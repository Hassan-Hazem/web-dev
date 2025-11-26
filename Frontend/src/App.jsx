import React from "react";
import Navbar from "./components/react/Navbar";
import Sidebar from "./components/react/Sidebar";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
  return (
    <div>
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <HomePage />
      </div>
    </div>
  );
}

export default App;
