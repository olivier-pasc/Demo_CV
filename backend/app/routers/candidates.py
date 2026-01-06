from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import storage, db, ai
from pydantic import BaseModel
from typing import List, Optional
import pypdf
import io
import uuid
import datetime

router = APIRouter()

class Candidate(BaseModel):
    id: str
    full_name: str
    email: Optional[str]
    skills: List[str]
    cv_url: Optional[str]
    extracted_data: dict
    created_at: str

@router.post("/upload", response_model=Candidate)
async def upload_cv(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # 1. Read file content
    content = await file.read()
    
    # 2. Extract Text from PDF
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF: {str(e)}")

    # 3. Upload to Cloud Storage
    filename = f"cvs/{uuid.uuid4()}_{file.filename}"
    try:
        public_url = storage.upload_file(io.BytesIO(content), filename)
    except Exception as e:
        # Continue even if storage fails, just log it (in a real app we might abort)
        print(f"Storage upload failed: {e}")
        public_url = None

    # 4. Extract Data using AI
    extracted_data = await ai.extract_cv_data(text)
    
    if "error" in extracted_data:
        # Fallback if AI fails
        print(f"AI Extraction failed: {extracted_data['error']}")
        extracted_data = {"raw_text": text[:500] + "..."}

    # 5. Store in Firestore
    candidate_id = str(uuid.uuid4())
    candidate_data = {
        "id": candidate_id,
        "full_name": extracted_data.get("full_name", "Unknown"),
        "email": extracted_data.get("email"),
        "skills": extracted_data.get("skills", []),
        "cv_url": public_url,
        "extracted_data": extracted_data,
        "created_at": datetime.datetime.now().isoformat()
    }
    
    if db.get_db():
        db.get_db().collection("candidates").document(candidate_id).set(candidate_data)

    return candidate_data

@router.get("/", response_model=List[Candidate])
async def list_candidates():
    if not db.get_db():
        return []
    
    docs = db.get_db().collection("candidates").stream()
    candidates = []
    for doc in docs:
        candidates.append(doc.to_dict())
    return candidates
