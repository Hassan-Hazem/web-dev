from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from summarizationService import generate_summary

router = APIRouter(tags=["summarization"])

class SummaryRequest(BaseModel):
    """Defines the expected body of the incoming POST request."""
    title: str = ""
    content: str

@router.post("/summarize")
def summarize_post(request: SummaryRequest):
    """
    Generates a concise summary for the provided post title and content.
    """
    try:
        summary = generate_summary(request.title, request.content)
        return {"summary": summary}
    except Exception as e:
        print(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary via AI service.")
