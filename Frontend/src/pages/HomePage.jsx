import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <main className="homepage-main">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Our Community</h1>
          <p className="hero-subtitle">
            Discover, share, and connect with people around the world. 
            Join millions of users sharing their stories, ideas, and passions.
          </p>
          <div className="hero-buttons">
            <Link to="/popular" className="btn-primary">
              Explore Popular Posts
            </Link>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <div className="card-icon">🔥</div>
            <div className="card-text">Trending Topics</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">💬</div>
            <div className="card-text">Active Discussions</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">⭐</div>
            <div className="card-text">Top Communities</div>
          </div>
        </div>
      </div>

      <section className="features-section">
        <h2 className="section-title">Why Join Our Community?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Stay Connected</h3>
            <p>Follow your favorite topics and never miss an update from the communities you love.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Share Your Voice</h3>
            <p>Post content, engage in discussions, and make your voice heard by millions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Discover Content</h3>
            <p>Explore trending posts, popular communities, and personalized recommendations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Build Community</h3>
            <p>Connect with like-minded people and grow your network across diverse topics.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join our community today and be part of something amazing</p>
          <Link to="/popular" className="btn-cta">
            View Popular Posts
          </Link>
        </div>
      </section>
    </main>
  );
}
