import { useEffect, useState } from "react";
import api from "../api/axios"; 
import "./PopularPage.css";
import PostCard from "../components/react/PostCard";
import TrendingCarousel from "../components/react/TrendingCarousel";
import RightSidebar from "../components/react/RightSidebar";

export default function PopularPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts whenever 'page' changes
  useEffect(() => {
    const fetchPosts = async () => {
      // Prevent fetching if we already know there's no more data
      if (!hasMore) return;
      
      setLoading(true);
      try {
        // Fetch with pagination query params (limit=10 is default in backend)
        const response = await api.get(`/posts?page=${page}&limit=10`);
        const newPosts = response.data;

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          // If it's page 1, replace. If > 1, append.
          setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, hasMore]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled to the bottom
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      ) {
        // Only load more if not currently loading and there is more data
        if (!loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <main className="popular-main">
      <TrendingCarousel />
      <div className="popular-grid">
        <div className="feed-column">
          <div className="filter-bar">
            <button className="filter-btn active">Best</button>
            <button className="filter-btn">Hot</button>
            <button className="filter-btn">New</button>
          </div>
          
          <section className="feed-section">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            
            {loading && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-body)" }}>
                Loading more posts...
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "gray" }}>
                You've reached the end! 🚀
              </div>
            )}
          </section>
        </div>
        
        <div className="sidebar-column">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}