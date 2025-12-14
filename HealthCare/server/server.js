import express from "express";
import pool from "./DB.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { json } from "stream/consumers";
import "dotenv/config";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const LoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts , please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const OTPStorage = {};
const FailureAttempts = {};
const JWTKey = process.env.JWT_SECRET;
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(String(process.env.ENCRYPTION_SECRET))
  .digest();

const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  const [ivHex, encryptedText] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function testDB() {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime;");
    console.log("Connected to hospitaldb at:", rows[0].currentTime);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

function AuthenticatedMiddleware(req, res, next) {
  const Header = req.headers.authorization;

  if (!Header || !Header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const Token = Header.split(" ")[1];

  try {
    const Decoded = jwt.verify(Token, JWTKey);
    console.log("✅ Authenticated successfully:", {
      username: Decoded.username,
      role: Decoded.role,
      patientId: Decoded.patientId,
    });
    req.user = Decoded;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" + err });
  }
}

app.post("/api/Login", LoginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const BruteForceAttempts = 5;
  const LockTime = 15 * 60 * 1000;

  try {
    const Tables = ["admin", "doctor", "nurse", "inpatient", "receptionist"];
    let User = null;
    let role = null;

    const userAttempts = FailureAttempts[username] || {
      failures: 0,
      lockUntil: 0,
    };

    if (userAttempts.lockUntil > Date.now()) {
      return res.status(429).json({
        message:
          "Account locked due to too many failed login attempts. Try again later.",
      });
    }

    for (const table of Tables) {
      const [rows] = await pool.query(
        `SELECT * FROM ${table} WHERE Username = ?`,
        [username]
      );
      if (rows.length > 0) {
        User = rows[0];
        role = table;
        break;
      }
    }

    if (!User) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const KeyMatch = await bcrypt.compare(password, User.PassKey);
    if (!KeyMatch) {
      userAttempts.failures++;
      FailureAttempts[username] = userAttempts;

      if (userAttempts.failures >= BruteForceAttempts) {
        userAttempts.lockUntil = Date.now() + LockTime;
        FailureAttempts[username] = userAttempts;
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (FailureAttempts[username]) {
      delete FailureAttempts[username];
    }

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTPStorage[username] = { code: OTP, expires: Date.now() + 45 * 1000 };
    console.log("Generated OTP:", OTPStorage[username]);

    const EncryptJWT = encrypt(JSON.stringify({ username, role, otp: OTP }));

    const OTPToken = jwt.sign({ data: EncryptJWT }, JWTKey, {
      expiresIn: "45s",
    });

    res.json({ message: "OTP Sent", OTPToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/VerifyOTP", async (req, res) => {
  const Authorization = req.headers["authorization"];
  if (!Authorization || !Authorization.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const OTPToken = Authorization.split(" ")[1];
  const { otp: UserOTP } = req.body;
  if (!UserOTP) return res.status(400).json({ message: "OTP is required" });

  try {
    const Verification = jwt.verify(OTPToken, JWTKey);
    const DecryptedJWT = JSON.parse(decrypt(Verification.data));
    const { username, role, otp } = DecryptedJWT;
    const StoredOTPData = OTPStorage[username];

    if (!StoredOTPData)
      return res
        .status(400)
        .json({ message: "OTP was not sent for this user" });
    if (Date.now() > StoredOTPData.expires) {
      delete OTPStorage[username];
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (StoredOTPData.code !== UserOTP) {
      delete OTPStorage[username];
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    delete OTPStorage[username];

    let patientId = null;
    if (role === "inpatient") {
      const [rows] = await pool.query(
        `SELECT Inpatient_id FROM Inpatient WHERE Username = ?`,
        [username]
      );
      if (rows.length > 0) {
        patientId = rows[0].Inpatient_id;
      }
    }

    const EncryptedAuthToken = encrypt(
      JSON.stringify({ username, role, patientId })
    );
    const AuthToken = jwt.sign({ username, role, patientId }, JWTKey, {
      expiresIn: "1h",
    });

    res.json({ message: "OTP Verified", AuthToken, role, patientId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/Admin/AddUser", AuthenticatedMiddleware, async (req, res) => {
  const { role, firstName, lastName, dob, email, phone, username, password } =
    req.body;

  if (
    !role ||
    !firstName ||
    !lastName ||
    !dob ||
    !email ||
    !phone ||
    !username ||
    !password
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const EmailRegex = /^[a-zA-Z0-9._%+-]+@alpha\.com$/;
  if (!EmailRegex.test(email))
    return res.status(400).json({ message: "Email must end with @alpha.com" });

  const PhoneRegex = /^\d{11}$/;
  if (!PhoneRegex.test(phone))
    return res
      .status(400)
      .json({ message: "Phone number must be exactly 11 digits" });

  const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!PasswordRegex.test(password))
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });

  const ForbiddenStrings = [username, firstName, lastName];
  for (const str of ForbiddenStrings) {
    if (password.toLowerCase().includes(str.toLowerCase())) {
      return res.status(400).json({
        message: "Password cannot contain username, first name, or last name",
      });
    }
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${role} WHERE Username = ? OR Email = ?`,
      [username, email]
    );
    if (rows.length > 0)
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO ${role} (FirstName, LastName, DateOfBirth, Email, PhoneNumber, Username, PassKey) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        encrypt(firstName),
        encrypt(lastName),
        encrypt(dob),
        encrypt(email),
        encrypt(phone),
        username,
        hashedPassword,
      ]
    );

    res.json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post(
  "/api/receptionist/AddPatient",
  AuthenticatedMiddleware,
  async (req, res) => {
    const { firstName, lastName, dob, email, phone } = req.body;

    if (!firstName || !lastName || !dob || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const PhoneRegex = /^\d{11}$/;
    if (!PhoneRegex.test(phone))
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 11 digits" });

    try {
      const [rows] = await pool.query(`SELECT Email FROM inpatient`);
      const present = rows.some((r) => decrypt(r.Email) === email);

      if (present) {
        return res
          .status(400)
          .json({ message: "Patient with this email already exists" });
      }

      const [insertResult] = await pool.query(
        `INSERT INTO inpatient (FirstName, LastName, DateOfBirth, Email, PhoneNumber) VALUES (?, ?, ?, ?, ?)`,
        [
          encrypt(firstName),
          encrypt(lastName),
          encrypt(dob),
          encrypt(email),
          encrypt(phone),
        ]
      );

      res.json({
        message: "Patient added successfully",
        inpatientId: insertResult.insertId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

app.get(
  "/api/doctor/GetPatients",
  AuthenticatedMiddleware,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT Inpatient_id, FirstName, LastName, Email, PhoneNumber, AdmissionDate, Username, Diagnosis, Treatment FROM Inpatient`
      );

      const safeDecrypt = (value) => (value ? decrypt(value) : "");

      const Patients = rows.map((patient) => ({
        id: patient.Inpatient_id,
        firstName: safeDecrypt(patient.FirstName),
        lastName: safeDecrypt(patient.LastName),
        email: safeDecrypt(patient.Email),
        phone: safeDecrypt(patient.PhoneNumber),
        admissionDate: safeDecrypt(patient.AdmissionDate),
        username: patient.Username,
        diagnosis: safeDecrypt(patient.Diagnosis) || "",
        treatment: safeDecrypt(patient.Treatment) || "",
        type: "Inpatient",
        active: true,
      }));

      res.json({ Patients });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch inpatients: " + err });
    }
  }
);

app.put(
  "/api/doctor/update-inpatient/:id",
  AuthenticatedMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { admissionDate, diagnosis, username, password, treatment } =
      req.body;

    if (!admissionDate || !diagnosis) {
      return res
        .status(400)
        .json({ message: "Admission date and diagnosis are required." });
    }

    try {
      const [rows] = await pool.query(
        `SELECT Username, PassKey, FirstName, LastName FROM Inpatient WHERE Inpatient_id = ?`,
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ message: "Patient not found." });

      const patient = rows[0];
      const FinalUsername = username || patient.Username;
      let FinalPassword = patient.PassKey;

      if (password) {
        const PasswordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!PasswordRegex.test(password)) {
          return res.status(400).json({
            message:
              "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
          });
        }

        const firstName = decrypt(patient.FirstName);
        const lastName = decrypt(patient.LastName);
        const ForbiddenStrings = [FinalUsername, firstName, lastName];
        for (const str of ForbiddenStrings) {
          if (str && password.toLowerCase().includes(str.toLowerCase())) {
            return res.status(400).json({
              message:
                "Password cannot contain username, first name, or last name",
            });
          }
        }

        FinalPassword = await bcrypt.hash(password, 10);
      }

      await pool.query(
        `UPDATE Inpatient 
       SET AdmissionDate = ?, Diagnosis = ?, Username = ?, PassKey = ?, Treatment = ?
       WHERE Inpatient_id = ?`,
        [
          encrypt(admissionDate),
          encrypt(diagnosis),
          FinalUsername,
          FinalPassword,
          encrypt(treatment || ""),
          id,
        ]
      );

      res.json({ message: "Patient updated successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error: " + err });
    }
  }
);

app.get("/api/patient/:id", async (req, res) => {
  const { id } = req.params;

  const AuthHeader = req.headers.authorization;
  if (!AuthHeader || !AuthHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const Token = AuthHeader.split(" ")[1];
  let Decoded;
  try {
    Decoded = jwt.verify(Token, JWTKey);
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  const UserRole = Decoded.role;
  const UserPatientID = Decoded.patientId;

  if (UserRole === "inpatient") {
    if (!UserPatientID || UserPatientID.toString() !== id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot access another patient's data." });
    }
  }

  try {
    const [rows] = await pool.query(
      `SELECT Inpatient_id, FirstName, LastName, DateOfBirth, Email, PhoneNumber, AdmissionDate, Username, Diagnosis, Treatment 
       FROM Inpatient 
       WHERE Inpatient_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const safeDecrypt = (value) => (value ? decrypt(value) : "");

    const patient = rows[0];

    const Patient = {
      id: patient.Inpatient_id,
      firstName: safeDecrypt(patient.FirstName),
      lastName: safeDecrypt(patient.LastName),
      dob: safeDecrypt(patient.DateOfBirth),
      email: safeDecrypt(patient.Email),
      phone: safeDecrypt(patient.PhoneNumber),
      admissionDate: safeDecrypt(patient.AdmissionDate),
      username: patient.Username,
      diagnosis: safeDecrypt(patient.Diagnosis),
      treatment: safeDecrypt(patient.Treatment),
    };

    res.json({ Patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patient: " + err });
  }
});

app.post("/api/ForgetPassword", async (req, res) => {
  const { Username } = req.body;
  if (!Username)
    return res.status(400).json({ message: "Username is required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM inpatient WHERE Username = ?`,
      [Username]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTPStorage[Username] = { code: OTP, expires: Date.now() + 5 * 60 * 1000 };
    console.log("Generated OTP for password reset:", OTP);

    const EncryptedJWT = encrypt(
      JSON.stringify({ username: Username, otp: OTP })
    );
    const OTPToken = jwt.sign({ data: EncryptedJWT }, JWTKey, {
      expiresIn: "2m",
    });

    res.json({ message: "OTP sent", OTPToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/ForgetPassword/VerifyOTP", async (req, res) => {
  const { OTP } = req.body;
  const Authorization = req.headers.authorization?.split(" ")[1];

  if (!Authorization) return res.status(401).json({ message: "Unauthorized" });
  if (!OTP) return res.status(400).json({ message: "OTP is required" });

  try {
    const Verification = jwt.verify(Authorization, JWTKey);
    const DecryptedJWT = JSON.parse(decrypt(Verification.data));
    const { username, otp: storedOtp } = DecryptedJWT;
    const StoredOTPData = OTPStorage[username];

    if (!StoredOTPData)
      return res.status(400).json({ message: "OTP not sent" });
    if (Date.now() > StoredOTPData.expires) {
      delete OTPStorage[username];
      return res.status(400).json({ message: "OTP expired" });
    }
    if (StoredOTPData.code !== OTP) {
      delete OTPStorage[username];
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    delete OTPStorage[username];

    const ResetEncryptedJWT = encrypt(JSON.stringify({ username }));
    const ResetToken = jwt.sign({ data: ResetEncryptedJWT }, JWTKey, {
      expiresIn: "2m",
    });

    res.json({ message: "OTP verified", ResetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/ForgetPassword/ResetPassword", async (req, res) => {
  const { password, confirmPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });
  if (!password || !confirmPassword)
    return res
      .status(400)
      .json({ message: "Password and confirmation are required" });
  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!PasswordRegex.test(password))
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });

  try {
    const verification = jwt.verify(token, JWTKey);
    let decrypted;
    try {
      decrypted = JSON.parse(decrypt(verification.data));
    } catch {
      return res.status(400).json({ message: "Invalid token format" });
    }

    const { username } = decrypted;

    const [rows] = await pool.query(
      `SELECT * FROM inpatient WHERE Username = ?`,
      [username]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(`UPDATE inpatient SET PassKey = ? WHERE Username = ?`, [
      hashedPassword,
      username,
    ]);

    res.json({ message: "Password has been successfully reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const HTTPS_PORT = 5000;

try {
  const options = {
    key: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "..", "cert.pem")),
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`Server running securely on https://localhost:${HTTPS_PORT}`);
  });
} catch (err) {
  console.error("Failed to start HTTPS server.");
  console.error("Error:", err.message);
}

testDB();
