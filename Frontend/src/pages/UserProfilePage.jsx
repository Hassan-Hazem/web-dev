import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import api from "../api/axios";
import { updateUserProfile } from "../api/userApi";
import { getUserComments, voteOnComment } from "../api/commentApi";
import CreatePostModal from "../components/react/CreatePostModal";
import ProfileRightSidebar from "../components/react/ProfileRightSidebar";
import PostCard from "../components/react/PostCard";
import CommentCard from "../components/react/CommentCard";
import snooImg from "../assets/images/Snoo_Expression_NoMouth.png";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const { user, updateUserProfile: updateAuthUser } = useAuth();
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const isSelf = !routeUsername || routeUsername === user?.username;
  
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
  const [userComments, setUserComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
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
        const url = isSelf ? "/users/me/info" : `/users/${routeUsername}`;
        const response = await api.get(url);
        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    // For self view, require auth; for other users, fetch regardless
    if (isSelf ? !!user : true) {
      fetchProfileData();
    }
  }, [user, routeUsername, isSelf]);

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

  // Reset posts and tab when profile/user changes
  useEffect(() => {
    setPostsPage(1);
    setUserPosts([]);
    setPostsHasMore(true);
    setActiveTab("Overview");
  }, [profileData?.username]);

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

  useEffect(() => {
    const fetchUserComments = async () => {
      if (activeTab !== "Comments" && activeTab !== "Overview") return;
      if (!profileData?.username) return;
      
      setLoadingComments(true);
      setCommentsError(null);
      try {
        const comments = await getUserComments(profileData.username, { limit: 50 });
        setUserComments(comments || []);
      } catch (err) {
        console.error("Error fetching user comments:", err);
        setCommentsError(err.response?.data?.message || "Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    };

    fetchUserComments();
  }, [activeTab, profileData?.username]);

  const handleCommentVote = async (commentId, voteType) => {
    // Require auth to vote
    if (!user) {
      // No modal on profile page; simply ignore if logged out
      return;
    }

    const target = userComments.find((c) => c._id === commentId);
    if (!target) return;

    const prevVote = target.userVote || null;
    const prevScore = typeof target.score === "number"
      ? target.score
      : (target.upvotes || 0) - (target.downvotes || 0);

    const nextVote = prevVote === voteType ? null : voteType;

    let delta = 0;
    if (prevVote === "up") delta -= 1;
    if (prevVote === "down") delta += 1;
    if (nextVote === "up") delta += 1;
    if (nextVote === "down") delta -= 1;

    // Optimistic update
    setUserComments((prev) => prev.map((c) => (
      c._id === commentId ? { ...c, userVote: nextVote, score: prevScore + delta } : c
    )));

    try {
      const res = await voteOnComment(commentId, voteType);
      const updated = res.comment || res;
      setUserComments((prev) => prev.map((c) => (
        c._id === commentId
          ? {
              ...c,
              ...updated,
              userVote: nextVote,
              score: (updated?.upvotes || 0) - (updated?.downvotes || 0),
            }
          : c
      )));
    } catch (err) {
      console.error("Vote error (profile page):", err);
      // Revert on failure
      setUserComments((prev) => prev.map((c) => (
        c._id === commentId ? { ...c, userVote: prevVote, score: prevScore } : c
      )));
    }
  };


  // If viewing own profile without being logged in, prompt login.
  if (!user && isSelf) {
    return (
      <div className="login-message">
        <h2>You are not logged in!</h2>
        <p>Please log in to view your profile.</p>
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

  const username = profileData.username || user?.username || routeUsername;
  const karma = profileData.karma || 0;
  const joinDate = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Unknown";
  const redditAgeYears = profileData.createdAt
    ? `${Math.max(1, Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)))}y`
    : "--";
  const tabs = isSelf
    ? ["Overview", "Posts", "Comments", "Saved", "History", "Hidden", "Upvoted", "Downvoted"]
    : ["Overview", "Posts", "Comments"];

  const tabContent = {
    "Overview": { 
      title: "Showing all content", 
      heading: isSelf ? "You don't have any posts yet" : `u/${username} doesn't have any posts yet`, 
      text: isSelf ? "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." : "" 
    },
    "Posts": { 
      title: `Posts by u/${username}`, 
      heading: isSelf ? "You don't have any posts yet" : `u/${username} doesn't have any posts yet`, 
      text: isSelf ? "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." : "" 
    },
    "Comments": { 
      title: "Showing all comments", 
      heading: isSelf ? "You don't have any comments yet" : `u/${username} doesn't have any comments yet`, 
      text: isSelf ? "Once you comment in a community, it'll show up here. If you'd rather hide your comments, update your settings." : "" 
    },
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
        {isSelf && (tab === "Overview" || tab === "Posts") && (
          <div className="overview-actions">
            <button className="create-post-btn" onClick={() => setIsCreatePostOpen(true)}>Create Post</button>
          </div>
        )}
      </div>
      <div className="overview-feed">
        {(tab === "Comments" && loadingComments) || (tab !== "Comments" && loadingPosts) ? (
          <p>Loading...</p>
        ) : (tab === "Comments" && commentsError) || (tab !== "Comments" && postsError) ? (
          <p style={{ color: "red" }}>{tab === "Comments" ? commentsError : postsError}</p>
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

  const handleShareProfile = async () => {
    const profileUrl = `https://redditfront.onrender.com/user/${username}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${username}'s Profile`,
          url: profileUrl
        });
        return;
      }
      
      await navigator.clipboard.writeText(profileUrl);
      alert("Profile link copied to clipboard!");
    } catch (err) {
      console.error("Share failed:", err);
      try {
        const textarea = document.createElement("textarea");
        textarea.value = profileUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Profile link copied to clipboard!");
      } catch (e) {
        console.error("Clipboard fallback failed:", e);
      }
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
              {isSelf && (
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
              )}
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
              <button className="profile-share-btn" onClick={handleShareProfile} aria-label="Share profile">Share</button>
            </div>
          </div>
          {isSelf && avatarError && <p className="profile-avatar-error" role="alert">{avatarError}</p>}

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
            {isSelf && activeTab === "Upvoted" && upvotedPosts.length > 0
              ? upvotedPosts.map(post => <PostCard key={post._id} post={post} />)
              : isSelf && activeTab === "Downvoted" && downvotedPosts.length > 0
              ? downvotedPosts.map(post => <PostCard key={post._id} post={post} />)
              : activeTab === "Comments" && userComments.length > 0
              ? (
                <>
                  {userComments.map(comment => (
                    <div 
                      key={comment._id} 
                      className="user-comment-item"
                    >
                      <div
                        className="comment-post-context"
                        onClick={() => navigate(`/post/${comment.post?._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="comment-post-title">
                          {comment.post?.title || "Post"}
                        </span>
                      </div>
                      <CommentCard comment={comment} onVote={handleCommentVote} />
                    </div>
                  ))}
                </>
              )
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

        <ProfileRightSidebar username={username} joinDate={joinDate} karma={karma} redditAgeYears={redditAgeYears} isSelf={isSelf} />
      </div>
    </div>
  );
}
