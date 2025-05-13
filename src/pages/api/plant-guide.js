/**
 * API route for generating plant guides
 */

import { generatePlantGuide } from "../../utils/rag-system.js";

// Mark this endpoint as server-rendered to handle POST requests
export const prerender = false;

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const plantName = url.searchParams.get("plant");

    if (!plantName) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameter: plant name is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const guideData = await generatePlantGuide(plantName);

    return new Response(JSON.stringify(guideData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in plant-guide API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate plant guide" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST({ request }) {
  try {
    const { plantName, county } = await request.json();

    if (!plantName) {
      return new Response(JSON.stringify({ error: "Plant name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const plantGuide = await generatePlantGuide(plantName, county);

    return new Response(JSON.stringify({ plantGuide }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating plant guide:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate plant guide. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
