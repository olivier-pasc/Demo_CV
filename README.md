# CV Matcher AI - Randstad Edition

An AI-powered CV analysis and candidate matching platform built for Google Cloud Run, styled with Randstad branding.

## Features

- **AI-Powered CV Analysis**: Upload PDF resumes and extract structured data using Google Vertex AI (Gemini)
- **Job Management**: Create and manage job postings with requirements
- **Smart Matching**: AI-driven candidate-to-job matching with strengths and weaknesses analysis
- **Randstad Design**: Modern UI matching Randstad's brand identity

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Google Cloud Firestore**: NoSQL document database
- **Google Cloud Storage**: File storage for CVs
- **Google Vertex AI (Gemini 1.5 Pro)**: AI/ML for extraction and matching
- **pypdf**: PDF text extraction

### Frontend
- **React 18** with **TypeScript**
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first styling with Randstad colors
- **Framer Motion**: Smooth animations
- **TanStack Query**: Data fetching and caching
- **Axios**: HTTP client

## Setup Instructions

### Prerequisites
1. Google Cloud Project with the following APIs enabled:
   - Cloud Run API
   - Firestore API
   - Vertex AI API
   - Cloud Storage API
2. `gcloud` CLI installed and authenticated
3. Node.js 18+ and Python 3.9+

### Initial GCP Setup

1. **Edit and run the setup script**:
   ```bash
   # Edit gcp_setup.sh and add your PROJECT_ID
   vim gcp_setup.sh
   
   # Make executable and run
   chmod +x gcp_setup.sh
   ./gcp_setup.sh
   ```

2. **Set environment variables** (for local development):
   ```bash
   export GCP_PROJECT_ID="your-project-id"
   export GCP_STORAGE_BUCKET="cv-matcher-uploads"
   export GCP_LOCATION="us-central1"
   ```

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and connect to the backend at `http://localhost:8000`.

### Production Deployment

#### Deploy to Cloud Run
```bash
# Build and deploy using Cloud Build
gcloud run deploy cv-matcher \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=your-project-id,GCP_STORAGE_BUCKET=cv-matcher-uploads,GCP_LOCATION=us-central1
```

The deployment will:
1. Build the React frontend
2. Set up the FastAPI backend
3. Serve both from a single Cloud Run service

## Recent Improvements

### Frontend Enhancements
1. **Randstad Brand Integration**:
   - Updated color palette (Randstad Blue #2175D9, Dark Navy #0E213B)
   - Modern navigation with sticky header
   - Professional footer
   - Rounded pill-style buttons

2. **Jobs Page**:
   - Animated job card creation
   - Better empty states
   - Improved form validation
   - Responsive grid layout
   - Calendar icons for posting dates

3. **Matches Page**:
   - Enhanced match cards with gradient headers
   - "Best Match" badge for top candidate
   - Job details preview
   - Better loading and error states
   - Animated reveals

4. **Home Page**:
   - Hero section with split layout
   - Professional typography
   - Improved CV upload flow
   - Better result cards

### Backend Improvements
1. **AI Service (`ai.py`)**:
   - Robust JSON extraction with regex fallback
   - Better error handling and logging
   - Updated to Gemini 1.5 Pro (stable)
   - Token limit management (3000 chars for CV, 20 candidates for matching)
   - Default values for missing fields
   - Improved prompts for better AI responses

2. **Better Error Messages**:
   - Clearer error responses when AI fails
   - Fallback data structures
   - User-friendly error messages

### UI Components
1. **Input Component**: Updated focus states with Randstad blue
2. **Button Component**: Rounded pill style with better hover effects
3. **Card Component**: Consistent shadows and borders
4. **Improved Animations**: Framer Motion for smooth transitions

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP/REST
       ▼
┌─────────────────┐      ┌──────────────┐
│  FastAPI Server │─────▶│  Firestore   │
│  (Cloud Run)    │      │  (Database)  │
└────────┬────────┘      └──────────────┘
         │
         ├──────────────▶ Cloud Storage (CVs)
         │
         └──────────────▶ Vertex AI (Gemini Pro)
```

## API Endpoints

- `GET /` - Health check
- `POST /api/candidates/upload` - Upload CV (PDF)
- `GET /api/candidates/` - List all candidates
- `POST /api/jobs/` - Create job posting
- `GET /api/jobs/` - List all jobs
- `POST /api/matches/match/{job_id}` - Get top 3 matches for a job

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | Required |
| `GCP_STORAGE_BUCKET` | Cloud Storage bucket name | `cv-matcher-uploads` |
| `GCP_LOCATION` | GCP region | `us-central1` |

## Troubleshooting

### "Vertex AI not initialized" error
- Ensure `GCP_PROJECT_ID` is set
- Verify that your service account has Vertex AI User role
- Check that Vertex AI API is enabled

### Frontend build fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run build`

### CV upload fails
- Verify Cloud Storage bucket exists
- Check service account permissions (Storage Admin role)
- Ensure bucket name matches `GCP_STORAGE_BUCKET` env var

## Future Enhancements

- [ ] Candidate detail view with full profile
- [ ] Email notifications for top matches
- [ ] Advanced filtering and search
- [ ] Candidate interview scheduling
- [ ] Multi-language support
- [ ] Resume templates
- [ ] Video introduction uploads

## License

Proprietary - All rights reserved
