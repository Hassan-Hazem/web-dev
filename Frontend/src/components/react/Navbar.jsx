import React, { useEffect, useState } from "react";
import "../css/Navbar.css";
import redditLogo from "../../assets/images/reddit_logo.png";
import AuthModal from "./AuthModal";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom"; 
import { getMyProfile } from "../../api/userApi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const navigate = useNavigate(); 
  useEffect(() => {
    // No user or already have avatar in auth context: nothing to do
    if (!user || user.profilePictureUrl) return;

    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        if (isMounted) setProfilePicUrl(data?.profilePictureUrl || null);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load profile picture", err);
          setProfilePicUrl(null);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const avatarUrl = user?.profilePictureUrl || profilePicUrl;

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
  const handleRedditLogoClick = () => {
    navigate("/");
  }
  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="reddit-logo">
            <img src={redditLogo} alt="Reddit" className="reddit-icon" onClick={handleRedditLogoClick} />
            <span className="reddit-text" onClick={handleRedditLogoClick}>reddit</span>
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
            <div
              className="user-section"
              onClick={goToProfile}
            >
              <div className="user-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="profile" />
                ) : (
                  user.username ? user.username.charAt(0).toUpperCase() : "U"
                )}
              </div>
              <span className="user-name">
                {user.username}
              </span>
              <button
                className="logout-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
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
