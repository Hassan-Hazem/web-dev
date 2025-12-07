import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // Import API
import "../css/CreatePostModal.css";

export default function CreatePostModal({ isOpen, onClose, defaultCommunity, onCreated }) {
  const [postType, setPostType] = useState("post"); // post, image, link
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("");
  const [link, setLink] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // New State for fetching communities
  const [communityList, setCommunityList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch communities when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCommunities = async () => {
        try {
          const res = await api.get("/communities");
          setCommunityList(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Failed to load communities", error);
        }
      };
      fetchCommunities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && defaultCommunity) {
      setCommunity(defaultCommunity);
    }
  }, [isOpen, defaultCommunity]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUploadClick = () => {
    document.getElementById("file-upload-input").click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageVideoFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (imageVideoFiles.length > 0) {
      setPostType("image");
      setSelectedFiles(imageVideoFiles);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("communityName", community);
      
      let finalPostType = "text"; 
      if (postType === "image") finalPostType = "image";
      if (postType === "link") finalPostType = "link";
      formData.append("postType", finalPostType);

      if (postType === "post") {
        formData.append("content", content);
      } else if (postType === "link") {
        formData.append("content", link);
      } else if (postType === "image") {
        if (selectedFiles.length > 0) {
           formData.append("image", selectedFiles[0]);
        }
        formData.append("content", content); 
      }

      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdPost = res.data;

      console.log("Post created successfully");
      
      // Reset form
      setTitle("");
      setContent("");
      setCommunity("");
      setLink("");
      setSelectedFiles([]);
      if (onCreated) onCreated(createdPost);
      onClose();
      
    } catch (error) {
      console.error("Error creating post:", error.response?.data?.message || error.message);
      alert("Failed to create post: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`modal-overlay ${isDragging ? 'dragging' : ''}`}
      onClick={onClose}
      onDragOver={postType === "image" ? handleDragOver : undefined}
      onDragLeave={postType === "image" ? handleDragLeave : undefined}
      onDrop={postType === "image" ? handleDrop : undefined}
    >
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a post</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="post-type-tabs">
          <button
            type="button"
            className={`tab-btn ${postType === "post" ? "active" : ""}`}
            onClick={() => setPostType("post")}
          >
            <span className="tab-icon">📝</span>
            Post
          </button>
          <button
            type="button"
            className={`tab-btn ${postType === "image" ? "active" : ""}`}
            onClick={() => setPostType("image")}
          >
            <span className="tab-icon">🖼️</span>
            Image & Video
          </button>
          <button
            type="button"
            className={`tab-btn ${postType === "link" ? "active" : ""}`}
            onClick={() => setPostType("link")}
          >
            <span className="tab-icon">🔗</span>
            Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <select
              className="community-select"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              required
            >
              <option value="">Choose a community</option>
              {communityList.map((c) => (
                <option key={c._id} value={c.name}>
                  r/{c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              className="title-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={300}
            />
            <div className="char-count">{title.length}/300</div>
          </div>

          {postType === "post" && (
            <div className="form-group">
              <textarea
                className="content-textarea"
                placeholder="Text (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
          )}

          {postType === "image" && (
            <div className="form-group">
              <input
                type="file"
                id="file-upload-input"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden-file-input"
              />
              <div 
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="upload-icon">📷</span>
                <p>Drag and drop images or videos</p>
                <button type="button" className="upload-btn">Upload</button>
              </div>
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {postType === "link" && (
            <div className="form-group">
              <input
                type="url"
                className="link-input"
                placeholder="Url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}