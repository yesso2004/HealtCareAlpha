import pool from "./DB.js";
import bcrypt from "bcrypt";

async function CreateAdmin() {
  const HashedPass = await bcrypt.hash("HexRuin#8Shade", 10);

  const sql = `
    INSERT INTO Admin (FirstName, LastName, DateOfBirth, Email, PhoneNumber, Username, PassKey)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const VALUES = [
    "Tamer",
    "Yassin",
    "1995-09-15",
    "tamer.yassin@alpha.com",
    "50564847584",
    "Tamer95",
    HashedPass,
  ];

  try {
    await pool.query(sql, VALUES);
    console.log("✅ Admin inserted");
  } catch (err) {
    console.error("❌ Error inserting admin:", err.message);
  }
}

CreateAdmin();
