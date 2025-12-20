import { Link } from "react-router-dom";
import "../css/CommentCard.css";

const formatTimeAgo = (isoDate) => {
  if (!isoDate) return "just now";
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffSeconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label}`;
  }

  return "just now";
};

export default function CommentCard({
  comment,
  onVote,
  onReply,
  onDelete,
  canDelete = false,
  canEdit = false,
  onEdit,
  isEditing = false,
  editValue = "",
  onEditChange,
  onEditSubmit,
  onCancelEdit,
  isReply = false,
  showReplies = false,
  onToggleReplies,
  repliesOpen = false,
  repliesLoading = false,
  repliesError = null,
}) {
  const score =
    typeof comment?.score === "number"
      ? comment.score
      : (comment?.upvotes || 0) - (comment?.downvotes || 0);

  const authorName = comment?.author?.username || "deleted";
  const createdLabel = formatTimeAgo(comment?.createdAt);

  const handleVote = (type) => {
    if (!onVote) return;
    onVote(comment._id, type);
  };

  const handleShare = async () => {
    const commentUrl = `https://redditfront.onrender.com/post/${comment.post?._id || comment.post}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Comment by ${authorName}`,
          url: commentUrl
        });
        return;
      }
      
      await navigator.clipboard.writeText(commentUrl);
      alert("Comment link copied to clipboard!");
    } catch (err) {
      console.error("Share failed:", err);
      try {
        const textarea = document.createElement("textarea");
        textarea.value = commentUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Comment link copied to clipboard!");
      } catch (e) {
        console.error("Clipboard fallback failed:", e);
      }
    }
  };

  return (
    <div className={`comment-card ${isReply ? "is-reply" : ""}`}>
      <div className="comment-votes">
        <button
          className={`arrow up ${comment.userVote === "up" ? "active-up" : ""}`}
          onClick={() => handleVote("up")}
          aria-label="Upvote comment"
        />
        <span
          className={`vote-count ${
            comment.userVote === "up"
              ? "text-orange"
              : comment.userVote === "down"
              ? "text-blue"
              : ""
          }`}
        >
          {score}
        </span>
        <button
          className={`arrow down ${comment.userVote === "down" ? "active-down" : ""}`}
          onClick={() => handleVote("down")}
          aria-label="Downvote comment"
        />
      </div>

      <div className="comment-body">
        <div className="comment-header">
          {authorName && authorName !== "deleted" ? (
            <Link to={`/user/${encodeURIComponent(authorName)}`} className="comment-author">
              u/{authorName}
            </Link>
          ) : (
            <span className="comment-author">u/{authorName}</span>
          )}
          <span className="comment-meta">• {createdLabel}</span>
        </div>

        {isEditing ? (
          <div className="comment-edit-block">
            <textarea
              className="comment-textarea"
              value={editValue}
              onChange={(e) => onEditChange && onEditChange(e.target.value)}
              rows={3}
            />
            <div className="comment-edit-actions">
              <button className="comment-btn" onClick={onCancelEdit}>
                Cancel
              </button>
              <button className="comment-btn primary" onClick={onEditSubmit}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment?.content}</p>
        )}

        <div className="comment-actions">
          {onReply && !isEditing && (
            <button className="comment-btn" onClick={() => onReply(comment)}>
              Reply
            </button>
          )}
          <button className="comment-btn" onClick={handleShare}>Share</button>
          {canEdit && onEdit && !isEditing && (
            <button className="comment-btn" onClick={onEdit}>
              Edit
            </button>
          )}
          {canDelete && onDelete && !isEditing && (
            <button className="comment-btn" onClick={() => onDelete(comment._id)}>
              Delete
            </button>
          )}
          {showReplies && onToggleReplies && !isEditing && (
            <button className="comment-btn" onClick={onToggleReplies}>
              {repliesOpen ? "Hide Replies" : "View Replies"}
            </button>
          )}
        </div>

        {repliesLoading && <p className="reply-loading">Loading replies...</p>}
        {repliesError && <p className="comment-error">{repliesError}</p>}
      </div>
    </div>
  );
}
