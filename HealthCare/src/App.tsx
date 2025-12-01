import "./App.css";
import ProtectedRoute from "../src/components/ProtectedRoute";
import Idle from "../src/components/Idle";
import LoginPage from "../src/components/LoginPage";
import "../src/Styles/Login.css";
import { Route, Routes } from "react-router-dom";
import AdminPage from "../src/Roles/Admin";
import ReceptionistPage from "../src/Roles/Receptionist";
import DoctorPage from "../src/Roles/Doctor";
import NursePage from "../src/Roles/Nurse";
import PatientPage from "../src/Roles/Patient";
import AuthPage from "../src/components/Otp";

const App: React.FC = () => {
  return (
    <main role="main">
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
          element={
            <ProtectedRoute AllowedRoles={["admin"]}>
              <Idle>
                <AdminPage />
              </Idle>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ab63c0d0657040400f5a49dadd7c211d9d502e8f71de3ace7736b5ac29d1e816"
          element={
            <ProtectedRoute AllowedRoles={["receptionist"]}>
              <Idle>
                <ReceptionistPage />
              </Idle>
            </ProtectedRoute>
          }
        />
        <Route
          path="/72f4be89d6ebab1496e21e38bcd7c8ca0a68928af3081ad7dff87e772eb350c2"
          element={
            <ProtectedRoute AllowedRoles={["doctor"]}>
              <Idle>
                <DoctorPage />
              </Idle>
            </ProtectedRoute>
          }
        />
        <Route
          path="/781e5116a1e14a34eada50159d589e690c81ec4c5063115ea1f10b99441d5b94"
          element={<NursePage />}
        />
        <Route
          path="/2295ff7a8bd8b3f2884c6482146e3ded0417f72072c079fbe223e13e83a0388e"
          element={<PatientPage />}
        />
        <Route path="/test" element={<AuthPage />} />
      </Routes>
    </main>
  );
};

export default App;
