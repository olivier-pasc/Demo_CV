from google.cloud import storage
import os

# Initialize Storage client
try:
    storage_client = storage.Client()
except Exception as e:
    print(f"Warning: Could not initialize Storage client. Error: {e}")
    storage_client = None

BUCKET_NAME = os.getenv("GCP_STORAGE_BUCKET", "cv-matcher-uploads")

def upload_file(file_obj, destination_blob_name):
    """Uploads a file-like object to the bucket."""
    if not storage_client:
        return None
    
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(destination_blob_name)
        
        # Reset file pointer to beginning just in case
        file_obj.seek(0)
        blob.upload_from_file(file_obj)
        
        return blob.public_url
    except Exception as e:
        print(f"Error uploading file: {e}")
        raise e

def get_file_uri(blob_name):
    return f"gs://{BUCKET_NAME}/{blob_name}"
