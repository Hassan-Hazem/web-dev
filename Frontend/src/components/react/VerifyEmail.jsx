import React, { useState } from "react";
import "../css/Login.css";

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
      const response = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        onVerified(data);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          username: "temp",
          password: "temp" 
        }),
      });

      if (response.ok) {
        setError("");
        alert("Verification code resent!");
      }
    } catch (err) {
      setError("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button onClick={onBack} className="back-btn" style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "50%",
        transition: "background 0.2s"
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h2 className="auth-header">Verify your email</h2>
      
      <p className="auth-legal-text" style={{ textAlign: "center", marginBottom: "24px" }}>
        Enter the 6-digit code we sent to <strong>{email}</strong>
      </p>

      {error && (
        <div style={{ 
          color: "#d93025", 
          marginBottom: "12px", 
          textAlign: "center", 
          fontSize: "0.875rem",
          padding: "12px",
          background: "#fef2f2",
          borderRadius: "8px"
        }}>
          {error}
        </div>
      )}

      <div className="auth-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Verification code"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
              if (error) setError("");
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && code && !loading) {
                handleSubmit();
              }
            }}
            className="auth-input"
            style={{
              textAlign: "center",
              fontSize: "1.5rem",
              letterSpacing: "0.5rem",
              fontWeight: "600"
            }}
            maxLength={6}
            disabled={loading}
            autoFocus
          />
        </div>

        <button
          onClick={handleSubmit}
          className={`auth-submit-btn ${(!code || loading) ? "disabled" : ""}`}
          disabled={!code || loading}
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <p style={{ fontSize: "0.875rem", color: "#7c7c7c", marginBottom: "8px" }}>
          Didn't get an email?
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: "none",
            border: "none",
            color: "#0079d3",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          {resending ? "Resending..." : "Resend"}
        </button>
      </div>
    </div>
  );
}