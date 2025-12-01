import { useEffect, useState } from "react";
import "../Styles/Doctor.css";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  admissionDate: string;
  username: string;
  diagnosis: string;
  treatment?: string;
  type: string;
  active: boolean;
}

const Doctor = () => {
  const [admissionDate, setAdmissionDate] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doctor/GetPatients");
        const data = await res.json();

        console.log("API response:", data);

        if (res.ok && data.Patients) {
          const mappedPatients: Patient[] = data.Patients.map((p: any) => ({
            id: p.id,
            name: `${p.firstName ?? ""} ${p.lastName ?? ""}`,
            email: p.email,
            phone: p.phone,
            admissionDate: p.admissionDate,
            username: p.username,
            diagnosis: p.diagnosis || "",
            treatment: p.treatment || "",
            type: "Inpatient",
            active: true,
          }));

          setPatients(mappedPatients);
        }
      } catch (err) {
        console.error("Failed to fetch inpatients", err);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setAdmissionDate(selectedPatient.admissionDate?.slice(0, 16) || "");
      setUsername(selectedPatient.username || "");
      setPassword("");
      setDiagnosis(selectedPatient.diagnosis || "");
    }
  }, [selectedPatient]);

  const setTimeNow = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setAdmissionDate(local);
  };

  const HandleLogout = () => {
    alert("Logout clicked");
  };

  const HandleSave = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/doctor/update-inpatient/${selectedPatient.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admissionDate,
            username,
            password,
            diagnosis,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) alert("Patient updated successfully!");
      else alert(data.message || "Failed to update patient");
    } catch (err) {
      console.error(err);
      alert("Server error while updating patient");
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Patients</h2>
          <div className="search-bar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search patients..." />
          </div>
        </div>

        <div className="list-content">
          {patients.length === 0 && <p>No patients loaded</p>}
          {patients.map((patient: Patient) => (
            <div
              key={patient.id}
              className={`list-item ${
                selectedPatient?.id === patient.id ? "selected" : ""
              }`}
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="list-info">
                <h4>{patient.name}</h4>
                <span>ID: #{patient.id}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-panel">
        {selectedPatient ? (
          <div className="profile-view">
            <header className="profile-header">
              <div className="profile-title">
                <h1>{selectedPatient.name}</h1>
                <span className="tag">{selectedPatient.type}</span>
              </div>
              <div className="header-buttons">
                <button className="btn-primary" onClick={HandleSave}>
                  Save Changes
                </button>
                <button className="btn-secondary" onClick={HandleLogout}>
                  Logout
                </button>
              </div>
            </header>

            <div className="grid-layout">
              <div className="card">
                <h3>Contact Information</h3>
                <div className="field-row">
                  <div className="field">
                    <label>Email Address</label>
                    <div className="value">{selectedPatient.email}</div>
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <div className="value">{selectedPatient.phone}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Admission Status</h3>
                <label>Admission Timestamp</label>
                <div className="input-with-action">
                  <input
                    type="datetime-local"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                  />
                  <button className="btn-secondary" onClick={setTimeNow}>
                    Now
                  </button>
                </div>
              </div>

              <div className="card full-width">
                <h3>Account Credentials</h3>
                <div className="credentials-grid">
                  <div className="form-group">
                    <label>Assign Username</label>
                    <input
                      type="text"
                      placeholder="Enter unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Assign Password</label>
                    <input
                      type="password"
                      placeholder="Enter temporary password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="card full-width">
                <h3>Medical Assessment</h3>
                <div className="form-group">
                  <label>Diagnosis Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter clinical notes..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="select-patient-msg">Select a patient to view details</p>
        )}
      </main>
    </div>
  );
};

export default Doctor;
