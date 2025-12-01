
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/react/Navbar";
import Sidebar from "./components/react/Sidebar";
import HomePage from "./pages/HomePage";
import PopularPage from "./pages/PopularPage";
import ExplorePage from "./pages/ExplorePage";
import "./App.css";
import Interests from "./components/react/Interests";


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <div>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="app-body">
          <Sidebar isSidebarOpen={isSidebarOpen} />
          {isSidebarOpen && (
            <div className="sidebar-backdrop" onClick={closeSidebar} />
          )}
          <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/explore" element={<ExplorePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
export default App