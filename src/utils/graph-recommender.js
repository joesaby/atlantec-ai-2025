/**
 * Graph-based recommendation engine for Irish plants
 */

import { runQuery } from "../database/neo4j-client.js";

/**
 * Get plant recommendations using graph traversal
 * @param {Object} conditions - Garden conditions
 * @param {string} conditions.county - Irish county
 * @param {string} conditions.sunExposure - 'Full Sun', 'Partial Shade', or 'Full Shade'
 * @param {Array} conditions.plantType - Types of plants the user wants to grow
 * @param {boolean} conditions.nativeOnly - Whether to only show native plants
 * @returns {Promise<Array>} Array of recommended plants
 */
export async function getGraphPlantRecommendations(conditions) {
  try {
    // Ensure we have valid conditions object with defaults
    const safeConditions = {
      county: conditions?.county || 'Dublin',
      sunExposure: conditions?.sunExposure || 'Full Sun',
      nativeOnly: conditions?.nativeOnly || false,
      plantType: Array.isArray(conditions?.plantType) ? conditions.plantType : []
    };
    
    console.log("Using plant recommendation conditions:", JSON.stringify(safeConditions));
    
    // Base query parts
    let matchClause = `
      MATCH (county:County {name: $county})-[:HAS_DOMINANT_SOIL]->(soil:SoilType)
      MATCH (plant:Plant)-[:GROWS_WELL_IN]->(soil)
      WHERE plant.sunNeeds CONTAINS $sunExposure
    `;

    // Additional filters based on conditions
    if (safeConditions.nativeOnly) {
      matchClause += ` AND plant.nativeToIreland = true`;
    }

    // Filter by plant type
    if (safeConditions.plantType && safeConditions.plantType.length > 0) {
      const plantTypeConditions = [];

      if (
        safeConditions.plantType.includes("vegetable") ||
        safeConditions.plantType.includes("fruit")
      ) {
        plantTypeConditions.push(`plant.harvestSeason IS NOT NULL`);
      }

      if (safeConditions.plantType.includes("flower")) {
        plantTypeConditions.push(`plant.floweringSeason IS NOT NULL`);
      }

      if (safeConditions.plantType.includes("tree")) {
        plantTypeConditions.push(
          `(plant.isPerennial = true AND plant.name CONTAINS 'Tree')`
        );
      }

      if (plantTypeConditions.length > 0) {
        matchClause += ` AND (${plantTypeConditions.join(" OR ")})`;
      }
    }

    // Complete the query with return statement and ordering
    const query = `
      ${matchClause}
      OPTIONAL MATCH (plant)-[:ATTRACTS]->(pollinator:PollinatorType)
      OPTIONAL MATCH (plant)-[r:COMPANION_TO|ANTAGONISTIC_TO]->(otherPlant)
      RETURN 
        plant,
        collect(DISTINCT pollinator.name) AS pollinators,
        collect(DISTINCT {
          type: type(r), 
          plantName: otherPlant.name, 
          notes: r.notes
        }) AS plantRelationships,
        count(DISTINCT pollinator) AS pollinatorCount,
        CASE 
          WHEN plant.nativeToIreland = true THEN 10 
          ELSE 0 
        END +
        CASE 
          WHEN plant.sunNeeds = $sunExposure THEN 25 
          ELSE 15 
        END +
        30 + 
        (plant.sustainabilityRating * 3) AS score
      ORDER BY score DESC
      LIMIT 8
    `;

    const result = await runQuery(query, {
      county: safeConditions.county,
      sunExposure: safeConditions.sunExposure,
    });

    // Transform Neo4j results to match the existing application structure
    return result.map((record) => {
      const plant = record.plant;
      const score = record.score;

      return {
        id: parseInt(plant.id),
        commonName: plant.name,
        latinName: plant.latinName,
        description: plant.description,
        waterNeeds: plant.waterNeeds,
        sunNeeds: plant.sunNeeds,
        soilPreference: plant.soilPreference,
        nativeToIreland: plant.nativeToIreland,
        isPerennial: plant.isPerennial,
        harvestSeason: plant.harvestSeason,
        floweringSeason: plant.floweringSeason,
        imageUrl: plant.imageUrl,
        sustainabilityRating: plant.sustainabilityRating,
        waterConservationRating: plant.waterConservationRating,
        biodiversityValue: plant.biodiversityValue,

        // New graph-specific properties
        score,
        matchPercentage: Math.min(Math.round((score / 80) * 100), 100),
        pollinators: record.pollinators.filter((p) => p !== null),
        plantRelationships: record.plantRelationships.filter(
          (r) => r.type !== null
        ),
        pollinatorCount: record.pollinatorCount,
      };
    });
  } catch (error) {
    console.error("Graph recommendation error:", error);
    throw new Error("Failed to generate graph-based plant recommendations");
  }
}

/**
 * Get plants with a specific relationship to a given plant
 * @param {string} plantName - The name of the plant to find relationships for
 * @param {string} relationshipType - The type of relationship ('COMPANION_TO' or 'ANTAGONISTIC_TO')
 * @returns {Promise<Array>} Array of related plants
 */
export async function getRelatedPlants(
  plantName,
  relationshipType = "COMPANION_TO"
) {
  try {
    const query = `
      MATCH (plant:Plant {name: $plantName})-[:${relationshipType}]->(related:Plant)
      RETURN related
    `;

    const result = await runQuery(query, { plantName });

    return result.map((record) => record.related);
  } catch (error) {
    console.error("Related plants query error:", error);
    throw new Error("Failed to find related plants");
  }
}

/**
 * Get plants that attract specific pollinators
 * @param {Array} pollinatorTypes - Array of pollinator type names
 * @returns {Promise<Array>} Array of plants that attract the specified pollinators
 */
export async function getPlantsForPollinators(pollinatorTypes) {
  try {
    const query = `
      MATCH (plant:Plant)-[:ATTRACTS]->(pollinator:PollinatorType)
      WHERE pollinator.name IN $pollinatorTypes
      RETURN plant, collect(DISTINCT pollinator.name) AS attractedPollinators
      ORDER BY size(attractedPollinators) DESC
    `;

    const result = await runQuery(query, { pollinatorTypes });

    return result.map((record) => ({
      ...record.plant,
      pollinators: record.attractedPollinators,
    }));
  } catch (error) {
    console.error("Pollinator plants query error:", error);
    throw new Error("Failed to find plants for pollinators");
  }
}
