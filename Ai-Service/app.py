from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn

# Import route modules
from routes import embeddingRoutes, summarizationRoutes

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Service",
    description="Microservice for AI operations: summarization and embeddings using Gemini API.",
    version="2.0.0"
)

# Register routes
app.include_router(embeddingRoutes.router)
app.include_router(summarizationRoutes.router)

# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Embedding & Summarization Service",
        "version": "2.0.0"
    }

# Root endpoint
@app.get("/", tags=["info"])
def root():
    """API information."""
    return {
        "message": "AI Service API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "summarization": "/summarize",
            "embedding": "/api/embed",
            "batch_embedding": "/api/embed/batch"
        }
    }

# Run the application
if __name__ == "__main__":
    print("\n" + "="*60)
    print("AI Service is starting...")
    print("="*60)
    print("Swagger Docs: http://localhost:8000/docs")
    print("ReDoc:        http://localhost:8000/redoc")
    print("Health:       http://localhost:8000/health")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
