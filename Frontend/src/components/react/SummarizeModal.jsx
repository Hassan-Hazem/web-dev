import React, { useState } from "react";
import { createPortal } from "react-dom";
import { summarizePost } from "../../api/aiApi";
import "../css/SummarizeModal.css";

export default function SummarizeModal({ isOpen, post, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarize = async () => {
    if (!post?.title || !post?.content) {
      setError("Post title and content are required to generate a summary");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await summarizePost(post.title, post.content);
      setSummary(result.summary);
    } catch (err) {
      console.error("Summarize error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to generate summary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSummary(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="summarize-modal-overlay" onClick={handleClose}>
      <div className="summarize-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="summarize-modal-header">
          <h2>📝 Summarize Post</h2>
          <button
            className="summarize-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="summarize-modal-body">
          {/* Post Info */}
          <div className="post-info">
            <h3 className="post-title">{post?.title}</h3>
            <p className="post-preview">
              {post?.content?.substring(0, 150)}
              {post?.content?.length > 150 ? "..." : ""}
            </p>
          </div>

          {/* Summary Section */}
          {summary ? (
            <div className="summary-result">
              <h4>AI Generated Summary:</h4>
              <div className="summary-text">{summary}</div>
            </div>
          ) : error ? (
            <div className="summary-error">
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="summary-loading">
              <div className="spinner"></div>
              <p>Generating summary...</p>
            </div>
          ) : (
            <div className="summary-empty">
              <p>Click the "Generate Summary" button to summarize this post.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="summarize-modal-footer">
          <button
            className="btn-secondary"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="btn-primary"
            onClick={handleSummarize}
            disabled={loading || !!summary}
          >
            {loading ? "Generating..." : summary ? "Summary Generated" : "Generate Summary"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
