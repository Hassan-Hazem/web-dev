import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  createComment,
  deleteComment,
  getCommentReplies,
  getPostComments,
  updateComment,
  voteOnComment,
} from "../api/commentApi";
import AuthModal from "../components/react/AuthModal";
import PostCard from "../components/react/PostCard";
import CommentCard from "../components/react/CommentCard";
import { useAuth } from "../context/authContext";
import "./PostDetailPage.css";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyState, setReplyState] = useState({});

  const mapCommentFromApi = (comment) => ({
    ...comment,
    score:
      typeof comment?.score === "number"
        ? comment.score
        : (comment?.upvotes || 0) - (comment?.downvotes || 0),
    userVote: comment?.userVote || null,
  });

  useEffect(() => {
    let active = true;

    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      setCommentError(null);
      try {
        const postRes = await api.get(`/posts/${postId}`);
        if (!active) return;
        const basePost = postRes.data;

        try {
          const commentsRes = await getPostComments(postId);
          if (!active) return;
          const mapped = (commentsRes || []).map(mapCommentFromApi);
          setComments(mapped);
          // Keep backend's commentCount as it includes all comments + replies
          setPost(basePost);
        } catch (commentErr) {
          console.error("Error fetching comments:", commentErr);
          if (active) {
            setComments([]);
            setPost(basePost);
            setCommentError(
              commentErr.response?.data?.message || "Unable to load comments"
            );
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPostData();
    return () => {
      active = false;
    };
  }, [postId]);

  const updateCommentInState = (commentId, updater) => {
    setComments((prev) => prev.map((c) => (c._id === commentId ? updater(c) : c)));

    setReplyState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((parentId) => {
        const thread = next[parentId];
        if (!thread?.items) return;
        next[parentId] = {
          ...thread,
          items: thread.items.map((item) =>
            item._id === commentId ? updater(item) : item
          ),
        };
      });
      return next;
    });
  };

  const removeCommentInState = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));

    setReplyState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((parentId) => {
        const thread = next[parentId];
        if (!thread?.items) return;
        next[parentId] = {
          ...thread,
          items: thread.items.filter((item) => item._id !== commentId),
        };
      });
      return next;
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null);

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const content = newComment.trim();
    if (!content) {
      setCommentError("Please enter a comment before posting.");
      return;
    }

    setSubmittingComment(true);
    try {
      const created = await createComment({ content, postId });
      setComments((prev) => [mapCommentFromApi(created), ...prev]);
      setNewComment("");
      setPost((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev
      );
    } catch (err) {
      console.error("Comment create error:", err);
      const message = err.response?.data?.message || "Failed to post comment";
      setCommentError(message);
      if (err.response?.status === 401) setShowLoginModal(true);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const target =
      comments.find((c) => c._id === commentId) ||
      Object.values(replyState)
        .flatMap((t) => t.items || [])
        .find((c) => c._id === commentId);
    if (!target) return;

    const previousVote = target.userVote;
    const previousScore =
      typeof target.score === "number"
        ? target.score
        : (target.upvotes || 0) - (target.downvotes || 0);

    const nextVote = previousVote === voteType ? null : voteType;

    let delta = 0;
    if (previousVote === "up") delta -= 1;
    if (previousVote === "down") delta += 1;
    if (nextVote === "up") delta += 1;
    if (nextVote === "down") delta -= 1;

    updateCommentInState(commentId, (c) => ({
      ...c,
      userVote: nextVote,
      score: previousScore + delta,
    }));

    try {
      const res = await voteOnComment(commentId, voteType);
      const updated = res.comment || res;

      updateCommentInState(commentId, (c) => ({
        ...c,
        ...updated,
        score: (updated?.upvotes || 0) - (updated?.downvotes || 0),
        userVote: nextVote,
      }));
    } catch (err) {
      console.error("Vote error:", err);
      updateCommentInState(commentId, (c) => ({
        ...c,
        userVote: previousVote,
        score: previousScore,
      }));
      if (err.response?.status === 401) setShowLoginModal(true);
      else setCommentError(err.response?.data?.message || "Failed to vote");
    }
  };

  const handlePostDelete = (deletedPostId) => {
    if (deletedPostId === postId) {
      alert("Post deleted. Redirecting...");
      navigate(-1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const target =
      comments.find((c) => c._id === commentId) ||
      Object.values(replyState)
        .flatMap((t) => t.items || [])
        .find((c) => c._id === commentId);
    if (!target) return;

    const isCommentAuthor = target.author?._id === user._id;
    const isPostAuthor = post?.author?._id === user._id;
    if (!isCommentAuthor && !isPostAuthor) {
      setCommentError("You can only delete your own comments.");
      return;
    }

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      removeCommentInState(commentId);
      setPost((prev) =>
        prev
          ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }
          : prev
      );
    } catch (err) {
      console.error("Delete comment error:", err);
      const message = err.response?.data?.message || "Failed to delete comment";
      setCommentError(message);
    }
  };

  const handleStartReply = (commentId) => {
    setCommentError(null);
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setActiveReply(commentId);
    setReplyText("");
  };

  const handleReplySubmit = async (commentId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const content = replyText.trim();
    if (!content) {
      setCommentError("Please enter a reply before posting.");
      return;
    }

    setReplying(true);
    setCommentError(null);

    try {
      const created = await createComment({
        content,
        postId,
        parentCommentId: commentId,
      });

      const mapped = mapCommentFromApi(created);
      setReplyState((prev) => {
        const thread = prev[commentId] || {};
        const items = thread.items || [];
        return {
          ...prev,
          [commentId]: {
            ...thread,
            open: true,
            loaded: true,
            items: [mapped, ...items],
          },
        };
      });

      setReplyText("");
      setActiveReply(null);
      setPost((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev
      );
    } catch (err) {
      console.error("Reply create error:", err);
      setCommentError(err.response?.data?.message || "Failed to post reply");
      if (err.response?.status === 401) setShowLoginModal(true);
    } finally {
      setReplying(false);
    }
  };

  const toggleReplies = async (commentId) => {
    setReplyState((prev) => {
      const thread = prev[commentId] || { items: [], open: false };
      return { ...prev, [commentId]: { ...thread, open: !thread.open } };
    });

    const thread = replyState[commentId];
    const alreadyLoaded = thread?.loaded;

    if (thread?.open || alreadyLoaded) return;

    setReplyState((prev) => ({
      ...prev,
      [commentId]: { ...(prev[commentId] || {}), loading: true, error: null },
    }));

    try {
      const res = await getCommentReplies(commentId);
      const mapped = (res || []).map(mapCommentFromApi);
      setReplyState((prev) => ({
        ...prev,
        [commentId]: {
          ...(prev[commentId] || {}),
          open: true,
          loading: false,
          loaded: true,
          items: mapped,
          error: null,
        },
      }));
    } catch (err) {
      console.error("Load replies error:", err);
      setReplyState((prev) => ({
        ...prev,
        [commentId]: {
          ...(prev[commentId] || {}),
          loading: false,
          error: err.response?.data?.message || "Failed to load replies",
        },
      }));
    }
  };

  const handleStartEdit = (comment) => {
    setCommentError(null);
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const isCommentAuthor = comment.author?._id === user._id;
    if (!isCommentAuthor) {
      setCommentError("You can only edit your own comments.");
      return;
    }

    setEditingId(comment._id);
    setEditText(comment.content || "");
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) {
      setCommentError("Please enter content before saving.");
      return;
    }

    try {
      const updated = await updateComment(commentId, editText.trim());
      const mapped = mapCommentFromApi(updated);
      updateCommentInState(commentId, () => mapped);
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit comment error:", err);
      setCommentError(err.response?.data?.message || "Failed to update comment");
      if (err.response?.status === 401) setShowLoginModal(true);
    }
  };

  if (loading) {
    return <div className="post-detail-loading">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="post-detail-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <h2>Post not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {/* Main Post */}
        <div className="post-detail-main">
          <PostCard post={post} onDelete={handlePostDelete} showBackButton={true} onBack={() => navigate(-1)} />
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments</h3>
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-textarea"
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              disabled={submittingComment}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={submittingComment || !newComment.trim()}
              title={!user ? "Login to comment" : "Post comment"}
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>
          {commentError && <p className="comment-error">{commentError}</p>}

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to share your thoughts.</p>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  onVote={handleCommentVote}
                  canDelete={
                    user &&
                    (comment.author?._id === user._id || post?.author?._id === user._id)
                  }
                  canEdit={user && comment.author?._id === user._id}
                  onDelete={handleDeleteComment}
                  onReply={() => handleStartReply(comment._id)}
                  onEdit={() => handleStartEdit(comment)}
                  isEditing={editingId === comment._id}
                  editValue={editText}
                  onEditChange={setEditText}
                  onEditSubmit={() => handleEditSubmit(comment._id)}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  showReplies
                  onToggleReplies={() => toggleReplies(comment._id)}
                  repliesOpen={!!replyState[comment._id]?.open}
                  repliesLoading={!!replyState[comment._id]?.loading}
                  repliesError={replyState[comment._id]?.error}
                />
              ))
            )}

            {activeReply && (
              <div className="reply-block">
                <textarea
                  className="comment-textarea"
                  placeholder="Write your reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  disabled={replying}
                />
                <div className="reply-actions">
                  <button
                    type="button"
                    className="comment-submit-btn secondary"
                    onClick={() => {
                      setActiveReply(null);
                      setReplyText("");
                    }}
                    disabled={replying}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="comment-submit-btn"
                    onClick={() => handleReplySubmit(activeReply)}
                    disabled={replying || !replyText.trim()}
                  >
                    {replying ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </div>
            )}

            {comments.map((comment) => (
              replyState[comment._id]?.open ? (
                <div className="reply-thread" key={`${comment._id}-replies`}>
                  {replyState[comment._id]?.error && (
                    <p className="comment-error">{replyState[comment._id].error}</p>
                  )}
                  {replyState[comment._id]?.loading && (
                    <p className="reply-loading">Loading replies...</p>
                  )}
                  {(replyState[comment._id]?.items || []).map((reply) => (
                    <div key={reply._id}>
                      <CommentCard
                        comment={reply}
                        onVote={handleCommentVote}
                        canDelete={
                          user &&
                          (reply.author?._id === user._id || post?.author?._id === user._id)
                        }
                        canEdit={user && reply.author?._id === user._id}
                        onDelete={handleDeleteComment}
                        onReply={() => handleStartReply(reply._id)}
                        onEdit={() => handleStartEdit(reply)}
                        isEditing={editingId === reply._id}
                        editValue={editText}
                        onEditChange={setEditText}
                        onEditSubmit={() => handleEditSubmit(reply._id)}
                        onCancelEdit={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                        isReply
                        showReplies
                        onToggleReplies={() => toggleReplies(reply._id)}
                        repliesOpen={!!replyState[reply._id]?.open}
                        repliesLoading={!!replyState[reply._id]?.loading}
                        repliesError={replyState[reply._id]?.error}
                      />
                      {replyState[reply._id]?.open && (
                        <div className="reply-thread">
                          {replyState[reply._id]?.error && (
                            <p className="comment-error">{replyState[reply._id].error}</p>
                          )}
                          {replyState[reply._id]?.loading && (
                            <p className="reply-loading">Loading replies...</p>
                          )}
                          {(replyState[reply._id]?.items || []).map((nestedReply) => (
                            <CommentCard
                              key={nestedReply._id}
                              comment={nestedReply}
                              onVote={handleCommentVote}
                              canDelete={
                                user &&
                                (nestedReply.author?._id === user._id || post?.author?._id === user._id)
                              }
                              canEdit={user && nestedReply.author?._id === user._id}
                              onDelete={handleDeleteComment}
                              onReply={() => handleStartReply(nestedReply._id)}
                              onEdit={() => handleStartEdit(nestedReply)}
                              isEditing={editingId === nestedReply._id}
                              editValue={editText}
                              onEditChange={setEditText}
                              onEditSubmit={() => handleEditSubmit(nestedReply._id)}
                              onCancelEdit={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                              isReply
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null
            ))}
          </div>
        </div>
      </div>

      {showLoginModal &&
        createPortal(
          <AuthModal
            isOpen
            initialView="login"
            onClose={() => setShowLoginModal(false)}
          />,
          document.body
        )}
    </div>
  );
}
