import React, { useState } from "react";

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

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length >= 1) {
      onComplete(selectedInterests);
    }
  };

  return (
    <div style={{
      padding: "60px 40px 40px",
      maxHeight: "90vh",
      overflowY: "auto"
    }}>
      <button 
        onClick={onSkip}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "none",
          border: "none",
          color: "#7c7c7c",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          padding: "8px 16px",
          borderRadius: "20px",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.background = "#f6f7f8"}
        onMouseLeave={(e) => e.target.style.background = "none"}
      >
        Skip
      </button>

      <h2 style={{
        fontSize: "1.75rem",
        fontWeight: "bold",
        color: "#1c1c1c",
        marginBottom: "12px",
        textAlign: "center"
      }}>
        Interests
      </h2>
      
      <p style={{
        fontSize: "0.875rem",
        color: "#7c7c7c",
        lineHeight: "1.5",
        marginBottom: "32px",
        textAlign: "center"
      }}>
        Pick things you'd like to see in your home feed.
      </p>

      {/* Category Tabs */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        borderBottom: "1px solid #edeff1",
        overflowX: "auto"
      }}>
        {Object.keys(interestsData).map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              background: "none",
              border: "none",
              padding: "12px 16px",
              fontSize: "0.9375rem",
              fontWeight: "600",
              color: activeCategory === category ? "#0079d3" : "#7c7c7c",
              borderBottom: activeCategory === category ? "2px solid #0079d3" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 0.2s"
            }}
          >
            {category === "Popular" && "🎯 "}
            {category === "Places & Travel" && "🌍 "}
            {category === "Q&As & Stories" && "✏️ "}
            {category}
          </button>
        ))}
      </div>

      {/* Interests Grid */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "32px"
      }}>
        {interestsData[activeCategory].map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            style={{
              background: selectedInterests.includes(interest) ? "#0079d3" : "#f6f7f8",
              color: selectedInterests.includes(interest) ? "#fff" : "#1c1c1c",
              border: selectedInterests.includes(interest) ? "1px solid #0079d3" : "1px solid transparent",
              borderRadius: "20px",
              padding: "8px 16px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              if (!selectedInterests.includes(interest)) {
                e.target.style.background = "#eaecef";
              }
            }}
            onMouseLeave={(e) => {
              if (!selectedInterests.includes(interest)) {
                e.target.style.background = "#f6f7f8";
              }
            }}
          >
            {interest}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={selectedInterests.length < 1}
        style={{
          width: "100%",
          padding: "14px 20px",
          background: selectedInterests.length >= 1 ? "#ff4500" : "#d7dadc",
          border: "none",
          borderRadius: "24px",
          fontSize: "1rem",
          fontWeight: "700",
          color: "#fff",
          cursor: selectedInterests.length >= 1 ? "pointer" : "not-allowed",
          marginTop: "16px",
          transition: "background 0.2s"
        }}
        onMouseEnter={(e) => {
          if (selectedInterests.length >= 1) {
            e.target.style.background = "#ff5414";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedInterests.length >= 1) {
            e.target.style.background = "#ff4500";
          }
        }}
      >
        {selectedInterests.length >= 1 
          ? `Continue (${selectedInterests.length} selected)` 
          : "Select at least 1 to continue"}
      </button>
    </div>
  );
}