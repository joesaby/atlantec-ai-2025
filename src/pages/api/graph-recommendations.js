/**
 * API route for handling graph-based plant recommendations
 */

import { getGraphPlantRecommendations } from "../../utils/graph-recommender.js";

// Mark this endpoint as server-rendered to handle POST requests
export const prerender = false;

export async function POST({ request }) {
  try {
    const { county, sunExposure, nativeOnly, plantType } = await request.json();

    if (!county) {
      return new Response(JSON.stringify({ error: "County is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!sunExposure) {
      console.warn("sunExposure parameter missing, defaulting to 'Full Sun'");
    }

    const recommendations = await getGraphPlantRecommendations({
      county,
      sunExposure: sunExposure || "Full Sun", // Provide default to prevent the parameter missing error
      nativeOnly,
      plantType,
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
