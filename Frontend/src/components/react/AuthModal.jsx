import React, { useState } from "react";
import "../css/AuthModal.css";
import Login from "./Login";
import Signup from "./Signup";
import VerifyEmail from "./VerifyEmail";
import Interests from "./Interests";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const [signupStep, setSignupStep] = useState(1);
  const [registrationEmail, setRegistrationEmail] = useState("");

  if (!isOpen) return null;

  const handleSwitchToLogin = () => {
    setView("login");
    setSignupStep(1);
    setRegistrationEmail("");
  };

  const handleSwitchToSignup = () => {
    setView("signup");
    setSignupStep(1);
    setRegistrationEmail("");
  };

  const handleSignupContinue = () => {
    setSignupStep(2);
  };

  const handleRegistrationComplete = (email) => {
    setRegistrationEmail(email);
    setView("verify");
  };

  const handleVerificationComplete = () => {
    
    setView("interests");
  };

  const handleInterestsComplete = (interests) => {
    console.log("Selected interests:", interests);
    // Here you can save interests to backend if needed
    // For now, we'll just close the modal and complete the flow
    window.location.reload(); // Reload to update the auth state
  };

  const handleInterestsSkip = () => {
    window.location.reload(); // Reload to update the auth state
  };

  const handleBackToSignup = () => {
    setView("signup");
    setSignupStep(1);
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
        
        {view === "login" && (
          <Login onSwitchToSignup={handleSwitchToSignup} closeModal={onClose} />
        )}
        
        {view === "signup" && (
          <Signup
            step={signupStep}
            onSwitchToLogin={handleSwitchToLogin}
            onContinue={handleSignupContinue}
            onRegistrationComplete={handleRegistrationComplete}
            setSignupStep={setSignupStep}
            closeModal={onClose}
          />
        )}
        
        {view === "verify" && (
          <VerifyEmail
            email={registrationEmail}
            onVerified={handleVerificationComplete}
            onBack={handleBackToSignup}
          />
        )}
        
        {view === "interests" && (
          <Interests
            onComplete={handleInterestsComplete}
            onSkip={handleInterestsSkip}
          />
        )}
      </div>
    </div>
  );
}