import React, { useState, useEffect } from "react";
import "../Styles/Patient.css";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  admissionDate: string;
  diagnosis: string;
  treatment: string;
}

const PatientPortal: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const patientId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/patient/${patientId}`
        );
        const data = await res.json();
        setPatient(data.Patient);
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading)
    return <div className="loading-state">Loading patient data...</div>;
  if (!patient) return <div className="loading-state">Patient not found.</div>;

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="portal-container">
      <div className="portal-card">
        <h1 className="portal-header">Patient Portal</h1>

        <div className="info-row">
          <strong className="info-label">ID:</strong>
          <span className="info-value">{patient.id}</span>
        </div>

        <div className="info-row">
          <strong className="info-label">Full Name:</strong>
          <span className="info-value">{fullName}</span>
        </div>

        <div className="info-row">
          <strong className="info-label">Date of Birth:</strong>
          <span className="info-value">{patient.dob}</span>
        </div>

        <div className="info-row">
          <strong className="info-label">Email:</strong>
          <span className="info-value">{patient.email}</span>
        </div>

        <div className="info-row">
          <strong className="info-label">Phone:</strong>
          <span className="info-value">{patient.phone}</span>
        </div>

        <div className="info-row">
          <strong className="info-label">Admission Date:</strong>
          <span className="info-value">{patient.admissionDate}</span>
        </div>

        <div className="info-row highlight-section">
          <strong className="info-label">Diagnosis:</strong>
          <span className="info-value">{patient.diagnosis}</span>
        </div>

        <div className="info-row highlight-section">
          <strong className="info-label">Treatment:</strong>
          <span className="info-value">{patient.treatment}</span>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
