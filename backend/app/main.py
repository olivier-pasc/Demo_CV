from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import candidates, jobs, matches

app = FastAPI(title="CV Matcher AI", description="AI-powered CV analysis and matching system")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "cv-matcher-backend"}

# Include Routers
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# ... (Previous code)

app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(matches.router, prefix="/api/matches", tags=["Matches"])

# Serve Frontend Static Files
# Mount the content of the frontend build
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend_dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_app(full_path: str):
        # API routes are already handled above. 
        # If it's a file that exists (like favicon), serve it.
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
             return FileResponse(file_path)
        
        # Otherwise serve index.html for SPA routing
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    print(f"Warning: Frontend build not found at {frontend_dist}")

