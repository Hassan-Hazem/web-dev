import React from "react";
import "../css/CommentCard.css";

export default function CommentCard({ comment }) {
  return (
    <div className="comment-card">
      <div className="comment-votes">
        <button className="arrow up"></button>
        <span className="vote-count">{comment.votes}</span>
        <button className="arrow down"></button>
      </div>

      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">u/{comment.author}</span>
          <span className="comment-meta">• {comment.time}</span>
        </div>

        <p className="comment-text">{comment.text}</p>

        <div className="comment-actions">
          <button className="comment-btn">Reply</button>
          <button className="comment-btn">Share</button>
          <button className="comment-btn">Save</button>
        </div>
      </div>
    </div>
  );
}
