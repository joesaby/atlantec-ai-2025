#!/bin/bash
# check-vertex-ai-setup.sh
# Script to validate an existing Vertex AI setup
# Checks for environment variables, service account key, and API access

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print formatted messages
print_success() {
  echo -e "${GREEN}${BOLD}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}${BOLD}!${NC} $1"
}

print_error() {
  echo -e "${RED}${BOLD}✗${NC} $1"
}

print_header() {
  echo -e "\n${BOLD}$1${NC}"
  echo "----------------------------------------"
}

# Check if .env file exists
print_header "Checking Configuration"
if [ -f .env ]; then
  print_success "Found .env file"
  source .env
else
  print_warning ".env file not found, checking for environment variables directly"
fi

# Check for required environment variables
missing_vars=0
for var in GOOGLE_CLOUD_PROJECT GOOGLE_APPLICATION_CREDENTIALS GOOGLE_AI_MODEL; do
  if [ -z "${!var}" ]; then
    print_error "Environment variable $var not set"
    missing_vars=1
  else
    print_success "$var = ${!var}"
  fi
done

if [ $missing_vars -eq 1 ]; then
  print_warning "Some required environment variables are missing. Please set them in your .env file or environment"
fi

# Check if credentials file exists
print_header "Checking Credentials"
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    print_success "Credentials file found at $GOOGLE_APPLICATION_CREDENTIALS"
    
    # Check if file is valid JSON
    if jq . "$GOOGLE_APPLICATION_CREDENTIALS" > /dev/null 2>&1; then
      print_success "Credentials file is valid JSON"
      
      # Check for key components in the service account file
      if jq -e '.type | contains("service_account")' "$GOOGLE_APPLICATION_CREDENTIALS" > /dev/null 2>&1; then
        print_success "Credentials file is a valid service account key"
        PROJECT_ID=$(jq -r '.project_id' "$GOOGLE_APPLICATION_CREDENTIALS")
        print_success "Service account project ID: $PROJECT_ID"
      else
        print_error "Credentials file is not a valid service account key"
      fi
    else
      print_error "Credentials file is not valid JSON"
    fi
  else
    print_error "Credentials file not found at $GOOGLE_APPLICATION_CREDENTIALS"
  fi
else
  print_error "GOOGLE_APPLICATION_CREDENTIALS not set"
fi

# Check if gcloud is installed
print_header "Checking Google Cloud SDK"
if command -v gcloud &> /dev/null; then
  print_success "Google Cloud SDK is installed"
  
  # Check if user is logged in
  if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_success "Logged in to Google Cloud SDK"
    
    # Check if Vertex AI API is enabled
    if [ -n "$GOOGLE_CLOUD_PROJECT" ]; then
      print_success "Using project: $GOOGLE_CLOUD_PROJECT"
      
      # Try to check if API is enabled
      if gcloud services list --project=$GOOGLE_CLOUD_PROJECT --filter="name:aiplatform.googleapis.com" --format="value(NAME)" 2>/dev/null | grep -q "aiplatform"; then
        print_success "Vertex AI API is enabled for this project"
      else
        print_warning "Vertex AI API might not be enabled for this project"
        print_warning "To enable it, run: gcloud services enable aiplatform.googleapis.com --project=$GOOGLE_CLOUD_PROJECT"
      fi
      
      # Check billing
      if gcloud billing projects describe $GOOGLE_CLOUD_PROJECT --format="value(billingEnabled)" 2>/dev/null | grep -q "True"; then
        print_success "Billing is enabled for this project"
      else
        print_error "Billing might not be enabled for this project"
        print_warning "Vertex AI requires billing to be enabled"
      fi
    else
      print_warning "GOOGLE_CLOUD_PROJECT not set, skipping API and billing check"
    fi
  else
    print_warning "Not logged in to Google Cloud SDK, some checks were skipped"
  fi
else
  print_warning "Google Cloud SDK is not installed, some checks were skipped"
fi

print_header "Next Steps"
echo "To validate your setup by testing the API:"
echo "1. Install required Node.js packages:"
echo "   npm install @google-cloud/vertexai dotenv"
echo ""
echo "2. Run the test script:"
echo "   node --experimental-json-modules scripts/test-vertex-ai.js"