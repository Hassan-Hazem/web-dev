import React from "react";
import "./PostCard.css";

export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="vote-section">
        <button className="arrow up" />
        <span className="vote-count">{post.votes}</span>
        <button className="arrow down" />
      </div>
      <div className="post-content">
        <div className="post-header">
          <span className="post-title">{post.title}</span>
          <div className="post-meta">
            <span className="post-subreddit">{post.subreddit}</span>
            <span className="post-author">• Posted by u/{post.author}</span>
          </div>
        </div>
        <div className="post-image">
          <img src={post.image} alt={post.title} />
        </div>
        <div className="post-actions">
          <button className="action-btn">
            <span className="action-icon comment" />
            {post.comments} Comments
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
