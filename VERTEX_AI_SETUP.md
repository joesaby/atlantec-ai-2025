# Vertex AI Setup Guide

This guide provides the essential steps to set up and validate Google Cloud's Vertex AI for your Garden Assistant.

## New Project Setup

### Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- Google account with billing enabled
- Node.js and npm installed

### Automated Setup with Script

1. Run the setup script:

   ```bash
   ./scripts/setup-vertex-ai.sh
   ```

2. Follow the prompts to:

   - Enter project name and ID
   - Enter service account name
   - Set up billing
   - Save service account key

3. Install required packages:
   ```bash
   npm install @google-cloud/vertexai dotenv
   ```

## Using an Existing Project

If your project is already set up in Google Cloud:

1. Retrieve your service account key:

   ```bash
   # List existing service accounts
   gcloud iam service-accounts list --project=YOUR_PROJECT_ID

   # Create a new key for an existing service account
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=SERVICE_ACCOUNT_EMAIL
   ```

2. Create a `.env` file in your project root:
   ```
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GOOGLE_AI_MODEL=gemini-1.0-pro
   MAX_TOKENS=1024
   TEMPERATURE=0.7
   ```

## Validating Your Setup

Run the test script to verify your Vertex AI connection:

```bash
node --experimental-json-modules scripts/test-vertex-ai.js
```

A successful response will show gardening plant recommendations for Irish gardens.

### Troubleshooting

If you encounter errors:

1. **Missing packages**: Install required packages

   ```bash
   npm install dotenv @google-cloud/vertexai
   ```

2. **Authentication issues**: Ensure your service account key path in `.env` is correct

3. **Billing not enabled**: Check billing is enabled in Google Cloud Console

   ```bash
   gcloud billing projects describe YOUR_PROJECT_ID
   ```

4. **API not enabled**: Enable the Vertex AI API
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

## Script to Verify Existing Setup

You can run this simple command to check your existing setup:

```bash
./scripts/check-vertex-ai-setup.sh
```

This will validate your environment variables, service account key, and API access.
