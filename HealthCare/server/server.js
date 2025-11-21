import express from "express";
import pool from "./DB.js";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const OTPStorage = {};
const LoginTokens = {};
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

    if (!User) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const KeyMatch = await bcrypt.compare(password, User.PassKey);
    if (!KeyMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    let OTP = Math.floor(100000 + Math.random() * 900000).toString();
    OTPStorage[username] = { code: OTP, expires: Date.now() + 45 * 1000 };
    console.log("Generated OTP:", OTPStorage[username]);

    const TemporaryToken = Math.random().toString(36).substring(2, 15);
    LoginTokens[TemporaryToken] = {
      username,
      role,
      expires: Date.now() + 45000,
    };

    return res.json({ message: "OTP Sent", TemporaryToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/VerifyToken", (req, res) => {
  const { Token } = req.body;
  const TokenData = LoginTokens[Token];

  if (!TokenData || Date.now() > TokenData.expires) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  return res.json({ username: TokenData.username, role: TokenData.role });
});

app.post("/api/VerifyOTP", async (req, res) => {
  const { username, otp } = req.body;

  const stored = OTPStorage[username];
  if (!stored) {
    return res
      .status(400)
      .json({ message: "OTP was not delivered to this user" });
  }

  const { code, expires } = stored;
  if (Date.now() > expires) {
    delete OTPStorage[username];
    return res.status(400).json({ message: "OTP has expired" });
  }

  if (otp !== code) {
    return res.status(401).json({ message: "Incorrect OTP" });
  }

  delete OTPStorage[username];
  return res.status(200).json({ message: "OTP verified" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

testDB();
