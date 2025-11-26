import React from "react";
import "./Home.css";
import PostCard from "./PostCard";
import TrendingCarousel from "./TrendingCarousel";
import RightSidebar from "./RightSidebar";

const posts = [
  {
    id: 1,
    title: "What kind of question is that?",
    author: "funnyvideos",
    subreddit: "r/funnyvideos",
    votes: 123,
    comments: 45,
    image: "https://via.placeholder.com/400x200",
  },
  {
    id: 2,
    title: "Check out this amazing sunset!",
    author: "naturelover",
    subreddit: "r/pics",
    votes: 98,
    comments: 12,
    image: "https://via.placeholder.com/400x200",
  },
  {
    id: 3,
    title: "My new gaming setup",
    author: "gamer123",
    subreddit: "r/gaming",
    votes: 76,
    comments: 30,
    image: "https://via.placeholder.com/400x200",
  },
];

export default function Home() {
  return (
    <main className="home-main">
      <TrendingCarousel />
      <div className="home-grid">
        <div className="feed-column">
          <div className="filter-bar">
            <button className="filter-btn active">Best</button>
            <button className="filter-btn">Hot</button>
            <button className="filter-btn">New</button>
          </div>
          <section className="feed-section">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </div>
        <div className="sidebar-column">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}
