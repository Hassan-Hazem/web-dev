import React from "react";
import "../css/TrendingCarousel.css";

const trendingCarouselData = [
  { 
    title: "Same-sex marriage in Europe", 
    subtitle: "EU court says same-sex marriages should be recognized across all member states",
    subreddit: "r/news",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop"
  },
  { 
    title: "Louvre heist suspects arrested", 
    subtitle: "Paris prosecutor reports 4 more arrests in connection with the museum theft",
    subreddit: "r/news",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop"
  },
  { 
    title: "Buses get stuck in Oslo", 
    subtitle: "Four buses got stuck in a roundabout traffic jam during rush hour",
    subreddit: "r/pics",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop"
  },
  { 
    title: "How to identify AI-generated content", 
    subtitle: "New tools help detect synthetic media and deepfakes",
    subreddit: "r/technology",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop"
  },
];

export default function TrendingCarousel() {
  return (
    <section className="trending-carousel-section">
      <div className="trending-carousel">
        {trendingCarouselData.map((item, idx) => (
          <div className="trending-carousel-card" key={idx}>
            <img src={item.img} alt={item.title} className="trending-carousel-img" />
            <div className="trending-carousel-gradient"></div>
            <div className="trending-carousel-content">
              <h3 className="trending-carousel-title">{item.title}</h3>
              <p className="trending-carousel-subtitle">{item.subtitle}</p>
              <div className="trending-carousel-footer">
                <span className="trending-carousel-icon"></span>
                <span className="trending-carousel-subreddit">{item.subreddit}</span>
                <span className="trending-carousel-more">and more</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
