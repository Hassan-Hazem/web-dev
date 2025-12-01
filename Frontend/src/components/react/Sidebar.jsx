import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar() {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/" 
          className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
        >
          <span className="sidebar-icon home" />
          Home
        </Link>
        <Link 
          to="/popular" 
          className={`sidebar-link ${location.pathname === "/popular" ? "active" : ""}`}
        >
          <span className="sidebar-icon popular" />
          Popular
        </Link>
        <Link 
          to="/explore" 
          className={`sidebar-link ${location.pathname === "/explore" ? "active" : ""}`}
        >
          <span className="sidebar-icon explore" />
          Explore
        </Link>
        <Link 
        to="/create-community" 
        className={`sidebar-link ${location.pathname === "/create-community" ? "active" : ""}`}
        >
        <span className="sidebar-icon create" />
        Start a community
       </Link>

        <div className="sidebar-section">
          <button
            className="accordion-btn"
            onClick={() => setResourcesOpen(!resourcesOpen)}
          >
            Resources
            <span className={`accordion-arrow ${resourcesOpen ? "open" : ""}`} />
          </button>
          {resourcesOpen && (
            <div className="accordion-content">
              <a href="#">About Reddit</a>
              <a href="#">Advertise</a>
              <a href="#">Developer Platform</a>
              <a href="#">Help</a>
            </div>
          )}
        </div>
      </nav>
      <footer className="sidebar-footer">
        <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Contact</a>
      </footer>
    </aside>
  );
}
