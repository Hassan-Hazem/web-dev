import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embedding(text: str) -> list[float]:
    """
    Generate embedding vector for given text using Gemini text-embedding-004.
    
    Args:
        text: Text to embed (post title + body + community)
        
    Returns:
        List of 768 floats representing the embedding vector
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"  # For indexing documents
        )
        return result['embedding']
    except Exception as e:
        print(f"Embedding generation error: {e}")
        raise

def generate_query_embedding(query: str) -> list[float]:
    """
    Generate embedding vector for search query using Gemini text-embedding-004.
    
    Args:
        query: Search query text
        
    Returns:
        List of 768 floats representing the query embedding vector
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query"  # For search queries
        )
        return result['embedding']
    except Exception as e:
        print(f"Query embedding generation error: {e}")
        raise

def generate_batch_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple texts in batch (more efficient).
    
    Args:
        texts: List of text strings to embed
        
    Returns:
        List of embedding vectors
    """
    try:
        embeddings = []
        # Gemini API supports batch but for safety we'll do one at a time
        # You can optimize this later with actual batch API if needed
        for text in texts:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
        return embeddings
    except Exception as e:
        print(f"Batch embedding generation error: {e}")
        raise
