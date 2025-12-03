import React, { useState } from "react";
import api from "../../api/axios"; // Import API
import "../css/Interests.css";

const interestsData = {
  Popular: [
    "AlexandriaEgy",
    "askegypt",
    "PersonalFinanceEgypt",
    "EGYescapism",
    "TopCharacterTropes",
    "ArcRaiders",
    "NBA",
    "Pop Culture Chat",
    "Tech news",
    "US news"
  ],
  "Places & Travel": [
    "Libya",
    "Egypt",
    "Syria",
    "Places in the Middle East",
    "Places in Europe",
    "Places in North America",
    "CAIRO",
    "Travel & Holiday",
    "Places in Asia",
    "Tunisia"
  ],
  "Q&As & Stories": [
    "Q&As",
    "Stories & Confessions",
    "Ask Reddit"
  ]
};

export default function Interests({ onComplete, onSkip }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Popular");
  const [loading, setLoading] = useState(false); // Add loading state

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length >= 1) {
      setLoading(true);
      try {
        // Integrate API: Update user profile with interests
        await api.put('/users/profile', { interests: selectedInterests });
        
        // Proceed to next step
        onComplete(selectedInterests);
      } catch (error) {
        console.error("Failed to update interests:", error);
        alert("Something went wrong saving your interests.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="interests-container">
      <button onClick={onSkip} className="interests-skip-btn">Skip</button>

      <h2 className="interests-title">Interests</h2>
      
      <p className="interests-subtitle">
        Pick things you'd like to see in your home feed.
      </p>

      {/* Category Tabs */}
      <div className="hide-scrollbar interests-tabs">
        {Object.keys(interestsData).map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`interests-tab-btn ${activeCategory === category ? 'active' : ''}`}
          >
            {category === "Popular" && "🎯 "}
            {category === "Places & Travel" && "🌍 "}
            {category === "Q&As & Stories" && "✏️ "}
            {category}
          </button>
        ))}
      </div>

      {/* Interests Grid */}
      <div className="interests-grid">
        {interestsData[activeCategory].map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`interest-chip ${selectedInterests.includes(interest) ? 'selected' : ''}`}
          >
            {interest}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={selectedInterests.length < 1 || loading}
        className={`interests-continue-btn ${selectedInterests.length >= 1 ? 'enabled' : ''}`}
      >
        {loading ? "Saving..." : (
          selectedInterests.length >= 1 
            ? `Continue (${selectedInterests.length} selected)` 
            : "Select at least 1 to continue"
        )}
      </button>
    </div>
  );
}