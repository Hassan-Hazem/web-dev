import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Gemini model for summarization
client = genai.GenerativeModel('gemini-2.5-flash')

def generate_summary(title: str, content: str) -> str:
    """
    Generate a concise summary for a post using Gemini.
    
    Args:
        title: Post title
        content: Post content
        
    Returns:
        String containing the generated summary
    """
    # Prepare the full content and the prompt
    full_text = f"Title: {title}\n\nContent: {content}"
    
    prompt = f"""
    You are a summarization expert. Summarize the following post content into a single, 
    concise paragraph (maximum 1 sentences). The summary should focus on the main topic 
    and key takeaways.

    POST CONTENT:
    ---
    {full_text.strip()}
    ---
    """
    
    try:
        response = client.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise Exception("Failed to generate summary via AI service")
