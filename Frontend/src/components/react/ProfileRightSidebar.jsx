import React, { useState, useRef, useEffect } from "react";
import { getMyProfile, updateUserProfile as updateUserProfileApi } from "../../api/userApi";
import api from "../../api/axios";
import "../css/ProfileRightSidebar.css";
import Interests from "./Interests";
import { useAuth } from "../../context/authContext";

export default function ProfileRightSidebar({ username, joinDate, karma, redditAgeYears, isSelf = false }) {
  const { updateUserProfile: updateAuthUser } = useAuth();
  const [bannerImage, setBannerImage] = useState(null);
  const [tempImage, setTempImage] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const fileInputRef = useRef(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioText, setBioText] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const [bioError, setBioError] = useState("");
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [usernameText, setUsernameText] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
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
        if (data.bio) {
          setBioText(data.bio);
        }
        if (data.username) {
          setUsernameText(data.username);
        }
        if (data.coverPictureUrl) {
          setBannerImage(data.coverPictureUrl);
          try {
            localStorage.setItem(localStorageKey, data.coverPictureUrl);
          } catch {
            // Ignore storage errors
          }
        } else {
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
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadResponse?.data?.filePath) {
        throw new Error("Upload failed - no file path returned");
      }

      const coverUrl = uploadResponse.data.filePath;

      const updateResponse = await updateUserProfileApi({ coverPictureUrl: coverUrl });

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

  function handleOpenBioModal() {
    setBioText(profileData?.bio || "");
    setBioError("");
    setIsBioModalOpen(true);
  }

  function handleBioModalCancel() {
    setIsBioModalOpen(false);
    setBioText(profileData?.bio || "");
    setBioError("");
  }

  async function handleBioSave() {
    if (bioText.length > 500) {
      setBioError("Bio cannot exceed 500 characters");
      return;
    }

    setBioError("");
    setBioSaving(true);

    try {
      const updateResponse = await updateUserProfileApi({ bio: bioText });
      
      const refreshedProfile = await getMyProfile();
      setProfileData(refreshedProfile);
      setBioText(refreshedProfile?.bio || "");

      setIsBioModalOpen(false);
    } catch (err) {
      console.error("Bio update error:", err);
      setBioError(err.response?.data?.message || err.message || "Failed to update bio");
    } finally {
      setBioSaving(false);
    }
  }

  function handleOpenUsernameModal() {
    setUsernameText(profileData?.username || username || "");
    setUsernameError("");
    setIsUsernameModalOpen(true);
  }

  function handleUsernameModalCancel() {
    setIsUsernameModalOpen(false);
    setUsernameText(profileData?.username || username || "");
    setUsernameError("");
  }

async function handleUsernameSave() {
  const trimmedUsername = usernameText.trim();
  
  if (trimmedUsername.length < 3) {
    setUsernameError("Username must be at least 3 characters long");
    return;
  }
  
  if (trimmedUsername.length > 30) {
    setUsernameError("Username cannot exceed 30 characters");
    return;
  }

  if (trimmedUsername === (profileData?.username || username)) {
    setIsUsernameModalOpen(false);
    return;
  }

  setUsernameError("");
  setUsernameSaving(true);

  try {
    const updateResponse = await updateUserProfileApi({ username: trimmedUsername });
    
    const refreshedProfile = await getMyProfile();
    setProfileData(refreshedProfile);
    setUsernameText(refreshedProfile?.username || "");

    if (refreshedProfile?.username) {
      updateAuthUser({ username: refreshedProfile.username });
    } else {
      updateAuthUser({ username: trimmedUsername });
    }

    setIsUsernameModalOpen(false);
    
    const newPath = `/user/${trimmedUsername}`;
    window.location.replace(newPath);

  } catch (err) {
    console.error("Username update error:", err);
    setUsernameError(err.response?.data?.message || err.message || "Failed to update username");
  } finally {
    setUsernameSaving(false);
  }
}

  function handleOpenInterestsModal() {
    setIsInterestsModalOpen(true);
  }

  function handleInterestsModalClose() {
    setIsInterestsModalOpen(false);
  }

  async function handleInterestsComplete() {
    const refreshedProfile = await getMyProfile();
    setProfileData(refreshedProfile);
    setIsInterestsModalOpen(false);
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
    <div className={`right-sidebar ${isModalOpen || isBioModalOpen || isUsernameModalOpen || isInterestsModalOpen ? "rs-modal-open" : ""}`}>
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
            <h3 className="rs-username">{profileData?.username || username}</h3>
            <p className="rs-username-sub">u/{profileData?.username || username}</p>
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

        {/* BIO SECTION */}
        <div className="rs-section">
          <div className="rs-bio-header">
            <h4 className="rs-section-title">Bio</h4>
            {isSelf && (
              <button className="rs-button inline" onClick={handleOpenBioModal}>
                {profileData?.bio ? "Edit" : "Add bio"}
              </button>
            )}
          </div>
          {loadingProfile ? (
            <p style={{ fontSize: "13px", color: "#888" }}>Loading...</p>
          ) : (
            <p className="rs-bio-text">
              {profileData?.bio || (isSelf ? "No bio yet. Add one to tell others about yourself!" : "No bio available.")}
            </p>
          )}
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
                <span>Username</span>
                <button onClick={handleOpenUsernameModal}>Update</button>
              </div>
            </div>

            <hr />

            {/* SOCIAL LINKS */}
            <div className="rs-section">
              <h4 className="rs-section-title">Social Links</h4>
              <button className="rs-button">Add Social Link</button>
            </div>

            <hr />

            {/* INTERESTS */}
            <div className="rs-section">
              <div className="rs-bio-header">
                <h4 className="rs-section-title">Interests</h4>
                <button className="rs-button inline" onClick={handleOpenInterestsModal}>
                  {profileData?.interests?.length > 0 ? "Edit" : "Add interests"}
                </button>
              </div>
              {loadingProfile ? (
                <p style={{ fontSize: "13px", color: "#888" }}>Loading...</p>
              ) : profileData?.interests?.length > 0 ? (
                <div className="rs-interests-list">
                  {profileData.interests.map((interest, index) => (
                    <span key={index} className="rs-interest-chip">{interest}</span>
                  ))}
                </div>
              ) : (
                <p className="rs-bio-text">No interests selected. Add some to personalize your feed!</p>
              )}
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

      {/* BIO MODAL */}
      {isBioModalOpen && (
        <div className="upload-modal-overlay" onClick={handleBioModalCancel}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit bio</h3>
            
            <div style={{ marginBottom: "4px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#1c1c1c",
                marginBottom: "8px"
              }}>
                Bio
              </label>
              <textarea
                className="rs-bio-textarea"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={500}
                rows={6}
              />
            </div>
            
            <p className="formats" style={{ textAlign: "right", marginTop: "0", marginBottom: "16px" }}>
              {bioText.length}/500 characters
            </p>

            {bioError && <p className="upload-error" role="alert">{bioError}</p>}

            <div className="upload-actions">
              <button className="cancel-btn" onClick={handleBioModalCancel} disabled={bioSaving}>Cancel</button>
              <button className="save-btn" onClick={handleBioSave} disabled={bioSaving}>
                {bioSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERNAME MODAL */}
      {isUsernameModalOpen && (
        <div className="upload-modal-overlay" onClick={handleUsernameModalCancel}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change username</h3>
            
            <div style={{ marginBottom: "4px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "12px", 
                fontWeight: "600", 
                color: "#1c1c1c",
                marginBottom: "8px"
              }}>
                Username
              </label>
              <input
                type="text"
                className="rs-username-input"
                value={usernameText}
                onChange={(e) => setUsernameText(e.target.value)}
                placeholder="Enter new username"
                maxLength={30}
              />
            </div>
            
            <p className="formats" style={{ textAlign: "right", marginTop: "0", marginBottom: "16px" }}>
              {usernameText.length}/30 characters (minimum 3)
            </p>

            {usernameError && <p className="upload-error" role="alert">{usernameError}</p>}

            <div className="upload-actions">
              <button className="cancel-btn" onClick={handleUsernameModalCancel} disabled={usernameSaving}>Cancel</button>
              <button className="save-btn" onClick={handleUsernameSave} disabled={usernameSaving}>
                {usernameSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERESTS MODAL */}
      {isInterestsModalOpen && (
        <div className="upload-modal-overlay" onClick={handleInterestsModalClose}>
          <div className="interests-modal" onClick={(e) => e.stopPropagation()}>
            <Interests 
              onComplete={handleInterestsComplete}
              onSkip={handleInterestsModalClose}
              initialInterests={profileData?.interests || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
