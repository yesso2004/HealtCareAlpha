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

    if (!User) return res.status(401).json({ message: "Invalid Credentials" });

    const KeyMatch = await bcrypt.compare(password, User.PassKey);
    if (!KeyMatch)
      return res.status(401).json({ message: "Invalid username or password" });

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

app.post("/api/VerifyOTP", (req, res) => {
  const Authorization = req.headers["authorization"];
  if (!Authorization || !Authorization.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const OTPToken = Authorization.split(" ")[1];
  const { otp: UserOTP } = req.body;
  if (!UserOTP) return res.status(400).json({ message: "OTP is required" });

  try {
    const Verification = jwt.verify(OTPToken, JWTKey);
    const { username, role, otp } = Verification;
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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

testDB();
