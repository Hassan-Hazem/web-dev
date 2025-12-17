from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from embeddingService import generate_embedding, generate_query_embedding

router = APIRouter(prefix="/api", tags=["embeddings"])

class EmbedRequest(BaseModel):
    """Request body for embedding generation."""
    text: str
    task_type: str = "document"  # 'document' or 'query'

@router.post("/embed")
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
