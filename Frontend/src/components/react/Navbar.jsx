import React, { useState } from "react";
import "../css/Navbar.css";
import redditLogo from "../../assets/images/reddit_logo.png";
import AuthModal from "./AuthModal";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom"; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  const navigate = useNavigate(); 

  const openLoginModal = () => {
    setAuthView("login");
    setIsAuthModalOpen(true);
  };

  const closeModal = () => setIsAuthModalOpen(false);
  const openCreatePost = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsCreatePostOpen(true);
    }
  };
  const closeCreatePost = () => setIsCreatePostOpen(false);

  const goToProfile = () => {
    if (user && user.username) {
      navigate(`/user/${user.username}`); 
    }
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
          <button className="create-post-btn" onClick={openCreatePost}>
            <span className="plus-icon">+</span>
            Create
          </button>
          <button className="get-app-btn">Get App</button>

          {!user && (
            <button className="login-btn" onClick={openLoginModal}>Log In</button>
          )}

          {user && (
            <div className="user-section">
              <div className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="user-name">{user.username}</span>
              <button
                className="logout-btn"
                onClick={logout}
            <div
              className="user-section"
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
              onClick={goToProfile} 
            >
              <div
                className="user-avatar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#ff4500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="user-name" style={{ fontWeight: 500 }}>
                {user.username}
              </span>
              <button
                className="logout-btn"
                onClick={(e) => {
                  e.stopPropagation(); 
                  logout();
                }}
                style={{
                  background: "#eaeaea",
                  color: "#333",
                  border: "none",
                  borderRadius: 20,
                  padding: "6px 16px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeModal}
        initialView={authView}
      />
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={closeCreatePost}
      />
    </>
  );
}
