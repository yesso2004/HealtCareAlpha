import "../Styles/Auth.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const QueryParams = new URLSearchParams(location.search);
  const OTPToken = QueryParams.get("token");

  const [OTP, setOTP] = useState("");
  const [Error, setError] = useState("");
  const [Timer, setTimer] = useState(0);

  const RolesRoute: Record<string, string> = {
    admin: "/8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    receptionist:
      "/ab63c0d0657040400f5a49dadd7c211d9d502e8f71de3ace7736b5ac29d1e816",
    doctor: "/72f4be89d6ebab1496e21e38bcd7c8ca0a68928af3081ad7dff87e772eb350c2",
    nurse: "/781e5116a1e14a34eada50159d589e690c81ec4c5063115ea1f10b99441d5b94",
    patient:
      "/2295ff7a8bd8b3f2884c6482146e3ded0417f72072c079fbe223e13e83a0388e",
  };

  useEffect(() => {
    const ExistingAuth = sessionStorage.getItem("AUTH_TOKEN");
    if (ExistingAuth) {
      const Decode = JSON.parse(atob(ExistingAuth.split(".")[1]));
      const role = Decode.role;
      navigate(RolesRoute[role]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("AUTH_TOKEN");
  }, []);

  useEffect(() => {
    if (!OTPToken) {
      alert("Invalid OTP Token");
      navigate("/");
      return;
    }

    const payload = JSON.parse(atob(OTPToken.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    let remaining = payload.exp - now;

    if (remaining <= 0) {
      alert("OTP Expired");
      navigate("/");
      return;
    }

    setTimer(remaining);

    const OTPTimer = setInterval(() => {
      remaining--;
      setTimer(remaining);
      if (remaining <= 0) {
        clearInterval(OTPTimer);
        alert("OTP Expired");
        navigate("/");
      }
    }, 1000);

    return () => clearInterval(OTPTimer);
  }, [OTPToken, navigate]);

  const HandleOTPSubmit = async () => {
    if (!OTP) {
      setError("Please enter the OTP");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/VerifyOTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OTPToken}`,
        },
        body: JSON.stringify({ otp: OTP }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("AUTH_TOKEN", data.AuthToken);
        sessionStorage.removeItem("OTPExpired");

        const Decoder = JSON.parse(atob(data.AuthToken.split(".")[1]));
        const Role = Decoder.role;
        const RedirectPath = RolesRoute[Role];

        navigate(RedirectPath || "/");
      } else {
        setError(data.message || "Invalid OTP");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Server Error");
      setTimeout(() => navigate("/"), 3000);
    }
  };

  return (
    <div className="OTPBK">
      <div className="OTPSection">
        <h2 className="otp-title">Enter OTP</h2>
        <p style={{ color: "red", fontWeight: "bold" }}>Expires in: {Timer}s</p>
        <input
          type="text"
          placeholder="One-Time Password"
          className="otp-input"
          value={OTP}
          onChange={(e) => setOTP(e.target.value)}
        />
        <p className="otp-error">{Error}</p>
        <button className="otp-btn" onClick={HandleOTPSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Otp;
