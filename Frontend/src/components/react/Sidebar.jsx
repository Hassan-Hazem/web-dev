import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <button
        className="sidebar-edge-toggle"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
        onClick={toggleSidebar}
        data-sidebar-open={isSidebarOpen}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line x1="7" y1="4" x2="7" y2="18" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
          <line x1="11" y1="4" x2="11" y2="18" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
          <line x1="15" y1="4" x2="15" y2="18" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`} data-open={isSidebarOpen}>
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
    </>
  );
}
