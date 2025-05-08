# Testing Vertex AI Integration

This document provides instructions for setting up and testing the Google Cloud Vertex AI integration for the Garden Assistant project.

## Prerequisites

1. Google Cloud account with billing enabled
2. Vertex AI API enabled in your project
3. Service account with appropriate permissions
4. Node.js and npm installed

## Setup Instructions

### 1. Service Account Key

You need a valid service account key file (`service-account-key.json`) with the following permissions:
- `roles/aiplatform.user`
- `roles/storage.objectViewer`

Place this file in your project root:
```
/workspaces/atlantec-ai-2025/service-account-key.json
```

### 2. Environment Variables

Create or update your `.env` file with the following Vertex AI configuration:

```properties
# AI Provider Configuration
USE_VERTEX_AI=true

# Google Cloud Vertex AI Configuration
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=europe-west1
VERTEX_MODEL=gemini-2.0-flash-001
VERTEX_SERVICE_ACCOUNT_KEY=/workspaces/atlantec-ai-2025/service-account-key.json

# Optional parameters
MAX_TOKENS=1024
TEMPERATURE=0.7
```

> **Note:** Replace `your-project-id` with your actual Google Cloud project ID.

### 3. Install Dependencies

```bash
npm install
```

## Running the Test

We've provided a validation script to test your Vertex AI configuration:

```bash
npm run validate-vertex
```

This script will:
1. Check your environment variables
2. Validate your service account credentials
3. Test connectivity to the Vertex AI API
4. Make a sample query and display the response

## Troubleshooting

If you encounter authentication errors:

1. Verify your `.env` file has the correct project ID
2. Ensure the `VERTEX_SERVICE_ACCOUNT_KEY` path is correct and absolute
3. Check that your service account key is valid and has the required permissions
4. Make sure the Vertex AI API is enabled in your Google Cloud project
5. Confirm billing is enabled for your project

For detailed error messages, check the output from the validation script.

## Additional Resources

- [Google Cloud Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Google Cloud Authentication](https://cloud.google.com/docs/authentication)