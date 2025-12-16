import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../css/CreateCommunityModal.css";

export default function CreateCommunityModal({ onClose }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [communityType, setCommunityType] = useState("public");
  
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Categories with topics (grouped) — used to render chips grouped like Reddit categories
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

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const createCommunity = async () => {
    if (!communityName.trim()) {
      setError("Enter a community name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const payload = {
        name: communityName.trim(),
        description: description.trim() || "Welcome to this community! Discuss and share.",
        topics: selectedInterests,
      };

      const response = await api.post("/communities", payload);
      const newCommunity = response.data;

      // Save to recents
      try {
        const raw = localStorage.getItem('recents');
        let recents = raw ? JSON.parse(raw) : [];
        recents = recents.filter((c) => c.name !== newCommunity.name);
        recents.unshift({
          name: newCommunity.name,
          displayName: newCommunity.name,
          description: newCommunity.description,
          createdAt: newCommunity.createdAt,
        });
        recents = recents.slice(0, 6);
        localStorage.setItem('recents', JSON.stringify(recents));
        window.dispatchEvent(new Event('recentsUpdated'));
      } catch (err) {
        console.error('Failed saving recents', err);
      }

      navigate(`/community/${newCommunity.name}`);
      onClose();
    } catch (err) {
      console.error("Error creating community:", err);
      setError(err.response?.data?.message || "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button onClick={onClose} className="modal-close">×</button>

        {/* Step 1: Topics (choose topics first) */}
        {step === 1 && (
          <div className="modal-step">
            <h2 className="modal-title">Choose Topics</h2>
            <p className="modal-desc">Select topics related to your community (optional).</p>

            <div>
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="category-section">
                  <h3 className="category-title">{cat.emoji} {cat.name}</h3>
                  <div className="interests-grid topics-grid">
                    {cat.topics.map((topic) => (
                      <button
                        key={topic}
                        className={`interest-btn ${selectedInterests.includes(topic) ? "selected" : ""}`}
                        onClick={() => toggleInterest(topic)}
                        type="button"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'flex', justifyContent:'space-between', gap:12, marginTop:18}}>
              <button onClick={onClose} className="btn btn-secondary">Cancel</button>
              <div style={{marginLeft:'auto', display:'flex', gap:12}}>
                <button onClick={() => setStep(2)} className="btn btn-primary">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Community type (after topics) */}
        {step === 2 && (
          <div className="modal-step">
            <h2 className="modal-title">What kind of community is this?</h2>
            <p className="modal-desc">Decide who can view and contribute in your community. Only public communities show up in search.</p>

            <div className="type-options">
              <label className={`type-option ${communityType === 'public' ? 'selected' : ''}`} onClick={() => setCommunityType('public')}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <span className="type-icon">🌐</span>
                  <div className="type-option-label">
                    <span className="type-option-name">Public</span>
                    <span className="type-option-desc">Anyone can view, post, and comment to this community</span>
                  </div>
                </div>
                <input
                  className="type-radio"
                  type="radio"
                  name="communityType"
                  checked={communityType === 'public'}
                  onChange={() => setCommunityType('public')}
                />
              </label>

              <label className={`type-option ${communityType === 'restricted' ? 'selected' : ''}`} onClick={() => setCommunityType('restricted')}>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <span className="type-icon">👁️</span>
                  <div className="type-option-label">
                    <span className="type-option-name">Restricted</span>
                    <span className="type-option-desc">Anyone can view, but only approved users can contribute</span>
                  </div>
                </div>
                <input
                  className="type-radio"
                  type="radio"
                  name="communityType"
                  checked={communityType === 'restricted'}
                  onChange={() => setCommunityType('restricted')}
                />
              </label>
            </div>

            <div style={{display:'flex', justifyContent:'space-between', gap:12, marginTop:18}}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Name & Description */}
        {step === 3 && (
          <div className="modal-step">
            <h2 className="modal-title">Tell us about your community</h2>

            <label className="modal-label">Community Name</label>
            <input
              className="modal-input"
              placeholder="ex: technology"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
            />

            <label className="modal-label">Description (optional)</label>
            <textarea
              className="modal-input"
              placeholder="Write a short description for your community"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error && <p style={{color: '#c0392b', fontSize: '13px', marginTop: '8px'}}>{error}</p>}

            <div style={{display:'flex', justifyContent:'space-between', gap:12, marginTop:18}}>
              <button onClick={() => setStep(2)} className="btn btn-secondary" disabled={creating}>Back</button>
              <button onClick={createCommunity} className="btn btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
