import React, { useState } from "react";
import "../css/Signup.css";
import { useAuth } from "../../context/authContext";

export default function Signup({ step, onSwitchToLogin, onContinue, setSignupStep, closeModal }) {
  const { register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (email && !loading) {
      setError("");
      onContinue();
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!username || !password || loading) return;
    setError("");
    
    const result = await register(username, email, password);
    if (result.success) {
      if (closeModal) closeModal();
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  };

  if (step === 1) {
    return (
      <div className="auth-form-container">
        <h2 className="auth-header">Sign Up</h2>
        
        <p className="auth-legal-text">
          By continuing, you agree to our{" "}
          <a href="#" className="auth-link">User Agreement</a> and acknowledge
          that you understand the{" "}
          <a href="#" className="auth-link">Privacy Policy</a>.
        </p>

        <button className="google-btn">
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {error && step === 1 && (
          <div
            className="auth-error"
            style={{ color: "#d93025", marginBottom: 12, textAlign: "center", fontSize: "0.875rem" }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleStep1Submit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(error) setError(""); }}
              className="auth-input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${(!email || loading) ? "disabled" : ""}`}
            disabled={!email || loading}
          >
            {loading ? "Please wait..." : "Continue"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already a redditor?{" "}
          <button onClick={onSwitchToLogin} className="auth-switch-link">
            Log In
          </button>
        </p>
      </div>
    );
  }

  // Step 2: Username and Password
  return (
    <div className="auth-form-container">
      <button onClick={() => setSignupStep(1)} className="back-btn">
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

      <h2 className="auth-header">Create your username and password</h2>
      
      <p className="auth-subtext">
        Reddit is anonymous, so your username is what you'll go by here. Choose
        wisely—because once you get a name, you can't change it.
      </p>
      {error && (
        <div
          className="auth-error"
          style={{ color: "#d93025", marginBottom: 12, textAlign: "center", fontSize: "0.875rem" }}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleStep2Submit} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); if(error) setError(""); }}
            className="auth-input"
            required
            disabled={loading}
          />
          {username && username.length >= 3 && (
            <div className="username-feedback success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.3333 4L6 11.3333L2.66666 8"
                  stroke="#46D160"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Nice! Username available
            </div>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if(error) setError(""); }}
            className="auth-input"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`auth-submit-btn ${(!username || !password || loading) ? "disabled" : ""}`}
          disabled={!username || !password || loading}
        >
          {loading ? "Registering..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
