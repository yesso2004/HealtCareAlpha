import React, { useState } from "react";
import "../Styles/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<
    "doctor" | "nurse" | "receptionist"
  >("doctor");

  return (
    <div className="AdminSection">
      <h1 className="AdminHeader">Admin Dashboard</h1>

      <div className="RoleSelection">
        <button
          className={`RoleSelection ${activeTab === "doctor" ? "active" : ""}`}
          onClick={() => setActiveTab("doctor")}
        >
          Add Doctor
        </button>
        <button
          className={`RoleSelection ${activeTab === "nurse" ? "active" : ""}`}
          onClick={() => setActiveTab("nurse")}
        >
          Add Nurse
        </button>
        <button
          className={`RoleSelection ${
            activeTab === "receptionist" ? "active" : ""
          }`}
          onClick={() => setActiveTab("receptionist")}
        >
          Add Receptionist
        </button>
      </div>

      <div className="AddUserContainer">
        {activeTab === "doctor" && (
          <div className="AddUserSection">
            <h2>Add Doctor</h2>
            <form className="UserForm">
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="date" placeholder="Date of Birth" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Phone Number" />
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Add Doctor</button>
            </form>
          </div>
        )}
        {activeTab === "nurse" && (
          <div className="AddUserSection">
            <h2>Add Nurse</h2>
            <form className="UserForm">
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="date" placeholder="Date of Birth" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Phone Number" />
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Add Nurse</button>
            </form>
          </div>
        )}
        {activeTab === "receptionist" && (
          <div className="AddUserSection">
            <h2>Add Receptionist</h2>
            <form className="UserForm">
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="date" placeholder="Date of Birth" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Phone Number" />
              <input type="text" placeholder="Username" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Add Receptionist</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
