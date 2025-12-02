import React from "react";
import { useParams } from "react-router-dom";
import "./Community.css";

export default function CommunityPage() {
  const { name } = useParams();

  // demo data (replace with real API data later)
  const community = {
    name: name || "Testttt345",
    description: "Make a place for people to share, discuss and discover.",
    members: 1,
    online: 0,
    posts: [], // empty to show the empty-state
    moderators: ["u/Major-Cucumber2333"],
  };

  return (
    <div className="community-page">

      {/* Banner */}
      <div className="community-banner">
        {/* optional banner image could be <img src={...} /> */}
        <div className="banner-edit">✎</div>
      </div>

      {/* Header area (icon overlaps banner) */}
      <div className="community-header">
        <div className="community-left">
          <div className="community-icon">
            {/* use an <img /> if you have an icon */}
            <span className="community-icon-text">r/</span>
          </div>

          <div className="community-meta">
            <h1 className="community-name">r/{community.name}</h1>
            <div className="community-sub">
              <span className="sub-creator">u/{community.name}-creator</span>
              <span className="dot">•</span>
              <span className="sub-age">new</span>
            </div>
          </div>
        </div>

        <div className="community-actions">
          <button className="btn create-post">+ Create Post</button>
          <button className="btn mod-tools">Mod Tools</button>
          <button className="btn more">⋯</button>
        </div>
      </div>

      {/* sort bar / controls (Best / New etc) */}
      <div className="sort-bar">
        <div className="sort-left">
          <button className="sort-btn">Best <span className="caret">▾</span></button>
          <button className="layout-btn">▦</button>
        </div>
      </div>

      {/* main content area: posts column + right sidebar */}
      <div className="community-content">
        {/* Posts column */}
        <main className="posts-column">
          {/* Empty state when no posts */}
          {community.posts.length === 0 ? (
            <div className="empty-state">
              <h2>This community doesn't have any posts yet</h2>
              <p>Make one and get this feed started.</p>
              <button className="btn primary large">Create Post</button>
            </div>
          ) : (
            community.posts.map((p) => (
              <article key={p.id} className="post-card">
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
              <div className="stat-label">Visitor</div>
            </div>
            <div className="stat">
              <div className="stat-num">{community.online}</div>
              <div className="stat-label">Contributions</div>
            </div>
          </div>

          <div className="sidebar-card mods-card">
            <h3>MODERATORS</h3>
            <button className="btn message-mods">✉ Message Mods</button>
            <div className="invite-mod">+ Invite Mod</div>
            <div className="mod-list">
              {community.moderators.map((m) => (
                <div key={m} className="mod-item">
                  <div className="mod-avatar" aria-hidden="true">🐸</div>
                  <div className="mod-name">{m}</div>
                </div>
              ))}
            </div>
            <button className="btn view-mods">View all moderators</button>
          </div>

          <div className="sidebar-card settings-card">
            <h3>COMMUNITY SETTINGS</h3>
            <button className="btn settings">Community Appearance</button>
            <button className="btn settings">Customize Community</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
