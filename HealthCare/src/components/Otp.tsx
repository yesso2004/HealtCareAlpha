import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/Auth.css";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🚫 Block manually entering or refreshing OTP page
  useEffect(() => {
    const tempToken = new URLSearchParams(location.search).get("token");
    if (!tempToken) navigate("/");
  }, [location, navigate]);

  // 🚫 Block access if user already logged in
  useEffect(() => {
    const session = sessionStorage.getItem("AUTH_TOKEN");
    if (session) navigate("/");
  }, [navigate]);

  // ✔ Validate the temporary token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/VerifyToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Token: token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.username || !data.role) {
          navigate("/");
        } else {
          setUsername(data.username);
          setRole(data.role);
        }
      })
      .catch(() => navigate("/"));
  }, [location, navigate]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/VerifyOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token
        const AuthToken = { username, role };
        sessionStorage.setItem("AUTH_TOKEN", JSON.stringify(AuthToken));

        // Redirect based on role
        switch (role) {
          case "admin":
            navigate(
              "/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
            );
            break;
          case "doctor":
            navigate("/doctor/dashboard");
            break;
          case "nurse":
            navigate("/nurse/dashboard");
            break;
          case "receptionist":
            navigate("/reception/dashboard");
            break;
          case "inpatient":
            navigate("/inpatient/dashboard");
            break;
          default:
            setError("Unknown role");
            setTimeout(() => navigate("/"), 3000);
        }
      } else {
        setError(data.message || "Invalid OTP");

        // ⏳ wait 3 seconds before redirecting home
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Server error");

      // ⏳ wait 3 seconds then redirect
      setTimeout(() => navigate("/"), 3000);
    }
  };

  return (
    <div className="OTPBK">
      <div className="OTPSection">
        <h2 className="otp-title">Enter OTP</h2>

        <input
          type="text"
          placeholder="One-Time Password"
          className="otp-input"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {error && <p className="otp-error">{error}</p>}

        <button className="otp-btn" onClick={handleVerifyOtp}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Otp;
