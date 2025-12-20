import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchPosts } from "../api/postApi";
import PostCard from "../components/react/PostCard";
import "./SearchResultsPage.css";

const normalizePosts = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.posts)) return data.posts;
  return [];
};

export default function SearchResultsPage() {
  const location = useLocation();
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || "").trim();
  }, [location.search]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runSearch = async () => {
      if (!query) {
        setPosts([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await searchPosts(query);
        setPosts(normalizePosts(data));
      } catch (err) {
        console.error("Search results error", err);
        setError("Something went wrong while searching posts.");
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [query]);

  return (
    <main className="search-results-page">
      <div className="search-results-header">
        <div>
          <h1>Search results</h1>
          {query ? <p className="search-query">for "{query}"</p> : <p className="search-query">Type a query in Om Ahmed ™ mode</p>}
        </div>
        {!loading && query && <span className="result-count">{posts.length} posts</span>}
      </div>

      {loading && <div className="search-status">Loading posts...</div>}
      {!loading && error && <div className="search-status error">{error}</div>}
      {!loading && !error && query && posts.length === 0 && (
        <div className="search-status">No posts found. Try another query.</div>
      )}
      {!loading && !query && <div className="search-status">Enter a search term and press Enter in Om Ahmed ™ mode to see results.</div>}

      <section className="search-results-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </section>
    </main>
  );
}
