/**
 * API route for handling plant recommendations
 */

import { getPlantRecommendations } from "../../utils/plant-recommender.js";

// Mark this endpoint as server-rendered to handle POST requests
export const prerender = false;

export async function POST({ request }) {
  try {
    const { county, sunExposure, soilType, gardenType, plantType } =
      await request.json();

    if (!county) {
      return new Response(JSON.stringify({ error: "County is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const recommendations = await getPlantRecommendations(
      county,
      sunExposure,
      soilType,
      gardenType,
      plantType
    );

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting plant recommendations:", error);

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
