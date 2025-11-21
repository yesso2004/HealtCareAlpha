import { useEffect, useState } from "react";
import "../Styles/Login.css";
import { FaUser, FaLock } from "react-icons/fa";

const LoginPage = () => {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [Error, setError] = useState("");
  const [Delay, setDelay] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem("AUTH_TOKEN");
  }, []);

  useEffect(() => {
    const LastLoginAttempt = localStorage.getItem("LastLoginAttempt");
    if (LastLoginAttempt) {
      const Now = Date.now();
      const Difference = Now - parseInt(LastLoginAttempt, 10);
      if (Difference < 5000) {
        setDelay(true);
        setTimeout(() => setDelay(false), 5000 - Difference);
      }
    }
  }, []);

  const HandleLogin = async () => {
    if (Delay) {
      setError("Please wait before trying again.");
      return;
    }

    const now = Date.now();
    localStorage.setItem("LastLoginAttempt", now.toString());
    setDelay(true);
    setTimeout(() => setDelay(false), 5000);

    try {
      const response = await fetch("http://localhost:5000/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: Username, password: Password }),
      });

      const Data = await response.json();

      if (response.ok) {
        window.location.href = `/test?token=${encodeURIComponent(
          Data.TemporaryToken
        )}`;
      } else {
        setError(Data.message || "Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Server Error");
    }
  };

  return (
    <div className="LoginBackground">
      <div className="LoginSection">
        <div className="HeaderSection">
          <h2>Healthcare Alpha</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            HandleLogin();
          }}
          autoComplete="off"
        >
          <div className="InputSection">
            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Username"
                value={Username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="input-box">
              <FaLock className="icon" />
              <input
                type="password"
                placeholder="Password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="MessageSection">{Error}</div>

          <div className="LoginButtonSection">
            <button type="submit" disabled={Delay}>
              {Delay ? "Please wait..." : "Login"}
            </button>
          </div>
        </form>

        <div className="ForgotPasswordSection">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
