// filepath: /workspaces/atlantec-ai-2025/src/pages/api/gardening-question/deterministic.js
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";

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
      const context = JSON.stringify(formattedResults, null, 2);

      // Create a prompt template that incorporates both structured data and the optional question
      const userQuestion = question ? question.trim() : null;

      // Build a dynamic prompt based on whether user has a specific question or not
      const promptTemplate = userQuestion
        ? `
You are a gardening assistant specializing in Irish gardens and growing conditions.
Please answer the following specific question from a gardener:

"${userQuestion}"

Use the following structured data about ${plantType.toLowerCase()} plants in ${countyName} 
county with ${soilType} soil during the ${season} season to inform your answer:

${context}

Your response should:
1. Directly address the question asked
2. Use specific plants and data from the structured information
3. Format your response in Markdown with headers, bullet points, and emphasis where appropriate
4. Be educational and practical for Irish gardeners
5. Include specific plant names, their Latin names if available, and practical advice about growing them
6. Mention the ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements where relevant
7. If information about rainfall or temperature is provided, include that as context
8. Format your response as a comprehensive gardening guide
`
        : `
You are a gardening assistant specializing in Irish gardens and growing conditions.
Please provide a comprehensive guide about ${plantType.toLowerCase()} plants that grow well in ${countyName} 
county with ${soilType} soil during the ${season} season, focusing on their ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

Use only the following data to formulate your response:
${context}

Format your response in Markdown with:
- A clear title using # heading
- Sections with ## subheadings
- Bullet points for lists of plants or growing tips
- *Emphasis* for important points
- Latin names in *italics* when available
- A summary section at the end

Include specific plant names, practical advice about growing them, and contextual information about the growing conditions.
`;

      answer = await generateText(promptTemplate, {
        maxTokens: 1024,
        temperature: 0.7,
      });
    } else {
      // Log that no plants were found matching the criteria
      console.log(
        `No plants found matching criteria: ${plantType} in ${countyName} with ${soilType} soil during ${season} season`
      );

      // Instead of just returning a generic message, send the question to the LLM anyway
      const userQuestion = question ? question.trim() : null;

      // Create a prompt that acknowledges the lack of specific data but still provides helpful information
      const promptTemplate = userQuestion
        ? `
You are a gardening assistant specializing in Irish gardens and growing conditions.
The user has asked the following question about gardening in Ireland:

"${userQuestion}"

They were specifically interested in ${plantType.toLowerCase()} plants in ${countyName} county 
with ${soilType} soil during the ${season} season, focusing on ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

Although I don't have specific data matching these exact criteria in my knowledge graph, please provide:
1. General advice about growing ${plantType.toLowerCase()} plants in Irish conditions similar to ${countyName}
2. Information about how ${soilType} soil typically affects plant growth
3. General ${season} season gardening tips for Ireland
4. Typical ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements for ${plantType.toLowerCase()} plants
5. Alternative approaches they might consider
6. Format your response in Markdown with headers, bullet points, and emphasis

Start by acknowledging that you don't have exact matches for their criteria, but then provide helpful general information.
`
        : `
You are a gardening assistant specializing in Irish gardens and growing conditions.

The user was looking for information about ${plantType.toLowerCase()} plants that grow well in ${countyName} 
county with ${soilType} soil during the ${season} season, focusing on their ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements.

Although I don't have specific data matching these exact criteria in my knowledge graph, please provide:
1. A helpful overview about growing ${plantType.toLowerCase()} plants in Irish conditions similar to ${countyName}
2. Information about how ${soilType} soil typically affects plant growth
3. General ${season} season gardening tips for Ireland
4. Typical ${growingProperty
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} requirements for ${plantType.toLowerCase()} plants
5. Suggestions for alternatives that might work better in these conditions
6. Format your response in Markdown with headers, bullet points, and emphasis

Start with an acknowledgment that you don't have exact matches for their criteria, but then provide helpful general information.
`;

      // Send to LLM despite not having specific matches
      answer = await generateText(promptTemplate, {
        maxTokens: 1024,
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
