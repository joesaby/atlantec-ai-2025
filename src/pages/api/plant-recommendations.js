import { getPlantRecommendations } from "../../utils/plant-recommender";

export async function POST({ request }) {
  try {
    const data = await request.json();

    if (!data.county || !data.sunExposure) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: county and sunExposure are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recommendations = await getPlantRecommendations(data);

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in plant-recommendations API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate plant recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}