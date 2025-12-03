import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Community.css";

export default function CommunityPage() {
  const { name } = useParams();
  const { user } = useAuth();
  const [bannerImage, setBannerImage] = useState(null);

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
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
          description: "Welcome to this community! Discuss and share.",
          creator: "creator",
          members: 142,
          online: 34,
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

  const moderators = community?.creator ? [community.creator] : ["AutoModerator"];
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

  if (loading) return <div className="comm-page">Loading...</div>;

  if (!community)
    return (
      <div className="comm-page">
        <div className="comm-content-wrap">
          <h2>Community not found</h2>
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
            <div className="comm-icon-placeholder">r/</div>
          </div>

          <div className="comm-header-text">
            <h1 className="comm-title">{community.name}</h1>
            <div className="comm-subtitle">r/{community.name}</div>
          </div>

          <div className="comm-header-actions">
            <button className="comm-btn-join">Join</button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="comm-grid">
          {/* Left Column: Feed */}
          <main className="comm-main-col">
            {/* Create Post Input */}
            <div className="comm-post" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white'}}>
                 <div style={{width: 38, height: 38, borderRadius: '50%', background: '#ccc'}}></div>
                 <input type="text" placeholder="Create Post" style={{flex: 1, background: '#f6f7f8', border: '1px solid #edeff1', borderRadius: 4, padding: '8px 16px'}} />
            </div>

            {/* Sort Bar */}
            <div className="comm-sort-bar">
              <button className="comm-sort-btn">Hot</button>
              <button className="comm-sort-btn">New</button>
              <button className="comm-sort-btn">Top</button>
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="comm-empty">
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
              </div>
            ) : (
              posts.map((p, idx) => (
                <article key={p.id || idx} className="comm-post">
                  <h3 className="comm-post-title">{p.title}</h3>
                  <div className="comm-post-body">{p.content}</div>
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
                    <span className="comm-stat-num">{community.members}</span>
                    <span className="comm-stat-label">Members</span>
                  </div>
                  <div className="comm-stat-item">
                    <span className="comm-stat-num">{community.online}</span>
                    <span className="comm-stat-label">Online</span>
                  </div>
                </div>

                <button className="comm-create-btn">Create Post</button>
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
    </div>
  );
}