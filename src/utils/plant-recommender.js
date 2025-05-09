import { plants } from "../data/plants";
import { getSoilDataByLocation } from "./soil-client";
import logger from './unified-logger.js';

/**
 * Recommends plants based on user's garden conditions
 * @param {Object} conditions - Garden conditions
 * @param {string} conditions.county - Irish county
 * @param {string} conditions.sunExposure - 'Full Sun', 'Partial Shade', or 'Full Shade'
 * @param {Array} conditions.plantType - Types of plants the user wants to grow
 * @param {boolean} conditions.nativeOnly - Whether to only show native plants
 * @returns {Promise<Array>} Array of recommended plants with scores
 */
export async function getPlantRecommendations(conditions) {
  try {
    // Get soil data for the specified county
    const soilData = await getSoilDataByLocation(conditions.county);

    // Filter and score plants based on conditions
    const scoredPlants = plants
      .filter((plant) => !conditions.nativeOnly || plant.nativeToIreland)
      .filter((plant) => {
        if (!conditions.plantType || conditions.plantType.length === 0) {
          return true;
        }

        const plantTypes = [];
        if (plant.harvestSeason) plantTypes.push("vegetable", "fruit");
        if (plant.floweringSeason) plantTypes.push("flower");
        if (
          plant.isPerennial &&
          plant.commonName.toLowerCase().includes("tree")
        ) {
          plantTypes.push("tree");
        }

        return conditions.plantType.some((type) => plantTypes.includes(type));
      })
      .map((plant) => {
        let score = 0;

        // Score based on soil suitability (0-30 points)
        if (plant.suitableSoilTypes.includes(soilData.soilType)) {
          score += 30;
        }

        // Score based on sun exposure (0-25 points)
        if (plant.sunNeeds === conditions.sunExposure) {
          score += 25;
        } else if (plant.sunNeeds.includes(conditions.sunExposure)) {
          score += 15;
        }

        // Bonus for native plants (0-10 points)
        if (plant.nativeToIreland) {
          score += 10;
        }

        // Sustainability bonus (0-15 points)
        score += plant.sustainabilityRating * 3;

        return {
          ...plant,
          score,
          matchPercentage: Math.min(Math.round((score / 80) * 100), 100),
        };
      })
      .sort((a, b) => b.score - a.score);

    return scoredPlants.slice(0, 8);
  } catch (error) {
    logger.error("Error generating plant recommendations", {
      component: "PlantRecommender",
      county: conditions.county,
      error: error.message
    });
    throw new Error("Failed to generate plant recommendations");
  }
}