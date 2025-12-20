import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios"; 
import "../css/PostCard.css";
import AuthModal from "./AuthModal";
import SummarizeModal from "./SummarizeModal";

export default function PostCard({ post, onDelete, showBackButton, onBack }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialScore = (post.upvotes || 0) - (post.downvotes || 0);
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  
  // Check if current user is the post owner
  const isOwner = user && post.author && user._id === post.author._id;

  // Helper to format URLs (handles local uploads vs external links)
  const formatUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") 
      ? url 
      : `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}/${url.replace(/\\/g, "/")}`;
  };

  // Helper to detect if a URL is a video
  const isVideoUrl = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|mpeg)$/i.test(url);
  };

  // Prepare Data
  const communityIcon = post.community?.profilePictureUrl
    ? formatUrl(post.community.profilePictureUrl)
    : null; 
    
  const subredditName = post.community ? `r/${post.community.name}` : "r/unknown";
  const authorName = post.author ? `u/${post.author.username}` : "u/deleted";
  const postMediaUrl = formatUrl(post.imageUrl);
  const commentCount = post.commentCount ?? 0;

  const handleVote = async (type) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const previousVote = userVote;
    const previousScore = score;
    const nextVote = previousVote === type ? null : type;

    let delta = 0;
    if (previousVote === 'up') delta -= 1;
    if (previousVote === 'down') delta += 1;
    if (nextVote === 'up') delta += 1;
    if (nextVote === 'down') delta -= 1;

    setUserVote(nextVote);
    setScore((s) => s + delta);

    try {
      const response = await api.post(`/posts/${post._id}/vote`, { voteType: type });
      const { upvotes, downvotes } = response.data;
      setScore(upvotes - downvotes);
      setUserVote(nextVote);
    } catch (error) {
      console.error("Voting error:", error);
      setUserVote(previousVote);
      setScore(previousScore);
      if (error.response?.status === 401) setShowLoginModal(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id);
      alert("Post deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleSummarize = () => {
    setShowSummarizeModal(true);
    setShowMenu(false);
  };

  const handleShare = async () => {
    const postUrl = `https://redditfront.onrender.com/post/${post._id}`;
    
    try {
      // Try native Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url: postUrl
        });
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(postUrl);
     
    } catch (err) {
      console.error("Share failed:", err);
      // Manual fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = postUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {
        console.error("Clipboard fallback failed:", e);
      }
    }
  };

  return (
    <>
      {showLoginModal && createPortal(
        <AuthModal
          isOpen
          initialView="login"
          onClose={() => setShowLoginModal(false)}
        />,
        document.body
      )}
      <SummarizeModal 
        isOpen={showSummarizeModal}
        post={post}
        onClose={() => setShowSummarizeModal(false)}
      />
      <div className="post-card">
      {showBackButton && (
        <button className="post-back-btn" onClick={onBack} aria-label="Go back">
          ←
        </button>
      )}

      <div className="vote-section">
        <button 
          className={`arrow up ${userVote === 'up' ? 'active-up' : ''}`} 
          onClick={() => handleVote('up')}
        />
        <span className={`vote-count ${userVote === 'up' ? 'text-orange' : userVote === 'down' ? 'text-blue' : ''}`}>
          {score}
        </span>
        <button 
          className={`arrow down ${userVote === 'down' ? 'active-down' : ''}`} 
          onClick={() => handleVote('down')}
        />
      </div>

      <div className="post-content">
        <div className="post-header">
          <div
            className="post-community-icon"
            onClick={() => post.community?.name && navigate(`/community/${post.community.name}`)}
            style={{ cursor: "pointer" }}
          >
            {communityIcon ? (
              <img
                src={communityIcon}
                alt={post.community?.name || "Community"}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget.nextElementSibling;
                  if (placeholder && placeholder.classList.contains("post-community-fallback")) {
                    placeholder.style.display = "inline-block";
                  }
                }}
              />
            ) : null}
            <div className="post-community-fallback" style={{ display: communityIcon ? "none" : "inline-block" }}>
              <div className="post-community-placeholder" />
            </div>
          </div>

          <div className="post-header-text">
            <span
              className="post-subreddit"
              onClick={() => post.community?.name && navigate(`/community/${post.community.name}`)}
              style={{ cursor: "pointer" }}
            >
              {subredditName}
            </span>
            <span className="post-dot">•</span>
            <span className="post-author">
              Posted by
              <span
                onClick={() => post.author?.username && navigate(`/user/${post.author.username}`)}
                style={{ cursor: "pointer", marginLeft: 4 }}
              >
                {authorName}
              </span>
            </span>
          </div>

          <div className="post-menu-container">
            <button 
              className="post-menu-btn" 
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Post options"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="post-menu-dropdown">
                <button 
                  className="menu-item delete" 
                  onClick={handleDelete}
                  disabled={deleting || !isOwner}
                  title={!isOwner ? "You can only delete your own posts" : ""}
                >
                  🗑️ {deleting ? "Deleting..." : "Delete"}
                </button>
                <button 
                  className="menu-item" 
                  onClick={handleSummarize}
                >
                  📝 Summarize
                </button>
              </div>
            )}
          </div>
        </div>
        
        <h3 
          className="post-title" 
          onClick={() => navigate(`/post/${post._id}`)}
          style={{ cursor: "pointer" }}
        >
          {post.title}
        </h3>

        {/* Updated Media Render Logic */}
        {postMediaUrl && (
          <div className="post-media">
            {isVideoUrl(postMediaUrl) ? (
              <video 
                src={postMediaUrl} 
                controls 
                className="post-video"
                style={{ width: "100%", maxHeight: "512px", borderRadius: "8px" }}
              />
            ) : (
              <img 
                src={postMediaUrl} 
                alt={post.title}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={imageLoaded ? 'loaded' : 'loading'}
              />
            )}
          </div>
        )}
        
        {post.content && !postMediaUrl && (
            <div className="post-text-body">{post.content}</div>
        )}
        
        <div className="post-actions">
          <button 
            className="action-btn"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <span className="action-icon comment" />
            {commentCount} Comments
          </button>
          <button className="action-btn" onClick={handleShare}>
            <span className="action-icon share" />
            Share
          </button>
        </div>
      </div>
    </div>
    </>
  );
}