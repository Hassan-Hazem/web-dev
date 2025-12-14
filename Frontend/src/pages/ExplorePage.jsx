import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../api/axios";
import "./ExplorePage.css";
import AuthModal from "../components/react/AuthModal";

// Categories and topics
const CATEGORIES = [
	{ id: "all", name: "All" },
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

export default function ExplorePage() {
	const navigate = useNavigate();
	const [activeTopic, setActiveTopic] = useState("all");
	const [communities, setCommunities] = useState([]);
	const [page, setPage] = useState(1);
	const [limit] = useState(12);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [joiningCommunity, setJoiningCommunity] = useState(null);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { user } = useAuth();

	// Get all topics from all categories
	const allTopics = useMemo(
		() => Array.from(new Set(CATEGORIES.filter((c) => c.id !== "all").flatMap((c) => c.topics || []))),
		[]
	);

	const fetchCommunities = async (reset = false, pageOverride) => {
		setLoading(true);
		setError(null);
		try {
			const currentPage = pageOverride ?? page;
			const topicParam = activeTopic !== "all" ? activeTopic : undefined;
			const params = new URLSearchParams();
			params.append("page", String(currentPage));
			params.append("limit", String(limit));
			if (topicParam) params.append("topic", topicParam);
			const res = await api.get(`/communities?${params.toString()}`);
			const payload = res.data;
			const data = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.communities)
				? payload.communities
				: [];
			setCommunities((prev) => (reset ? data : [...prev, ...data]));
			setHasMore(data.length >= limit);
		} catch (err) {
			console.error("Failed to load communities", err);
			setError(err.response?.data?.message || "Failed to load communities");
		} finally {
			setLoading(false);
		}
	};

	const filteredCommunities = useMemo(() => {
		return communities.filter((cm) => {
			if (activeTopic === "all") return true;
			if (Array.isArray(cm.topics)) return cm.topics.includes(activeTopic);
			return cm.topic === activeTopic;
		});
	}, [communities, activeTopic]);

	const shouldShowMoreButton = filteredCommunities.length > limit || hasMore || page > 1;

	useEffect(() => {
		setPage(1);
		setCommunities([]);
		setHasMore(true);
		fetchCommunities(true, 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTopic]);

	useEffect(() => {
		if (page > 1) fetchCommunities(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	const handleToggleShow = () => {
		if (loading) return;
		if (page > 1 && !hasMore) {
			// collapse to initial page
			setPage(1);
			setCommunities([]);
			setHasMore(true);
			fetchCommunities(true, 1);
		} else {
			setPage((p) => p + 1);
		}
	};

	const handleJoinCommunity = async (e, communityName) => {
		e.stopPropagation(); // Prevent card click
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		setJoiningCommunity(communityName);
		try {
			await api.post(`/communities/${communityName}/join`);
			alert("Joined community successfully!");
		} catch (err) {
			console.error("Error joining community:", err);
			if (err.response?.status === 401) {
				setShowLoginModal(true);
			} else {
				alert(err.response?.data?.message || "Failed to join community");
			}
		} finally {
			setJoiningCommunity(null);
		}
	};

	const handleCommunityClick = (communityName) => {
		navigate(`/community/${communityName}`);
	};

	return (
		<>
			{showLoginModal && createPortal(
				<AuthModal
					isOpen
					initialView="login"
					onClose={() => setShowLoginModal(false)}
				/>,
				document.body
			)}
			<main className="explore-main">
				<div className="explore-header">
				<h1>Explore Communities</h1>
				<div className="categories-bar" style={{ marginTop: 8 }}>
					<button
						key="topic-all"
						className={`category-btn ${activeTopic === "all" ? "active" : ""}`}
						onClick={() => setActiveTopic("all")}
					>
						All Topics
					</button>
					{allTopics.map((topic) => (
						<button
							key={`topic-${topic}`}
							className={`category-btn ${activeTopic === topic ? "active" : ""}`}
							onClick={() => setActiveTopic(topic)}
						>
							{topic}
						</button>
					))}
				</div>
			</div>

			<div className="explore-container">
				<section className="communities-section">
					<h2 className="section-title">Communities</h2>

					{error && <p style={{ color: "red" }}>{error}</p>}

					{!loading && filteredCommunities.length === 0 && (
						<p className="no-communities-message">No communities found for this topic.</p>
					)}

					<div className="communities-grid">
						{filteredCommunities.map((community) => (
								<div 
									key={community._id} 
									className="community-card"
									onClick={() => handleCommunityClick(community.name)}
									style={{ cursor: 'pointer' }}
								>
									<div className="community-header">
										<div className="community-avatar">
											{(() => {
												const avatarUrl =
													community.profilePictureUrl ||
													community.profilePicture ||
													community.avatarUrl ||
													community.iconUrl ||
													"";
												return avatarUrl ? (
													<img
														src={avatarUrl}
														alt={`r/${community.name} avatar`}
														className="community-avatar-img"
														onError={(e) => {
															e.currentTarget.style.display = 'none';
															e.currentTarget.parentElement.textContent = '👥';
														}}
													/>
												) : (
													community.icon || "👥"
												);
											})()}
										</div>
										<div className="community-meta">
											<h3 className="community-name">r/{community.name}</h3>
											<span className="community-members">{community.memberCount || 0} members</span>
										</div>
										<button 
										className="btn-join-card"
										onClick={(e) => handleJoinCommunity(e, community.name)}
										disabled={joiningCommunity === community.name}
									>
										{joiningCommunity === community.name ? "Joining..." : "Join"}
										</button>
									</div>
									<p className="community-description">{community.description}</p>
								</div>
							))}
					</div>

					{shouldShowMoreButton && (
						<button className="btn-show-more" onClick={handleToggleShow} disabled={loading || (!hasMore && page === 1)}>
							{loading ? "Loading..." : page > 1 && !hasMore ? "Show less" : "Show more"}
						</button>
					)}
				</section>
			</div>
		</main>
		</>
	);
}