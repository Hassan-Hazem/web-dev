from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from embeddingService import generate_embedding, generate_query_embedding, generate_batch_embeddings

router = APIRouter(prefix="/api", tags=["embeddings"])

class EmbedRequest(BaseModel):
    """Request body for embedding generation."""
    text: str
    task_type: str = "document"  # 'document' or 'query'

class BatchEmbedRequest(BaseModel):
    """Request body for batch embedding generation."""
    texts: list[str]

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

@router.post("/embed/batch")
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
