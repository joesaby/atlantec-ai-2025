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

    const GARDENING_STRICT_GUIDELINES = `You are an expert Irish gardening assistant focused EXCLUSIVELY on gardening topics.

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

      // Improved prompt with system instruction - more detailed but still efficient
      const promptTemplate = userQuestion
        ? `${GARDENING_STRICT_GUIDELINES}

User question: "${userQuestion}"

Context information from Irish gardening knowledge graph about ${plantType.toLowerCase()} plants in ${countyName} 
county with ${soilType} soil during the ${season} season:
${context}

Answer the user's question using ONLY the information in the context above.
Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response.`
        : `${GARDENING_STRICT_GUIDELINES}

Please provide information about ${plantType.toLowerCase()} plants that grow well in ${countyName} 
county with ${soilType} soil during the ${season} season, focusing on their ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

Context information from Irish gardening knowledge graph:
${context}

Provide information using ONLY the data in the context above.
Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response.`;

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
        ? `${GARDENING_STRICT_GUIDELINES}

User question: "${userQuestion}"

The user was specifically interested in ${plantType.toLowerCase()} plants in ${countyName} county 
with ${soilType} soil during the ${season} season, focusing on ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} considerations during ${season}
- Alternative plants that might thrive in these conditions

We don't have specific data matching these exact criteria in our knowledge graph.
Please provide general gardening advice about growing ${plantType.toLowerCase()} plants in Irish conditions similar to ${countyName}.
Focus on ${soilType} soil information and ${season} season gardening tips for Ireland.

Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response if appropriate.`
        : `${GARDENING_STRICT_GUIDELINES}

Request for information about ${plantType.toLowerCase()} plants that grow well in ${countyName} 
county with ${soilType} soil during the ${season} season, focusing on their ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

We don't have specific data matching these exact criteria in our knowledge graph.
Please provide general gardening advice about growing ${plantType.toLowerCase()} plants in Irish conditions similar to ${countyName}.
Focus on ${soilType} soil information and ${season} season gardening tips for Ireland.

Remember to follow all the guidelines above for formatting and tone.
Include SHOWING_PLANT_CARDS at the end of your response if appropriate.`;

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
