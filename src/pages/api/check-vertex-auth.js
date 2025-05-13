// src/pages/api/check-vertex-auth.js
// Simple endpoint to check if Vertex AI authentication is working

import { checkLLMHealth } from "../../utils/vertex-client.js";

export async function GET() {
  try {
    console.log("Checking Vertex AI authentication status...");
    const healthStatus = await checkLLMHealth();

    return new Response(
      JSON.stringify({
        status: healthStatus.healthy ? "connected" : "error",
        message: healthStatus.message,
        details: {
          model: healthStatus.model,
          project: healthStatus.project,
          error: healthStatus.error,
        },
      }),
      {
        status: healthStatus.healthy ? 200 : 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error checking Vertex AI health:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Failed to check Vertex AI health",
        details: {
          error: error.message,
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
