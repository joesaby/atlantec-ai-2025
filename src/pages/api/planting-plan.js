/**
 * API endpoint for generating custom planting plans using RAG
 */

import { generatePlantingPlan } from "../../utils/rag-system.js";

// Mark this endpoint as server-rendered to handle POST requests
export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { county, sunExposure, spaceAvailable, goals } = data;

    if (!county || !sunExposure || !spaceAvailable) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: county, sunExposure, and spaceAvailable are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const plantingPlan = await generatePlantingPlan({
      county,
      sunExposure,
      spaceAvailable,
      goals: goals || [],
    });

    return new Response(JSON.stringify(plantingPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in planting-plan API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate planting plan" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
