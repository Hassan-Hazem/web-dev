import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import ProfileRightSidebar from "../components/react/ProfileRightSidebar";
import PostCard from "../components/react/PostCard";
import CommentCard from "../components/react/CommentCard";
import snooImg from "../assets/images/Snoo_Expression_NoMouth.png";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { username: paramUsername } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [filterOpen, setFilterOpen] = useState(false);


  if (!user) {
    return (
      <div className="login-message">
        <h2>You are not logged in!</h2>
        <p>Please log in to view this profile.</p>
      </div>
    );
  }
  

  const username = user.username; 
  const tabs = [
    "Overview", "Posts", "Comments", "Saved",
    "History", "Hidden", "Upvoted", "Downvoted"
  ];

  const feedOptions = [
    { name: "Hot", emoji: "🔥" },
    { name: "New", emoji: "🆕" },
    { name: "Top", emoji: "📈" },
    { name: "View", emoji: "👁️" },
    { name: "Card", emoji: "🃏" },
    { name: "Compact", emoji: "🗂️" }
  ];

  const demoPosts = [
    { id: 1, title: "My first demo post", subreddit: "reactjs", author: username, votes: 42, comments: 5, image: "https://via.placeholder.com/300" }
  ];

  const demoComments = [
    { id: 1, author: username, text: "This is a demo comment.", votes: 12, time: "3h ago" }
  ];

  const tabContent = {
    "Overview": { title: "Showing all content", heading: "You don't have any posts yet", text: "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." },
    "Posts": { title: `Posts by u/${username}`, heading: "You don't have any posts yet", text: "Once you post to a community, it'll show up here. If you'd rather hide your posts, update your settings." },
    "Comments": { title: "Showing all comments", heading: "You don't have any comments yet", text: "Once you comment in a community, it'll show up here. If you'd rather hide your comments, update your settings." },
    "Saved": { title: "Saved content", heading: "Looks like you haven't saved anything yet", text: "" },
    "History": { title: "History", heading: "Looks like you haven't visited any posts yet", text: "" },
    "Hidden": { title: "Hidden content", heading: "Looks like you haven't hidden anything yet", text: "" },
    "Upvoted": { title: "Upvoted content", heading: "Looks like you haven't upvoted anything yet", text: "" },
    "Downvoted": { title: "Downvoted content", heading: "Looks like you haven't downvoted anything yet", text: "" }
  };

  const renderFilterButton = () => {
    if (activeTab === "Overview" || activeTab === "Posts") {
      return (
        <div className="filter-dropdown-wrapper">
          <button className="filter-btn" onClick={() => setFilterOpen(!filterOpen)}>🔽 Filter</button>
          {filterOpen && (
            <ul className="filter-dropdown">
              {feedOptions.map(option => (
                <li key={option.name}>
                  <span className="filter-emoji">{option.emoji}</span> {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    return null;
  };

  const renderEmptyFeed = (tab) => (
    <div className="overview-box">
      <div className="overview-header">
        <h3>{tabContent[tab].title}</h3>
        {(tab === "Overview" || tab === "Posts") && (
          <div className="overview-actions">
            <button className="create-post-btn">Create Post</button>
            {renderFilterButton()}
          </div>
        )}
      </div>
      <div className="overview-feed">
        <img src={snooImg} alt="Snoo" className="snoo-img" />
        <h4>{tabContent[tab].heading}</h4>
        {tabContent[tab].text && <p>{tabContent[tab].text}</p>}
        {(tab === "Overview" || tab === "Posts" || tab === "Comments") && (
          <button className="update-settings-btn">Update Settings</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-layout">
        <div className="profile-main">
          <div className="profile-header">
            <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="profile-header-info">
              <h2>{username}</h2>
              <p className="meta">123 Karma • Joined Jan 2023</p>
            </div>
          </div>

          <div className="profile-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`profile-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setFilterOpen(false); }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="profile-content">
            {activeTab === "Posts" && demoPosts.length > 0
              ? demoPosts.map(post => <PostCard key={post.id} post={post} />)
              : activeTab === "Comments" && demoComments.length > 0
              ? demoComments.map(comment => <CommentCard key={comment.id} comment={comment} />)
              : renderEmptyFeed(activeTab)
            }
          </div>
        </div>

        <ProfileRightSidebar username={username} />
      </div>
    </div>
  );
}
