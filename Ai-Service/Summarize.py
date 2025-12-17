
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os
import uvicorn
from embeddingService import generate_embedding, generate_query_embedding, generate_batch_embeddings

# Load environment variables from .env file
load_dotenv()
  
# --- API Setup ---
app = FastAPI(
    title="AI Service", 
    description="Microservice for AI operations: summarization and embeddings using Gemini API."
)

# Initialize Gemini Client
# The client automatically uses GEMINI_API_KEY from environment variables
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    client = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Failed to initialize Gemini Client: {e}")
    client = None

# --- Data Schema ---
class SummaryRequest(BaseModel):
    """Defines the expected body of the incoming POST request."""
    title: str = ""
    content: str

class EmbedRequest(BaseModel):
    """Request body for embedding generation."""
    text: str
    task_type: str = "document"  # 'document' or 'query'

class BatchEmbedRequest(BaseModel):
    """Request body for batch embedding generation."""
    texts: list[str]

# --- Endpoints ---
@app.post("/summarize")
def summarize_post(request: SummaryRequest):
    """Generates a concise summary for the provided post title and content."""
    
    if not client:
        raise HTTPException(status_code=503, detail="AI Service initialization failed.")
    
    # 1. Prepare the full content and the prompt
    full_text = f"Title: {request.title}\n\nContent: {request.content}"
    
    prompt = f"""
    You are a summarization expert. Summarize the following post content into a single, 
    concise paragraph (maximum 1 sentences). The summary should focus on the main topic 
    and key takeaways.

    POST CONTENT:
    ---
    {full_text.strip()}
    ---
    """
    
    # 2. Call the Gemini API
    try:
        response = client.generate_content(prompt)
        
        # 3. Return the generated summary
        return {"summary": response.text.strip()}

    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Log the error and return a standard server error response
        raise HTTPException(status_code=500, detail="Failed to generate summary via AI service.")

@app.post("/api/embed")
def embed_text(request: EmbedRequest):
    """
    Generate embedding vector for text using Gemini text-embedding-004.
    Returns 768-dimensional embedding vector.
    """
    try:
        if request.task_type == "query":
            embedding = generate_query_embedding(request.text)
        else:
            embedding = generate_embedding(request.text)
        
        return {
            "embedding": embedding,
            "dimensions": len(embedding),
            "model": "text-embedding-004"
        }
    except Exception as e:
        print(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")

@app.post("/api/embed/batch")
def embed_batch(request: BatchEmbedRequest):
    """
    Generate embeddings for multiple texts in batch.
    More efficient for processing many texts at once.
    """
    try:
        embeddings = generate_batch_embeddings(request.texts)
        return {
            "embeddings": embeddings,
            "count": len(embeddings),
            "dimensions": len(embeddings[0]) if embeddings else 0,
            "model": "text-embedding-004"
        }
    except Exception as e:
        print(f"Batch embedding error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate batch embeddings: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "AI Embedding & Summarization Service"}

# --- Running the service (for local development) ---
if __name__ == "__main__":
    # Runs on http://127.0.0.1:8000
    uvicorn.run(app, host="0.0.0.0", port=8000)