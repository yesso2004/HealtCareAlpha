import { useState } from "react";
import "../Styles/Doctor.css";

const Doctor = () => {
  const [admissionDate, setAdmissionDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const setTimeNow = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setAdmissionDate(local);
  };

  const handleLogout = () => {
    alert("Logout clicked");
  };

  const handleSave = () => {
    console.log("Saving Data:", { username, password, admissionDate });
    alert("Changes Saved!");
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
          <div className="list-item selected">
            <div className="list-info">
              <h4>John Doe</h4>
              <span>ID: #8832</span>
            </div>
            <div className="status-dot active"></div>
          </div>
          <div className="list-item">
            <div className="list-info">
              <h4>Jane Smith</h4>
              <span>ID: #9941</span>
            </div>
            <div className="status-dot"></div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <div className="profile-view">
          <header className="profile-header">
            <div className="profile-title">
              <h1>John Doe</h1>
              <span className="tag">Inpatient</span>
            </div>
            <div className="header-buttons">
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={handleLogout}>
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
                  <div className="value">john.doe@example.com</div>
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <div className="value">+1 (555) 012-3456</div>
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
                <textarea rows={3} placeholder="Enter clinical notes..." />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Doctor;
