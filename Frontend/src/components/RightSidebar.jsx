import React from "react";
import "./RightSidebar.css";

const communities = [
  { name: "r/AskMen", members: "7,088,368" },
  { name: "r/technology", members: "13,245,123" },
  { name: "r/PS4", members: "5,508,246" },
  { name: "r/apple", members: "6,284,854" },
  { name: "r/NBA2k", members: "738,541" },
];

export default function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="community-card">
        <h3>POPULAR COMMUNITIES</h3>
        <ul className="community-list">
          {communities.map((c, idx) => (
            <li key={c.name} className="community-item">
              <span className="community-icon" />
              <span className="community-name">{c.name}</span>
              <span className="community-members">{c.members} members</span>
            </li>
          ))}
        </ul>
        <button className="see-more-btn">See more</button>
      </div>
    </aside>
  );
}
