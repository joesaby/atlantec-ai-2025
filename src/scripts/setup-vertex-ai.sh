#!/bin/bash
# setup-vertex-ai.sh
# Script to automate the setup of Vertex AI in Google Cloud
# Includes project creation, API enabling, service account setup, and key generation

set -e  # Exit on any error

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print formatted messages
print_message() {
  echo -e "${GREEN}${BOLD}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}${BOLD}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}${BOLD}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  print_error "Google Cloud SDK is not installed. Please install it first."
  print_message "Visit: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q "@"; then
  print_warning "You are not logged into Google Cloud SDK"
  print_message "Please log in now"
  gcloud auth login
fi

# Get user inputs
read -p "Enter project name (e.g., garden-assistant-ai): " PROJECT_NAME
read -p "Enter project ID (must be unique, e.g., garden-assistant-ai-123): " PROJECT_ID
read -p "Enter service account name (e.g., garden-assistant-sa): " SA_NAME
read -p "Where would you like to save the service account key? (default: ./service-account-key.json): " KEY_PATH
KEY_PATH=${KEY_PATH:-"./service-account-key.json"}

# Create new project
# print_message "Creating new Google Cloud project: $PROJECT_NAME ($PROJECT_ID)"
# gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"

# # Set the project as active
# print_message "Setting project $PROJECT_ID as active"
# gcloud config set project $PROJECT_ID

# # Improved billing setup
# print_warning "You need to enable billing for this project to use Vertex AI"
# print_message "Checking available billing accounts..."

# # List available billing accounts
# BILLING_ACCOUNTS=$(gcloud billing accounts list --format="value(ACCOUNT_ID)")

# if [ -z "$BILLING_ACCOUNTS" ]; then
#   print_error "No billing accounts found. You need to set up a billing account first."
#   print_message "Opening the Google Cloud Console to create a billing account..."
  
#   # Open browser to billing setup page
#   if command -v xdg-open &>/dev/null; then
#     xdg-open "https://console.cloud.google.com/billing/create?project=$PROJECT_ID"
#   elif command -v open &>/dev/null; then
#     open "https://console.cloud.google.com/billing/create?project=$PROJECT_ID"
#   else
#     print_message "Please visit: https://console.cloud.google.com/billing/create?project=$PROJECT_ID"
#   fi
  
#   read -p "Press Enter after you've created and selected a billing account in the browser..."
# else
#   # Display available billing accounts
#   print_message "Available billing accounts:"
#   gcloud billing accounts list
  
#   # Ask user to select a billing account
#   read -p "Enter the billing account ID to use (from the ACCOUNT_ID column above): " BILLING_ACCOUNT_ID
  
#   # Link project to the selected billing account
#   print_message "Linking project to billing account $BILLING_ACCOUNT_ID..."
#   if ! gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID; then
#     print_error "Failed to link billing account. Please verify the account ID and try again."
#     print_message "You can manually enable billing at: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
#     read -p "Press Enter after enabling billing in the browser..."
#   else
#     print_message "Successfully linked billing account to project"
#   fi
# fi

# # Verify billing is enabled
# print_message "Verifying billing is enabled..."
# BILLING_ENABLED=$(gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)")

# if [ "$BILLING_ENABLED" != "True" ] && [ "$BILLING_ENABLED" != "true" ]; then
#   print_error "Billing is not enabled for this project. Vertex AI requires billing to be enabled."
#   print_message "Please enable billing manually at: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
#   read -p "Press Enter after enabling billing in the browser..."
# fi

# # Enable required APIs
# print_message "Enabling required APIs"
# gcloud services enable aiplatform.googleapis.com \
#                        compute.googleapis.com \
#                        iam.googleapis.com

# # Create service account
# print_message "Creating service account: $SA_NAME"
# gcloud iam service-accounts create $SA_NAME \
#   --display-name="$PROJECT_NAME Service Account"

# # Add delay to allow service account creation to propagate
# print_message "Waiting for service account to be fully created..."
# sleep 10  # Wait for 10 seconds

# Verify service account exists before continuing
print_message "Verifying service account was created successfully..."
max_retries=5
retry_count=0
sa_email="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

while ! gcloud iam service-accounts describe $sa_email &>/dev/null; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -ge $max_retries ]; then
    print_error "Service account not available after $max_retries attempts. Please check the Google Cloud Console"
    print_message "You may need to run the script again or manually assign the roles"
    exit 1
  fi
  
  print_warning "Service account not found yet. Waiting 10 more seconds..."
  sleep 10
done

print_message "Service account verified. Proceeding with role assignment..."

# # Assign roles to the service account
# print_message "Assigning required roles to service account"
# gcloud projects add-iam-policy-binding $PROJECT_ID \
#   --member="serviceAccount:$sa_email" \
#   --role="roles/aiplatform.user"

# gcloud projects add-iam-policy-binding $PROJECT_ID \
#   --member="serviceAccount:$sa_email" \
#   --role="roles/storage.objectViewer"

# Create and download the key file
print_message "Creating and downloading service account key"
gcloud iam service-accounts keys create $KEY_PATH \
  --iam-account="$sa_email"

# Make the key file readable only by the current user
chmod 600 $KEY_PATH

# Create .env file
print_message "Creating .env file with project configuration"
cat > .env << EOL
GOOGLE_CLOUD_PROJECT=$PROJECT_ID
GOOGLE_APPLICATION_CREDENTIALS=$KEY_PATH
GOOGLE_AI_MODEL=gemini-2.0-flash-001
MAX_TOKENS=1024
TEMPERATURE=0.7
EOL

print_message "Adding .env to .gitignore if it doesn't exist"
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo -e "\n# API keys and secrets\n.env\n.env.*\nservice-account*.json" >> .gitignore
fi

print_message "${BOLD}Setup completed successfully!${NC}"
print_message "Project ID: $PROJECT_ID"
print_message "Service Account: $sa_email"
print_message "Key file saved to: $KEY_PATH"
print_message "Environment variables saved to: .env"
print_message "\nNext steps:"
print_message "1. Install required npm packages: npm install @google-cloud/vertexai"
print_message "2. See VERTEX_AI_SETUP.md for usage instructions"