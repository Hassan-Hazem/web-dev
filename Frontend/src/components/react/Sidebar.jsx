import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "../css/Sidebar.css";
import CreateCommunityModal from "./CreateCommunityModal"; // <— ADD THIS

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false); // <— NEW
  const location = useLocation();
  const { user } = useAuth(); // Get auth state
  const [recents, setRecents] = useState([]);
  const [recentsOpen, setRecentsOpen] = useState(false);

  useEffect(() => {
    const loadRecents = () => {
      try {
        const raw = localStorage.getItem('recents');
        const parsed = raw ? JSON.parse(raw) : [];
        setRecents(parsed);
      } catch (err) {
        console.error('Failed to load recents', err);
        setRecents([]);
      }
    };

    loadRecents();

    // Listen to updates from modal or other tabs
    const onRecentsUpdated = () => loadRecents();
    window.addEventListener('recentsUpdated', onRecentsUpdated);
    window.addEventListener('storage', onRecentsUpdated);

    return () => {
      window.removeEventListener('recentsUpdated', onRecentsUpdated);
      window.removeEventListener('storage', onRecentsUpdated);
    };
  }, []);

  return (
    <>
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

          {/* ----------------------------- */}
          {/* START A COMMUNITY (OPEN MODAL) */}
          {/* ----------------------------- */}
          {user && (
            <Link
              to="#" // we keep it as # because it just opens modal
              className="sidebar-link start-community-link"
              onClick={() => setOpenModal(true)}
            >
              <span className="sidebar-icon create" />
              Start a community
            </Link>
          )}

          {/* Recents (collapsible like Resources) - only show when logged in */}
          {user && recents && recents.length > 0 && (
            <div className="sidebar-section">
              <button
                className="accordion-btn"
                onClick={() => setRecentsOpen(!recentsOpen)}
              >
                Recents
                <span className={`accordion-arrow ${recentsOpen ? "open" : ""}`} />
              </button>

              {recentsOpen && (
                <div className="accordion-content">
                  {recents.map((c) => (
                    <Link
                      key={c.name}
                      to={`/community/${c.name}`}
                      className={`sidebar-link recent-item ${location.pathname === `/community/${c.name}` ? 'active' : ''}`}
                    >
                      <span className="sidebar-icon recent" />
                      {c.displayName || c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}



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

      {/* Render the modal when openModal is true */}
      {openModal && <CreateCommunityModal onClose={() => setOpenModal(false)} />}
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
