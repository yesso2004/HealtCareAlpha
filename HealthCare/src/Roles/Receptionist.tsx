import { useState } from "react";
import "../Styles/Receptionist.css";

const Receptionist = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    email: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit", formData);
    setMessage("Submitting...");
  };

  return (
    <div className="ReceptionistSection">
      <h1 className="ReceptionistHeader">Receptionist Dashboard</h1>
      <div className="AddOutpatientContainer">
        <div className="AddOutpatientSection">
          <h2>Add Outpatient</h2>
          <form
            className="OutpatientForm"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              autoComplete="off"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              autoComplete="off"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              autoComplete="off"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              autoComplete="off"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <button type="submit">Add Outpatient</button>
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

export default Receptionist;
