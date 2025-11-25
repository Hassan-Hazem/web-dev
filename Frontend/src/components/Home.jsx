import React from "react";
import "./Home.css";
import PostCard from "./PostCard";

const trending = [
  { title: "Scarlett Johansson to star in new ‘Exorcist’", img: "https://via.placeholder.com/120x80", subreddit: "r/horror" },
  { title: "Tornado strikes near Houston", img: "https://via.placeholder.com/120x80", subreddit: "r/tornado" },
  { title: "Judge orders James Comey case dismissed", img: "https://via.placeholder.com/120x80", subreddit: "r/politics" },
];

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
      <section className="trending-section">
        <h2>Trending</h2>
        <div className="trending-cards">
          {trending.map((item, idx) => (
            <div className="trending-card" key={idx}>
              <img src={item.img} alt={item.title} />
              <div className="trending-info">
                <span className="trending-title">{item.title}</span>
                <span className="trending-subreddit">{item.subreddit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
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
    </main>
  );
}
