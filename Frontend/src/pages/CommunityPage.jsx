import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Community.css";

export default function CommunityPage() {
  const { name } = useParams();
  const { user } = useAuth();
  const [bannerImage, setBannerImage] = useState(null);

  /* -------------------- STATE (backend ready) -------------------- */
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- LOAD COMMUNITY -------------------- */
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        /* 🟡 localStorage fallback for now */
        let recents = [];
        try {
          const raw = localStorage.getItem("recents");
          recents = raw ? JSON.parse(raw) : [];
        } catch {
          recents = [];
        }

        const recent = recents.find((c) => c.name === name);

        const fallbackCommunity = {
          name: name || "TestCommunity",
          description: "Make a place for people to share, discuss and discover.",
          creator: "creator",
          members: 1,
          online: 0,
          posts: [],
        };

        const finalCommunity = recent || fallbackCommunity;

        setCommunity(finalCommunity);
        setPosts(Array.isArray(finalCommunity.posts) ? finalCommunity.posts : []);
      } catch (error) {
        console.error("Error loading community:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [name]);

  /* -------------------- MODERATOR LOGIC -------------------- */
  const moderators = community?.creator ? [community.creator] : [];
  const isUserModerator = user && community?.creator === user.username;

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

  const triggerBannerInput = () => {
    document.getElementById("banner-input")?.click();
  };

  /* -------------------- LOADING STATE -------------------- */
  if (loading) return <div className="community-page">Loading...</div>;

  if (!community)
    return (
      <div className="community-page">
        <h2>Community not found</h2>
      </div>
    );

  /* -------------------- RENDER -------------------- */
  return (
    <div className="community-page">
      {/* This wrapper ensures content never goes under the left fixed sidebar */}
      <div className="content-wrap">

        {/* Banner */}
        <div
          className="community-banner"
          style={{
            backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
          }}
        >
          {isUserModerator && (
            <>
              <div className="banner-edit" onClick={triggerBannerInput}>✎</div>
              <input
                id="banner-input"
                type="file"
                accept="image/*"
                className="banner-input"
                onChange={handleBannerUpload}
              />
            </>
          )}
        </div>

        {/* Header */}
        <div className="community-header">
          <div className="community-left">
            <div className="community-icon">
              <span className="community-icon-text">r/</span>
            </div>

            <div className="community-meta">
              <h1 className="community-name">r/{community.name}</h1>
              <div className="community-sub">
                <span className="sub-creator">u/{community.creator || "creator"}</span>
                <span className="dot">•</span>
                <span className="sub-age">new</span>
              </div>
            </div>
          </div>

          <div className="community-actions">
            <button className="btn create-post">+ Create Post</button>
            {isUserModerator && <button className="btn mod-tools">Mod Tools</button>}
            <button className="btn more">⋯</button>
          </div>
        </div>

        {/* Sort bar */}
        <div className="sort-bar">
          <div className="sort-left">
            <button className="sort-btn">Best ▾</button>
            <button className="layout-btn">▦</button>
          </div>
        </div>

        {/* Page content */}
        <div className="community-content">
          {/* Posts column */}
          <main className="posts-column">
            {posts.length === 0 ? (
              <div className="empty-state">
                <h2>This community doesn't have any posts yet</h2>
                <p>Make one and get this feed started.</p>
                <button className="btn primary large">Create Post</button>
              </div>
            ) : (
              posts.map((p) => (
                <article key={p.id || Math.random()} className="post-card">
                  <h3>{p.title}</h3>
                  <p>{p.content}</p>
                </article>
              ))
            )}
          </main>

          {/* Right sidebar */}
          <aside className="community-sidebar">
            <div className="sidebar-card stats-card">
              <div className="stat">
                <div className="stat-num">{community.members}</div>
                <div className="stat-label">Visitors</div>
              </div>
              <div className="stat">
                <div className="stat-num">{community.online}</div>
                <div className="stat-label">Online</div>
              </div>
            </div>

            <div className="sidebar-card mods-card">
              <h3>MODERATORS</h3>
              <button className="btn message-mods">✉ Message Mods</button>

              {isUserModerator && <div className="invite-mod">+ Invite Mod</div>}

              <div className="mod-list">
                {moderators.map((m) => (
                  <div key={m} className="mod-item">
                    <div className="mod-avatar" aria-hidden="true">🐸</div>
                    <div className="mod-name">u/{m}</div>
                  </div>
                ))}
              </div>

              <button className="btn view-mods">View all moderators</button>
            </div>

            {isUserModerator && (
              <div className="sidebar-card settings-card">
                <h3>COMMUNITY SETTINGS</h3>
                <button className="btn settings">Community Appearance</button>
                <button className="btn settings">Customize Community</button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
