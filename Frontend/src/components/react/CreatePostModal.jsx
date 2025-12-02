import React, { useState } from "react";
import "../css/CreatePostModal.css";

export default function CreatePostModal({ isOpen, onClose }) {
  const [postType, setPostType] = useState("post"); // post, image, link, poll
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("");
  const [link, setLink] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isDragging, setIsDragging] = useState(false);

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

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement post creation API call
    console.log("Creating post:", { 
      postType, 
      title, 
      content, 
      community, 
      link, 
      files: selectedFiles,
      pollOptions: postType === "poll" ? pollOptions : null
    });
    onClose();
    // Reset form
    setTitle("");
    setContent("");
    setCommunity("");
    setLink("");
    setSelectedFiles([]);
    setPollOptions(["", ""]);
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
            className={`tab-btn ${postType === "post" ? "active" : ""}`}
            onClick={() => setPostType("post")}
          >
            <span className="tab-icon">📝</span>
            Post
          </button>
          <button
            className={`tab-btn ${postType === "image" ? "active" : ""}`}
            onClick={() => setPostType("image")}
          >
            <span className="tab-icon">🖼️</span>
            Image & Video
          </button>
          <button
            className={`tab-btn ${postType === "link" ? "active" : ""}`}
            onClick={() => setPostType("link")}
          >
            <span className="tab-icon">🔗</span>
            Link
          </button>
          <button
            className={`tab-btn ${postType === "poll" ? "active" : ""}`}
            onClick={() => setPostType("poll")}
          >
            <span className="tab-icon">📊</span>
            Poll
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
              <option value="funny">r/funny</option>
              <option value="tressless">r/tressless</option>
              <option value="FunnyAnimals">r/FunnyAnimals</option>
              <option value="MinoxBeards">r/MinoxBeards</option>
              <option value="bald">r/bald</option>
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

          {postType === "poll" && (
            <div className="form-group">
              {pollOptions.map((option, index) => (
                <div key={index} className="poll-option-container">
                  <input
                    type="text"
                    className="poll-option"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() => removePollOption(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <button type="button" className="add-option-btn" onClick={addPollOption}>
                  + Add option
                </button>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
