import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PostCard from "../components/react/PostCard";
import CommentCard from "../components/react/CommentCard";
import "./PostDetailPage.css";

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch post details
        const postRes = await api.get(`/posts/${postId}`);
        setPost(postRes.data);

        // Try to fetch comments for this post
        try {
          const commentsRes = await api.get(`/posts/${postId}/comments`);
          setComments(commentsRes.data || []);
        } catch (commentErr) {
          console.log("Comments endpoint not available or empty", commentErr);
          setComments([]);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    alert("Comments feature is coming soon!");
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
      {/* Back Button - Top Left */}
      <button className="back-btn" onClick={() => navigate('/explore')}>
        ← Back to Explore
      </button>
      
      <div className="post-detail-container">
        {/* Main Post */}
        <div className="post-detail-main">
          <PostCard post={post} onDelete={handlePostDelete} />
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments</h3>

          {/* Comment Form - Disabled for now */}
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-textarea"
              placeholder="What are your thoughts? (Coming soon)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              disabled={true}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={true}
              title="Comments feature coming soon"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Comments feature coming soon!</p>
            ) : (
              comments.map((comment) => (
                <CommentCard key={comment._id} comment={comment} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
