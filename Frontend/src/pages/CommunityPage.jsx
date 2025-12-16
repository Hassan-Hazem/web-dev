import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../api/axios";
import CreatePostModal from "../components/react/CreatePostModal";
import PostCard from "../components/react/PostCard";
import AuthModal from "../components/react/AuthModal";
import "./Community.css";
import { useNavigate } from "react-router-dom";
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2 16a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1H2v-1Zm10 1v-1a6 6 0 0 0-1.1-3.5A4 4 0 0 1 14 12a4 4 0 0 1 4 4v1h-6Z"/>
  </svg>
);
const CakeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a2 2 0 0 0-2 2v1h4V4a2 2 0 0 0-2-2ZM4 7h12a2 2 0 0 1 2 2v7H2V9a2 2 0 0 1 2-2Zm2 3h2v2H6v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z"/>
  </svg>
);
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 2h6l8 8-6 6-8-8V2Zm3.5 3A1.5 1.5 0 1 0 8 6.5 1.5 1.5 0 0 0 6.5 5Z"/>
  </svg>
);

export default function CommunityPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bannerImage, setBannerImage] = useState(null);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortMode, setSortMode] = useState("Hot");
  const [joinLoading, setJoinLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  useEffect(() => {
    // sync newName when community loads
    if (community && community.name) setNewName(community.name);
  }, [community]);

  // Update page metadata (title, description, open graph tags)
  useEffect(() => {
    if (!community) return;

    // Title
    const prevTitle = document.title;
    document.title = `r/${community.name} - ${community.description || "Community"}`;

    // Meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", community.description || `Join r/${community.name}`);

    // Open Graph tags (basic)
    const setMeta = (prop, content) => {
      let tag = document.querySelector(`meta[property="${prop}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content || "");
    };

    setMeta("og:title", `r/${community.name}`);
    setMeta("og:description", community.description || "");
    setMeta("og:image", community.coverPictureUrl || community.profilePictureUrl || "");

    return () => {
      document.title = prevTitle;
    };
  }, [community]);
  // Add community to recents when visited
useEffect(() => {
  if (!community) return;

  try {
    const recents = JSON.parse(
      localStorage.getItem("recentCommunities") || "[]"
    );

    const exists = recents.some((c) => c.name === community.name);
    if (exists) return;

    const updated = [
      { name: community.name },
      ...recents,
    ].slice(0, 10);

    localStorage.setItem(
      "recentCommunities",
      JSON.stringify(updated)
    );
    window.dispatchEvent(new Event("recentsUpdated"));
  } catch (e) {
    console.error("Failed to update recents", e);
  }
}, [community]);


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
      setShowLoginModal(true);
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
      if (err.response?.status === 401) {
        setShowLoginModal(true);
      } else {
        alert(err.response?.data?.message || "Action failed");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const openCreate = () => {
    if (!user) {
      setShowLoginModal(true);
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
    if (!avatarInputRef.current?.files?.length) {
      setAvatarModalOpen(false);
      return;
    }

    const file = avatarInputRef.current.files[0];
    setAvatarUploading(true);
    setAvatarError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/upload", formData);
      const data = uploadRes.data || {};

      const avatarUrl = data.filePath || data.file?.path || data.file?.location || data.file?.secure_url || data.file?.url || data.secure_url || data.url || null;

      if (!avatarUrl) {
        console.error("Upload response missing URL:", data);
        setAvatarError(data.message || "Upload succeeded but no file URL returned by storage provider");
        setAvatarUploading(false);
        return;
      }

      try {
        const updateRes = await api.put(`/communities/${encodeURIComponent(name)}`, {
          profilePictureUrl: avatarUrl,
        });

        const updatedCommunity = updateRes.data || null;
        if (updatedCommunity && typeof updatedCommunity === "object") {
          setCommunity(updatedCommunity);
          setBannerImage(updatedCommunity.coverPictureUrl || updatedCommunity.profilePictureUrl || bannerImage);
        } else {
          await loadCommunity();
        }

        setAvatarModalOpen(false);
        setTempAvatar(null);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
      } catch (err) {
        console.error("Failed to update community:", err);
        setAvatarError(err.response?.data?.message || "Failed to update community profile");
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      setAvatarError(err.response?.data?.message || err.message || "Upload failed");
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
    <>
      {showLoginModal && createPortal(
        <AuthModal
          isOpen
          initialView="login"
          onClose={() => setShowLoginModal(false)}
        />,
        document.body
      )}
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
            <button className="comm-create-btn" onClick={openCreate} style={{ marginLeft: 8 }}>
              + Create Post
            </button>
            <button className="comm-btn-join" onClick={handleJoinToggle} disabled={joinLoading}>
              {joinLoading ? "..." : isJoined ? "Joined" : "Join"}
            </button>
          </div>
           </div>

        {/* Main Grid Layout */}
        <div className="comm-grid">
          {/* Left Column: Feed */}
          <main className="comm-main-col">
            {/* Create Post Input 
            <div className="comm-create-post" onClick={openCreate} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter') openCreate(); }}>
              <div className="comm-create-avatar" aria-hidden="true">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={`${user.username || 'User'} avatar`} />
                ) : (
                  <div className="comm-create-avatar-fallback">{user?.username ? user.username.charAt(0).toUpperCase() : ''}</div>
                )}
              </div>
              <input className="comm-create-input" type="text" placeholder="Create Post" onClick={openCreate} readOnly aria-label="Create Post" />
            </div>*/}
            <div className="comm-sort-bar">
              <button className={`comm-sort-btn ${sortMode === 'Hot' ? 'active' : ''}`} onClick={() => setSortMode('Hot')}>Hot</button>
              <button className={`comm-sort-btn ${sortMode === 'New' ? 'active' : ''}`} onClick={() => setSortMode('New')}>New</button>
              <button className={`comm-sort-btn ${sortMode === 'Top' ? 'active' : ''}`} onClick={() => setSortMode('Top')}>Top</button>
            </div>
            {postsLoading ? (
              <div className="comm-empty"><p>Loading posts...</p></div>
            ) : posts.length === 0 ? (
              <div className="comm-empty">
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
                <div style={{marginTop: 12}}>
                  <button className="comm-create-btn" onClick={openCreate}>+ Create Post</button>
                </div>
              </div>
            ) : (
              posts.map((p) => (
                <PostCard key={p._id} post={p} />
              ))
            )}
          </main>
          <aside className="comm-sidebar">
            <div className="comm-card">
              <div className="comm-card-header">
                {!editingName ? (
                  <>
                    <div style={{fontSize:16, fontWeight:700}}>r/{community.name}</div>
                    {isUserModerator && (
                      <button
                        className="comm-edit-name-btn"
                        title="Edit community name"
                        onClick={() => setEditingName(true)}
                      >
                        ✎
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{display: 'flex', gap: 8, alignItems: 'center', width: '100%'}}>
                    <input
                      className="comm-edit-input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    <div className="comm-edit-actions">
                      <button
                        className="comm-edit-save"
                        onClick={async () => {
                          const trimmed = (newName || '').trim();
                          if (!trimmed || trimmed === community.name) { setEditingName(false); return; }
                          setEditingSaving(true);
                          try {
                            const res = await api.put(`/communities/${encodeURIComponent(name)}`, { name: trimmed });
                            const updated = res.data;
                            if (updated?.name) {
                              setCommunity(updated);
                              setEditingName(false);
                              try {
                                const recents = JSON.parse(
                                  localStorage.getItem("recentCommunities") || "[]"
                                );
                                const updatedRecents = recents.map((c) =>
                                  c.name === name ? { ...c, name: updated.name } : c
                                );
                                localStorage.setItem(
                                  "recentCommunities",
                                  JSON.stringify(updatedRecents)
                                );
                                 window.dispatchEvent(new Event("recentsUpdated"));
                              } catch {}
                              navigate(
                                `/community/${encodeURIComponent(updated.name)}`,
                                { replace: true }
                              );
                            }

                          } catch (err) {
                            console.error('Failed to update name', err);
                            if (err.response && err.response.status === 404) {
                              alert('Rename failed: backend does not expose a rename endpoint (404).');
                            } else {
                              alert(err.response?.data?.message || 'Failed to update community name');
                            }
                          } finally {
                            setEditingSaving(false);
                          }
                        }}
                        disabled={editingSaving}
                      >{editingSaving ? 'Saving...' : 'Save'}</button>
                      <button className="comm-edit-cancel" onClick={() => { setNewName(community.name); setEditingName(false); }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="comm-card-body">
                <div className="comm-about-desc">{community.description}</div>
                    <div className="comm-meta">
                      <CakeIcon/>
                      Created at: {community.createdAt ? new Date(community.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Unknown"}
                    </div>

                    <div className="comm-meta">
                      <UsersIcon/>
                      { (community.memberCount || 0).toLocaleString() } members
                    </div>

                    <div className="comm-meta">
                      <TagIcon/>
                      {community.topics && community.topics.length > 0 ? community.topics.join(", ") : "General"}
                    </div>
                    <div className="comm-insights">
                      <div className="comm-insight">
                        <div className="comm-insight-num">{posts.length}</div>
                        <div className="comm-insight-label">Posts</div>
                      </div>
                      <div className="comm-insight">
                        <div className="comm-insight-num">{Math.max(0, community.contributorsCount|| 0)}</div>
                        <div className="comm-insight-label">Contributors</div>
                      </div>
                    </div>
                    {isUserModerator && (
                    <button className="comm-create-btn">
                      ＋ Add a community guide
                    </button>
                  )}
            </div>
              <div className="comm-card-header">
                <div>Moderators</div>
              </div>
              <div className="comm-card-body">
                <div className="comm-mod-list">
                  {isUserModerator && (
                    <button className="comm-create-mod-btn">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                       Invite Mod
                    </button>
                      )}
                  {moderators.map((m) => (
                    <div key={m} className="comm-mod-item">u/{m}</div>
                  ))}
                  <button className="comm-create-btn">
                    View all moderators
                  </button>
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
    </>
  );
}