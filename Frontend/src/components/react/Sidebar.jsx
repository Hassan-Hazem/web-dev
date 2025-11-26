import React, { useState } from "react";
import "../css/Sidebar.css";

export default function Sidebar() {
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <a href="#" className="sidebar-link">
          <span className="sidebar-icon home" />
          Home
        </a>
        <a href="#" className="sidebar-link">
          <span className="sidebar-icon popular" />
          Popular
        </a>
        <a href="#" className="sidebar-link">
          <span className="sidebar-icon explore" />
          Explore
        </a>
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
