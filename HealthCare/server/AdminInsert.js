import pool from "./DB.js";
import bcrypt from "bcrypt";

async function CreateAdmin() {
  const HashedPass = await bcrypt.hash("HexRuin#9Shade", 10);

  const sql = `
    INSERT INTO Admin (FirstName, LastName, DateOfBirth, Email, PhoneNumber, Username, PassKey)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const VALUES = [
    "Ahmed",
    "Mohsen",
    "1995-08-15",
    "ahmed.mohsen@alpha.com",
    "5056485881",
    "Mohsen90",
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
