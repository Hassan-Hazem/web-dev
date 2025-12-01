import React, { useState } from "react";
import api from "../../api/axios";
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
    <div className="auth-form-container" style={{ position: "relative", padding: "40px 32px" }}>
      <button 
        onClick={onBack} 
        className="back-btn" 
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
          color: "#7c7c7c"
        }}
        onMouseEnter={(e) => e.target.style.background = "#f6f7f8"}
        onMouseLeave={(e) => e.target.style.background = "none"}
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

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 20px",
          background: "linear-gradient(135deg, #0079d3 0%, #0056a3 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,121,211,0.3)"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          color: "#1c1c1c",
          marginBottom: "12px"
        }}>
          Check your email
        </h2>
        
        <p style={{ 
          fontSize: "0.9375rem", 
          color: "#7c7c7c", 
          lineHeight: "1.5",
          maxWidth: "400px",
          margin: "0 auto"
        }}>
          We sent a 6-digit verification code to<br />
          <strong style={{ color: "#1c1c1c" }}>{email}</strong>
        </p>
      </div>

      {error && (
        <div style={{ 
          color: "#d93025", 
          marginBottom: "20px", 
          textAlign: "center", 
          fontSize: "0.875rem",
          padding: "14px 16px",
          background: "#fef2f2",
          borderRadius: "12px",
          border: "1px solid rgba(217,48,37,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="auth-form" style={{ marginBottom: "28px" }}>
        <div className="form-group">
          <label style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "600",
            color: "#555",
            marginBottom: "10px",
            textAlign: "center"
          }}>
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
            className="auth-input"
            style={{
              textAlign: "center",
              fontSize: "2rem",
              letterSpacing: "1rem",
              fontWeight: "700",
              fontFamily: "monospace",
              padding: "16px",
              border: error ? "2px solid #d93025" : "2px solid #edeff1",
              background: "#f6f7f8",
              transition: "border-color 0.2s, box-shadow 0.2s"
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "#0079d3";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,121,211,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? "#d93025" : "#edeff1";
              e.target.style.boxShadow = "none";
            }}
            maxLength={6}
            disabled={loading}
            autoFocus
          />
          <p style={{
            fontSize: "0.75rem",
            color: "#888",
            marginTop: "8px",
            textAlign: "center"
          }}>
            {code.length}/6 digits
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="auth-submit-btn"
          disabled={code.length !== 6 || loading}
          style={{
            background: code.length === 6 && !loading ? "#ff4500" : "#d7dadc",
            cursor: code.length === 6 && !loading ? "pointer" : "not-allowed",
            padding: "14px 20px",
            fontSize: "1rem",
            fontWeight: "700",
            borderRadius: "24px",
            border: "none",
            color: "#fff",
            width: "100%",
            transition: "all 0.2s",
            boxShadow: code.length === 6 && !loading ? "0 2px 8px rgba(255,69,0,0.3)" : "none"
          }}
          onMouseEnter={(e) => {
            if (code.length === 6 && !loading) {
              e.target.style.background = "#ff5414";
              e.target.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (code.length === 6 && !loading) {
              e.target.style.background = "#ff4500";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ 
                width: "16px", 
                height: "16px", 
                border: "2px solid #fff", 
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite"
              }} />
              Verifying...
            </span>
          ) : "Verify & Continue"}
        </button>
      </div>

      <div style={{ 
        textAlign: "center", 
        paddingTop: "20px",
        borderTop: "1px solid #edeff1"
      }}>
        <p style={{ 
          fontSize: "0.875rem", 
          color: "#7c7c7c", 
          marginBottom: "12px" 
        }}>
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: "none",
            border: "none",
            color: resending ? "#7c7c7c" : "#0079d3",
            fontSize: "0.9375rem",
            fontWeight: "600",
            cursor: resending ? "not-allowed" : "pointer",
            padding: "8px 16px",
            borderRadius: "20px",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => {
            if (!resending) e.target.style.background = "#f6f7f8";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "none";
          }}
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}