import React, { useState, useEffect } from "react";
import "../Styles/Patient.css";

interface Patient {
  id: string;
  fullName: string;
  admissionDate: string;
  diagnosis: string;
  treatment: string;
}

const PatientPortal: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const mockPatientData: Patient = {
      id: "PAT789012",
      fullName: "Jane Smith",
      admissionDate: new Date().toLocaleDateString(),
      diagnosis: "Acute Bronchitis",
      treatment: "Prescription of antibiotics and rest.",
    };

    setTimeout(() => {
      setPatient(mockPatientData);
    }, 500);
  }, []);

  if (!patient) {
    return <div className="loading-state">Loading patient data...</div>;
  }

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
          <span className="info-value">{patient.fullName}</span>
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
