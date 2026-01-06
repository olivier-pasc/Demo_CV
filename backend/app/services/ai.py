import vertexai
from vertexai.generative_models import GenerativeModel
import os
import json
import re

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Using the latest stable Gemini model
    model = GenerativeModel("gemini-1.5-pro")
except Exception as e:
    print(f"Warning: Could not initialize Vertex AI. Error: {e}")
    model = None

def extract_json_from_text(text: str) -> dict:
    """Extract JSON from text that may contain markdown code blocks or other formatting."""
    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Try to find JSON object in the text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        text = json_match.group(0)
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Attempted to parse: {text[:200]}...")
        return {"error": "Failed to parse AI response as JSON"}

async def extract_cv_data(cv_text: str):
    """Extracts structured data from CV text using Gemini."""
    if not model:
        return {"error": "Vertex AI not initialized. Please check your GCP_PROJECT_ID environment variable."}

    prompt = f"""You are an expert HR assistant. Extract the following information from the CV below and return ONLY valid JSON format.
    
Fields to extract:
- full_name (string)
- email (string or null if not found)
- phone (string or null if not found)
- skills (array of strings, extract technical and soft skills)
- experience_years (number, estimate if not explicit, default to 0)
- summary (string, create a brief 2-3 sentence professional summary)
- education (array of objects with degree, institution, year)
- work_experience (array of objects with title, company, duration, description)

Important: Return ONLY the JSON object, no additional text or explanation.

CV Content:
{cv_text[:3000]}

Output format example:
{{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "skills": ["Python", "JavaScript", "Leadership"],
  "experience_years": 5,
  "summary": "Experienced software engineer...",
  "education": [{{"degree": "B.Sc Computer Science", "institution": "MIT", "year": "2018"}}],
  "work_experience": [{{"title": "Senior Developer", "company": "Tech Corp", "duration": "2020-2023", "description": "Led development team..."}}]
}}"""
    
    try:
        response = model.generate_content(prompt)
        result = extract_json_from_text(response.text)
        
        # Ensure required fields exist
        if "error" not in result:
            result.setdefault("full_name", "Unknown Candidate")
            result.setdefault("email", None)
            result.setdefault("skills", [])
            result.setdefault("experience_years", 0)
            result.setdefault("summary", "No summary available")
            
        return result
    except Exception as e:
        print(f"Error extracting CV data: {e}")
        return {
            "error": str(e),
            "full_name": "Unknown",
            "skills": [],
            "summary": "Failed to extract data from CV"
        }

async def match_candidates(job_description: str, candidates: list):
    """
    Matches candidates to a job description.
    candidates: list of dicts containing candidate data.
    """
    if not model:
        return {"error": "Vertex AI not initialized. Please check your GCP_PROJECT_ID environment variable."}
    
    if not candidates:
        return {"matches": [], "message": "No candidates available"}
    
    # Limit candidates to prevent token overflow
    candidates_subset = candidates[:20]
    candidates_json = json.dumps(candidates_subset, indent=2)
    
    prompt = f"""You are an expert recruiter. Given the Job Description and the List of Candidates below, select the top 3 best matching candidates.

For each selected candidate, provide:
- candidate_id (string)
- match_score (number between 0-100)
- strengths (array of strings, 2-4 specific reasons why they fit)
- weaknesses (array of strings, 1-3 specific gaps or areas for improvement)

Return ONLY a JSON array of exactly 3 candidate match objects, ordered by match score (highest first).

Job Description:
{job_description}

Candidates:
{candidates_json}

Output format example:
[
  {{
    "candidate_id": "abc123",
    "match_score": 92,
    "strengths": ["5 years Python experience", "Strong GCP knowledge", "Leadership skills"],
    "weaknesses": ["Limited React experience"]
  }},
  ...
]

Return ONLY the JSON array, no additional text."""

    try:
        response = model.generate_content(prompt)
        result = extract_json_from_text(response.text)
        
        # If result is a dict with matches key, return it, otherwise wrap it
        if isinstance(result, list):
            return {"matches": result}
        elif isinstance(result, dict) and "matches" in result:
            return result
        else:
            return {"matches": [], "error": "Unexpected response format"}
            
    except Exception as e:
        print(f"Error matching candidates: {e}")
        return {"error": str(e), "matches": []}
