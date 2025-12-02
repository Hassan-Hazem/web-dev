import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/react/Navbar";
import Sidebar from "./components/react/Sidebar";
import HomePage from "./pages/HomePage";
import PopularPage from "./pages/PopularPage";
import ExplorePage from "./pages/ExplorePage";
import CommunityPage from "./pages/CommunityPage";

import "./App.css";
import Interests from "./components/react/Interests";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div>
        <Navbar />
        <div className="app-body">
          {/* Sidebar from main branch */}
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Overlay click to close sidebar (from main) */}
          {isSidebarOpen && (
            <div className="sidebar-backdrop" onClick={closeSidebar} />
          )}

          {/* Main content wrapper (from main) */}
          <main className={`main-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/explore" element={<ExplorePage />} />

              {/* The route from YOUR branch */}
              <Route path="/community/:name" element={<CommunityPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
