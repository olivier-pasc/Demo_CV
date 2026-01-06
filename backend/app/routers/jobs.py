from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import db
import uuid
import datetime
from typing import List

router = APIRouter()

class JobBase(BaseModel):
    title: str
    description: str
    requirements: List[str]

class Job(JobBase):
    id: str
    created_at: str

@router.post("/", response_model=Job)
async def create_job(job: JobBase):
    job_id = str(uuid.uuid4())
    job_data = job.dict()
    job_data["id"] = job_id
    job_data["created_at"] = datetime.datetime.now().isoformat()
    
    if db.get_db():
        db.get_db().collection("jobs").document(job_id).set(job_data)
    
    return job_data

@router.get("/", response_model=List[Job])
async def list_jobs():
    if not db.get_db():
        return []
    
    docs = db.get_db().collection("jobs").stream()
    jobs = []
    for doc in docs:
        jobs.append(doc.to_dict())
    return jobs

@router.delete("/{job_id}")
async def delete_job(job_id: str):
    if not db.get_db():
        raise HTTPException(status_code=503, detail="Database not available")
    
    doc_ref = db.get_db().collection("jobs").document(job_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete the document
    doc_ref.delete()
    
    return {"message": "Job deleted successfully", "id": job_id}

