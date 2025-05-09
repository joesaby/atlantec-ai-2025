// src/pages/api/garden.js
import {
  processGardeningQueryWithVertex,
} from "../../utils/vertex-client-v2.js";
import logger from "../../utils/unified-logger.js";

// Ensure this endpoint is always server-rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    // Debug request
    const text = await request.text();
    logger.info(`Received garden query: ${text.substring(0, 100)}...`);
    
    // Parse JSON manually for better error handling
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
    
    const response = await processGardeningQueryWithVertex(
      query,
      history
    );

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
        errorDetails: {
          message: error.message,
          name: error.name,
          stack: error.stack,
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