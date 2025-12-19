# 🚀 Reddit Clone - AI-Powered Community Platform

A full-stack Reddit clone featuring AI-powered content analysis, community management, and real-time interactions. Built with modern web technologies and enhanced with machine learning capabilities for intelligent content summarization and semantic search.

## 📋 Overview

This platform replicates core Reddit functionality while incorporating cutting-edge AI features for enhanced user experience. Users can create communities, share posts (text, images, links), engage in threaded discussions, and leverage AI-powered summarization to quickly understand lengthy content.

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens and Google OAuth 2.0 (Passport.js)
- **Media Storage**: Cloudinary for image uploads
- **Email Service**: SendGrid for transactional emails
- **API Documentation**: Swagger

### AI Service

- **Framework**: Python FastAPI
- **ML Models**: Sentence-Transformers for semantic embeddings
- **Summarization**: Transformer-based text summarization
- **Vector Storage**: Integration with MongoDB for embedding storage

### Frontend

- **Framework**: React 18 with Vite
- **State Management**: Context API
- **Styling**: Custom CSS with modular components
- **HTTP Client**: Axios
- **Routing**: React Router

## ✨ Key Features

### 🔐 Authentication & User Management

- Email/password registration with JWT tokens
- Email verification for new accounts
- Password reset functionality with secure tokens
- Google OAuth 2.0 integration for social login
- User profiles with customizable avatars and bio

### 👥 Community Management

- Create and manage communities with custom names and descriptions
- Community subscription system
- Community-specific post feeds
- User roles and permissions

### 📝 Content Creation & Interaction

- **Multiple Post Types**:
  - Text posts with rich content
  - Image posts with Cloudinary integration
  - Link posts with URL validation
- **Nested Commenting System**: Multi-level threaded discussions
- **Polymorphic Voting**: Upvote/downvote system for both posts and comments
- **Real-time Updates**: Dynamic content loading and interactions

### 🤖 AI-Powered Features

- **Intelligent Summarization**: Automatically generate concise summaries of lengthy posts
- **Semantic Embeddings**: Vector representations of posts for content analysis
- **Content Discovery**: AI-enhanced search and recommendation capabilities

### 📊 Feed & Discovery

- Home feed with subscribed communities
- Popular posts across all communities
- Explore page for discovering new communities
- Search functionality with filtering options

## 🗄️ Database Architecture

The application uses MongoDB with the following Mongoose models:

### Core Models

**User Model**

- Authentication credentials (email, hashed password)
- Profile information (username, display name, avatar, bio)
- Account metadata (verification status, creation date)
- Google OAuth integration fields

**Community Model**

- Community metadata (name, description, icon)
- Creator reference
- Member count tracking
- Timestamps for creation and updates

**Post Model**

- Content fields (title, body, type, URL, image URL)
- Author and community references
- Engagement metrics (vote count, comment count, view count)
- Timestamps and soft delete support

**Comment Model**

- Comment content and author reference
- Post reference for association
- Parent comment reference for threading
- Vote count and timestamp tracking

### Relationship Models

**Vote Model** (Polymorphic)

- User reference
- Target reference (Post or Comment via discriminator)
- Vote type (upvote/downvote)
- Ensures unique votes per user per target

**Subscription Model**

- User and community references
- Subscription timestamp
- Unique constraint per user-community pair

**PostEmbedding Model**

- Post reference
- Vector embedding array (384 dimensions)
- Summary text field
- Metadata and timestamps

### Relationships

- **One-to-Many**: User → Posts, User → Comments, Community → Posts
- **Many-to-Many**: Users ↔ Communities (via Subscriptions)
- **Polymorphic**: Votes can reference either Posts or Comments
- **Self-Referential**: Comments → Parent Comment (nested structure)

## 📁 Project Structure

```
web-dev/
├── Backend/                    # Node.js/Express API server
│   ├── config/                # Configuration files (DB, Passport, Cloudinary, CORS)
│   ├── controllers/           # Request handlers for each resource
│   ├── middlewares/           # Auth, upload, and validation middleware
│   ├── models/                # Mongoose schemas and models
│   ├── repositories/          # Data access layer
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic (AI, email services)
│   ├── validators/            # Input validation schemas
│   ├── server.js              # Application entry point
│   └── swagger.yaml           # API documentation
│
├── Frontend/                  # React application
│   ├── src/
│   │   ├── api/              # API client modules
│   │   ├── assets/           # Static assets (fonts, images)
│   │   ├── components/       # Reusable React components
│   │   │   ├── css/         # Component-specific styles
│   │   │   └── react/       # Component implementations
│   │   ├── context/          # React Context providers
│   │   ├── pages/            # Page-level components
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Application entry point
│   └── vite.config.js        # Vite configuration
│
├── Ai-Service/                # Python FastAPI AI microservice
│   ├── routes/               # API route handlers
│   │   ├── embeddingRoutes.py      # Embedding generation endpoints
│   │   └── summarizationRoutes.py  # Summarization endpoints
│   ├── embeddingService.py   # Sentence-Transformers integration
│   ├── summarizationService.py     # Text summarization logic
│   ├── app.py                # FastAPI application entry point
│   └── requirements.txt      # Python dependencies
│
└── Database Diagram/          # ER diagrams and schema documentation
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or Atlas cluster)
- npm or yarn package manager
- pip for Python packages

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-dev
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/reddit-clone
# or MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/reddit-clone

# Server
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_SERVICE=gmail

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# URLs
FRONTEND_URL=http://localhost:5174
BACKEND_URL=http://localhost:5000
AI_SERVICE_URL=http://localhost:5001
```

Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. AI Service Setup

```bash
cd Ai-Service
pip install -r requirements.txt
```

Start the AI service:

```bash
uvicorn app:app --reload --port 5001
# or
python app.py
```

### 4. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note**: The frontend communicates with the backend, which then proxies requests to the AI service. You don't need to configure the AI service URL in the frontend.

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5174`

## 🔑 Environment Variables Reference

### Backend (.env)

| Variable                | Description                 | Required    |
| ----------------------- | --------------------------- | ----------- |
| `MONGO_URI`             | MongoDB connection string   | ✅          |
| `PORT`                  | Server port (default: 5000) | ✅          |
| `JWT_SECRET`            | Secret key for JWT signing  | ✅          |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name       | ✅          |
| `CLOUDINARY_API_KEY`    | Cloudinary API key          | ✅          |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret       | ✅          |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID      | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth client secret  | ⚠️ Optional |
| `GOOGLE_CALLBACK_URL`   | OAuth callback URL          | ⚠️ Optional |
| `SENDGRID_API_KEY`      | SendGrid API key for emails | ✅          |
| `SENDGRID_FROM_EMAIL`   | Sender email address        | ✅          |
| `FRONTEND_URL`          | Frontend application URL    | ✅          |
| `BACKEND_URL`           | Backend API URL             | ✅          |
| `AI_SERVICE_URL`        | AI service URL              | ✅          |

### Frontend (.env)

| Variable            | Description          | Required |
| ------------------- | -------------------- | -------- |
| `VITE_API_BASE_URL` | Backend API base URL | ✅       |

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Users

- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:username/posts` - Get user's posts

### Communities

- `POST /api/communities` - Create community
- `GET /api/communities` - List all communities
- `GET /api/communities/:name` - Get community details
- `POST /api/communities/:name/subscribe` - Subscribe to community
- `DELETE /api/communities/:name/subscribe` - Unsubscribe from community

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts feed
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/community/:communityName` - Get community posts

### Comments

- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get post comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Votes

- `POST /api/votes` - Cast vote (post or comment)
- `DELETE /api/votes` - Remove vote

### AI Features

- `POST /api/ai/summarize` - Generate post summary
- `POST /api/ai/embed` - Generate post embeddings

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

## 🚢 Deployment

This project is deployed on [Render](https://render.com) with the following architecture:

### Backend (Node.js/Express)

**Deploy to Render Web Service**:

1. Connect your GitHub repository
2. Set build command: `cd Backend && npm install`
3. Set start command: `cd Backend && node  server.js`
4. Configure environment variables from the Backend .env reference
5. Note your backend URL (e.g., `https://your-app.onrender.com`)

### AI Service (FastAPI)

**Deploy to Render Web Service**:

1. Connect your GitHub repository
2. Set build command: `cd Ai-Service && pip install -r requirements.txt`
3. Set start command: `cd Ai-Service && uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Note your AI service URL and add it to Backend's `AI_SERVICE_URL` environment variable

### Frontend (React + Vite)

**Deploy to Render Static Site** :

1. Build command: `cd Frontend && npm install && npm run build`
2. Publish directory: `Frontend/dist`
3. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
4. Configure redirects for client-side routing

### Database

- **MongoDB Atlas** for managed database hosting
- Configure network access to allow connections from Render
- Add connection string to Backend's `MONGO_URI`
- Enable backups and monitoring


**Built with ❤️ using modern web technologies**
