# Deployment Guide - CV Matcher AI

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"

# Run the setup script
chmod +x gcp_setup.sh
./gcp_setup.sh
```

### Option 2: Manual Deployment
```bash
# Build and deploy in one command
gcloud builds submit --config=cloudbuild.yaml
```

## DevOps Features

### 🔄 CI/CD Pipeline
Two deployment options available:

#### Cloud Build (GCP-native)
- Triggered via: `gcloud builds submit`
- Automated build, test, and deploy
- Configured in `cloudbuild.yaml`

#### GitHub Actions
- Automatic deployment on push to `main`
- Configured in `.github/workflows/deploy.yml`
- Requires Workload Identity Federation setup

### 📊 Monitoring & Observability

**Cloud Monitoring**
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision"

# Stream logs in real-time
gcloud logging tail "resource.type=cloud_run_revision"
```

**Metrics & Alerts**
- CPU utilization
- Memory usage
- Request count & latency
- Error rates

Access at: https://console.cloud.google.com/monitoring

### 🔐 Security Best Practices

**Service Account**
- Dedicated service account with minimal permissions
- Automatic credential rotation
- No hardcoded secrets

**Secret Management**
```bash
# Add a secret
echo "your-secret-value" | gcloud secrets create SECRET_NAME --data-file=-

# Update a secret
echo "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Access secret in Cloud Run
gcloud run services update cv-matcher \
  --update-secrets=SECRET_ENV_VAR=SECRET_NAME:latest
```

**Environment Variables**
Set via Cloud Run:
```bash
gcloud run services update cv-matcher \
  --set-env-vars KEY1=value1,KEY2=value2
```

### 🚀 Deployment Strategies

#### Blue-Green Deployment
```bash
# Deploy new version without traffic
gcloud run deploy cv-matcher \
  --image=IMAGE_URL \
  --no-traffic \
  --tag=blue

# Test the new version
curl https://blue---cv-matcher-xxx.run.app

# Migrate traffic
gcloud run services update-traffic cv-matcher \
  --to-latest
```

#### Canary Deployment
```bash
# Split traffic between versions
gcloud run services update-traffic cv-matcher \
  --to-revisions=LATEST=25,STABLE=75
```

### 📈 Scaling Configuration

**Auto-scaling**
```bash
gcloud run services update cv-matcher \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80
```

**Resource Limits**
```bash
gcloud run services update cv-matcher \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300
```

### 🧪 Testing

**Local Testing**
```bash
# Build Docker image
docker build -t cv-matcher .

# Run locally
docker run -p 8080:8080 \
  -e GCP_PROJECT_ID=your-project \
  -e GCP_STORAGE_BUCKET=your-bucket \
  cv-matcher
```

**Load Testing**
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 50 https://your-app-url.run.app
```

### 🔄 Rollback

**Immediate Rollback**
```bash
# List revisions
gcloud run revisions list --service=cv-matcher

# Rollback to previous revision
gcloud run services update-traffic cv-matcher \
  --to-revisions=REVISION_NAME=100
```

### 💰 Cost Optimization

**Check current costs**
```bash
# View billing
gcloud billing accounts list
gcloud alpha billing accounts describe ACCOUNT_ID
```

**Optimization tips**
1. Use `--min-instances=0` to scale to zero
2. Set appropriate `--concurrency` (80-100)
3. Enable Cloud CDN for static assets
4. Use Cloud Scheduler for cold start mitigation:
   ```bash
   gcloud scheduler jobs create http keepalive \
     --schedule="*/5 * * * *" \
     --uri="https://your-app.run.app" \
     --http-method=GET
   ```

### 🔍 Troubleshooting

**View deployment status**
```bash
gcloud run services describe cv-matcher \
  --region=us-central1 \
  --format=yaml
```

**Debug container issues**
```bash
# View build logs
gcloud builds list --limit=5

# View specific build
gcloud builds describe BUILD_ID
```

**Common Issues**

1. **Container fails to start**
   - Check logs: `gcloud logging read "severity>=ERROR"`
   - Verify PORT environment variable
   - Ensure dependencies are installed

2. **Permission denied**
   - Verify service account permissions
   - Check IAM roles
   - Enable required APIs

3. **Timeout errors**
   - Increase `--timeout` value
   - Check Firestore/Storage connectivity
   - Verify Vertex AI quota

### 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [Best Practices](https://cloud.google.com/run/docs/best-practices)

---

## Automated Deployment Checklist

- [ ] Set `GCP_PROJECT_ID` environment variable
- [ ] Run `./gcp_setup.sh`
- [ ] Update secrets in Secret Manager
- [ ] Deploy with `gcloud builds submit`
- [ ] Verify deployment at Cloud Run URL
- [ ] Setup monitoring alerts
- [ ] Configure custom domain (optional)
- [ ] Enable Cloud CDN (optional)
- [ ] Setup backup strategy
