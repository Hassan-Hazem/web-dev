import React, { useState } from "react";
import "./Navbar.css";
import redditLogo from "../assets/images/reddit_logo.png";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  const handleLoginClick = () => {
    setAuthView("login");
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="reddit-logo">
            <img src={redditLogo} alt="Reddit" className="reddit-icon" />
            <span className="reddit-text">reddit</span>
          </div>
        </div>
        <div className="navbar-center">
          <div className="search-bar">
            <span className="search-icon" />
            <input
              type="text"
              placeholder="Search Reddit"
              className="search-input"
            />
          </div>
        </div>
        <div className="navbar-right">
          <button className="get-app-btn">Get App</button>
          <button className="login-btn" onClick={handleLoginClick}>Log In</button>
        </div>
      </nav>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authView}
      />
    </>
  );
}
