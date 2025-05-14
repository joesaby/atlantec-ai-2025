/**
 * RAG (Retrieval-Augmented Generation) system for Bloom
 * Combines knowledge retrieval from Neo4j with Vertex AI generation
 */

import { generateText } from "./vertex-client.js";
import { runQuery, closeDriver } from "../database/neo4j-client.js";

/**
 * Core RAG function to answer gardening questions
 * @param {string} question - The user's gardening question
 * @param {Object} context - Additional context (county, season, soil type, etc.)
 * @returns {Promise<Object>} The answer with supporting facts
 */
export async function answerGardeningQuestion(question, context = {}) {
  try {
    // 1. Extract entities and intent from the question
    const entities = await extractEntities(question);

    // 2. Retrieve relevant information from the database
    const retrievedInfo = await retrieveInformation(
      question,
      entities,
      context
    );

    // 3. Format the context for the LLM
    const promptContext = formatContextForLLM(retrievedInfo, context);

    // 4. Generate the answer using Vertex AI
    const answer = await generateAnswer(question, promptContext);

    return {
      answer,
      sourceFacts: retrievedInfo.facts,
      entities: entities,
    };
  } catch (error) {
    console.error("Error in RAG system:", error);
    return {
      answer:
        "I'm sorry, I couldn't generate an answer due to a technical issue.",
      error: error.message,
    };
  }
}

/**
 * Extract entities (plants, pests, soil types, etc.) from the question
 * @param {string} question - The user's question
 * @returns {Promise<Object>} Extracted entities
 */
async function extractEntities(question) {
  // Start with a simple keyword extraction approach
  const entities = {
    plants: [],
    soilTypes: [],
    counties: [],
    seasons: [],
    months: [],
    activities: [],
  };

  // Plant entities
  const plantQuery = `
    MATCH (p:Plant)
    RETURN p.name AS name, p.type AS type
  `;
  const plants = await runQuery(plantQuery);

  for (const plant of plants) {
    if (question.toLowerCase().includes(plant.name.toLowerCase())) {
      entities.plants.push(plant);
    }
  }

  // Soil type entities
  const soilQuery = `
    MATCH (s:SoilType)
    RETURN s.type AS type
  `;
  const soilTypes = await runQuery(soilQuery);

  for (const soil of soilTypes) {
    if (soil.type && question.toLowerCase().includes(soil.type.toLowerCase())) {
      entities.soilTypes.push(soil.type);
    }
  }

  // County entities
  const countyQuery = `
    MATCH (c:County)
    RETURN c.name AS name
  `;
  const counties = await runQuery(countyQuery);

  for (const county of counties) {
    if (question.toLowerCase().includes(county.name.toLowerCase())) {
      entities.counties.push(county.name);
    }
  }

  // Seasonal entities
  const seasons = ["Spring", "Summer", "Autumn", "Winter"];
  for (const season of seasons) {
    if (question.toLowerCase().includes(season.toLowerCase())) {
      entities.seasons.push(season);
    }
  }

  // Month entities
  const monthQuery = `
    MATCH (m:Month)
    RETURN m.name AS name
  `;
  const months = await runQuery(monthQuery);

  for (const month of months) {
    if (question.toLowerCase().includes(month.name.toLowerCase())) {
      entities.months.push(month.name);
    }
  }

  // Common gardening activities
  const activities = [
    "plant",
    "grow",
    "sow",
    "harvest",
    "prune",
    "fertilize",
    "water",
    "mulch",
    "weed",
    "companion planting",
  ];

  for (const activity of activities) {
    if (question.toLowerCase().includes(activity.toLowerCase())) {
      entities.activities.push(activity);
    }
  }

  return entities;
}

/**
 * Retrieve relevant information from Neo4j based on the question and extracted entities
 * @param {string} question - The user's question
 * @param {Object} entities - Extracted entities
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} Retrieved information
 */
async function retrieveInformation(question, entities, context) {
  const retrievedInfo = {
    facts: [],
    plants: [],
    soilTypes: [],
    seasonalAdvice: [],
    companionPlants: [],
    antagonisticPlants: [],
  };

  // If the question mentions specific plants, get information about them
  if (entities.plants.length > 0) {
    for (const plant of entities.plants) {
      // Get plant details
      const plantQuery = `
        MATCH (p:Plant {name: $plantName})
        RETURN p.name AS name, p.type AS type, p.description AS description, 
               p.growingSeason AS growingSeason, p.climateZones AS climateZones
      `;
      const plantDetails = await runQuery(plantQuery, {
        plantName: plant.name,
      });

      if (plantDetails.length > 0) {
        retrievedInfo.plants.push(plantDetails[0]);
        retrievedInfo.facts.push(
          `${plantDetails[0].name} is a ${plantDetails[0].type} that ${plantDetails[0].description}`
        );

        // Get planting months
        const plantingMonthsQuery = `
          MATCH (p:Plant {name: $plantName})-[:PLANT_IN]->(m:Month)
          RETURN m.name AS month
          ORDER BY m.order
        `;
        const plantingMonths = await runQuery(plantingMonthsQuery, {
          plantName: plant.name,
        });

        if (plantingMonths.length > 0) {
          const monthsList = plantingMonths.map((m) => m.month).join(", ");
          retrievedInfo.facts.push(
            `${plant.name} can be planted in: ${monthsList}`
          );
          retrievedInfo.seasonalAdvice.push({
            plant: plant.name,
            activity: "planting",
            months: plantingMonths.map((m) => m.month),
          });
        }

        // Get harvesting months
        const harvestingMonthsQuery = `
          MATCH (p:Plant {name: $plantName})-[:HARVEST_IN]->(m:Month)
          RETURN m.name AS month
          ORDER BY m.order
        `;
        const harvestingMonths = await runQuery(harvestingMonthsQuery, {
          plantName: plant.name,
        });

        if (harvestingMonths.length > 0) {
          const monthsList = harvestingMonths.map((m) => m.month).join(", ");
          retrievedInfo.facts.push(
            `${plant.name} can be harvested in: ${monthsList}`
          );
          retrievedInfo.seasonalAdvice.push({
            plant: plant.name,
            activity: "harvesting",
            months: harvestingMonths.map((m) => m.month),
          });
        }

        // Get suitable soil types
        const soilTypesQuery = `
          MATCH (p:Plant {name: $plantName})-[:GROWS_WELL_IN]->(s:SoilType)
          RETURN s.type AS soilType
        `;
        const soilTypes = await runQuery(soilTypesQuery, {
          plantName: plant.name,
        });

        if (soilTypes.length > 0) {
          const soilTypesList = soilTypes
            .map((s) => s.soilType)
            .filter(Boolean)
            .join(", ");
          if (soilTypesList) {
            retrievedInfo.facts.push(
              `${plant.name} grows well in these soil types: ${soilTypesList}`
            );
            retrievedInfo.soilTypes = retrievedInfo.soilTypes.concat(
              soilTypes.map((s) => s.soilType).filter(Boolean)
            );
          }
        }

        // Get companion plants
        const companionPlantsQuery = `
          MATCH (p:Plant {name: $plantName})-[:COMPANION_TO]->(companion:Plant)
          RETURN companion.name AS companionName
        `;
        const companionPlants = await runQuery(companionPlantsQuery, {
          plantName: plant.name,
        });

        if (companionPlants.length > 0) {
          const companionsList = companionPlants
            .map((c) => c.companionName)
            .join(", ");
          retrievedInfo.facts.push(
            `${plant.name} grows well with these companion plants: ${companionsList}`
          );
          retrievedInfo.companionPlants.push({
            plant: plant.name,
            companions: companionPlants.map((c) => c.companionName),
          });
        }

        // Get antagonistic plants
        const antagonisticPlantsQuery = `
          MATCH (p:Plant {name: $plantName})-[:ANTAGONISTIC_TO]->(enemy:Plant)
          RETURN enemy.name AS enemyName
        `;
        const antagonisticPlants = await runQuery(antagonisticPlantsQuery, {
          plantName: plant.name,
        });

        if (antagonisticPlants.length > 0) {
          const enemiesList = antagonisticPlants
            .map((e) => e.enemyName)
            .join(", ");
          retrievedInfo.facts.push(
            `${plant.name} should not be planted with: ${enemiesList}`
          );
          retrievedInfo.antagonisticPlants.push({
            plant: plant.name,
            enemies: antagonisticPlants.map((e) => e.enemyName),
          });
        }
      }
    }
  }

  // If the question mentions specific months, get seasonal information
  if (entities.months.length > 0) {
    for (const month of entities.months) {
      // What to plant in this month
      const plantInMonthQuery = `
        MATCH (p:Plant)-[:PLANT_IN]->(m:Month {name: $monthName})
        RETURN p.name AS plantName, p.type AS plantType
      `;
      const plantsToPlant = await runQuery(plantInMonthQuery, {
        monthName: month,
      });

      if (plantsToPlant.length > 0) {
        const plantList = plantsToPlant.map((p) => p.plantName).join(", ");
        retrievedInfo.facts.push(
          `Plants to sow/plant in ${month}: ${plantList}`
        );
      }

      // What to harvest in this month
      const harvestInMonthQuery = `
        MATCH (p:Plant)-[:HARVEST_IN]->(m:Month {name: $monthName})
        RETURN p.name AS plantName, p.type AS plantType
      `;
      const plantsToHarvest = await runQuery(harvestInMonthQuery, {
        monthName: month,
      });

      if (plantsToHarvest.length > 0) {
        const harvestList = plantsToHarvest.map((p) => p.plantName).join(", ");
        retrievedInfo.facts.push(
          `Plants to harvest in ${month}: ${harvestList}`
        );
      }
    }
  }

  return retrievedInfo;
}

/**
 * Format the retrieved information and context for the LLM
 * @param {Object} retrievedInfo - Information retrieved from the database
 * @param {Object} context - Additional context
 * @returns {string} Formatted context for the LLM
 */
function formatContextForLLM(retrievedInfo, context) {
  let formattedContext = "Gardening Assistant Context:\n";

  if (retrievedInfo.facts.length > 0) {
    formattedContext += "Facts:\n" + retrievedInfo.facts.join("\n") + "\n";
  }

  if (context.county) {
    formattedContext += `County: ${context.county}\n`;
  }

  if (context.season) {
    formattedContext += `Season: ${context.season}\n`;
  }

  if (context.soilType) {
    formattedContext += `Soil Type: ${context.soilType}\n`;
  }

  return formattedContext;
}

/**
 * Generate the answer using Vertex AI
 * @param {string} question - The user's question
 * @param {string} promptContext - Formatted context for the LLM
 * @returns {Promise<string>} Generated answer
 */
async function generateAnswer(question, promptContext) {
  const prompt = `
    You are a gardening assistant. Answer the following question based on the provided context:
    Question: ${question}
    Context: ${promptContext}
  `;

  const response = await generateText(prompt, {
    temperature: 0.7,
    maxTokens: 500,
  });

  return response;
}

/**
 * Get seasonal gardening recommendations for a specific month
 * @param {string} month - The month to get recommendations for
 * @param {Object} context - Additional context (county, etc.)
 * @returns {Promise<Object>} Seasonal recommendations
 */
export async function getSeasonalRecommendations(month, context = {}) {
  try {
    // What to plant in this month
    const plantInMonthQuery = `
      MATCH (p:Plant)-[:PLANT_IN]->(m:Month {name: $monthName})
      RETURN p.name AS name, p.type AS type, p.description AS description
    `;
    const plantsToPlant = await runQuery(plantInMonthQuery, {
      monthName: month,
    });

    // What to harvest in this month
    const harvestInMonthQuery = `
      MATCH (p:Plant)-[:HARVEST_IN]->(m:Month {name: $monthName})
      RETURN p.name AS name, p.type AS type, p.description AS description
    `;
    const plantsToHarvest = await runQuery(harvestInMonthQuery, {
      monthName: month,
    });

    // Get the season for this month
    const monthInfoQuery = `
      MATCH (m:Month {name: $monthName})
      RETURN m.season AS season
    `;
    const monthInfo = await runQuery(monthInfoQuery, { monthName: month });
    const season = monthInfo.length > 0 ? monthInfo[0].season : "";

    // Get county-specific recommendations if provided
    let countyRecommendations = [];
    if (context.county) {
      const countySoilQuery = `
        MATCH (c:County {name: $countyName})-[:HAS_DOMINANT_SOIL]->(s:SoilType)<-[:GROWS_WELL_IN]-(p:Plant)-[:PLANT_IN]->(:Month {name: $monthName})
        RETURN p.name AS name, p.type AS type, s.type AS soilType
      `;
      countyRecommendations = await runQuery(countySoilQuery, {
        countyName: context.county,
        monthName: month,
      });
    }

    // Generate a seasonal tip using LLM
    const tipContext = `
    - Month: ${month}
    - Season: ${season}
    - Plants to sow/plant: ${plantsToPlant.map((p) => p.name).join(", ")}
    - Plants to harvest: ${plantsToHarvest.map((p) => p.name).join(", ")}
    ${context.county ? `- County: ${context.county}` : ""}
    `;

    const tipPrompt = `You are an expert Bloom. 
    
    Please provide a short, practical gardening tip for Irish gardeners during ${month} (${season}) that is about 2-3 sentences long.
    
    Context:
    ${tipContext}
    
    Gardening Tip:`;

    const seasonalTip = await generateText(tipPrompt, {
      maxTokens: 200,
      temperature: 0.7,
    });

    return {
      month,
      season,
      plantsToPlant,
      plantsToHarvest,
      countyRecommendations,
      seasonalTip,
    };
  } catch (error) {
    console.error("Error getting seasonal recommendations:", error);
    return {
      error: error.message,
    };
  }
}

/**
 * Get plant recommendations based on various criteria
 * @param {Object} criteria - Filtering criteria
 * @returns {Promise<Array>} Recommended plants
 */
export async function getPlantRecommendations(criteria = {}) {
  try {
    let query = `
      MATCH (p:Plant)
      WHERE 1=1
    `;

    const params = {};

    // Filter by plant type
    if (criteria.plantType) {
      query += ` AND p.type = $plantType`;
      params.plantType = criteria.plantType;
    }

    // Filter by soil type
    if (criteria.soilType) {
      query += ` AND EXISTS {
        MATCH (p)-[:GROWS_WELL_IN]->(s:SoilType {type: $soilType})
      }`;
      params.soilType = criteria.soilType;
    }

    // Filter by county (get soil type for county and then match plants)
    if (criteria.county && !criteria.soilType) {
      query += ` AND EXISTS {
        MATCH (c:County {name: $county})-[:HAS_DOMINANT_SOIL]->(s:SoilType)<-[:GROWS_WELL_IN]-(p)
      }`;
      params.county = criteria.county;
    }

    // Filter by planting month
    if (criteria.plantingMonth) {
      query += ` AND EXISTS {
        MATCH (p)-[:PLANT_IN]->(m:Month {name: $plantingMonth})
      }`;
      params.plantingMonth = criteria.plantingMonth;
    }

    // Filter by harvesting month
    if (criteria.harvestingMonth) {
      query += ` AND EXISTS {
        MATCH (p)-[:HARVEST_IN]->(m:Month {name: $harvestingMonth})
      }`;
      params.harvestingMonth = criteria.harvestingMonth;
    }

    // Return results
    query += `
      RETURN p.name AS name, p.type AS type, p.description AS description, 
             p.growingSeason AS growingSeason, p.climateZones AS climateZones
      ORDER BY p.name
      LIMIT 20
    `;

    const recommendations = await runQuery(query, params);

    // For each plant, fetch additional information
    for (const plant of recommendations) {
      // Get planting months
      const plantingMonthsQuery = `
        MATCH (p:Plant {name: $name})-[:PLANT_IN]->(m:Month)
        RETURN m.name AS month
        ORDER BY m.order
      `;
      const plantingMonths = await runQuery(plantingMonthsQuery, {
        name: plant.name,
      });
      plant.plantingMonths = plantingMonths.map((m) => m.month);

      // Get harvesting months
      const harvestingMonthsQuery = `
        MATCH (p:Plant {name: $name})-[:HARVEST_IN]->(m:Month)
        RETURN m.name AS month
        ORDER BY m.order
      `;
      const harvestingMonths = await runQuery(harvestingMonthsQuery, {
        name: plant.name,
      });
      plant.harvestingMonths = harvestingMonths.map((m) => m.month);

      // Get companion plants
      const companionPlantsQuery = `
        MATCH (p:Plant {name: $name})-[:COMPANION_TO]->(companion:Plant)
        RETURN companion.name AS name
      `;
      const companionPlants = await runQuery(companionPlantsQuery, {
        name: plant.name,
      });
      plant.companionPlants = companionPlants.map((c) => c.name);

      // Get plants to avoid
      const plantsToAvoidQuery = `
        MATCH (p:Plant {name: $name})-[:ANTAGONISTIC_TO]->(avoid:Plant)
        RETURN avoid.name AS name
      `;
      const plantsToAvoid = await runQuery(plantsToAvoidQuery, {
        name: plant.name,
      });
      plant.plantsToAvoid = plantsToAvoid.map((a) => a.name);
    }

    return recommendations;
  } catch (error) {
    console.error("Error getting plant recommendations:", error);
    return [];
  }
}

/**
 * Generates a detailed plant guide for a specific plant using the RAG system
 * @param {string} plantName - The name of the plant to generate a guide for
 * @returns {Promise<Object>} The plant guide data
 */
export async function generatePlantGuide(plantName) {
  try {
    // Find the plant in the database
    const plantQuery = `
      MATCH (p:Plant)
      WHERE toLower(p.name) CONTAINS toLower($searchTerm)
      RETURN p.name AS name, p.type AS type, p.description AS description, 
             p.growingSeason AS growingSeason, p.climateZones AS climateZones
      LIMIT 1
    `;

    const plantResults = await runQuery(plantQuery, { searchTerm: plantName });

    if (plantResults.length === 0) {
      return {
        error: `No plant found matching '${plantName}'`,
      };
    }

    const plant = plantResults[0];

    // Get planting information
    const plantingQuery = `
      MATCH (p:Plant {name: $plantName})-[:PLANT_IN]->(m:Month)
      RETURN m.name AS month, m.season AS season
      ORDER BY m.order
    `;

    const plantingMonths = await runQuery(plantingQuery, {
      plantName: plant.name,
    });

    // Get harvesting information
    const harvestingQuery = `
      MATCH (p:Plant {name: $plantName})-[:HARVEST_IN]->(m:Month)
      RETURN m.name AS month, m.season AS season
      ORDER BY m.order
    `;

    const harvestingMonths = await runQuery(harvestingQuery, {
      plantName: plant.name,
    });

    // Get soil type compatibility
    const soilQuery = `
      MATCH (p:Plant {name: $plantName})-[:GROWS_WELL_IN]->(s:SoilType)
      RETURN s.type AS soilType, s.characteristics AS characteristics
    `;

    const compatibleSoils = await runQuery(soilQuery, {
      plantName: plant.name,
    });

    // Get companion plants
    const companionsQuery = `
      MATCH (p:Plant {name: $plantName})-[:COMPANION_TO]->(companion:Plant)
      RETURN companion.name AS name, companion.type AS type
    `;

    const companions = await runQuery(companionsQuery, {
      plantName: plant.name,
    });

    // Get plants to avoid
    const avoidQuery = `
      MATCH (p:Plant {name: $plantName})-[:ANTAGONISTIC_TO]->(avoid:Plant)
      RETURN avoid.name AS name, avoid.type AS type
    `;

    const plantsToAvoid = await runQuery(avoidQuery, { plantName: plant.name });

    // Get pollinators if applicable
    const pollinatorsQuery = `
      MATCH (p:Plant {name: $plantName})-[:ATTRACTS]->(pol:PollinatorType)
      RETURN pol.name AS name
    `;

    const pollinators = await runQuery(pollinatorsQuery, {
      plantName: plant.name,
    });

    // Prepare the facts for the LLM to generate growing tips
    const plantFacts = [
      `${plant.name} is a ${plant.type}.`,
      plant.description,
      `Growing season: ${plant.growingSeason || "Not specified"}`,
      `Suitable climate zones: ${
        Array.isArray(plant.climateZones)
          ? plant.climateZones.join(", ")
          : "Various"
      }`,
      `Planting months: ${
        plantingMonths.map((m) => m.month).join(", ") || "Not specified"
      }`,
      `Harvesting months: ${
        harvestingMonths.map((m) => m.month).join(", ") || "Not specified"
      }`,
      `Compatible soil types: ${
        compatibleSoils.map((s) => s.soilType).join(", ") || "Various"
      }`,
    ];

    if (companions.length > 0) {
      plantFacts.push(
        `Companion plants: ${companions.map((c) => c.name).join(", ")}`
      );
    }

    if (plantsToAvoid.length > 0) {
      plantFacts.push(
        `Plants to avoid growing nearby: ${plantsToAvoid
          .map((p) => p.name)
          .join(", ")}`
      );
    }

    if (pollinators.length > 0) {
      plantFacts.push(`Attracts: ${pollinators.map((p) => p.name).join(", ")}`);
    }

    // Generate growing tips using the LLM
    const growingTipsPrompt = `
    You are an expert gardener specializing in Irish gardening conditions.
    
    Based on the following facts about ${
      plant.name
    }, provide 3-5 clear, practical growing tips specifically for Irish gardeners:
    
    ${plantFacts.join("\n")}
    
    Format your response as a bulleted list of growing tips, focusing on practical advice that addresses common challenges for this plant in Irish climate.
    `;

    const growingTips = await generateText(growingTipsPrompt, {
      maxTokens: 500,
      temperature: 0.7,
    });

    // Generate care calendar
    const careCalendarPrompt = `
    You are an expert gardener specializing in Irish gardening conditions.
    
    Based on the following facts about ${
      plant.name
    }, create a brief monthly care calendar specifically for Irish gardeners:
    
    ${plantFacts.join("\n")}
    
    Format your response as a month-by-month summary covering only the relevant months for this plant, including key tasks like planting, maintenance, and harvesting. Keep each month's advice to 1-2 sentences at most.
    `;

    const careCalendar = await generateText(careCalendarPrompt, {
      maxTokens: 600,
      temperature: 0.7,
    });

    // Generate common problems/solutions
    const commonProblemsPrompt = `
    You are an expert gardener specializing in Irish gardening conditions.
    
    Based on the following facts about ${
      plant.name
    }, identify 2-3 common problems that Irish gardeners might encounter with this plant and provide solutions:
    
    ${plantFacts.join("\n")}
    
    Format your response as a list with problem-solution pairs.
    `;

    const commonProblems = await generateText(commonProblemsPrompt, {
      maxTokens: 500,
      temperature: 0.7,
    });

    // Construct the full guide
    return {
      name: plant.name,
      type: plant.type,
      description: plant.description,
      growingSeason: plant.growingSeason,
      climateZones: plant.climateZones,
      plantingMonths: plantingMonths.map((m) => ({
        name: m.month,
        season: m.season,
      })),
      harvestingMonths: harvestingMonths.map((m) => ({
        name: m.month,
        season: m.season,
      })),
      compatibleSoils: compatibleSoils.map((s) => ({
        type: s.soilType,
        characteristics: s.characteristics,
      })),
      companions: companions.map((c) => ({
        name: c.name,
        type: c.type,
      })),
      plantsToAvoid: plantsToAvoid.map((p) => ({
        name: p.name,
        type: p.type,
      })),
      pollinators: pollinators.map((p) => p.name),
      growingTips: growingTips,
      careCalendar: careCalendar,
      commonProblems: commonProblems,
      // Add any other useful information
      sustainabilityRating: 4, // Default rating (1-5)
      waterNeeds: "Medium", // Default
      sunNeeds: "Full Sun", // Default
      nativeToIreland:
        plant.climateZones &&
        Array.isArray(plant.climateZones) &&
        plant.climateZones.includes("Ireland"),
    };
  } catch (error) {
    console.error("Error generating plant guide:", error);
    return {
      error: "Failed to generate plant guide",
    };
  }
}

/**
 * Generates a customized planting plan based on garden specifications
 * @param {Object} specs - Garden specifications
 * @param {string} specs.county - The county where the garden is located
 * @param {string} specs.sunExposure - Amount of sun exposure (Full Sun, Partial Shade, Full Shade)
 * @param {string} specs.spaceAvailable - Description of available space
 * @param {Array<string>} specs.goals - Gardening goals (e.g., "grow vegetables", "attract pollinators")
 * @returns {Promise<Object>} The customized planting plan
 */
export async function generatePlantingPlan(specs) {
  try {
    const { county, sunExposure, spaceAvailable, goals } = specs;

    // Get soil type for the county
    const soilQuery = `
      MATCH (c:County {name: $countyName})-[:HAS_DOMINANT_SOIL]->(s:SoilType)
      RETURN s.type AS soilType, s.characteristics AS characteristics
    `;

    const soilResults = await runQuery(soilQuery, { countyName: county });
    const soilType = soilResults.length > 0 ? soilResults[0].soilType : "Loam";
    const soilCharacteristics =
      soilResults.length > 0 ? soilResults[0].characteristics : "";

    // Get current month and season
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });
    const monthsToSeasons = {
      January: "Winter",
      February: "Winter",
      March: "Spring",
      April: "Spring",
      May: "Spring",
      June: "Summer",
      July: "Summer",
      August: "Summer",
      September: "Autumn",
      October: "Autumn",
      November: "Autumn",
      December: "Winter",
    };
    const currentSeason = monthsToSeasons[currentMonth];

    // Find suitable plants based on specifications
    let query = `
      MATCH (p:Plant)
      WHERE EXISTS {
        MATCH (p)-[:GROWS_WELL_IN]->(s:SoilType {type: $soilType})
      }
    `;

    if (currentMonth) {
      query += `
        AND EXISTS {
          MATCH (p)-[:PLANT_IN]->(m:Month {name: $currentMonth})
        }
      `;
    }

    query += `
      RETURN p.name AS name, p.type AS type, p.description AS description
      LIMIT 15
    `;

    const plants = await runQuery(query, {
      soilType,
      currentMonth,
    });

    // Determine plant types needed based on goals
    const plantTypes = determinePlantTypesFromGoals(goals);

    // Group plants by type
    const plantsByType = {};
    for (const plant of plants) {
      if (!plantsByType[plant.type]) {
        plantsByType[plant.type] = [];
      }
      plantsByType[plant.type].push(plant);
    }

    // For each plant, get companion plants
    for (const plant of plants) {
      const companionsQuery = `
        MATCH (p:Plant {name: $plantName})-[:COMPANION_TO]->(companion:Plant)
        RETURN companion.name AS name
      `;

      const companions = await runQuery(companionsQuery, {
        plantName: plant.name,
      });
      plant.companions = companions.map((c) => c.name);
    }

    // Generate layout suggestions based on plant types and space
    const layoutSuggestion = generateLayoutSuggestion(
      plantsByType,
      spaceAvailable
    );

    // Generate planting schedule
    const plantingSchedule = await generatePlantingSchedule(
      plants,
      currentMonth
    );

    // Generate companion planting recommendations
    const companionRecommendations = generateCompanionRecommendations(plants);

    // Generate a customized planting guide with the LLM
    const plantingGuidePrompt = `
    You are an expert Irish gardening consultant specializing in creating personalized garden plans.
    
    Create a practical planting plan for a garden with the following specifications:
    - County: ${county}
    - Soil Type: ${soilType} (${soilCharacteristics})
    - Sun Exposure: ${sunExposure}
    - Space Available: ${spaceAvailable}
    - Current Month: ${currentMonth} (${currentSeason})
    ${goals.length > 0 ? `- Gardening Goals: ${goals.join(", ")}` : ""}
    
    Recommended plants suitable for these conditions:
    ${plants.map((p) => `- ${p.name} (${p.type}): ${p.description}`).join("\n")}
    
    Create a practical, month-by-month planting guide that maximizes use of the available space. 
    Focus on plants that work well together, with specific recommendations for plant spacing and layout.
    Keep your advice specific to Irish growing conditions.
    `;

    const customPlantingGuide = await generateText(plantingGuidePrompt, {
      maxTokens: 800,
      temperature: 0.7,
    });

    // Compile the complete planting plan
    return {
      county,
      soilType,
      sunExposure,
      spaceAvailable,
      currentMonth,
      currentSeason,
      recommendedPlants: plants,
      layoutSuggestion,
      plantingSchedule,
      companionRecommendations,
      customPlantingGuide,
    };
  } catch (error) {
    console.error("Error generating planting plan:", error);
    return {
      error: "Failed to generate planting plan",
    };
  }
}

/**
 * Determine plant types needed based on gardening goals
 * @param {Array<string>} goals - Gardening goals
 * @returns {Object} Plant types to prioritize
 */
function determinePlantTypesFromGoals(goals) {
  const types = {
    vegetables: false,
    fruits: false,
    herbs: false,
    flowers: false,
    trees: false,
    native: false,
  };

  if (!goals || goals.length === 0) {
    // Default to a balanced approach
    types.vegetables = true;
    types.herbs = true;
    types.flowers = true;
    return types;
  }

  const goalStr = goals.join(" ").toLowerCase();

  if (
    goalStr.includes("vegetable") ||
    goalStr.includes("food") ||
    goalStr.includes("edible")
  ) {
    types.vegetables = true;
  }

  if (goalStr.includes("fruit")) {
    types.fruits = true;
  }

  if (goalStr.includes("herb") || goalStr.includes("cooking")) {
    types.herbs = true;
  }

  if (
    goalStr.includes("flower") ||
    goalStr.includes("beautiful") ||
    goalStr.includes("pollinator") ||
    goalStr.includes("bee") ||
    goalStr.includes("butterfly")
  ) {
    types.flowers = true;
  }

  if (
    goalStr.includes("tree") ||
    goalStr.includes("shrub") ||
    goalStr.includes("privacy") ||
    goalStr.includes("shade")
  ) {
    types.trees = true;
  }

  if (
    goalStr.includes("native") ||
    goalStr.includes("wildlife") ||
    goalStr.includes("biodiversity") ||
    goalStr.includes("irish")
  ) {
    types.native = true;
  }

  // Ensure at least one type is selected
  if (!Object.values(types).some(Boolean)) {
    types.vegetables = true;
    types.flowers = true;
  }

  return types;
}

/**
 * Generate layout suggestions based on plant types and available space
 * @param {Object} plantsByType - Plants grouped by type
 * @param {string} spaceAvailable - Description of available space
 * @returns {Object} Layout suggestion
 */
function generateLayoutSuggestion(plantsByType, spaceAvailable) {
  // Parse space available to determine rough dimensions/area
  const isSmall =
    spaceAvailable.toLowerCase().includes("small") ||
    spaceAvailable.toLowerCase().includes("container") ||
    spaceAvailable.toLowerCase().includes("balcony");

  const isMedium =
    spaceAvailable.toLowerCase().includes("medium") ||
    spaceAvailable.toLowerCase().includes("raised bed");

  const isLarge =
    spaceAvailable.toLowerCase().includes("large") ||
    spaceAvailable.toLowerCase().includes("acre") ||
    spaceAvailable.toLowerCase().includes("plot");

  // Default to medium if no size indication
  const size = isSmall ? "small" : isLarge ? "large" : "medium";

  // Generate different layouts based on size
  let layoutType = "rows";
  let sections = [];

  if (size === "small") {
    layoutType = "container";

    if (plantsByType["Vegetable"]) {
      sections.push({
        name: "Container Vegetables",
        plants: plantsByType["Vegetable"].slice(0, 3).map((p) => p.name),
        area: "60%",
      });
    }

    if (plantsByType["Herb"]) {
      sections.push({
        name: "Herb Containers",
        plants: plantsByType["Herb"].slice(0, 2).map((p) => p.name),
        area: "20%",
      });
    }

    if (plantsByType["Flower"]) {
      sections.push({
        name: "Pollinator Flowers",
        plants: plantsByType["Flower"].slice(0, 2).map((p) => p.name),
        area: "20%",
      });
    }
  } else if (size === "medium") {
    layoutType = "raised beds";

    if (plantsByType["Vegetable"]) {
      sections.push({
        name: "Vegetable Bed",
        plants: plantsByType["Vegetable"].slice(0, 5).map((p) => p.name),
        area: "50%",
      });
    }

    if (plantsByType["Herb"]) {
      sections.push({
        name: "Herb Corner",
        plants: plantsByType["Herb"].slice(0, 3).map((p) => p.name),
        area: "15%",
      });
    }

    if (plantsByType["Flower"]) {
      sections.push({
        name: "Flower Border",
        plants: plantsByType["Flower"].slice(0, 4).map((p) => p.name),
        area: "25%",
      });
    }

    if (plantsByType["Fruit"]) {
      sections.push({
        name: "Fruit Area",
        plants: plantsByType["Fruit"].slice(0, 2).map((p) => p.name),
        area: "10%",
      });
    }
  } else {
    // large
    layoutType = "garden plot";

    if (plantsByType["Vegetable"]) {
      sections.push({
        name: "Main Vegetable Plot",
        plants: plantsByType["Vegetable"].slice(0, 8).map((p) => p.name),
        area: "40%",
      });
    }

    if (plantsByType["Herb"]) {
      sections.push({
        name: "Herb Garden",
        plants: plantsByType["Herb"].slice(0, 5).map((p) => p.name),
        area: "10%",
      });
    }

    if (plantsByType["Flower"]) {
      sections.push({
        name: "Pollinator Border",
        plants: plantsByType["Flower"].slice(0, 6).map((p) => p.name),
        area: "20%",
      });
    }

    if (plantsByType["Fruit"]) {
      sections.push({
        name: "Fruit Section",
        plants: plantsByType["Fruit"].slice(0, 4).map((p) => p.name),
        area: "20%",
      });
    }

    if (plantsByType["Tree"]) {
      sections.push({
        name: "Tree Corner",
        plants: plantsByType["Tree"].slice(0, 2).map((p) => p.name),
        area: "10%",
      });
    }
  }

  return {
    size,
    layoutType,
    sections:
      sections.length > 0
        ? sections
        : [
            {
              name: "General Planting Area",
              plants: Object.values(plantsByType)
                .flat()
                .slice(0, 5)
                .map((p) => p.name),
              area: "100%",
            },
          ],
  };
}

/**
 * Generate a month-by-month planting schedule
 * @param {Array<Object>} plants - Plants to include in the schedule
 * @param {string} startMonth - Month to start the schedule from
 * @returns {Promise<Object>} Monthly planting schedule
 */
async function generatePlantingSchedule(plants, startMonth) {
  // Get all months in order starting from the start month
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const startIdx = monthOrder.indexOf(startMonth);
  const orderedMonths = [
    ...monthOrder.slice(startIdx),
    ...monthOrder.slice(0, startIdx),
  ];

  // Generate a 6-month schedule
  const scheduleMonths = orderedMonths.slice(0, 6);
  const schedule = {};

  // For each plant, get planting and harvesting months
  for (const plant of plants) {
    // Get planting months
    const plantingMonthsQuery = `
      MATCH (p:Plant {name: $plantName})-[:PLANT_IN]->(m:Month)
      RETURN m.name AS month
    `;
    const plantingMonths = await runQuery(plantingMonthsQuery, {
      plantName: plant.name,
    });

    // Get harvesting months
    const harvestingMonthsQuery = `
      MATCH (p:Plant {name: $plantName})-[:HARVEST_IN]->(m:Month)
      RETURN m.name AS month
    `;
    const harvestingMonths = await runQuery(harvestingMonthsQuery, {
      plantName: plant.name,
    });

    // Add to schedule for relevant months
    for (const month of scheduleMonths) {
      if (!schedule[month]) {
        schedule[month] = {
          toPlant: [],
          toMaintain: [],
          toHarvest: [],
        };
      }

      // If this is a planting month for this plant, add to planting list
      if (plantingMonths.some((m) => m.month === month)) {
        schedule[month].toPlant.push({
          name: plant.name,
          type: plant.type,
        });
      } else {
        // If not planting, might be maintaining
        schedule[month].toMaintain.push({
          name: plant.name,
          type: plant.type,
        });
      }

      // If this is a harvesting month for this plant, add to harvesting list
      if (harvestingMonths.some((m) => m.month === month)) {
        schedule[month].toHarvest.push({
          name: plant.name,
          type: plant.type,
        });
      }
    }
  }

  return {
    startMonth,
    months: scheduleMonths,
    schedule,
  };
}

/**
 * Generate companion planting recommendations
 * @param {Array<Object>} plants - Plants to generate recommendations for
 * @returns {Array<Object>} Companion planting recommendations
 */
function generateCompanionRecommendations(plants) {
  const recommendations = [];

  // Find plants that are companions to each other
  for (let i = 0; i < plants.length; i++) {
    for (let j = i + 1; j < plants.length; j++) {
      const plant1 = plants[i];
      const plant2 = plants[j];

      // Check if plant2 is in plant1's companions list
      if (plant1.companions && plant1.companions.includes(plant2.name)) {
        recommendations.push({
          plant1: plant1.name,
          plant2: plant2.name,
          benefit: "These plants grow well together",
        });
      }

      // Check if plant1 is in plant2's companions list
      if (plant2.companions && plant2.companions.includes(plant1.name)) {
        // Only add if not already added above (avoid duplicates)
        if (
          !recommendations.some(
            (r) =>
              (r.plant1 === plant1.name && r.plant2 === plant2.name) ||
              (r.plant1 === plant2.name && r.plant2 === plant1.name)
          )
        ) {
          recommendations.push({
            plant1: plant2.name,
            plant2: plant1.name,
            benefit: "These plants grow well together",
          });
        }
      }
    }
  }

  return recommendations;
}
