#!/bin/bash

# =============================================================================
# GCP Setup Script - CV Matcher AI Platform
# Automated DevOps Infrastructure Setup
# =============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Variables
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
BUCKET_NAME="${GCP_STORAGE_BUCKET:-cv-matcher-uploads}"
SERVICE_NAME="cv-matcher"
ARTIFACT_REPO="cv-matcher-repo"
SERVICE_ACCOUNT_NAME="cv-matcher-sa"
DB_NAME="(default)"

# Function to print colored output
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if [ "$PROJECT_ID" = "your-project-id" ]; then
        print_error "Please set GCP_PROJECT_ID environment variable or edit this script"
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Required for local testing."
    fi
    
    print_success "Prerequisites check completed"
}

# Function to set GCP project
setup_project() {
    print_info "Setting up GCP project: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    print_success "Project set to $PROJECT_ID"
}

# Function to enable required APIs
enable_apis() {
    print_info "Enabling required GCP APIs..."
    
    gcloud services enable \
        cloudrun.googleapis.com \
        cloudbuild.googleapis.com \
        artifactregistry.googleapis.com \
        firestore.googleapis.com \
        storage.googleapis.com \
        aiplatform.googleapis.com \
        cloudresourcemanager.googleapis.com \
        iam.googleapis.com \
        secretmanager.googleapis.com \
        monitoring.googleapis.com \
        logging.googleapis.com \
        --project "$PROJECT_ID"
    
    print_success "All APIs enabled"
}

# Function to create service account
create_service_account() {
    print_info "Creating service account: $SERVICE_ACCOUNT_NAME"
    
    # Check if service account exists
    if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" &>/dev/null; then
        print_warning "Service account already exists"
    else
        gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
            --display-name="CV Matcher Service Account" \
            --project "$PROJECT_ID"
        print_success "Service account created"
    fi
    
    # Grant necessary roles
    print_info "Granting IAM roles to service account..."
    
    local SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    for role in \
        "roles/firestore.user" \
        "roles/storage.admin" \
        "roles/aiplatform.user" \
        "roles/logging.logWriter" \
        "roles/cloudtrace.agent"; do
        
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
            --role="$role" \
            --condition=None \
            --quiet > /dev/null
    done
    
    print_success "IAM roles granted"
}

# Function to create Cloud Storage bucket
create_storage_bucket() {
    print_info "Creating Cloud Storage bucket: $BUCKET_NAME"
    
    if gsutil ls -p "$PROJECT_ID" "gs://$BUCKET_NAME" &>/dev/null; then
        print_warning "Bucket already exists"
    else
        gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://$BUCKET_NAME/"
        
        # Set CORS for frontend access
        cat > /tmp/cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
        gsutil cors set /tmp/cors.json "gs://$BUCKET_NAME"
        rm /tmp/cors.json
        
        print_success "Storage bucket created with CORS configured"
    fi
}

# Function to initialize Firestore
setup_firestore() {
    print_info "Setting up Firestore database..."
    
    # Check if Firestore is already initialized
    if gcloud firestore databases describe --database="$DB_NAME" &>/dev/null; then
        print_warning "Firestore database already exists"
    else
        gcloud firestore databases create \
            --region="$REGION" \
            --type=firestore-native \
            --project="$PROJECT_ID"
        
        print_success "Firestore database created"
    fi
    
    # Create indexes (optional - for optimized queries)
    print_info "Creating Firestore indexes..."
    cat > firestore.indexes.json <<EOF
{
  "indexes": [
    {
      "collectionGroup": "candidates",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "candidate_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    }
  ]
}
EOF
    
    gcloud firestore indexes composite create --collection-group=candidates \
        --field-config field-path=created_at,order=descending \
        --quiet || true
    
    print_success "Firestore indexes configured"
}

# Function to create Artifact Registry
setup_artifact_registry() {
    print_info "Setting up Artifact Registry..."
    
    if gcloud artifacts repositories describe "$ARTIFACT_REPO" \
        --location="$REGION" &>/dev/null; then
        print_warning "Artifact Registry already exists"
    else
        gcloud artifacts repositories create "$ARTIFACT_REPO" \
            --repository-format=docker \
            --location="$REGION" \
            --description="Docker images for CV Matcher" \
            --project="$PROJECT_ID"
        
        print_success "Artifact Registry created"
    fi
}

# Function to setup Secret Manager
setup_secrets() {
    print_info "Setting up Secret Manager..."
    
    # Create example secrets (you'll need to add actual values)
    for secret_name in "openai-api-key" "jwt-secret" "database-url"; do
        if gcloud secrets describe "$secret_name" &>/dev/null; then
            print_warning "Secret $secret_name already exists"
        else
            echo "placeholder-value-change-me" | gcloud secrets create "$secret_name" \
                --data-file=- \
                --replication-policy="automatic" \
                --project="$PROJECT_ID"
            
            print_info "Created secret: $secret_name (Remember to update with actual value!)"
        fi
    done
    
    print_success "Secret Manager configured"
}

# Function to setup Cloud Build triggers
setup_cicd() {
    print_info "Setting up CI/CD with Cloud Build..."
    
    # Create build configuration
    cat > cloudbuild.yaml <<EOF
steps:
  # Build frontend
  - name: 'node:18'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd frontend
        npm ci
        npm run build
    id: 'build-frontend'

  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:\$SHORT_SHA'
      - '-t'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:latest'
      - '.'
    id: 'build-docker'

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '--all-tags'
      - '${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}'
    id: 'push-image'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - '${SERVICE_NAME}'
      - '--image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:\$SHORT_SHA'
      - '--region=${REGION}'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--service-account=${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com'
      - '--set-env-vars=GCP_PROJECT_ID=${PROJECT_ID},GCP_STORAGE_BUCKET=${BUCKET_NAME},GCP_LOCATION=${REGION}'
    id: 'deploy-cloudrun'

images:
  - '${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:\$SHORT_SHA'
  - '${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:latest'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_HIGHCPU_8'
EOF
    
    print_success "Cloud Build configuration created (cloudbuild.yaml)"
}

# Function to setup monitoring and alerts
setup_monitoring() {
    print_info "Setting up Cloud Monitoring..."
    
    # Create uptime check
    cat > uptime-check.json <<EOF
{
  "displayName": "CV Matcher Uptime Check",
  "monitoredResource": {
    "type": "uptime_url",
    "labels": {
      "project_id": "$PROJECT_ID",
      "host": "YOUR_CLOUD_RUN_URL"
    }
  },
  "httpCheck": {
    "path": "/",
    "port": 443,
    "useSsl": true
  },
  "period": "300s",
  "timeout": "10s"
}
EOF
    
    print_info "Uptime check configuration created (update YOUR_CLOUD_RUN_URL after deployment)"
    print_success "Monitoring setup complete"
}

# Function to create .env file template
create_env_template() {
    print_info "Creating environment configuration..."
    
    cat > .env.production <<EOF
# GCP Configuration (Auto-configured in Cloud Run)
GCP_PROJECT_ID=$PROJECT_ID
GCP_STORAGE_BUCKET=$BUCKET_NAME
GCP_LOCATION=$REGION

# Service Account (Automatically configured in Cloud Run)
# GOOGLE_APPLICATION_CREDENTIALS is set automatically

# Application Settings
PORT=8080
ENVIRONMENT=production
EOF
    
    print_success "Environment template created (.env.production)"
}

# Function to display next steps
show_next_steps() {
    print_success "✨ GCP Infrastructure Setup Complete! ✨"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. 🔐 Update secrets in Secret Manager:"
    echo "   ${YELLOW}gcloud secrets versions add <secret-name> --data-file=<path>${NC}"
    echo ""
    echo "2. 🚀 Deploy application:"
    echo "   ${YELLOW}gcloud builds submit --config=cloudbuild.yaml${NC}"
    echo ""
    echo "3. 📊 View your application:"
    echo "   ${YELLOW}gcloud run services describe $SERVICE_NAME --region=$REGION${NC}"
    echo ""
    echo "4. 🔍 Monitor logs:"
    echo "   ${YELLOW}gcloud logging read 'resource.type=cloud_run_revision'${NC}"
    echo ""
    echo "5. 📈 Setup monitoring alerts in Cloud Console:"
    echo "   https://console.cloud.google.com/monitoring"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📁 Files Created:${NC}"
    echo "   - cloudbuild.yaml (CI/CD configuration)"
    echo "   - firestore.indexes.json (Database indexes)"
    echo "   - .env.production (Environment template)"
    echo "   - uptime-check.json (Monitoring configuration)"
    echo ""
    echo -e "${YELLOW}💡 Tip: Commit these files to your repository${NC}"
    echo ""
}

# Function to setup Workload Identity Federation for GitHub Actions
setup_wif() {
    print_info "Setting up Workload Identity Federation..."
    
    local POOL_NAME="github-pool"
    local PROVIDER_NAME="github-provider"
    local REPO_NAME="${GITHUB_REPO:-olivier-pasc/Demo_CV}" # Default to your repo
    
    # 1. Create Workload Identity Pool
    if gcloud iam workload-identity-pools describe "$POOL_NAME" --location="global" &>/dev/null; then
        print_warning "Workload Identity Pool 'github-pool' already exists"
    else
        gcloud iam workload-identity-pools create "$POOL_NAME" \
            --location="global" \
            --display-name="GitHub Actions Pool" \
            --description="Pool for GitHub Actions" \
            --project="$PROJECT_ID"
        print_success "Workload Identity Pool created"
    fi
    
    # 2. Create Provider
    if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="global" &>/dev/null; then
        print_warning "Workload Identity Provider 'github-provider' already exists"
    else
        gcloud iam workload-identity-pools providers create "$PROVIDER_NAME" \
            --workload-identity-pool="$POOL_NAME" \
            --location="global" \
            --display-name="GitHub Actions Provider" \
            --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
            --attribute-condition="assertion.repository=='$REPO_NAME'" \
            --issuer-uri="https://token.actions.githubusercontent.com" \
            --project="$PROJECT_ID"
        print_success "Workload Identity Provider created"
    fi
    
    # 3. Allow Service Account impersonation
    local WIF_PRINCIPAL="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$REPO_NAME"
    
    gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
        --role="roles/iam.workloadIdentityUser" \
        --member="$WIF_PRINCIPAL" \
        --project="$PROJECT_ID" \
        --quiet > /dev/null
        
    print_success "Service Account impersonation configured for repo: $REPO_NAME"
    
    # Export WIF Provider resource name for output
    export WIF_PROVIDER_NAME="projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"
}

# Function to setup real Cloud Monitoring Uptime Check
setup_monitoring_real() {
    print_info "Creating fully managed Uptime Check..."
    
    # Only proceed if we have a deployed URL (mostly for update scenarios), otherwise create config for later
    # Attempt to create a simple check
    
    if gcloud monitoring uptime-check-configs list --filter="displayName='CV Matcher Health'" --format="value(name)" | grep -q "."; then
        print_warning "Uptime check 'CV Matcher Health' already exists"
    else
        # We need the service URL first. If not deployed, we create a placeholder or skip.
        # Let's create a placeholder check that users can update later.
        gcloud monitoring uptime-check-configs create \
            --display-name="CV Matcher Health" \
            --uri="https://${SERVICE_NAME}-PLACEHOLDER.a.run.app" \
            --period=5 \
            --timeout=10 \
            --project="$PROJECT_ID" \
            --quiet || print_warning "Could not create uptime check (requires Monitoring Editor role)"
            
        print_success "Uptime Check created (Update URL after deployment)"
    fi
}


# Main execution
main() {
    echo -e "${BLUE}"
    echo "═══════════════════════════════════════════════════════════"
    echo "   CV Matcher AI - GCP Infrastructure Setup"
    echo "   DevOps Automation Script"
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    check_prerequisites
    setup_project
    enable_apis
    create_service_account
    create_storage_bucket
    setup_firestore
    setup_artifact_registry
    setup_secrets
    setup_wif        # New: Workload Identity Federation
    setup_cicd
    setup_monitoring_real # New: Real monitoring setup
    create_env_template

    print_success "✨ GCP Infrastructure Setup Complete! ✨"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. 🔐 Add these Secrets to GitHub Repository:"
    echo "   (Settings -> Secrets and variables -> Actions)"
    echo "   - GCP_PROJECT_ID: $PROJECT_ID"
    echo "   - WIF_PROVIDER: $WIF_PROVIDER_NAME"
    echo "   - WIF_SERVICE_ACCOUNT: ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    echo ""
    echo "2. 🔐 Update secrets in Secret Manager (for app runtime):"
    echo "   ${YELLOW}gcloud secrets versions add <secret-name> --data-file=<path>${NC}"
    echo ""
    echo "3. 🚀 Deploy application:"
    echo "   ${YELLOW}git push origin main${NC} (Automated via GitHub Actions)"
    echo "   OR Manual: ${YELLOW}gcloud builds submit --config=cloudbuild.yaml${NC}"
    echo ""
    echo "4. 🔍 Monitor & Verify:"
    echo "   - Update Uptime Check URL in Cloud Console: https://console.cloud.google.com/monitoring/uptime"
    echo "   - View Logs: https://console.cloud.google.com/run"
    echo ""
}

# Run main function
main
