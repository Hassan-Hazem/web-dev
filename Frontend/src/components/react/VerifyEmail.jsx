import { useState } from "react";
import api from "../../api/axios";
import "../css/Login.css";
import "../css/VerifyEmail.css";

export default function VerifyEmail({ email, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/verify-email", { email, code });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onVerified(data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    
    try {
      await api.post("/auth/resend-verification", { email });
      setError("");
      alert("Verification code resent! Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-form-container verify-container">
      <button 
        onClick={onBack} 
        className="verify-back-btn"
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="verify-hero">
        <div className="verify-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2 className="verify-title">
          Check your email
        </h2>
        
        <p className="verify-subtitle">
          We sent a 6-digit verification code to<br />
          <strong className="email">{email}</strong>
        </p>
      </div>

      {error && (
        <div className="verify-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="auth-form verify-form">
        <div className="form-group">
          <label className="verify-label">
            Verification Code
          </label>
          <input
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
              if (error) setError("");
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && code.length === 6 && !loading) {
                handleSubmit();
              }
            }}
            className={`auth-input verify-code-input ${error ? 'error' : ''}`}
            maxLength={6}
            disabled={loading}
            autoFocus
          />
          <p className="verify-code-hint">
            {code.length}/6 digits
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className={`verify-submit ${code.length === 6 && !loading ? 'enabled' : 'disabled'}`}
          disabled={code.length !== 6 || loading}
        >
          {loading ? (
            <span className="loading-row">
              <span className="spinner" />
              Verifying...
            </span>
          ) : "Verify & Continue"}
        </button>
      </div>

      <div className="verify-bottom">
        <p className="muted">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="verify-resend-btn"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}