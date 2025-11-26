import React, { useState } from "react";
import "./AuthModal.css";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const [signupStep, setSignupStep] = useState(1);

  if (!isOpen) return null;

  const handleSwitchToLogin = () => {
    setView("login");
    setSignupStep(1);
  };

  const handleSwitchToSignup = () => {
    setView("signup");
    setSignupStep(1);
  };

  const handleSignupContinue = () => {
    setSignupStep(2);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleBackdropClick}>
      <div className="auth-modal-content">
        <button className="auth-modal-close" onClick={onClose}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {view === "login" ? (
          <Login onSwitchToSignup={handleSwitchToSignup} />
        ) : (
          <Signup
            step={signupStep}
            onSwitchToLogin={handleSwitchToLogin}
            onContinue={handleSignupContinue}
            setSignupStep={setSignupStep}
          />
        )}
      </div>
    </div>
  );
}
