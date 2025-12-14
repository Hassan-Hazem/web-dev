import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import api from "../../api/axios"; 
import "../css/PostCard.css";
import AuthModal from "./AuthModal";

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
  
  // Check if current user is the post owner
  const isOwner = user && post.author && user._id === post.author._id;

  // Helper to format URLs (handles local uploads vs external links)
  const formatUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") 
      ? url 
      : `http://localhost:5000/${url.replace(/\\/g, "/")}`;
  };

  // Prepare Data
  const communityIcon = post.community?.profilePictureUrl 
    ? formatUrl(post.community.profilePictureUrl) 
    : null; // Fallback to default CSS background if null
    
  const subredditName = post.community ? `r/${post.community.name}` : "r/unknown";
  const authorName = post.author ? `u/${post.author.username}` : "u/deleted";
  const postImageUrl = formatUrl(post.imageUrl);

  const handleVote = async (type) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Optimistic update: adjust UI immediately, then reconcile with server
    const previousVote = userVote;
    const previousScore = score;

    const nextVote = previousVote === type ? null : type;

    // Calculate score delta based on vote transition
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
    alert("Summarize feature coming soon!");
    setShowMenu(false);
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
      <div className="post-card">
      {/* Back Button - if in detail view */}
      {showBackButton && (
        <button className="post-back-btn" onClick={onBack} aria-label="Go back">
          ←
        </button>
      )}

      {/* Vote Section */}
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

      {/* Content Section */}
      <div className="post-content">
        <div className="post-header">
          {/* Community Icon */}
          <div className="post-community-icon">
            {communityIcon ? (
              <img src={communityIcon} alt="Community" />
            ) : (
              // Fallback placeholder circle if no image
              <div className="post-community-placeholder" />
            )}
          </div>

          <div className="post-header-text">
            <span className="post-subreddit">{subredditName}</span>
            <span className="post-dot">•</span>
            <span className="post-author">Posted by {authorName}</span>
          </div>

          {/* Three Dots Menu */}
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
                  disabled
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

        {/* Content Render */}
        {postImageUrl && (
          <div className="post-image">
            <img 
              src={postImageUrl} 
              alt={post.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={imageLoaded ? 'loaded' : 'loading'}
            />
          </div>
        )}
        
        {post.content && !postImageUrl && (
            <div className="post-text-body">{post.content}</div>
        )}
        
        {/* Actions */}
        <div className="post-actions">
          <button 
            className="action-btn"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            <span className="action-icon comment" />
            {post.commentCount || 0} Comments
          </button>
          <button className="action-btn">
            <span className="action-icon share" />
            Share
          </button>
        </div>
      </div>
    </div>
    </>
  );
}