import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; //
import "../css/RightSidebar.css";

export default function RightSidebar() {
  const [communities, setCommunities] = useState([]);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/communities?limit=${limit}`);
        setCommunities(response.data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [limit]);

  const loadMore = () => {
    setLimit((prev) => Math.min(prev + 5, 10));
    setIsExpanded(true);
  };

  const seeLess = () => {
    setLimit(5);
    setIsExpanded(false);
  };

  return (
    <aside className="right-sidebar">
      <div className="community-card">
        <h3>POPULAR COMMUNITIES</h3>
        <ul className="community-list">
          {communities.map((c) => (
            <li
              key={c._id}
              className="community-item"
              onClick={() => navigate(`/community/${encodeURIComponent(c.name)}`)}
              style={{ cursor: "pointer" }}
            >
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
        {(limit < 10 && communities.length >= limit) && (
          <button className="see-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "See more"}
          </button>
        )}
        {isExpanded && (
          <button className="see-less-btn" onClick={seeLess}>
            See less
          </button>
        )}
      </div>
    </aside>
  );
}