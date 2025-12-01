import React from "react";
import "./Community.css";
import { useParams } from "react-router-dom";

export default function CommunityPage() {
  const { name } = useParams();

  // Dummy data for now
  const community = {
    name: name,
    description: "This is a sample community description.",
    image: null, // Can be a URL if uploaded
    posts: [
      { id: 1, title: "First Post", content: "Hello, this is a post!" },
      { id: 2, title: "Second Post", content: "Another post content." },
    ],
  };

  return (
    <div className="community-page">
      <header className="community-header">
        {community.image && <img src={community.image} alt={community.name} />}
        <h1>{community.name}</h1>
        <p>{community.description}</p>
        <button>Join Community</button>
      </header>

      <section className="community-posts">
        <h2>Posts</h2>
        {community.posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
