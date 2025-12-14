import React, { useState, useEffect, useRef } from "react";

import { useAuth } from "../context/authContext";
import api from "../api/axios";
import { updateUserProfile } from "../api/userApi";
import CreatePostModal from "../components/react/CreatePostModal";
import ProfileRightSidebar from "../components/react/ProfileRightSidebar";
import PostCard from "../components/react/PostCard";
import snooImg from "../assets/images/Snoo_Expression_NoMouth.png";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const { user, updateUserProfile: updateAuthUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState("Overview");
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [upvotedPosts, setUpvotedPosts] = useState([]);
  const [downvotedPosts, setDownvotedPosts] = useState([]);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const response = await api.get("/users/me/info");
        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profileData?.username) return;
      
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const response = await api.get(`/posts/user/${profileData.username}?page=${postsPage}&limit=10`);
        const newPosts = response.data;
        
        if (newPosts.length === 0) {
          setPostsHasMore(false);
        } else {
          // Replace posts if page 1, append otherwise
          setUserPosts((prev) => postsPage === 1 ? newPosts : [...prev, ...newPosts]);
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setPostsError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [profileData?.username, postsPage]);

  useEffect(() => {
    const fetchUpvotedPosts = async () => {
      if (activeTab !== "Upvoted") return;
      
      try {
        const response = await api.get("/votes/upvoted?limit=50");
        setUpvotedPosts(response.data);
      } catch (err) {
        console.error("Error fetching upvoted posts:", err);
      }
    };

    fetchUpvotedPosts();
  }, [activeTab]);

  // Reset pagination when tab changes to Posts or Overview
  useEffect(() => {
    if (activeTab === "Posts" || activeTab === "Overview") {
      setPostsPage(1);
      setUserPosts([]);
      setPostsHasMore(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchDownvotedPosts = async () => {
      if (activeTab !== "Downvoted") return;
      
      try {
        const response = await api.get("/votes/downvoted?limit=50");
        setDownvotedPosts(response.data);
      } catch (err) {
        console.error("Error fetching downvoted posts:", err);
      }
    };

    fetchDownvotedPosts();
  }, [activeTab]);


  if (!user) {
    return (
      <div className="login-message">
        <h2>You are not logged in!</h2>
        <p>Please log in to view this profile.</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="login-message">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-message">
        <h2>Error loading profile</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="login-message">
        <h2>Profile not found</h2>
      </div>
    );
  }

  const username = profileData.username || user.username;
  const karma = profileData.karma || 0;
  const joinDate = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Unknown";
  const redditAgeYears = profileData.createdAt
    ? `${Math.max(1, Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)))}y`
    : "--";
  const tabs = [
    "Overview", "Posts", "Comments", "Saved",
    "History", "Hidden", "Upvoted", "Downvoted"
  ];

  const tabContent = {
    "Overview": { title: "Showing all content", heading: "You don't have any posts yet", text: "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." },
    "Posts": { title: `Posts by u/${username}`, heading: "You don't have any posts yet", text: "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." },
    "Comments": { title: "Showing all comments", heading: "You don't have any comments yet", text: "Once you comment in a community, it'll show up here. If you'd rather hide your comments, update your settings." },
    "Saved": { title: "Saved content", heading: "Looks like you haven't saved anything yet", text: "" },
    "History": { title: "History", heading: "Looks like you haven't visited any posts yet", text: "" },
    "Hidden": { title: "Hidden content", heading: "Looks like you haven't hidden anything yet", text: "" },
    "Upvoted": { title: "Upvoted content", heading: "Looks like you haven't upvoted anything yet", text: "" },
    "Downvoted": { title: "Downvoted content", heading: "Looks like you haven't downvoted anything yet", text: "" }
  };

  const renderEmptyFeed = (tab) => (
    <div className="overview-box">
      <div className="overview-header">
        <h3>{tabContent[tab].title}</h3>
        {(tab === "Overview" || tab === "Posts") && (
          <div className="overview-actions">
            <button className="create-post-btn" onClick={() => setIsCreatePostOpen(true)}>Create Post</button>
          </div>
        )}
      </div>
      <div className="overview-feed">
        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : postsError ? (
          <p style={{ color: "red" }}>{postsError}</p>
        ) : (
          <>
            <img src={snooImg} alt="Snoo" className="snoo-img" />
            <h4>{tabContent[tab].heading}</h4>
            {tabContent[tab].text && <p>{tabContent[tab].text}</p>}
          </>
        )}
      </div>
    </div>
  );

  const handleAvatarSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    await uploadAvatar(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const uploadAvatar = async (file) => {
    setAvatarError("");
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Only JPG, PNG, GIF, or WEBP images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image exceeds 2 MB.");
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = uploadResponse.data.filePath;
      const updateRes = await updateUserProfile({ profilePictureUrl: avatarUrl });

      // Prefer server response user object if present
      const updatedUser = updateRes?.user;
      if (updatedUser) {
        setProfileData((prev) => ({ ...(prev || {}), ...updatedUser }));
        updateAuthUser(updatedUser);
      } else {
        setProfileData((prev) => (prev ? { ...prev, profilePictureUrl: avatarUrl } : prev));
        updateAuthUser({ profilePictureUrl: avatarUrl });
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarError(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
      <div className="profile-layout">
        <div className="profile-main">
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              {profileData.profilePictureUrl ? (
                <img
                  src={profileData.profilePictureUrl}
                  alt={`${username}'s avatar`}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-fallback">{username.charAt(0).toUpperCase()}</div>
              )}
              <button
                type="button"
                className="profile-avatar-upload-btn"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                title="Update profile picture"
                aria-label="Update profile picture"
              >
                {avatarUploading ? "…" : "+"}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="profile-header-info">
              <h2 className="profile-title">{username}</h2>
              <p className="meta">u/{username}</p>
              <div className="profile-meta-stats">
                <span>{karma} Karma</span>
                <span>•</span>
                <span>{redditAgeYears} Reddit Age</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="profile-share-btn" aria-label="Share profile">Share</button>
            </div>
          </div>
          {avatarError && <p className="profile-avatar-error" role="alert">{avatarError}</p>}

          <div className="profile-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`profile-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="profile-content">
            {activeTab === "Upvoted" && upvotedPosts.length > 0
              ? upvotedPosts.map(post => <PostCard key={post._id} post={post} />)
              : activeTab === "Downvoted" && downvotedPosts.length > 0
              ? downvotedPosts.map(post => <PostCard key={post._id} post={post} />)
              : (activeTab === "Posts" || activeTab === "Overview") && userPosts.length > 0
              ? (
                <>
                  {userPosts.map(post => <PostCard key={post._id} post={post} />)}
                  {postsHasMore && (
                    <div className="pagination-controls">
                      <button 
                        className="load-more-btn"
                        onClick={() => setPostsPage(prev => prev + 1)}
                        disabled={loadingPosts}
                      >
                        {loadingPosts ? "Loading..." : "Load More Posts"}
                      </button>
                    </div>
                  )}
                  {!postsHasMore && userPosts.length > 0 && (
                    <div className="pagination-end">
                      <p>No more posts to load</p>
                    </div>
                  )}
                </>
              )
              : renderEmptyFeed(activeTab)
            }
          </div>
        </div>

        <ProfileRightSidebar username={username} joinDate={joinDate} karma={karma} redditAgeYears={redditAgeYears} />
      </div>
    </div>
  );
}
