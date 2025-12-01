// src/pages/CreateCommunityPage.jsx
import React from "react";
import "./Community.css";
import CreateCommunityForm from "../components/react/CreateCommunityForm";

export default function CreateCommunityPage() {
  return (
    <div className="community-page">
      {/* Optional header to match Explore page style */}
      <div className="community-header">
        <img src="/default-avatar.png" alt="Community" />
        <div>
          <h1>Create a Community</h1>
          <p>Start your own subreddit-style community</p>
        </div>
        <button>Help</button>
      </div>

      {/* Form */}
      <div className="create-community-form">
        <CreateCommunityForm />
      </div>
    </div>
  );
}
