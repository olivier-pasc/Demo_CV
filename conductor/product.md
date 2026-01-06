# CV Matcher AI - Randstad Edition

## Initial Concept

An AI-powered CV analysis and candidate matching platform built for Google Cloud Run, styled with Randstad branding.

## Features

- **AI-Powered CV Analysis**: Upload PDF resumes and extract structured data using Google Vertex AI (Gemini).
- **Job Management**: Create and manage job postings with requirements.
- **Smart Matching**: AI-driven candidate-to-job matching with strengths and weaknesses analysis.
- **Randstad Design**: Modern UI matching Randstad's brand identity.

## Architecture Overview

The project is structured as a monorepo containing both a FastAPI backend and a React frontend. It is designed for deployment on Google Cloud Run and interacts with Google Cloud services such as Firestore (for database), Cloud Storage (for CV storage), and Vertex AI (for AI/ML capabilities).

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
