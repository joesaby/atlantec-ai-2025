---
title: "Getting Started with Bloom"
description: "A comprehensive guide to setting up and working with the Bloom codebase"
category: "general"
---

# Getting Started with Bloom

This guide will help you get started with Bloom development, including environment setup, running the application, and using the dashboard effectively.

## Environment Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16+)
- npm (v8+)
- Git

### Clone the Repository

```bash
git clone https://github.com/joesaby/atlantec-ai-2025.git
cd atlantec-ai-2025
```

### Install Dependencies

```bash
npm install
```

## Development Commands

Bloom uses npm scripts to manage the development workflow:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server at localhost:4321 |
| `npm run build` | Build the production site to ./dist/ |
| `npm run preview` | Preview the production build locally |
| `npm run astro ...` | Run CLI commands like astro add, astro check |

### Starting the Development Server

To run Bloom locally:

```bash
npm run dev
```

This will start the development server at [http://localhost:4321](http://localhost:4321).

For network access (to view the site on other devices):

```bash
npm run dev -- --host
```

## Project Structure

Bloom follows a specific project structure:

```
/
├── public/            # Static assets (images, fonts)
├── src/
│   ├── assets/        # Styles and processed assets
│   ├── components/    # React and Astro components
│   │   ├── common/    # Shared UI components
│   │   ├── garden/    # Garden planning components
│   │   ├── plants/    # Plant recommendation components
│   │   └── ...        # Other component modules
│   ├── content/       # Content collections (docs, plants)
│   ├── data/          # Data files (JSON, JS)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Pages and API routes
│   │   ├── api/       # API endpoints
│   │   │   └── diagnostics/ # System test and diagnostic endpoints
│   │   ├── admin/     # Admin dashboard pages
│   │   └── ...        # User-facing pages
│   └── utils/         # Utility functions
└── package.json
```

## Environment Variables

Bloom uses environment variables for configuration. Create a `.env` file in the project root with the following:

```env
# AI Provider Configuration
USE_VERTEX_AI=false

# OpenAI Configuration (if not using Vertex AI)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo

# Google Cloud Vertex AI Configuration (if using Vertex AI)
VERTEX_PROJECT_ID=your_google_cloud_project_id
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-1.0-pro

# Neo4j Configuration (for GraphRAG)
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Admin Dashboard
LOGS_API_KEY=your_secure_random_key
```

## Using the Admin Dashboard

Bloom includes an admin dashboard for monitoring and managing the application.

### Accessing the Dashboard

The admin dashboard is available at:

```
http://localhost:4321/admin/dashboard
```

For the logs dashboard:

```
http://localhost:4321/admin/dashboard?tab=logs&key=YOUR_LOGS_API_KEY
```

For the diagnostics and testing:

```
http://localhost:4321/admin/dashboard?tab=test-suite
```

Replace `YOUR_LOGS_API_KEY` with the value from your `.env` file.

### Dashboard Features

The admin dashboard provides:

1. **Logs Viewer**: Real-time access to application logs
2. **Diagnostics**: Tools for diagnosing system issues
3. **Test Suite**: Comprehensive tests for system components
4. **Environment Info**: View and validate environment settings

See the [System Diagnostics & Testing](/docs/general/diagnostics) guide for more details on the diagnostic features.

## Testing the System

Bloom includes comprehensive test endpoints that can be accessed via the admin dashboard or directly via API calls.

### Running Tests via Dashboard

1. Navigate to the Test Suite tab in the admin dashboard
2. Select the test category you want to run
3. Click "Run Selected Test" to execute the test
4. View results in the Test Results panel

### Running Tests Programmatically

All tests are also available as API endpoints:

```bash
# Example: Testing Neo4j connection
curl http://localhost:4321/api/diagnostics/neo4j-connection

# Example: Testing plant recommendations
curl http://localhost:4321/api/diagnostics/plant-recommendations-test
```

## Working with Netlify

Bloom is designed to be deployed on Netlify.

### Local Netlify Development

To test Netlify functions locally:

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Run the Netlify dev server:
   ```bash
   netlify dev
   ```

### Deploying to Netlify

To deploy to Netlify:

1. Link your repository to Netlify
2. Configure the build command: `npm run build`
3. Configure the publish directory: `dist`
4. Set up the required environment variables in Netlify's dashboard

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure your AI provider API keys are correctly set in `.env`
2. **Neo4j Connection Errors**: Verify Neo4j is running and credentials are correct
3. **Build Failures**: Check for missing dependencies with `npm install`
4. **Netlify Function Errors**: Check Netlify logs for serverless function errors

### Using Diagnostics for Troubleshooting

The diagnostic tools can help identify and fix issues:

1. Use the Neo4j connection test to verify database connectivity
2. Check Vertex AI authentication with the Vertex auth test
3. Verify weather API functionality with the weather client test
4. Test the GraphRAG system with the GraphRAG test

### Getting Help

If you encounter issues:

1. Check existing GitHub issues
2. Consult the [Architecture Documents](/docs/arch/01-architecture-overview)
3. Review the [Development Phases](/docs/devel-phases/phase-dependencies)

## Next Steps

After setting up your development environment:

1. Explore the [Architecture Overview](/docs/arch/01-architecture-overview)
2. Walk through the [Development Phases](/docs/devel-phases/phase1-setup)
3. Try adding a new feature following the existing patterns
4. Run the test suite to verify your changes

## Resources

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://reactjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [daisyUI Components](https://daisyui.com/components)
- [Neo4j Documentation](https://neo4j.com/docs)