import {
  generateVertexResponse,
  processGardeningQueryWithVertex,
} from "../../utils/vertex-client";

// Ensure this endpoint is always server-rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    // Debug request
    const text = await request.text();
    console.log("Request body:", text);
    
    // Parse JSON manually to better handle errors
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
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

    console.log("Processing query:", query);
    console.log("History length:", history.length);
    
    console.log("Calling Vertex AI with query:", query);
    
    const response = await processGardeningQueryWithVertex(
      query,
      history
    );
    
    console.log("Detailed Vertex AI response:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing garden query:", error);
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
