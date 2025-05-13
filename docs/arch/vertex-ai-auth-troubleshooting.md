# Vertex AI Authentication Troubleshooting Guide

This guide provides detailed troubleshooting steps for Vertex AI authentication issues, particularly when deploying to Netlify.

## Common Authentication Issues

When using Vertex AI in the Garden Assistant application, you may encounter authentication errors, especially in Netlify deployments. The most common error looks like:

```
[VertexAI.GoogleAuthError]: 
Unable to authenticate your request
```

## Diagnosing the Issue

1. Go to the admin dashboard at `/admin/logs-dashboard.astro`
2. Click on the "Diagnostics" tab
3. Click "Test Vertex Auth" to run a diagnostic test
4. Review the detailed error information

## Common Causes and Solutions

### 1. JSON Formatting Issues

**Problem**: The most common issue is improperly formatted JSON in the `GOOGLE_APPLICATION_CREDENTIALS_JSON` environment variable. 

**Solution**:
1. Use the provided `netlify-credential-helper.js` script to properly format your credentials:
   ```bash
   node scripts/netlify-credential-helper.js /path/to/your-service-account-key.json
   ```
2. Follow the script's instructions to set the environment variable in Netlify using the Netlify CLI

### 2. Newlines in Private Key

**Problem**: The private key contains escaped newlines (`\\n`) that are not being converted to actual newlines.

**Solution**:
- When setting the environment variable in Netlify, use the CLI method:
  ```bash
  netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "$(cat /path/to/your-service-account-key.json)"
  ```
- This preserves the JSON formatting including newlines

### 3. Missing or Incorrect Environment Variables

**Problem**: Required environment variables like `VERTEX_PROJECT_ID` are missing or incorrect.

**Solution**:
1. Ensure these environment variables are set in Netlify:
   - `VERTEX_PROJECT_ID`: Your Google Cloud project ID
   - `VERTEX_LOCATION`: Region (e.g., "us-central1" or "europe-west1")
   - `VERTEX_MODEL`: Model name (e.g., "gemini-2.0-flash-001")
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Properly formatted service account key JSON

2. Verify the project ID in the environment variable matches the project ID in the credentials

### 4. Service Account Permissions

**Problem**: The service account may not have the required permissions.

**Solution**:
1. Ensure the service account has at least these roles:
   - `roles/aiplatform.user`
   - `roles/storage.objectViewer`

2. To add these roles using gcloud:
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:YOUR_SA_EMAIL" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:YOUR_SA_EMAIL" \
     --role="roles/storage.objectViewer"
   ```

### 5. API Not Enabled

**Problem**: The Vertex AI API is not enabled in your Google Cloud project.

**Solution**:
1. Enable the API using gcloud:
   ```bash
   gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
   ```
2. Or enable it in the [Google Cloud Console](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)

## Setting Up Credentials for Different Environments

### Local Development

For local development, you can use a service account key file:

1. Download the service account key JSON file
2. Add to your `.env` file:
   ```
   VERTEX_PROJECT_ID=your-project-id
   VERTEX_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
   VERTEX_LOCATION=us-central1
   VERTEX_MODEL=gemini-2.0-flash-001
   ```

### Netlify Deployment

For Netlify, use the environment variables in the Netlify dashboard or CLI:

1. Format the credentials using the helper script:
   ```bash
   node scripts/netlify-credential-helper.js /path/to/service-account-key.json
   ```

2. Set the environment variables using Netlify CLI:
   ```bash
   netlify env:set VERTEX_PROJECT_ID your-project-id
   netlify env:set VERTEX_LOCATION us-central1
   netlify env:set VERTEX_MODEL gemini-2.0-flash-001
   netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "$(cat /path/to/service-account-key.json)"
   ```

## Using the Diagnostic Tools

The application includes built-in diagnostic tools to help troubleshoot authentication issues:

1. **Test Vertex Auth**: Tests authentication using the Vertex AI client
2. **Test Direct Auth**: Tests authentication using the base Google Auth library
3. **Check Environment**: Shows environment variables (without revealing sensitive values)

Access these tools at `/admin/logs-dashboard.astro` in the Diagnostics tab.

## Need More Help?

If you continue to experience authentication issues:

1. Review the detailed error information in the diagnostic tools
2. Check the application logs for specific error messages
3. Verify your Google Cloud project settings (API enabled, billing enabled, etc.)
4. Try regenerating your service account key
5. Make sure you're using the latest version of the Google Cloud libraries