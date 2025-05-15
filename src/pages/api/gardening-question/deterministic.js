// filepath: /workspaces/atlantec-ai-2025/src/pages/api/gardening-question/deterministic.js
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";

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

    // Validate all required parameters are present
    if (!countyName || !plantType || !soilType || !season || !growingProperty) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters. Please provide countyName, plantType, soilType, season, and growingProperty.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generate a deterministic Cypher query based on the parameters
    let cypherQuery;

    // Different query patterns based on what we're looking for
    if (
      growingProperty === "harvestSeason" ||
      growingProperty === "growingSeason"
    ) {
      // Query for seasonal information
      cypherQuery = `
        MATCH (county:County {name: "${countyName}"})
        MATCH (plant:Plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)
        MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType {name: "${soilType}"})
        MATCH (plant)-[:${
          growingProperty === "harvestSeason" ? "HARVEST_IN" : "PLANT_IN"
        }]->(month:Month)
        WHERE month.season = "${season}" AND plant.type = "${plantType}"
        RETURN plant.name as plantName, plant.latinName as latinName, plant.description as description, 
               plant.${growingProperty} as seasonInfo, month.name as specificMonth, 
               soil.name as soilName, soil.characteristics as soilCharacteristics
        ORDER BY month.order ASC
      `;
    } else if (
      growingProperty === "waterNeeds" ||
      growingProperty === "sunNeeds"
    ) {
      // Query for growing requirements
      cypherQuery = `
        MATCH (county:County {name: "${countyName}"})
        MATCH (plant:Plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)
        MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType {name: "${soilType}"})
        WHERE plant.type = "${plantType}"
        RETURN plant.name as plantName, plant.latinName as latinName, plant.description as description, 
               plant.${growingProperty} as requirements, soil.name as soilName, 
               soil.characteristics as soilCharacteristics, 
               gc.rainfallMm as rainfall, gc.avgTempC as temperature
        ORDER BY plant.name ASC
      `;
    } else {
      // General query for soil preference or other properties
      cypherQuery = `
        MATCH (county:County {name: "${countyName}"})
        MATCH (plant:Plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)
        MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType {name: "${soilType}"})
        WHERE plant.type = "${plantType}"
        RETURN plant.name as plantName, plant.latinName as latinName, plant.description as description, 
               plant.${growingProperty} as propertyValue, soil.name as soilName, 
               soil.characteristics as soilCharacteristics
        ORDER BY plant.name ASC
      `;
    }

    console.log("Executing Cypher query:", cypherQuery);

    // Execute the Cypher query
    const session = neo4jDriver.session();
    let result;

    try {
      result = await session.run(cypherQuery);
    } finally {
      await session.close();
    }

    const records = result.records || [];

    // Format results
    const formattedResults = records.map((record) => {
      const recordObj = {};
      record.keys.forEach((key) => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });

    // Generate natural language response using the structured data
    let answer;

    if (formattedResults.length > 0) {
      // Limit to a reasonable number of results
      const limitedResults = formattedResults.slice(0, 5);
      const context = JSON.stringify(limitedResults, null, 1);

      // More comprehensive prompt - balanced detail level
      const userQuestion = question ? question.trim() : null;

      // Improved prompt with system instruction - more detailed but still efficient
      const promptTemplate = userQuestion
        ? `${GRAPHRAG_SYSTEM_INSTRUCTION}

Question: "${userQuestion}"
About: ${plantType} plants in ${countyName} with ${soilType} soil during ${season} season
Focus: ${growingProperty.replace(/([A-Z])/g, " $1").toLowerCase()}

Data:
${context}

Provide a comprehensive answer with specific advice for Irish gardening conditions.
Include plant names in italic and use descriptive examples that reference the data.
Format with Markdown using appropriate headings, lists, and structured sections.`
        : `${GRAPHRAG_SYSTEM_INSTRUCTION}

Create a guide about ${plantType} plants in ${countyName} with ${soilType} soil during ${season} season
Focus on ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements

Data:
${context}

Provide comprehensive information with specific examples from the data.
Include growing techniques, seasonal considerations, and care instructions.
Format using Markdown with clear headings, lists, and organized sections.`;

      answer = await generateText(promptTemplate, {
        maxTokens: 768, // Increased from 512 to allow more detailed responses
        temperature: 0.7,
      });
    } else {
      // Log that no plants were found matching the criteria
      console.log(
        `No plants found matching criteria: ${plantType} in ${countyName} with ${soilType} soil during ${season} season`
      );

      // More comprehensive fallback prompt
      const userQuestion = question ? question.trim() : null;

      // Improved fallback prompt - more balanced
      const promptTemplate = userQuestion
        ? `${GRAPHRAG_SYSTEM_INSTRUCTION}

Question: "${userQuestion}"
No specific data found for ${plantType} plants in ${countyName} with ${soilType} soil during ${season} season
Focus area: ${growingProperty.replace(/([A-Z])/g, " $1").toLowerCase()}

Provide informative general gardening advice for Irish conditions.
Include practical tips on soil preparation, planting techniques, and seasonal considerations.
Suggest similar plants that might work well in these conditions.
Format with Markdown using appropriate structure and organization.`
        : `${GRAPHRAG_SYSTEM_INSTRUCTION}

No specific data found for ${plantType} plants in ${countyName} with ${soilType} soil during ${season} season

Provide general guidance on:
- Growing similar plants in Irish conditions
- Working with ${soilType} soil in ${countyName}
- ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} considerations during ${season}
- Alternative plants that might thrive in these conditions

Include practical advice and format using Markdown with clear sections.`;

      // Send to LLM despite not having specific matches with adjusted token count
      answer = await generateText(promptTemplate, {
        maxTokens: 640, // Increased from 1024 to allow more complete responses
        temperature: 0.7,
      });
    }

    return new Response(
      JSON.stringify({
        answer,
        results: formattedResults,
        query: cypherQuery,
        params: {
          countyName,
          plantType,
          soilType,
          season,
          growingProperty,
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
