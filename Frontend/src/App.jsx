
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/react/Navbar";
import Sidebar from "./components/react/Sidebar";
import HomePage from "./pages/HomePage";
import PopularPage from "./pages/PopularPage";
import ExplorePage from "./pages/ExplorePage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import CommunityPage from "./pages/CommunityPage";

import "./App.css";


function App() {

  return (

    <Router>
      <div>
        <Navbar />
        <div className="app-body">
          <Sidebar />
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<PopularPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/create-community" element={<CreateCommunityPage />} />  {/* new */}
          <Route path="/community/:name" element={<CommunityPage />} />          {/* dynamic page */}
         </Routes>

        </div>
      </div>
    </Router>
  );
}
export default App