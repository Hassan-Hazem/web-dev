import React, { useState } from "react";
import api from "../../api/axios"; 
import "../css/PostCard.css";

export default function PostCard({ post }) {
  const initialScore = (post.upvotes || 0) - (post.downvotes || 0);
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(null); 

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
    try {
      const response = await api.post(`/posts/${post._id}/vote`, { voteType: type });
      const { upvotes, downvotes } = response.data;
      setScore(upvotes - downvotes);
      setUserVote(userVote === type ? null : type);
    } catch (error) {
      console.error("Voting error:", error);
      if (error.response?.status === 401) alert("Please login to vote");
    }
  };

  return (
    <div className="post-card">
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
        </div>
        
        <h3 className="post-title">{post.title}</h3>

        {/* Content Render */}
        {postImageUrl && (
          <div className="post-image">
            <img src={postImageUrl} alt={post.title} />
          </div>
        )}
        
        {post.content && !postImageUrl && (
            <div className="post-text-body">{post.content}</div>
        )}
        
        {/* Actions */}
        <div className="post-actions">
          <button className="action-btn">
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
  );
}