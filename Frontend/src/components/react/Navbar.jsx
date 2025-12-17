import React, { useEffect, useState, useRef, useCallback } from "react";
import "../css/Navbar.css";
import redditLogo from "../../assets/images/reddit_logo.png";
import AuthModal from "./AuthModal";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom"; 
import { getMyProfile } from "../../api/userApi";
import { searchPosts } from "../../api/searchApi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate(); 
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfilePicUrl(null);
        return;
      }
      try {
        const data = await getMyProfile();
        if (data?.profilePictureUrl) {
          setProfilePicUrl(data.profilePictureUrl);
        } else {
          setProfilePicUrl(null);
        }
      } catch (err) {
        console.error("Failed to load profile picture", err);
        setProfilePicUrl(null);
      }
    };

    loadProfile();
  }, [user]);

<<<<<<< Updated upstream
=======
  const avatarUrl = user?.profilePictureUrl || profilePicUrl;

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchPosts(query.trim(), 5);
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  // Handle clicking on a search result
  const handleResultClick = (postId) => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/post/${postId}`);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

>>>>>>> Stashed changes
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
          <div className="search-bar" ref={searchRef}>
            <span className="search-icon" />
            <input
              type="text"
              placeholder="Search Reddit"
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
            />
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-result-item loading">
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((post) => (
                      <div
                        key={post._id}
                        className="search-result-item"
                        onClick={() => handleResultClick(post._id)}
                      >
                        <div className="search-result-content">
                          <div className="search-result-title">{post.title}</div>
                          <div className="search-result-meta">
                            <span>r/{post.community?.name}</span>
                            <span>•</span>
                            <span>u/{post.author?.username}</span>
                            {post.vectorScore && (
                              <>
                                <span>•</span>
                                <span className="match-score">
                                  {Math.round(post.vectorScore * 100)}% match
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="search-result-footer">
                      <button onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setShowResults(false);
                      }}>
                        See all results for "{searchQuery}"
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="search-result-item no-results">
                    <span>No results found for "{searchQuery}"</span>
                  </div>
                )}
              </div>
            )}
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
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="profile" />
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
