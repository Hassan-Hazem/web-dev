import React, { useState } from "react";
import api from "../../api/axios"; // Import API
import "../css/Interests.css";

// Sync categories with CreateCommunityModal
const CATEGORIES = [
  {
    id: 'technology',
    name: 'Technology',
    emoji: '💻',
    topics: ['AI & ML','Web Development','Mobile Development','DevOps','Cybersecurity','Blockchain','Cloud Computing']
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    topics: ['Physics','Biology','Chemistry','Astronomy','Earth Science','Neuroscience','Environmental Science']
  },
  {
    id: 'arts',
    name: 'Arts & Media',
    emoji: '🎨',
    topics: ['Photography','Music','Film & TV','Painting','Graphic Design','Literature','Theater']
  },
  {
    id: 'gaming',
    name: 'Gaming',
    emoji: '🎮',
    topics: ['PC Gaming','Console Gaming','Mobile Gaming','Esports','Game Development','Retro Games','VR/AR']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    emoji: '✨',
    topics: ['Health & Fitness','Food & Cooking','Travel','Personal Finance','Home & Garden','Fashion','Relationships']
  },
  {
    id: 'education',
    name: 'Education',
    emoji: '📚',
    topics: ['STEM Education','Language Learning','Study Tips','Educational Tech','Research','Teaching Resources','Remote Learning']
  },
  {
    id: 'business',
    name: 'Business & Entrepreneurship',
    emoji: '💼',
    topics: ['Startups','Marketing','Product Management','Finance','E-commerce','Freelancing','HR & People Ops']
  }
];

export default function Interests({ onComplete, onSkip }) {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
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

      {/* Category Tabs (synced with CreateCommunity) */}
      <div className="hide-scrollbar interests-tabs">
        {/* All tab to show all topics without filters */}
        <button
          key="all"
          onClick={() => setActiveCategoryId('all')}
          className={`interests-tab-btn ${activeCategoryId === 'all' ? 'active' : ''}`}
        >
           All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`interests-tab-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Interests Grid (topics from active category or all) */}
      <div className="interests-grid">
        {(activeCategoryId === 'all'
          ? Array.from(new Set(CATEGORIES.flatMap((c) => c.topics)))
          : (CATEGORIES.find((c) => c.id === activeCategoryId)?.topics || [])
        ).map((topic) => (
          <button
            key={topic}
            onClick={() => toggleInterest(topic)}
            className={`interest-chip ${selectedInterests.includes(topic) ? 'selected' : ''}`}
          >
            {topic}
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