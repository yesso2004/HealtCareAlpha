import React, { useState } from "react";
import { Lock, User, KeyRound, CheckCircle, RotateCcw } from "lucide-react";
import "../Styles/ForgetPassword.css";

const STEPS = {
  USERNAME: "username",
  OTP: "otp",
  RESET: "reset",
  SUCCESS: "success",
};

const ForgetPassword = () => {
  const [step, setStep] = useState(STEPS.USERNAME);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const nextStep = (next: string) => {
    setError("");
    setStep(next);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please enter your username or patient ID.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep(STEPS.OTP);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep(STEPS.RESET);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep(STEPS.SUCCESS);
      setIdentifier("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  const InputField = ({
    icon: Icon,
    type,
    value,
    onChange,
    placeholder,
  }: {
    icon: any;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }) => (
    <div className="fp-input-wrapper">
      <Icon className="fp-input-icon" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="fp-input"
        disabled={isLoading}
      />
    </div>
  );

  const ActionButton = ({
    onClick,
    children,
  }: {
    onClick: any;
    children: any;
  }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`fp-button ${isLoading ? "disabled" : ""}`}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );

  const renderStepContent = () => {
    switch (step) {
      case STEPS.USERNAME:
        return (
          <form onSubmit={handleSendOtp}>
            <h2 className="fp-title">Find Your Account</h2>
            <p className="fp-subtitle">
              Enter your username or patient ID to receive a verification code.
            </p>
            <InputField
              icon={User}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Patient ID"
            />
            <ActionButton onClick={handleSendOtp}>
              Send Verification Code
            </ActionButton>
          </form>
        );
      case STEPS.OTP:
        return (
          <form onSubmit={handleVerifyOtp}>
            <h2 className="fp-title">Verify Code</h2>
            <p className="fp-subtitle">A 6-digit code has been sent.</p>
            <InputField
              icon={KeyRound}
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="Enter OTP"
            />
            <ActionButton onClick={handleVerifyOtp}>Verify Code</ActionButton>
            <button
              type="button"
              onClick={() => nextStep(STEPS.USERNAME)}
              className="fp-secondary-button"
              disabled={isLoading}
            >
              <RotateCcw className="fp-rotate-icon" />
              Request New Code
            </button>
          </form>
        );
      case STEPS.RESET:
        return (
          <form onSubmit={handleResetPassword}>
            <h2 className="fp-title">Set New Password</h2>
            <p className="fp-subtitle">Choose a strong, unique password.</p>
            <InputField
              icon={Lock}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />
            <InputField
              icon={Lock}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
            />
            <ActionButton onClick={handleResetPassword}>
              Reset Password
            </ActionButton>
          </form>
        );
      case STEPS.SUCCESS:
        return (
          <div className="fp-success">
            <CheckCircle className="fp-success-icon" />
            <h2 className="fp-success-title">Success!</h2>
            <p className="fp-success-text">
              Your password has been reset. You can now log in with your new
              credentials.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="fp-button"
            >
              Go to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        {error && <div className="fp-error">{error}</div>}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ForgetPassword;
