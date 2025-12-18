import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/react/Navbar";
import Sidebar from "./components/react/Sidebar";
import HomePage from "./pages/HomePage";
import PopularPage from "./pages/PopularPage";
import ExplorePage from "./pages/ExplorePage";
import CommunityPage from "./pages/CommunityPage";
import UserProfilePage from "./pages/UserProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import AuthSuccess from "./pages/AuthSuccess";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SearchResultsPage from "./pages/SearchResultsPage";

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
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
              <Route path="/resetPassword" element={<ResetPasswordPage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/community/:name" element={<CommunityPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
