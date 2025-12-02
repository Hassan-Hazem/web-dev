
import React, { useState, useRef, useEffect } from "react";
import "../css/ProfileRightSidebar.css";


export default function ProfileRightSidebar({ username }) {
  const [bannerImage, setBannerImage] = useState(null);
  const [tempImage, setTempImage] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const localStorageKey = `profile_banner_${username || "anonymous"}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) setBannerImage(saved);
    } catch (err) {
    }
  }, [localStorageKey]);

  function openFileDialog() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    validateImage(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    validateImage(file);
  }

  function validateImage(file) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG and PNG formats are allowed.");
      return;
    }
    if (file.size > 500 * 1024) {
      alert("Image exceeds 500 KB max size.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function handleModalSave() {
    if (!tempImage) {
      setIsModalOpen(false);
      return;
    }
    setBannerImage(tempImage);
    try {
      localStorage.setItem(localStorageKey, tempImage);
    } catch (err) {
    }
    setTempImage(null);
    setIsModalOpen(false);
  }

  function handleModalCancel() {
    setTempImage(null);
    setIsModalOpen(false);
  }

  function handleOpenUploader() {
    openFileDialog();
  }

  return (
    <div className="right-sidebar">
      <div className="rs-card">

        {/* COVER */}
        <div
          className="rs-cover large"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            backgroundImage: bannerImage
              ? `url(${bannerImage})`
              : "linear-gradient(135deg, #0079D3 0%, #48A9F8 100%)",
          }}
        >
          {}
          <div className="rs-cover-actions">
            <button
              className="rs-add-btn"
              onClick={handleOpenUploader}
              aria-label="Add banner image"
              title="Add banner image"
            >
              ➕ Add photo
            </button>
          </div>

          {}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {}
          <div className="rs-avatar">{username ? username.charAt(0).toUpperCase() : "U"}</div>
          <h3 className="rs-username">{username}</h3>
        </div>

        <hr />

        {/* STATS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Stats</h4>
          <div className="rs-info-row">
            <span className="rs-info-label">Followers</span>
            <span className="rs-info-value">0</span>
          </div>
          <div className="rs-info-row">
            <span className="rs-info-label">Karma</span>
            <span className="rs-info-value">1</span>
          </div>
          <div className="rs-info-row">
            <span className="rs-info-label">Contributions</span>
            <span className="rs-info-value">0</span>
          </div>
          <div className="rs-info-row">
            <span className="rs-info-label">Reddit Age</span>
            <span className="rs-info-value">0 d</span>
          </div>
          <div className="rs-info-row">
            <span className="rs-info-label">Active in</span>
            <span className="rs-info-value">0</span>
          </div>
          <div className="rs-info-row">
            <span className="rs-info-label">Gold earned</span>
            <span className="rs-info-value">0</span>
          </div>
        </div>

        <hr />

        {/* ACHIEVEMENTS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Achievements</h4>
          <div className="rs-badges">
            <span className="rs-badge">Joined Reddit</span>
            <span className="rs-badge">Secured Account</span>
            <span className="rs-badge">Newcomer</span>
          </div>
          <p className="rs-badge-note">2 unlocked</p>
          <button className="rs-button">View All</button>
        </div>

        <hr />

        {/* SETTINGS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Settings</h4>
          <div className="rs-setting-row">
            <span>Profile</span>
            <button>Update</button>
          </div>
          <div className="rs-setting-row">
            <span>Avatar</span>
            <button>Update</button>
          </div>
          <div className="rs-setting-row">
            <span>Mod Tools</span>
            <button>Update</button>
          </div>
        </div>

        <hr />

        {/* SOCIAL LINKS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Social Links</h4>
          <button className="rs-button">Add Social Link</button>
        </div>

        <hr />

        {/* TROPHY CASE */}
        <div className="rs-section">
          <h4 className="rs-section-title">Trophy Case</h4>
          <span className="rs-trophy">New User</span>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="upload-modal-overlay" onClick={handleModalCancel}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Banner image</h3>

            <div
              className="upload-dropbox"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={openFileDialog}
            >
              <p className="drop-text">Drop file or <span className="browse">browse device</span></p>
              <p className="formats">Formats: JPG, PNG</p>
              <p className="formats">Max size: 500 KB</p>
              {tempImage && <img src={tempImage} alt="preview" className="preview-img" />}
              <input
                type="file"
                accept="image/png,image/jpeg"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </div>

            <div className="upload-actions">
              <button className="cancel-btn" onClick={handleModalCancel}>Cancel</button>
              <button className="save-btn" onClick={handleModalSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
