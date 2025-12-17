import React, { useEffect, useState, useRef } from "react";
import "../css/Navbar.css";
import redditLogo from "../../assets/images/reddit_logo.png";
import AuthModal from "./AuthModal";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom"; 
import { getMyProfile, searchUsers } from "../../api/userApi";
import { searchCommunities } from "../../api/communityApi";
import { searchPosts } from "../../api/postApi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    posts: [],
    communities: [],
    users: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

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

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search with debounce
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ posts: [], communities: [], users: [] });
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const [postsData, communitiesData, usersData] = await Promise.all([
        searchPosts(query).catch(() => ({ posts: [] })),
        searchCommunities(query).catch(() => ({ communities: [] })),
        searchUsers(query).catch(() => ({ users: [] }))
      ]);

      setSearchResults({
        posts: postsData.posts || postsData || [],
        communities: communitiesData.communities || communitiesData || [],
        users: usersData.users || usersData || []
      });
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ posts: [], communities: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (400ms debounce)
    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 400);
  };

  // Navigate to result and close dropdown
  const handleResultClick = (type, identifier) => {
    setShowResults(false);
    setSearchQuery("");
    
    if (type === "post") {
      navigate(`/post/${identifier}`);
    } else if (type === "community") {
      navigate(`/community/${identifier}`);
    } else if (type === "user") {
      navigate(`/user/${identifier}`);
    }
  };

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
  };

  const hasResults = searchResults.posts.length > 0 || 
                     searchResults.communities.length > 0 || 
                     searchResults.users.length > 0;
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
          <div className="search-bar-container" ref={searchRef}>
            <div className="search-bar">
              <span className="search-icon" />
              <input
                type="text"
                placeholder="Search Reddit"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && hasResults && setShowResults(true)}
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-loading">Searching...</div>
                ) : hasResults ? (
                  <>
                    {/* Posts Section */}
                    {searchResults.posts.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-items">
                          {searchResults.posts.slice(0, 5).map((post) => (
                            <div
                              key={post._id}
                              className="search-result-item"
                              onClick={() => handleResultClick("post", post._id)}
                            >
                              <div className="search-result-icon">📄</div>
                              <div className="search-result-content">
                                <div className="search-result-title">{post.title}</div>
                                <div className="search-result-meta">
                                  r/{post.communityName} • Posted by u/{post.author?.username || "unknown"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Communities Section */}
                    {searchResults.communities.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">Communities</div>
                        <div className="search-section-items">
                          {searchResults.communities.slice(0, 5).map((community) => (
                            <div
                              key={community._id}
                              className="search-result-item"
                              onClick={() => handleResultClick("community", community.name)}
                            >
                              <div className="search-result-icon community-icon">
                                {community.profilePictureUrl ? (
                                  <img src={community.profilePictureUrl} alt={community.name} />
                                ) : (
                                  "r/"
                                )}
                              </div>
                              <div className="search-result-content">
                                <div className="search-result-title">r/{community.name}</div>
                                <div className="search-result-meta">
                                  {community.memberCount || 0} members
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users Section */}
                    {searchResults.users.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-header">People</div>
                        <div className="search-section-items">
                          {searchResults.users.slice(0, 5).map((userResult) => (
                            <div
                              key={userResult._id}
                              className="search-result-item"
                              onClick={() => handleResultClick("user", userResult.username)}
                            >
                              <div className="search-result-icon user-icon">
                                {userResult.profilePictureUrl ? (
                                  <img src={userResult.profilePictureUrl} alt={userResult.username} />
                                ) : (
                                  userResult.username.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="search-result-content">
                                <div className="search-result-title">u/{userResult.username}</div>
                                {userResult.bio && (
                                  <div className="search-result-meta">{userResult.bio}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="search-no-results">No results found</div>
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
