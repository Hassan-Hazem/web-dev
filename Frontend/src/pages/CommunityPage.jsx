import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../api/axios";
import CreatePostModal from "../components/react/CreatePostModal";
import "./Community.css";

export default function CommunityPage() {
  const { name } = useParams();
  const { user } = useAuth();
  const [bannerImage, setBannerImage] = useState(null);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = React.useRef(null);

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/communities/${encodeURIComponent(name)}`);
      const comm = data.data;
      setCommunity(comm);
      setIsJoined(!!comm.isJoined);
      if (comm.coverPictureUrl) setBannerImage(comm.coverPictureUrl);
    } catch (err) {
      console.error("Error loading community:", err);
      setError(err.response?.data?.message || "Failed to load community");
    } finally {
      setLoading(false);
    }
  }, [name]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await api.get(`/posts/community/${encodeURIComponent(name)}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setPostsLoading(false);
    }
  }, [name]);

  useEffect(() => {
    loadCommunity();
    loadPosts();
  }, [loadCommunity, loadPosts]);

  const moderators = community?.creator?.username ? [community.creator.username] : ["AutoModerator"];
  const isUserModerator = user && community?.creator?.username === user.username;

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setBannerImage(evt.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinToggle = async () => {
    if (!user) {
      alert("Please log in to join communities.");
      return;
    }
    if (!community) return;
    setJoinLoading(true);
    try {
      if (isJoined) {
        await api.post(`/communities/${encodeURIComponent(name)}/leave`);
        setIsJoined(false);
        setCommunity((prev) => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 1) - 1) } : prev);
      } else {
        await api.post(`/communities/${encodeURIComponent(name)}/join`);
        setIsJoined(true);
        setCommunity((prev) => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : prev);
      }
    } catch (err) {
      console.error("Join/leave failed", err);
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setJoinLoading(false);
    }
  };

  const openCreate = () => {
    if (!user) {
      alert("Please log in to create a post.");
      return;
    }
    setIsCreateOpen(true);
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  const openAvatarUpload = () => {
    if (avatarInputRef.current) avatarInputRef.current.click();
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WebP formats are allowed.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Image exceeds 3 MB max size.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTempAvatar(reader.result);
      setAvatarModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!tempAvatar || !avatarInputRef.current?.files?.length) {
      setAvatarModalOpen(false);
      return;
    }
    const file = avatarInputRef.current.files[0];
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = uploadRes.data.filePath;
      await api.put(`/communities/${encodeURIComponent(name)}`, {
        profilePictureUrl: avatarUrl,
      });
      setCommunity((prev) => prev ? { ...prev, profilePictureUrl: avatarUrl } : prev);
      setAvatarModalOpen(false);
      setTempAvatar(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarError(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarCancel = () => {
    setTempAvatar(null);
    setAvatarModalOpen(false);
    setAvatarError("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  if (loading) return <div className="comm-page">Loading...</div>;

  if (error || !community)
    return (
      <div className="comm-page">
        <div className="comm-content-wrap">
          <h2>{error || "Community not found"}</h2>
        </div>
      </div>
    );

  return (
    <div className="comm-page">
      {/* Banner Area */}
      <div 
        className="comm-banner"
        style={{ backgroundImage: bannerImage ? `url(${bannerImage})` : undefined }}
      >
        {isUserModerator && (
          <>
            <div className="comm-banner-edit" onClick={() => document.getElementById("comm-banner-input")?.click()}>
              ✎
            </div>
            <input
              id="comm-banner-input"
              type="file"
              accept="image/*"
              className="comm-banner-input"
              onChange={handleBannerUpload}
            />
          </>
        )}
      </div>

      {/* Header Area */}
      <div className="comm-content-wrap">
        <div className="comm-header">
          <div className="comm-icon-container">
            {community.profilePictureUrl ? (
              <img src={community.profilePictureUrl} alt="community" className="comm-icon-img" />
            ) : (
              <div className="comm-icon-placeholder">r/</div>
            )}
            {isUserModerator && (
              <button
                className="comm-avatar-btn"
                onClick={openAvatarUpload}
                title="Change community icon"
              >
                +
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="comm-header-text">
            <h1 className="comm-title">{community.name}</h1>
            <div className="comm-subtitle">r/{community.name}</div>
          </div>

          <div className="comm-header-actions">
            <button className="comm-btn-join" onClick={handleJoinToggle} disabled={joinLoading}>
              {joinLoading ? "..." : isJoined ? "Joined" : "Join"}
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="comm-grid">
          {/* Left Column: Feed */}
          <main className="comm-main-col">
            {/* Create Post Input */}
              <div className="comm-post" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white'}}>
                <div style={{width: 38, height: 38, borderRadius: '50%', background: '#ccc'}}></div>
                  <input type="text" placeholder="Create Post" style={{flex: 1, background: '#f6f7f8', border: '1px solid #edeff1', borderRadius: 4, padding: '8px 16px'}} onClick={openCreate} readOnly />
              </div>

            {/* Sort Bar */}
            <div className="comm-sort-bar">
              <button className="comm-sort-btn">Hot</button>
              <button className="comm-sort-btn">New</button>
              <button className="comm-sort-btn">Top</button>
            </div>

            {/* Posts List */}
            {postsLoading ? (
              <div className="comm-empty"><p>Loading posts...</p></div>
            ) : posts.length === 0 ? (
              <div className="comm-empty">
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
              </div>
            ) : (
              posts.map((p) => (
                <article key={p._id} className="comm-post">
                  <div style={{fontSize: "12px", color: "#7c7c7c", marginBottom: "6px"}}>
                    {p.community?.name ? `r/${p.community.name}` : "r/"}{" "}• {p.author?.username || "anonymous"}
                  </div>
                  <h3 className="comm-post-title">{p.title}</h3>
                  {p.content && <div className="comm-post-body">{p.content}</div>}
                  {p.imageUrl && <img src={p.imageUrl} alt="post" style={{maxWidth: "100%", borderRadius: "6px", marginTop: "8px"}} />}
                </article>
              ))
            )}
          </main>

          {/* Right Column: Sidebar */}
          <aside className="comm-sidebar">
            <div className="comm-card">
              <div className="comm-card-header">About Community</div>
              <div className="comm-card-body">
                <div className="comm-about-desc">{community.description}</div>
                
                <div className="comm-stats">
                  <div className="comm-stat-item">
                    <span className="comm-stat-num">{community.memberCount ?? community.members ?? 0}</span>
                    <span className="comm-stat-label">Members</span>
                  </div>
                  <div className="comm-stat-item">
                    <span className="comm-stat-num">{community.online ?? 0}</span>
                    <span className="comm-stat-label">Online</span>
                  </div>
                </div>

                <button className="comm-create-btn" onClick={openCreate}>Create Post</button>
              </div>
            </div>

            <div className="comm-card">
              <div className="comm-card-header">Moderators</div>
              <div className="comm-card-body">
                <div className="comm-mod-list">
                  <button className="comm-btn-outline" style={{width: '100%', marginBottom: '10px'}}>Message Mods</button>
                  {moderators.map((m) => (
                    <div key={m} className="comm-mod-item">u/{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
        <CreatePostModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          defaultCommunity={community?.name}
          onCreated={handlePostCreated}
        />

        {avatarModalOpen && (
          <div className="upload-modal-overlay" onClick={handleAvatarCancel}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Community Icon</h3>
              <div className="upload-dropbox">
                <p className="drop-text">Preview</p>
                {tempAvatar && <img src={tempAvatar} alt="preview" className="preview-img" />}
              </div>
              {avatarError && <p className="upload-error">{avatarError}</p>}
              <div className="upload-actions">
                <button className="cancel-btn" onClick={handleAvatarCancel} disabled={avatarUploading}>Cancel</button>
                <button className="save-btn" onClick={handleAvatarSave} disabled={avatarUploading}>
                  {avatarUploading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}