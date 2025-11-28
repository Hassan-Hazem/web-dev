import React, { useState } from "react";
import "./ExplorePage.css";

const categories = [
  "All",
  "Internet Culture",
  "Games",
  "Q&As & Stories",
  "Technology",
  "Movies & TV",
  "Places & Travel",
  "Pop Culture",
  "Business & Finance",
  "Sports",
  "Education & Career",
  "News & Politics",
];

const recommendedCommunities = [
  {
    id: 1,
    name: "tressless",
    icon: "👨‍🦲",
    members: "520K",
    description: "Connect with others experiencing hair loss and explore effective treatments and solutions.",
  },
  {
    id: 2,
    name: "funny",
    icon: "😂",
    members: "4.3M",
    description: "Get your daily fix of humor with posts that will have you laughing out loud.",
  },
  {
    id: 3,
    name: "Minoxbeards",
    icon: "🧔",
    members: "121K",
    description: "Welcome to MinoxBeards, the subreddit for those seeking to grow fuller, thicker beards.",
  },
  {
    id: 4,
    name: "bald",
    icon: "👨",
    members: "1.6M",
    description: "Embrace your baldness and connect with others who understand in this supportive community.",
  },
  {
    id: 5,
    name: "PersonalFinanceEgypt",
    icon: "💰",
    members: "36K",
    description: "Discuss budgeting, investing, saving, banking services, and all around personal finance in Egypt.",
  },
  {
    id: 6,
    name: "FunnyAnimals",
    icon: "🐾",
    members: "529K",
    description: "Laugh at the hilarious antics of our furry, feathered, and scaly friends.",
  },
];

const internetCultureCommunities = [
  {
    id: 7,
    name: "BestofRedditorUpdates",
    icon: "📰",
    members: "1.5M",
    description: "Follow up on the most intriguing Reddit stories and see how they turned out.",
  },
  {
    id: 8,
    name: "SipsTea",
    icon: "🍵",
    members: "4.1M",
    description: "Sip some tea and enjoy the internet's hottest viral videos and memes.",
  },
  {
    id: 9,
    name: "HistoryMemes",
    icon: "📜",
    members: "1.3M",
    description: "Relive history in a hilarious way with our collection of historical memes.",
  },
  {
    id: 10,
    name: "Whatcouldgowrong",
    icon: "🤦",
    members: "2.2M",
    description: "See the consequences of stupid ideas. Watch and learn what not to do.",
  },
  {
    id: 11,
    name: "funny",
    icon: "😂",
    members: "4.3M",
    description: "Get your daily fix of humor with posts that will have you laughing out loud.",
  },
  {
    id: 12,
    name: "oddlysatisfying",
    icon: "😌",
    members: "2.3M",
    description: "Share and enjoy videos and images that are pleasing to the eye and satisfying.",
  },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <main className="explore-main">
      <div className="explore-header">
        <h1>Explore Communities</h1>
        <div className="categories-bar">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="explore-container">
        <section className="communities-section">
          <h2 className="section-title">Recommended for you</h2>
          <div className="communities-grid">
            {recommendedCommunities.map((community) => (
              <div key={community.id} className="community-card">
                <div className="community-header">
                  <div className="community-avatar">{community.icon}</div>
                  <div className="community-meta">
                    <h3 className="community-name">r/{community.name}</h3>
                    <span className="community-members">{community.members} weekly visitors</span>
                  </div>
                  <button className="btn-join-card">Join</button>
                </div>
                <p className="community-description">{community.description}</p>
              </div>
            ))}
          </div>
          <button className="btn-show-more">Show more</button>
        </section>

        <section className="communities-section">
          <h2 className="section-title">Internet Culture</h2>
          <div className="communities-grid">
            {internetCultureCommunities.map((community) => (
              <div key={community.id} className="community-card">
                <div className="community-header">
                  <div className="community-avatar">{community.icon}</div>
                  <div className="community-meta">
                    <h3 className="community-name">r/{community.name}</h3>
                    <span className="community-members">{community.members} weekly visitors</span>
                  </div>
                  <button className="btn-join-card">Join</button>
                </div>
                <p className="community-description">{community.description}</p>
              </div>
            ))}
          </div>
          <button className="btn-show-more">Show more</button>
        </section>
      </div>
    </main>
  );
}
