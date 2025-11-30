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
  const [loading, setLoading] = useState(false);

  const HandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/receptionist/AddPatient",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage("Error: " + data.message);
      } else {
        setMessage(data.message);
        setFormData({
          firstName: "",
          lastName: "",
          dob: "",
          phone: "",
          email: "",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ReceptionistSection">
      <h1 className="ReceptionistHeader">Receptionist Dashboard</h1>
      <div className="AddOutpatientContainer">
        <div className="AddOutpatientSection">
          <h2>Add Outpatient</h2>
          <form
            className="OutpatientForm"
            onSubmit={HandleSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              autoComplete="off"
              value={formData.firstName}
              onChange={HandleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              autoComplete="off"
              value={formData.lastName}
              onChange={HandleChange}
              required
            />
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              autoComplete="off"
              value={formData.dob}
              onChange={HandleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              autoComplete="off"
              value={formData.phone}
              onChange={HandleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              value={formData.email}
              onChange={HandleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Outpatient"}
            </button>
          </form>

          {message && (
            <p
              style={{
                color: message.startsWith("Error") ? "red" : "green",
                marginTop: "10px",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receptionist;
