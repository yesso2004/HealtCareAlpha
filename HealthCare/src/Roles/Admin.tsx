import { useState } from "react";
import "../Styles/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<
    "doctor" | "nurse" | "receptionist"
  >("doctor");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      const res = await fetch("http://localhost:5000/api/Admin/AddUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeTab, ...formData }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`${activeTab} added successfully! ID: ${data.userId}`);
        setFormData({
          firstName: "",
          lastName: "",
          dob: "",
          email: "",
          phone: "",
          username: "",
          password: "",
        });
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="AdminSection">
      <h1 className="AdminHeader">Admin Dashboard</h1>

      <div className="RoleSelection">
        {["doctor", "nurse", "receptionist"].map((role) => (
          <button
            key={role}
            className={`RoleSelection ${activeTab === role ? "active" : ""}`}
            onClick={() => setActiveTab(role as any)}
          >
            Add {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div className="AddUserContainer">
        <div className="AddUserSection">
          <h2>Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <form className="UserForm" onSubmit={handleSubmit}>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">
              Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </form>
          {message && (
            <p style={{ color: message.startsWith("Error") ? "red" : "green" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
