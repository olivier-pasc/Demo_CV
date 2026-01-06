#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
REGION="us-central1"
BUCKET_NAME="cv-matcher-uploads"
DB_NAME="(default)"

echo "Setting up GCP resources for project: $PROJECT_ID"
echo "WARNING: Provide your PROJECT_ID in this script before running!"

# Enable APIs
gcloud services enable cloudrun.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    --project $PROJECT_ID

# Create Cloud Storage Bucket
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME/
gsutil defacl set public-read gs://$BUCKET_NAME/

# Create Firestore (if not exists)
# Note: Firestore creation via CLI is in alpha/beta and might vary. 
# Best to do in Console if this fails.
gcloud firestore databases create --region=$REGION --project=$PROJECT_ID

echo "Setup complete. Ensure you update backend/app/services constants with these values."
