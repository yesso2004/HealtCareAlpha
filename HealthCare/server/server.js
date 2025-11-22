import express from "express";
import pool from "./DB.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

const OTPStorage = {};
const JWTKey = "SuperSecretKey";

// Test DB connection
async function testDB() {
  try {
    const [rows] = await pool.query("SELECT NOW() AS currentTime;");
    console.log("Connected to hospitaldb at:", rows[0].currentTime);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

// LOGIN ROUTE
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

    // Compare password with bcrypt hash
    const KeyMatch = await bcrypt.compare(password, User.PassKey);
    if (!KeyMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    // Generate OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTPStorage[username] = { code: OTP, expires: Date.now() + 45 * 1000 };
    console.log("Generated OTP:", OTPStorage[username]);

    const OTPToken = jwt.sign({ username, role, otp: OTP }, JWTKey, {
      expiresIn: "45s",
    });

    res.json({ message: "OTP Sent", OTPToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// VERIFY OTP ROUTE
app.post("/api/VerifyOTP", (req, res) => {
  const Authorization = req.headers["authorization"];
  if (!Authorization || !Authorization.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const OTPToken = Authorization.split(" ")[1];
  const { otp: UserOTP } = req.body;

  if (!UserOTP) return res.status(400).json({ message: "OTP is required" });

  try {
    const Verification = jwt.verify(OTPToken, JWTKey);
    const { username, role } = Verification;
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

// ADD USER ROUTE
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
    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO ${role} (FirstName, LastName, DateOfBirth, Email, PhoneNumber, Username, PassKey) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, dob, email, phone, username, hashedPassword]
    );

    res.json({ message: "User added successfully", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));

// Test DB
testDB();
