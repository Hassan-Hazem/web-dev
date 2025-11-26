import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import Home from "./components/Home";
import TrendingCarousel from "./components/TrendingCarousel";
import "./App.css";

function App() {
  return (
    <div>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <Home />
      </div>
    </div>
  );
}

export default App;
