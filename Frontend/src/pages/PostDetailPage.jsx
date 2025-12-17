import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import PostCard from "../components/react/PostCard";
import CommentCard from "../components/react/CommentCard";
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

  const fetchComments = async () => {
    try {
      const commentsRes = await api.get(`/comments/post/${postId}`);
      setComments(commentsRes.data || []);
    } catch (commentErr) {
      console.log("Comments endpoint error", commentErr);
      setComments([]);
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch post details
        const postRes = await api.get(`/posts/${postId}`);
        setPost(postRes.data);

        // Fetch comments for this post
        await fetchComments();
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post("/comments", {
        content: newComment,
        postId: postId,
      });
      setNewComment("");
      await fetchComments();
      // Refetch post to update comment count
      const postRes = await api.get(`/posts/${postId}`);
      setPost(postRes.data);
    } catch (err) {
      console.error("Error creating comment:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDeleted = async (commentId) => {
    await fetchComments();
    // Refetch post to update comment count
    const postRes = await api.get(`/posts/${postId}`);
    setPost(postRes.data);
  };

  const handlePostDelete = (deletedPostId) => {
    if (deletedPostId === postId) {
      alert("Post deleted. Redirecting...");
      navigate(-1);
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

          {/* Comment Form */}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-textarea"
              placeholder={user ? "What are your thoughts?" : "Login to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              disabled={!user || submittingComment}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!user || submittingComment || !newComment.trim()}
              title={!user ? "Login to comment" : ""}
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <CommentCard 
                  key={comment._id} 
                  comment={comment}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
