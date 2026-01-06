from google.cloud import firestore
import os

# Initialize Firestore client
# Assuming GOOGLE_APPLICATION_CREDENTIALS is set or running in an environment with default credentials
try:
    db = firestore.Client()
except Exception as e:
    print(f"Warning: Could not initialize Firestore client. Ensure GCP credentials are set. Error: {e}")
    db = None

def get_db():
    return db
