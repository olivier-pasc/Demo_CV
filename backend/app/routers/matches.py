from fastapi import APIRouter, HTTPException
from app.services import db, ai
from typing import List, Dict, Any

router = APIRouter()

@router.post("/match/{job_id}")
async def match_candidates_to_job(job_id: str):
    if not db.get_db():
        raise HTTPException(status_code=503, detail="Database not available")

    # 1. Get Job Description
    job_ref = db.get_db().collection("jobs").document(job_id)
    job_doc = job_ref.get()
    
    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = job_doc.to_dict()
    job_description = f"Title: {job_data.get('title')}\nDescription: {job_data.get('description')}\nRequirements: {', '.join(job_data.get('requirements', []))}"

    # 2. Get All Candidates
    # In a real app, we would filter candidates to avoid sending thousands to the LLM
    candidates_ref = db.get_db().collection("candidates").stream()
    candidates = []
    for doc in candidates_ref:
        data = doc.to_dict()
        # Simplify candidate data for the prompt to save tokens
        candidates.append({
            "id": data.get("id"),
            "name": data.get("full_name"),
            "skills": data.get("skills"),
            "summary": data.get("extracted_data", {}).get("summary", "")
        })
    
    if not candidates:
        return {"matches": [], "message": "No candidates found to match."}

    # 3. Perform AI Matching
    matches = await ai.match_candidates(job_description, candidates)
    
    return {"job_id": job_id, "matches": matches}
