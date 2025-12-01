import express from "express";
import pool from "./DB.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { json } from "stream/consumers";

const app = express();
app.use(express.json());
app.use(cors());

const OTPStorage = {};
const JWTKey = "SuperSecretKey";
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("SuperSecretKey12345")
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

app.post("/api/Login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const Tables = ["admin", "doctor", "nurse", "inpatient", "receptionist"];
    let User = null;
    let role = null;

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

    if (!User)
      return res.status(401).json({ message: "Invalid username or password" });

    const KeyMatch = await bcrypt.compare(password, User.PassKey);
    if (!KeyMatch)
      return res.status(401).json({ message: "Invalid username or password" });

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

app.post("/api/VerifyOTP", (req, res) => {
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
    const AuthToken = jwt.sign({ username, role }, JWTKey, { expiresIn: "1h" });
    res.json({ message: "OTP Verified", AuthToken, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/Admin/AddUser", async (req, res) => {
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

  const forbiddenStrings = [username, firstName, lastName];
  for (const str of forbiddenStrings) {
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

app.post("/api/receptionist/AddPatient", async (req, res) => {
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
});

app.get("/api/doctor/GetPatients", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Inpatient_id, FirstName, LastName, Email, PhoneNumber, AdmissionDate, Username, Diagnosis, Treatment FROM Inpatient`
    );

    const Patients = rows.map((patient) => ({
      id: patient.Inpatient_id,
      firstName: decrypt(patient.FirstName),
      lastName: decrypt(patient.LastName),
      email: decrypt(patient.Email),
      phone: decrypt(patient.PhoneNumber),
      admissionDate: patient.AdmissionDate,
      username: patient.Username,
      diagnosis: patient.Diagnosis || "",
      treatment: patient.Treatment || "",
      type: "Inpatient",
      active: true,
    }));

    res.json({ Patients });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inpatients: " + err });
  }
});
app.put("/api/doctor/update-inpatient/:id", async (req, res) => {
  const { id } = req.params;
  const { admissionDate, diagnosis, username, password } = req.body;

  if (!admissionDate || !diagnosis) {
    return res
      .status(400)
      .json({ message: "Admission date and diagnosis are required." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT Username, PassKey FROM Inpatient WHERE Inpatient_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const patient = rows[0];

    if (patient.Username && patient.PassKey) {
      if (username || password) {
        return res.status(400).json({
          message: "Username and password already exist. Cannot overwrite.",
        });
      }
    } else {
      if (!username || !password) {
        return res.status(400).json({
          message:
            "This patient has no credentials. Please provide username & password.",
        });
      }
    }

    const FinalUsername = patient.Username || username;
    const FinalPassword = patient.PassKey || (await bcrypt.hash(password, 10));

    await pool.query(
      `UPDATE Inpatient 
       SET AdmissionDate = ?, Diagnosis = ?, Username = ?, PassKey = ?
       WHERE Inpatient_id = ?`,
      [
        encrypt(admissionDate),
        encrypt(diagnosis),
        FinalUsername,
        encrypt(FinalPassword),
        id,
      ]
    );

    res.json({ message: "Patient updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
testDB();
