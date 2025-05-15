// Import directly from the src directory using Node.js-style paths
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";

// Mark this endpoint as server-rendered
export const prerender = false;

// System instruction for gardening focus
const GRAPHRAG_SYSTEM_INSTRUCTION = `You are Bloom's GraphRAG system, an expert Irish gardening assistant powered by a knowledge graph.

STRICT TOPIC POLICY:
- You MUST ONLY process gardening-related queries about plants, soil, gardening tasks, etc.
- For non-gardening topics, respond: "I'm Bloom, your gardening assistant. I can only help with gardening-related questions."
- NEVER provide responses about politics, technology, news, or other non-gardening topics
- When generating Cypher queries, ensure they are properly formatted and limited in scope
- Keep all responses focused on Irish gardening practices and conditions

Your gardening knowledge encompasses:
- Irish native and non-native plants suitable for Irish gardens
- Irish soil types and growing conditions
- Plant relationships (companions, antagonists)
- Seasonal gardening tasks and timing
- Sustainable gardening practices`;

// Helper function to clean the query from markdown formatting
function cleanCypherQuery(query) {
  // Remove markdown code block syntax if present
  return query
    .replace(/```cypher\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/```sql\n?/g, "")
    .trim();
}

export async function POST({ request }) {
  console.log("Starting stochastic endpoint processing...");
  try {
    const { question } = await request.json();
    console.log(`Received question: "${question}"`);

    // Step 1: Check if the query is gardening-related with a mini-prompt
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

    // Step 2: Generate Cypher query (continuing with gardening-related queries)
    console.log("Generating Cypher query with Vertex AI...");
    const cypherPrompt = `
${GRAPHRAG_SYSTEM_INSTRUCTION}

Create a concise Neo4j Cypher query for the gardening question: "${question}"

NODE LABELS: Plant, County, SoilType, GrowingCondition, Season, Month
RELATIONSHIPS: GROWS_IN, HAS_SOIL, SUITABLE_FOR, PLANTED_IN, HARVEST_IN, ATTRACTS, COMPANION_TO, ANTAGONISTIC_TO

QUERY PATTERNS:
- Vegetables in county: MATCH (plant:Plant)-[:SUITABLE_FOR]->(:GrowingCondition)-[:SUITABLE_FOR]->(county:County {name: "CountyName"})
- Companions: MATCH (plant:Plant {name: "X"})-[:COMPANION_TO]->(companion:Plant)
- Soil types: MATCH (plant:Plant)-[:GROWS_WELL_IN]->(soil:SoilType)
- Planting times: MATCH (plant:Plant)-[:PLANT_IN]->(month:Month)

Return query only, no explanations.
LIMIT all results to 5-10 items maximum.`;

    console.log("Sending prompt to Vertex AI...");
    const rawGeneratedQuery = await generateText(cypherPrompt, {
      maxTokens: 512, // Reduced from 1024
      temperature: 0.2,
    });
    console.log("Received response from Vertex AI");

    // Clean the query from any markdown formatting
    const generatedQuery = cleanCypherQuery(rawGeneratedQuery);
    console.log("Cleaned Cypher query:", generatedQuery);

    // Step 3: Execute the generated Cypher query against Neo4j
    console.log("Connecting to Neo4j...");
    const session = neo4jDriver.session();
    console.log("Neo4j session created");

    let contextData = [];
    try {
      console.log("Executing Cypher query...");
      const result = await session.run(generatedQuery);
      console.log(
        "Cypher query executed",
        result.records
          ? `with ${result.records.length} records`
          : "with no results"
      );

      // Process Neo4j results into a usable context format
      if (result.records && result.records.length > 0) {
        // Limit the number of records processed to avoid overly large contexts
        const limitedRecords = result.records.slice(0, 10);
        contextData = limitedRecords.map((record) => {
          const recordObj = {};
          record.keys.forEach((key) => {
            const value = record.get(key);
            if (typeof value === "object" && value !== null) {
              // Handle Neo4j node objects
              if (value.properties) {
                recordObj[key] = value.properties;
              } else {
                recordObj[key] = value;
              }
            } else {
              recordObj[key] = value;
            }
          });
          return recordObj;
        });
      }
    } finally {
      await session.close();
      console.log("Neo4j session closed");
    }

    // Format the retrieved data into a readable context - limit the number of facts
    const sourceFacts = contextData.slice(0, 5).map((item) => {
      // Create a more concise representation of each data item
      const factParts = [];
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "object" && value !== null) {
          // Only include name, type and 1-2 key properties
          if (value.name) factParts.push(`${key}: ${value.name}`);
          if (value.type) factParts.push(`type: ${value.type}`);
        } else {
          factParts.push(`${key}: ${value}`);
        }
      }
      return factParts.join(", ");
    });

    // Check if we have sufficient data from the knowledge graph
    const hasSufficientData = contextData.length > 0;

    // Log to console if data is missing but don't tell the user
    if (!hasSufficientData) {
      console.log(`[KNOWLEDGE GAP] No data found for question: "${question}"`);
      console.log(`[KNOWLEDGE GAP] Query used: ${generatedQuery}`);
      console.log(
        `[KNOWLEDGE GAP] Falling back to LLM without knowledge graph context`
      );
    }

    // Step 4: Generate an answer based on whether we have data or not
    let answer;

    const userQuestion = question ? question.trim() : null;

    if (hasSufficientData) {
      // Create a simplified context - only include essential data
      const simplifiedContext = contextData.slice(0, 5).map((item) => {
        // Filter out complex objects and only keep key properties
        const simplified = {};
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === "object" && value !== null && value.properties) {
            simplified[key] = {
              name: value.name || "Unknown",
              type: value.type || "Unknown",
            };
          } else if (typeof value === "object" && value !== null) {
            // Simplify nested objects, keeping only name and type
            const simpleObj = {};
            if (value.name) simpleObj.name = value.name;
            if (value.type) simpleObj.type = value.type;
            simplified[key] = simpleObj;
          } else {
            simplified[key] = value;
          }
        }
        return simplified;
      });

      const formatContext = JSON.stringify(simplifiedContext, null, 1);

      // More balanced prompt - not too verbose but not too short
      const contextualPrompt = userQuestion
        ? `${GRAPHRAG_SYSTEM_INSTRUCTION}

Answer this gardening question: "${userQuestion}"

Use these facts from our Irish gardening database:
${formatContext}

Provide detailed, practical advice specific to Irish growing conditions. 
Include plant names in italic and use descriptive examples.
Format with Markdown using headings, lists, and paragraphs as appropriate.`
        : `${GRAPHRAG_SYSTEM_INSTRUCTION}

Create a gardening guide based on:
${formatContext}

Focus on practical Irish gardening advice with specific examples.
Include growing conditions, seasonal considerations, and care instructions.
Format using Markdown with clear headings and organized sections.`;

      answer = await generateText(contextualPrompt, {
        maxTokens: 768, // Increased from 512 to allow more detailed responses
        temperature: 0.7,
      });
    } else {
      // Balanced fallback prompt - not too brief
      const fallbackPrompt = userQuestion
        ? `${GRAPHRAG_SYSTEM_INSTRUCTION}

Answer: "${userQuestion}"
No specific garden data available. Provide general Irish gardening advice that addresses the question.
Include practical tips, seasonal considerations, and growing conditions common in Ireland.
Use Markdown format with appropriate structure.`
        : `${GRAPHRAG_SYSTEM_INSTRUCTION}

Provide guidance on plants for Irish gardens.
Include information on seasonal considerations, growing conditions, and care instructions.
Format as a helpful guide using Markdown with appropriate headings and structure.`;

      answer = await generateText(fallbackPrompt, {
        maxTokens: 512, // Increased from 384 to allow more complete responses
        temperature: 0.7,
      });
    }

    return new Response(
      JSON.stringify({
        answer,
        sourceFacts,
        generatedQuery: rawGeneratedQuery, // Return the original query for debugging
        cleanedQuery: generatedQuery, // Also return the cleaned query
        hasKnowledgeGraphData: hasSufficientData, // Flag indicating if answer came from knowledge graph
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in stochastic GraphRAG endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process your question. Please try again.",
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
