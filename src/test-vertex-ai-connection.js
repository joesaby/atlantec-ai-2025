/**
 * Test script to verify Vertex AI connectivity
 */

import { checkLLMHealth, generateText } from "./utils/vertex-client.js";

async function testConnection() {
  try {
    // Test health check
    console.log("Testing Vertex AI connection...");
    const healthStatus = await checkLLMHealth();
    console.log("Health status:", healthStatus);

    if (healthStatus.healthy) {
      // Try a simple generation if healthy
      console.log("Testing text generation...");
      const result = await generateText(
        "What are three vegetables that grow well in Ireland?",
        {
          maxTokens: 200,
          temperature: 0.5,
        }
      );
      console.log(
        "Generation result:",
        result ? result.substring(0, 100) + "..." : "No result from API"
      );
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testConnection();
