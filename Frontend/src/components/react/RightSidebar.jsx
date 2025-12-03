import React, { useEffect, useState } from "react";
import api from "../../api/axios"; //
import "../css/RightSidebar.css";

export default function RightSidebar() {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Fetch top 5 communities (Backend sorts by memberCount by default)
        const response = await api.get("/communities?limit=5"); //
        setCommunities(response.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <aside className="right-sidebar">
      <div className="community-card">
        <h3>POPULAR COMMUNITIES</h3>
        <ul className="community-list">
          {communities.map((c) => (
            <li key={c._id} className="community-item">
              {/* Use profilePictureUrl if available, otherwise default color */}
              <span 
                className="community-icon" 
                style={{
                   backgroundImage: c.profilePictureUrl ? `url(${c.profilePictureUrl})` : 'none',
                   backgroundColor: c.profilePictureUrl ? 'transparent' : '#0079D3'
                }}
              />
              <div className="community-info">
                 <span className="community-name">r/{c.name}</span>
                 <span className="community-members">
                   {c.memberCount ? c.memberCount.toLocaleString() : 0} members
                 </span>
              </div>
            </li>
          ))}
        </ul>
        <button className="see-more-btn">See more</button>
      </div>
    </aside>
  );
}