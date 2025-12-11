import React, { useState } from "react";
import "../Styles/ForgetPassword.css";

const STEPS = {
  USERNAME: 1,
  OTP: 2,
  RESET: 3,
  SUCCESS: 4,
};

const ForgetPassword = () => {
  const [step, setStep] = useState(STEPS.USERNAME);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return setError("Enter username or ID");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://localhost:5000/api/ForgetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setOtpToken(data.OTPToken);
      setStep(STEPS.OTP);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter valid 6-digit OTP");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://localhost:5000/api/ForgetPassword/VerifyOTP",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${otpToken}`,
          },
          body: JSON.stringify({ OTP: otp }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      setResetToken(data.ResetToken);
      setStep(STEPS.RESET);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password too short");
    if (password !== confirmPassword) return setError("Passwords don't match");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://localhost:5000/api/ForgetPassword/ResetPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },
          body: JSON.stringify({ password, confirmPassword }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setStep(STEPS.SUCCESS);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        {error && <div className="fp-error">{error}</div>}

        {step === STEPS.USERNAME && (
          <form onSubmit={handleSendOtp}>
            <h2>Find Account</h2>
            <p>Enter your username or ID.</p>
            <input
              type="text"
              placeholder="Username / ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
            <button disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp}>
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to you.</p>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <button disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => setStep(STEPS.USERNAME)}
            >
              Back
            </button>
          </form>
        )}

        {step === STEPS.RESET && (
          <form onSubmit={handleReset}>
            <h2>New Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button disabled={loading}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === STEPS.SUCCESS && (
          <div className="text-center">
            <h2 className="success-text">Success!</h2>
            <p>Your password has been updated.</p>
            <button onClick={() => window.location.reload()}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
