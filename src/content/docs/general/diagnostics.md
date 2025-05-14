---
title: "System Diagnostics & Testing"
description: "Guide to using the diagnostic tools and test suite in Bloom"
category: "general"
---

# System Diagnostics & Testing

Bloom includes a comprehensive suite of diagnostic tools and system tests to help you verify that all components are functioning correctly. This guide covers how to use these tools to diagnose issues and ensure system health.

## Accessing the Diagnostics Dashboard

The diagnostics dashboard is integrated into the admin interface and provides access to various system tests and diagnostic tools.

### URL

```
http://localhost:4321/admin/dashboard?tab=test-suite
```

You can directly access specific test sections using the `test` parameter:

```
http://localhost:4321/admin/dashboard?tab=test-suite&test=neodb
```

Available test parameters: `neodb`, `graphrag`, `plants`, `stochastic`, `vertex`, `weather`

## Available Diagnostic Tests

The diagnostics dashboard includes the following test categories:

### Neo4j Database Tests

Tests connectivity to the Neo4j graph database and verifies that the connection is working properly.

**Features:**
- Basic connectivity check
- Authentication verification
- Query execution verification

**API Endpoint:** `/api/diagnostics/neo4j-connection`

### GraphRAG Tests

Tests the Graph Retrieval-Augmented Generation system by running a series of predefined gardening questions and verifying that the responses contain expected information.

**Features:**
- Tests gardening question answering
- Validates content relevance
- Checks for appropriate context integration

**API Endpoint:** `/api/diagnostics/graphrag-test`

### Plant Recommendations Tests

Tests the plant recommendation engine by sending different requests with various parameters and validating that the responses contain expected plant types.

**Features:**
- Tests recommendation quality
- Verifies parameter handling
- Checks for minimum recommendation count

**API Endpoint:** `/api/diagnostics/plant-recommendations-test`

### Stochastic RAG Tests

Tests the stochastic (dynamic) mode of the GraphRAG system, which generates Cypher queries from natural language questions.

**Features:**
- Tests query generation capabilities
- Validates entity and relationship extraction
- Verifies response quality

**API Endpoint:** `/api/diagnostics/stochastic-rag-test`

### Vertex AI Connection Tests

Verifies connectivity to Google's Vertex AI service and ensures that the authentication is working properly.

**Features:**
- Tests health check endpoint
- Validates authentication
- Verifies simple text generation capabilities

**API Endpoint:** `/api/diagnostics/vertex-auth-test`

### Weather Client Tests

Tests the weather client functionality by retrieving weather data for different locations.

**Features:**
- Tests data retrieval for multiple locations
- Validates response structure
- Checks error handling
- Tests fallback to mock data when necessary

**API Endpoint:** `/api/diagnostics/weather-client-test`

#### Understanding Weather Client Test Results

The weather client has a built-in fallback mechanism that returns mock weather data when:

- The API is unavailable
- There are network issues
- URL parsing fails (especially in server-side contexts)

This fallback is **by design** and allows the application to continue functioning even when external weather data is unavailable. When running the test, you may see log messages like:

```
[ERROR] Weather API error (Met.ie) or XML parsing error
[INFO] Falling back to mock weather data for Dublin
```

Followed by:

```
[INFO] Successfully tested weather for Dublin
```

This is normal behavior, especially in development environments where the weather client might use mock data due to URL parsing limitations in server-side contexts.

**When Using Mock Data is Fine:**

1. During local development
2. In test environments
3. When the Met.ie API is down or unavailable
4. When running in environments with network limitations

The mock data is county-specific and provides realistic values, making it suitable for most development and testing purposes.

## Running Tests Programmatically

All diagnostic tests are also available as API endpoints, which can be called programmatically for continuous integration or automated testing.

### Example API Call

```javascript
async function runNeo4jTest() {
  const response = await fetch('http://localhost:4321/api/diagnostics/neo4j-connection');
  const results = await response.json();
  console.log('Neo4j connection status:', results.status);
}
```

### Test API Response Format

All test APIs return JSON responses with standardized structures:

```json
{
  "status": "success",                // or "error"
  "timestamp": "2025-05-14T12:34:56", // ISO timestamp of test execution
  // Test-specific results follow
}
```

## Troubleshooting with Diagnostics

When encountering issues with Bloom, follow these steps to diagnose the problem:

1. **Check Environment Variables**: Use the "Check Environment" option in the Diagnostics tab to verify configuration
2. **Verify External Services**: Use the connection tests to verify Neo4j and Vertex AI connectivity
3. **Test Specific Features**: Use the targeted tests to check specific functionality like recommendations or weather data
4. **Check Logs**: Review logs for detailed error information in the Logs Viewer tab

## Adding Custom Tests

If you develop new features, consider adding diagnostic tests to verify they work correctly. Place new test endpoints in:

```
src/pages/api/diagnostics/
```

Follow the existing pattern of returning structured JSON responses and handling errors gracefully.

## Running Tests During Development

During development, it's recommended to run relevant tests after making significant changes:

1. Open the admin dashboard with the test suite tab
2. Select the test category related to your changes
3. Run the test and verify that it passes
4. Check for any warnings or performance issues

This ensures that your changes don't inadvertently break existing functionality.

## Scripted Testing

For CI/CD pipelines or bulk testing, you can run all diagnostic tests programmatically:

```bash
# Example bash script to run all diagnostics
#!/bin/bash

BASE_URL="http://localhost:4321/api/diagnostics"
TESTS=("neo4j-connection" "graphrag-test" "plant-recommendations-test" "stochastic-rag-test" "vertex-ai-connection" "weather-client-test")

for test in "${TESTS[@]}"; do
  echo "Running test: $test"
  curl -s "${BASE_URL}/${test}" | jq '.'
  echo "----------------------"
done
```

## Resources

- [Neo4j Browser Guide](https://neo4j.com/developer/neo4j-browser/)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Weather API Documentation](https://met.no/en/API-and-data)