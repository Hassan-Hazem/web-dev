
import React, { useState, useRef, useEffect } from "react";
import { getMyProfile, updateUserProfile } from "../../api/userApi";
import api from "../../api/axios";
import "../css/ProfileRightSidebar.css";


export default function ProfileRightSidebar({ username, joinDate, karma, redditAgeYears, isSelf = false }) {
  const [bannerImage, setBannerImage] = useState(null);
  const [tempImage, setTempImage] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const fileInputRef = useRef(null);

  const localStorageKey = `profile_banner_${username || "anonymous"}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) setBannerImage(saved);
    } catch {
      // Ignore storage errors
    }
  }, [localStorageKey]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoadingProfile(true);
      try {
        const url = isSelf ? "/users/me/info" : `/users/${username}`;
        const data = isSelf ? await getMyProfile() : (await api.get(url)).data;
        setProfileData(data);
        if (data.coverPictureUrl) {
          const coverUrl = data.coverPictureUrl.startsWith("http")
            ? data.coverPictureUrl
            : `http://localhost:5000/${data.coverPictureUrl.replace(/\\/g, "/")}`;
          setBannerImage(coverUrl);
          try {
            localStorage.setItem(localStorageKey, coverUrl);
          } catch {
            // Ignore storage errors
          }
        } else {
          // Clear banner if no cover picture
          setBannerImage(null);
        }
      } catch (err) {
        console.error("Failed to load profile stats:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [localStorageKey, username, isSelf]);

  function openFileDialog() {
    // Clear input to allow selecting same file multiple times
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) validateImage(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) validateImage(file);
  }


  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateImage(file) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setBannerError("Only JPG, PNG, GIF, or WebP formats are allowed.");
      resetFileInput();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBannerError("Image exceeds 5 MB max size.");
      resetFileInput();
      return;
    }

    setBannerError("");
    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleModalSave() {
    if (!tempImage || !fileInputRef.current?.files?.length) {
      setIsModalOpen(false);
      setTempImage(null);
      return;
    }

    const file = fileInputRef.current.files[0];
    setBannerError("");
    setBannerUploading(true);

    try {
      // Step 1: Upload file to cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadResponse?.data?.filePath) {
        throw new Error("Upload failed - no file path returned");
      }

      const coverUrl = uploadResponse.data.filePath;

      // Step 2: Update user profile with cover URL
      const updateResponse = await updateUserProfile({ coverPictureUrl: coverUrl });

      // Step 3: Force refresh profile to get latest from database
      const refreshedProfile = await getMyProfile();
      
      if (refreshedProfile?.coverPictureUrl) {
        setBannerImage(refreshedProfile.coverPictureUrl);
        setProfileData(refreshedProfile);
        try {
          localStorage.setItem(localStorageKey, refreshedProfile.coverPictureUrl);
        } catch {
          // Ignore storage errors
        }
      } else {
        // Fallback to uploaded URL
        setBannerImage(coverUrl);
        try {
          localStorage.setItem(localStorageKey, coverUrl);
        } catch {
          // Ignore storage errors
        }
      }

      // Success
      setIsModalOpen(false);
      setTempImage(null);
      resetFileInput();
    } catch (err) {
      console.error("Banner upload error:", err);
      setBannerError(err.response?.data?.message || err.message || "Failed to update banner");
    } finally {
      setBannerUploading(false);
    }
  }

  function handleModalCancel() {
    setTempImage(null);
    setIsModalOpen(false);
    setBannerError("");
    resetFileInput();
  }

  function handleOpenUploader() {
    setBannerError("");
    openFileDialog();
  }

  const redditAge = profileData?.createdAt
    ? Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const computedKarma = profileData?.karma ?? karma ?? 0;
  const createdDate = joinDate || (profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "--");
  const ageLabel = redditAgeYears || `${redditAge} d`;

  return (
    <div className={`right-sidebar ${isModalOpen ? "rs-modal-open" : ""}`}>
      <div className="rs-card">

        {/* COVER */}
        <div
          className="rs-cover large"
          onDragOver={isSelf ? (e) => e.preventDefault() : undefined}
          onDrop={isSelf ? handleDrop : undefined}
          style={{
            backgroundImage: bannerImage
              ? `url(${bannerImage})`
              : "linear-gradient(135deg, #0f214a 0%, #0b1533 100%)",
          }}
        >
          {isSelf && (
            <div className="rs-cover-actions">
              <button
                className="rs-add-btn"
                onClick={handleOpenUploader}
                aria-label="Add banner image"
                title="Add banner image"
              >
                {bannerUploading ? "Uploading..." : "Add banner"}
              </button>
            </div>
          )}

          {isSelf && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          )}
          <div className="rs-avatar-wrapper">
            {profileData?.profilePictureUrl ? (
              <img
                src={profileData.profilePictureUrl}
                alt={`${username}'s avatar`}
                className="rs-avatar-img"
              />
            ) : (
              <div className="rs-avatar-fallback">{username ? username.charAt(0).toUpperCase() : "U"}</div>
            )}
          </div>
          <div className="rs-identity">
            <h3 className="rs-username">{username}</h3>
            <p className="rs-username-sub">u/{username}</p>
          </div>
        </div>

        <div className="rs-section rs-header-section">
          <div className="rs-identity-row">
            <div>
              <p className="rs-identity-label">Joined</p>
              <p className="rs-identity-value">{createdDate}</p>
            </div>
            {isSelf && <button className="rs-button inline">Share</button>}
          </div>
        </div>

        <hr />

        {/* STATS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Stats</h4>
          {loadingProfile ? (
            <p style={{ fontSize: "13px", color: "#888" }}>Loading...</p>
          ) : (
            <>
              <div className="rs-info-row">
                <span className="rs-info-label">Followers</span>
                <span className="rs-info-value">0</span>
              </div>
              <div className="rs-info-row">
                <span className="rs-info-label">Karma</span>
                <span className="rs-info-value">{computedKarma}</span>
              </div>
              <div className="rs-info-row">
                <span className="rs-info-label">Contributions</span>
                <span className="rs-info-value">0</span>
              </div>
              <div className="rs-info-row">
                <span className="rs-info-label">Reddit Age</span>
                <span className="rs-info-value">{ageLabel}</span>
              </div>
              <div className="rs-info-row">
                <span className="rs-info-label">Active in</span>
                <span className="rs-info-value">0</span>
              </div>
              <div className="rs-info-row">
                <span className="rs-info-label">Gold earned</span>
                <span className="rs-info-value">0</span>
              </div>
            </>
          )}
        </div>

        <hr />

        {/* ACHIEVEMENTS */}
        <div className="rs-section">
          <h4 className="rs-section-title">Achievements</h4>
          <div className="rs-badges">
            <span className="rs-badge">Banana Beginner</span>
            <span className="rs-badge">Banana Baby</span>
            <span className="rs-badge">Feed Finder</span>
            <span className="rs-badge">+2 more</span>
          </div>
          <div className="rs-badge-footer">
            <p className="rs-badge-note">5 unlocked</p>
            <button className="rs-button inline">View All</button>
          </div>
        </div>

        <hr />

        {/* SETTINGS */}
        {isSelf && (
          <>
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
          </>
        )}

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
              <p className="formats">Formats: JPG, PNG, WebP, GIF</p>
              <p className="formats">Max size: 5 MB</p>
              {tempImage && <img src={tempImage} alt="preview" className="preview-img" />}
            </div>

            {bannerError && <p className="upload-error" role="alert">{bannerError}</p>}

            <div className="upload-actions">
              <button className="cancel-btn" onClick={handleModalCancel} disabled={bannerUploading}>Cancel</button>
              <button className="save-btn" onClick={handleModalSave} disabled={bannerUploading}>
                {bannerUploading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
