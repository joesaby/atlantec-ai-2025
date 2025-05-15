// filepath: /workspaces/atlantec-ai-2025/src/pages/api/gardening-question/deterministic.js
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";
import { executeWithFallback } from "../../../database/fallback-query.js";
import { plants as localPlants } from "../../../data/plants.js"; // Import local plant data

// System instruction for gardening focus
const GRAPHRAG_SYSTEM_INSTRUCTION = `You are Bloom's GraphRAG system, an expert Irish gardening assistant powered by a knowledge graph.

STRICT TOPIC POLICY:
- You MUST ONLY process gardening-related queries about plants, soil, gardening tasks, etc.
- For non-gardening topics, respond: "I'm Bloom, your gardening assistant. I can only help with gardening-related questions."
- NEVER provide responses about politics, technology, news, or other non-gardening topics
- Keep all responses focused on Irish gardening practices and conditions

Your gardening expertise covers:
- Irish native and non-native plants suitable for Irish gardens
- Irish soil types and growing conditions by county
- Plant relationships (companions, antagonists)
- Seasonal gardening tasks and timing
- Sustainable gardening practices`;

export async function POST({ request }) {
  try {
    const {
      countyName,
      plantType,
      soilType,
      season,
      growingProperty,
      question,
    } = await request.json();

    // Check if any user-provided question is gardening-related using system instruction
    if (question) {
      const topicCheckPrompt = `
${GRAPHRAG_SYSTEM_INSTRUCTION}

QUERY: "${question}"

TASK: Determine if this is a gardening-related query that I should respond to.
If it IS gardening-related, respond with "GARDENING: YES"
If it is NOT gardening-related, respond with "GARDENING: NO"

Answer with ONLY "GARDENING: YES" or "GARDENING: NO" and nothing else.`;

      const topicCheckResponse = await generateText(topicCheckPrompt, {
        maxTokens: 16,
        temperature: 0.1,
      });

      const isGardeningTopic = topicCheckResponse.includes("GARDENING: YES");

      // Reject non-gardening queries
      if (!isGardeningTopic) {
        console.log(`Rejecting non-gardening query: "${question}"`);
        return new Response(
          JSON.stringify({
            answer:
              "I'm Bloom, your gardening assistant. I can only help with gardening-related questions. Please ask me something about plants, gardening, or sustainable garden practices.",
            isGardeningTopic: false,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Validate required parameters are present
    if (!countyName || !plantType) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters. Please provide countyName and plantType.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Use default values for optional parameters if not provided
    const params = {
      countyName,
      plantType,
      soilType: soilType || "",
      season: season || "",
      growingProperty: growingProperty || "general", // Default value
    };

    // Function to build a Cypher query based on parameters
    // Uses only properties that actually exist in the database
    const buildQuery = (params) => {
      let cypherQuery = `MATCH (county:County {name: "${params.countyName}"})`;

      // Basic county-plant relationship for suitability
      cypherQuery += `\nMATCH (county)-[:suitableFor]->(plant:Plant)`;

      // Add soil type filter if provided
      if (params.soilType) {
        cypherQuery += `\nMATCH (soil:SoilType {name: "${params.soilType}"})`;
        cypherQuery += `\nMATCH (plant)-[:GROWS_IN]->(soil)`;
      }

      // Add season filter if provided
      if (params.season) {
        const seasonMonths = getMonthsForSeason(params.season);
        if (seasonMonths && seasonMonths.length > 0) {
          cypherQuery += `\nMATCH (plant)-[:plantIn|harvestIn]->(month:Month)`;
          cypherQuery += `\nWHERE month.name IN [${seasonMonths
            .map((m) => `"${m}"`)
            .join(", ")}]`;
        }
      }

      // Filter plants by type using the WHERE clause
      if (params.plantType === "Vegetable") {
        cypherQuery += params.season
          ? `\nAND plant.name IN ["Potato", "Cabbage", "Kale", "Leek", "Onion"]`
          : `\nWHERE plant.name IN ["Potato", "Cabbage", "Kale", "Leek", "Onion"]`;
      } else if (params.plantType === "Wildflower") {
        cypherQuery += params.season
          ? `\nAND plant.name IN ["Irish Wildflower Mix", "Irish Primrose"]`
          : `\nWHERE plant.name IN ["Irish Wildflower Mix", "Irish Primrose"]`;
      } else if (params.plantType === "Tree") {
        cypherQuery += params.season
          ? `\nAND plant.name IN ["Hawthorn"]`
          : `\nWHERE plant.name IN ["Hawthorn"]`;
      }

      // Add optional matches for additional data based on growingProperty
      if (params.growingProperty === "pollinators") {
        cypherQuery += `\nOPTIONAL MATCH (plant)-[:ATTRACTS]->(pollinator:PollinatorType)`;
      } else if (params.growingProperty === "soilPreference") {
        cypherQuery += `\nOPTIONAL MATCH (plant)-[:GROWS_IN]->(soilType:SoilType)`;
      } else if (params.growingProperty === "growingCondition") {
        cypherQuery += `\nOPTIONAL MATCH (plant)-[:PREFERS]->(condition:GrowingCondition)`;
      } else if (params.growingProperty === "plantingSeason") {
        cypherQuery += `\nOPTIONAL MATCH (plant)-[:plantIn]->(plantMonth:Month)`;
      } else if (params.growingProperty === "harvestSeason") {
        cypherQuery += `\nOPTIONAL MATCH (plant)-[:harvestIn]->(harvestMonth:Month)`;
      }

      // Return clause with all collected data
      cypherQuery += `\nRETURN DISTINCT plant.name as plantName, plant.id as plantId, 
                      plant.color as plantColor, plant.size as plantSize`;

      // Add collection operations based on growingProperty
      if (params.growingProperty === "pollinators") {
        cypherQuery += `,\nCOLLECT(DISTINCT pollinator.name) as pollinators`;
      } else {
        cypherQuery += `,\n[] as pollinators`;
      }

      if (params.growingProperty === "soilPreference") {
        cypherQuery += `,\nCOLLECT(DISTINCT soilType.name) as soilTypes`;
      } else {
        cypherQuery += `,\n[] as soilTypes`;
      }

      if (params.growingProperty === "growingCondition") {
        cypherQuery += `,\nCOLLECT(DISTINCT condition.name) as growingConditions`;
      } else {
        cypherQuery += `,\n[] as growingConditions`;
      }

      if (params.growingProperty === "plantingSeason") {
        cypherQuery += `,\nCOLLECT(DISTINCT plantMonth.name) as plantingMonths`;
      } else {
        cypherQuery += `,\n[] as plantingMonths`;
      }

      if (params.growingProperty === "harvestSeason") {
        cypherQuery += `,\nCOLLECT(DISTINCT harvestMonth.name) as harvestMonths`;
      } else {
        cypherQuery += `,\n[] as harvestMonths`;
      }

      cypherQuery += `\nORDER BY plantName ASC`;

      return cypherQuery;
    };

    // Helper function to map seasons to their corresponding months
    function getMonthsForSeason(season) {
      switch (season.toLowerCase()) {
        case "spring":
          return ["March", "April", "May"];
        case "summer":
          return ["June", "July", "August"];
        case "autumn":
          return ["September", "October", "November"];
        case "winter":
          return ["December", "January", "February"];
        default:
          return null;
      }
    }

    console.log("Executing Cypher query with fallback mechanism");

    // Use the fallback mechanism to execute the query with progressive relaxation
    const fallbackResult = await executeWithFallback(params, buildQuery);

    const records = fallbackResult.records || [];
    console.log(
      `Query returned ${records.length} results ${
        fallbackResult.fallbackUsed
          ? "after using fallback"
          : "on first attempt"
      }`
    );

    // Format results and enhance with local data
    const formattedResults = [];

    // Create a map of local plants by name for quick lookups
    const plantNameMap = new Map();
    localPlants.forEach((plant) => {
      plantNameMap.set(plant.commonName.toLowerCase(), plant);
    });

    // Enhance Neo4j results with local plant data
    records.forEach((record) => {
      if (record.plantName) {
        const localPlant = plantNameMap.get(record.plantName.toLowerCase());

        // Create a merged record with data from Neo4j and local plants
        const enhancedRecord = {
          // Neo4j data (guaranteed to exist)
          plantName: record.plantName,
          plantId: record.plantId,

          // Optional Neo4j data
          pollinators: record.pollinators || [],
          soilTypes: record.soilTypes || [],
          growingConditions: record.growingConditions || [],
          plantingMonths: record.plantingMonths || [],
          harvestMonths: record.harvestMonths || [],
        };

        // Add local plant data if available
        if (localPlant) {
          enhancedRecord.latinName = localPlant.latinName;
          enhancedRecord.description = localPlant.description;
          enhancedRecord.waterNeeds = localPlant.waterNeeds;
          enhancedRecord.sunNeeds = localPlant.sunNeeds;
          enhancedRecord.soilPreference = localPlant.soilPreference;
          enhancedRecord.nativeToIreland = localPlant.nativeToIreland;
          enhancedRecord.isPerennial = localPlant.isPerennial;
          enhancedRecord.harvestSeason = localPlant.harvestSeason;
          enhancedRecord.imageUrl = localPlant.imageUrl;
          enhancedRecord.sustainabilityRating = localPlant.sustainabilityRating;
          enhancedRecord.waterConservationRating =
            localPlant.waterConservationRating;
          enhancedRecord.biodiversityValue = localPlant.biodiversityValue;
        }

        formattedResults.push(enhancedRecord);
      }
    });

    // Generate natural language response using the structured data
    let answer;

    const GARDENING_STRICT_GUIDELINES = `You are an expert gardening assistant focused EXCLUSIVELY on gardening topics.

STRICT RESPONSE POLICY:
- You MUST ONLY respond to gardening-related queries. For ANY non-gardening topic, respond ONLY with: "I'm Bloom, your gardening assistant. I can only help with gardening-related questions. Please ask me something about plants, gardening, or sustainable garden practices."
- You must NEVER provide information on illegal plants, controlled substances, or any topic outside of legitimate garden plants and practices.
- You must NEVER engage in discussions about politics, news, technology, personal advice, or any non-gardening topics.
- If you're unsure whether a query is gardening-related, treat it as non-gardening and provide the standard response above.

Your gardening responses MUST be:
- Friendly, warm and personal - use conversational language and connect with the user
- Use "you" and "your garden" to make advice feel tailored to the specific user
- Brief and to the point (especially for task-related queries)
- Helpful and specific to Irish growing conditions
- Tailored to Irish climate zones, weather patterns, and native plants
- Informed by Irish soil types and local pest management strategies

Focus on delivering practical gardening advice:
- Use bullet points for lists instead of paragraphs
- Provide specific gardening actions rather than general information
- Skip introductory phrases like "As an Irish gardening assistant..."
- Avoid repetition of the user's question
- Address the user directly and conversationally
- Add occasional Irish expressions or terminology when appropriate

SUSTAINABILITY GUIDANCE:
When users ask about sustainability in gardening contexts:
- Provide specific information on carbon footprint savings from growing plants
- Mention water conservation benefits for Irish gardens
- Highlight biodiversity benefits of certain garden plants
- Explain gardening practices that align with UN Sustainable Development Goals
- Offer practical sustainable gardening tips specific to Irish conditions
- Be encouraging and positive about the environmental benefits of home gardening
- Indicate SHOWING_SUSTAINABILITY_CARDS in your response for sustainability queries

For plant recommendations:
- Provide a very brief introduction (1 sentence)
- Mention that you're showing plant cards
- Indicate SHOWING_PLANT_CARDS in your response

For gardening tasks:
- Keep responses to 1-2 short sentences
- Direct users to the calendar view: "Check the calendar view to see your monthly tasks."
- Indicate SHOWING_TASK_CARDS in your response

For soil information:
- Provide 1-2 sentences about the soil type
- Direct users to view detailed information: "View soil details for more information."

Format your response as plain text with one of these indicators at the very end if appropriate: SHOWING_PLANT_CARDS, SHOWING_TASK_CARDS, or SHOWING_SUSTAINABILITY_CARDS.`;

    if (formattedResults.length > 0) {
      // Limit to a reasonable number of results
      const limitedResults = formattedResults.slice(0, 5);
      const context = JSON.stringify(limitedResults, null, 1);

      // More comprehensive prompt - balanced detail level
      const userQuestion = question ? question.trim() : null;

      // Build fallback explanation if needed
      let fallbackExplanation = "";
      if (fallbackResult.fallbackUsed) {
        const successfulStrategy = fallbackResult.fallbackAttempts.find(
          (attempt) => attempt.resultCount > 0
        );

        fallbackExplanation = `\n\nNOTE: The user's exact search criteria (${countyName} county, ${plantType}${
          params.soilType ? ", " + params.soilType + " soil" : ""
        }${
          params.season ? ", " + params.season + " season" : ""
        }) didn't return any results.
Instead, I found results by ${successfulStrategy.description}.
Please be clear about this in your response and explain that while these aren't exact matches to their criteria, they're the closest available information.`;
      }

      // Build a dynamic prompt based on whether user has a specific question or not
      const promptTemplate = userQuestion
        ? `${GARDENING_STRICT_GUIDELINES}

User question: "${userQuestion}"

Context information from Irish gardening knowledge graph about ${plantType.toLowerCase()} plants in ${countyName} 
county${params.soilType ? " with " + params.soilType + " soil" : ""}${
            params.season ? " during the " + params.season + " season" : ""
          }:
${context}${fallbackExplanation}

Answer the user's question using ONLY the information in the context above.
Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response.`
        : `${GARDENING_STRICT_GUIDELINES}

Please provide information about ${plantType.toLowerCase()} plants that grow well in ${countyName} 
county${params.soilType ? " with " + params.soilType + " soil" : ""}${
            params.season ? " during the " + params.season + " season" : ""
          }, focusing on their ${(params.growingProperty || "general growing")
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

Context information from Irish gardening knowledge graph:
${context}${fallbackExplanation}

Provide information using ONLY the data in the context above.
Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response.`;

      answer = await generateText(promptTemplate, {
        maxTokens: 768, // Increased from 512 to allow more detailed responses
        temperature: 0.7,
      });
    } else {
      // No plants were found even after all fallback attempts
      console.log(
        `No plants found matching criteria or any fallback criteria: ${plantType} in ${countyName}${
          params.soilType ? " with " + params.soilType + " soil" : ""
        }${params.season ? " during " + params.season + " season" : ""}`
      );

      // Create a prompt that acknowledges the lack of specific data
      const promptTemplate = `${GARDENING_STRICT_GUIDELINES}

The user searched for ${plantType.toLowerCase()} plants in ${countyName} county 
${params.soilType ? "with " + params.soilType + " soil" : ""}${
        params.season ? " during the " + params.season + " season" : ""
      }${
        params.growingProperty
          ? ", focusing on " +
            params.growingProperty.replace(/([A-Z])/g, " $1").toLowerCase() +
            " requirements"
          : ""
      }.

Unfortunately, we don't have any data matching these criteria in our knowledge graph, 
even after trying several fallback searches with fewer constraints.

The user was specifically interested in ${plantType.toLowerCase()} plants in ${countyName} county 
with ${soilType} soil during the ${season} season, focusing on ${growingProperty
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()} considerations during ${season}
- Alternative plants that might thrive in these conditions

Remember to follow all the guidelines above for formatting and tone.`;

      // Send to LLM despite not having specific matches
      answer = await generateText(promptTemplate, {
        maxTokens: 640, // Increased from 1024 to allow more complete responses
        temperature: 0.7,
      });
    }

    return new Response(
      JSON.stringify({
        answer,
        results: formattedResults,
        query: fallbackResult.query,
        fallbackInfo: {
          fallbackUsed: fallbackResult.fallbackUsed,
          originalParams: fallbackResult.originalParams,
          finalParams: fallbackResult.currentParams,
          attempts: fallbackResult.fallbackAttempts,
        },
        params: {
          countyName,
          plantType,
          soilType: params.soilType,
          season: params.season,
          growingProperty: params.growingProperty,
          question,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in deterministic GraphRAG endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process your query. Please try again.",
        message: error.message,
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
