import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/authContext";
import "../css/CommentCard.css";

export default function CommentCard({ comment, onCommentDeleted }) {
  const { user } = useAuth();
  // Calculate votes properly - upvotes minus downvotes
  const initialVotes = (comment.upvotes || 0) - (comment.downvotes || 0);
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(comment.userVote || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content || "");
  const [loading, setLoading] = useState(false);

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  const handleVote = async (voteType) => {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      setLoading(true);
      // Convert upvote/downvote to up/down for backend
      const type = voteType === 'upvote' ? 'up' : 'down';
      const result = await api.post(`/comments/${comment._id}/vote`, { voteType: type });
      // Update votes based on upvotes and downvotes from response
      const newVotes = (result.data.comment.upvotes || 0) - (result.data.comment.downvotes || 0);
      setVotes(newVotes);
      setUserVote(result.data.comment.userVote);
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      setLoading(true);
      await api.delete(`/comments/${comment._id}`);
      if (onCommentDeleted) {
        onCommentDeleted(comment._id);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editedContent.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/comments/${comment._id}`, { content: editedContent });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      alert(error.response?.data?.message || "Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user && user._id === comment.author?._id;

  return (
    <div className="comment-card">
      <div className="comment-votes">
        <button
          className={`arrow up ${userVote === 'upvote' ? 'active' : ''}`}
          onClick={() => handleVote('upvote')}
          disabled={loading || !user}
          title={!user ? "Login to vote" : ""}
        >
          ▲
        </button>
        <span className="vote-count">{votes}</span>
        <button
          className={`arrow down ${userVote === 'downvote' ? 'active' : ''}`}
          onClick={() => handleVote('downvote')}
          disabled={loading || !user}
          title={!user ? "Login to vote" : ""}
        >
          ▼
        </button>
      </div>

      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">
            u/{comment.author?.username || "Unknown"}
          </span>
          <span className="comment-meta">• {formatDate(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="comment-edit">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="comment-edit-textarea"
            />
            <div className="comment-edit-actions">
              <button
                onClick={handleEditSubmit}
                disabled={loading}
                className="edit-save-btn"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="edit-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{editedContent}</p>
        )}

        <div className="comment-actions">
          {canEdit && (
            <>
              <button
                className="comment-btn"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="comment-btn delete"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
