/**
 * API route for handling graph-based plant recommendations
 */

import { getGraphPlantRecommendations } from "../../utils/graph-recommender.js";

// Mark this endpoint as server-rendered to handle POST requests
export const prerender = false;

export async function POST({ request }) {
  try {
    const { county, requirements } = await request.json();

    if (!county) {
      return new Response(JSON.stringify({ error: "County is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recommendations = await getGraphPlantRecommendations({
      county,
      ...requirements,
    });

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting graph recommendations:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to get recommendations. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
