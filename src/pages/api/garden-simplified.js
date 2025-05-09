// src/pages/api/garden-simplified.js
// A simplified version of the garden API endpoint

import { createVertexClient } from "../../utils/vertex-client-simplified";
import logger from "../../utils/unified-logger.js";

// Ensure this endpoint is always server-rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    // Debug request
    const text = await request.text();
    logger.info(`Received garden query request: ${text.substring(0, 100)}...`);
    
    // Parse JSON manually to better handle errors
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      logger.error("JSON parsing error", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request",
          content: "There was a problem with the request format. Please try again.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    const { query, conversationHistory } = data;
    
    if (!query) {
      logger.warn("Missing query parameter in request");
      return new Response(
        JSON.stringify({
          error: "Missing query parameter",
          content: "Please provide a query in your request.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Use default empty array if conversationHistory is not provided
    const history = conversationHistory || [];
    
    logger.info(`Processing query: "${query}"`);
    logger.info(`History length: ${history.length}`);
    
    // Create a new Vertex AI client 
    logger.info("Creating Vertex AI client");
    const client = await createVertexClient();
    
    // Generate response using the client
    logger.info("Generating response");
    const response = await client.generateResponse(query, history);
    
    logger.info("Response generated successfully");
    logger.debug("Detailed response", response);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Error processing garden query", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process query",
        content:
          "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly.",
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