// Import directly from the src directory using Node.js-style paths
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";
import { determineCardTypeFromQuery } from "../../../utils/rag-system.js";

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

// Helper function to clean the query from markdown formatting and validate it's a Cypher query
function cleanCypherQuery(query) {
  // Ensure we have a string
  if (!query || typeof query !== "string") {
    console.warn("Invalid query input:", query);
    return "MATCH (n:Plant) WHERE n.name = 'NO_RESULTS' RETURN n LIMIT 0";
  }

  // Remove markdown code block syntax if present
  const cleaned = query
    .replace(/```cypher\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/```sql\n?/g, "")
    .trim();

  // Check if it's actually a Cypher query by looking for common Cypher keywords
  const cypherKeywords = [
    "MATCH",
    "RETURN",
    "WHERE",
    "CREATE",
    "MERGE",
    "WITH",
    "OPTIONAL",
  ];
  const isCypherQuery = cypherKeywords.some((keyword) =>
    cleaned.toUpperCase().includes(keyword)
  );

  if (!isCypherQuery) {
    console.warn(
      "Generated text does not appear to be a valid Cypher query:",
      cleaned
    );
    // Return a simple query that will work but return no results
    return "MATCH (n:Plant) WHERE n.name = 'NO_RESULTS' RETURN n LIMIT 0";
  }

  return cleaned;
}

/**
 * Helper function to run a function with a timeout
 */
async function withTimeout(
  fn,
  timeoutMs = 10000,
  timeoutMessage = "Operation timed out"
) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

export async function POST({ request }) {
  const requestStartTime = Date.now();
  console.log(
    `Starting stochastic endpoint processing at ${new Date().toISOString()}...`
  );
  try {
    const { question, conversationHistory } = await request.json();
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

    // Log the topic check response for debugging
    console.log("Topic check response:", topicCheckResponse);

    // Use a stricter check to ensure we're getting proper responses
    const isGardeningTopic = topicCheckResponse.trim() === "GARDENING: YES";

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

TASK: Create a valid Neo4j Cypher query for the gardening question: "${question}"

NODE LABELS: Plant, County, SoilType, GrowingCondition, Season, Month
RELATIONSHIPS: GROWS_IN, HAS_SOIL, SUITABLE_FOR, PLANTED_IN, HARVEST_IN, ATTRACTS, COMPANION_TO, ANTAGONISTIC_TO

QUERY PATTERNS:
- Vegetables in county: MATCH (plant:Plant)-[:SUITABLE_FOR]->(:GrowingCondition)-[:SUITABLE_FOR]->(county:County {name: "CountyName"})
- Companions: MATCH (plant:Plant {name: "X"})-[:COMPANION_TO]->(companion:Plant)
- Soil types: MATCH (plant:Plant)-[:GROWS_WELL_IN]->(soil:SoilType)
- Planting times: MATCH (plant:Plant)-[:PLANT_IN]->(month:Month)

RESPONSE FORMAT INSTRUCTIONS:
- Begin your response with the word 'MATCH' or another valid Cypher keyword 
- Provide ONLY a valid Cypher query with no explanations
- Your query MUST include a RETURN clause
- LIMIT all results to 5-10 items maximum
- Do not include any text, comments, or markdown formatting

Example valid response format:
MATCH (p:Plant)-[:GROWS_WELL_IN]->(s:SoilType)
WHERE s.name = 'Clay'
RETURN p.name as PlantName, p.type as PlantType
LIMIT 5
`;

    console.log("Sending prompt to Vertex AI...");
    const rawGeneratedQuery = await generateText(cypherPrompt, {
      maxTokens: 512, // Reduced from 1024
      temperature: 0.2,
    });
    console.log("Received response from Vertex AI");

    // Log the raw response for debugging
    console.log("Raw response from Vertex AI:", rawGeneratedQuery);

    // Clean the query from any markdown formatting and validate it's a proper Cypher query
    const generatedQuery = cleanCypherQuery(rawGeneratedQuery);
    console.log("Cleaned Cypher query:", generatedQuery);

    // Step 3: Execute the generated Cypher query against Neo4j
    console.log("Connecting to Neo4j...");
    const session = neo4jDriver.session();
    console.log("Neo4j session created");

    let contextData = [];
    try {
      // Additional safety check to ensure we don't execute invalid queries
      if (generatedQuery.trim().startsWith("I'm Bloom")) {
        console.log(
          "Detected assistant response instead of Cypher query, using safe fallback query"
        );
        // Use a safe fallback query that will simply return no results
        generatedQuery =
          "MATCH (n:Plant) WHERE n.name = 'NO_RESULTS' RETURN n LIMIT 0";
      }

      console.log("Executing Cypher query...");

      // Extract all parameter names from the query
      const paramRegex = /\$([a-zA-Z0-9_]+)/g;
      const requiredParams = new Set();
      let match;

      while ((match = paramRegex.exec(generatedQuery)) !== null) {
        requiredParams.add(match[1]);
      }

      // Declare query parameters and result outside of conditional blocks
      let queryParams = {};
      let result;

      // Check if parameters are required
      if (requiredParams.size === 0) {
        console.log("No parameters required for this query");

        // Execute without parameters
        result = await withTimeout(
          async () => session.run(generatedQuery),
          10000, // 10 second timeout
          "Neo4j query execution timed out"
        );
      } else {
        // Set default values for common parameters
        const defaultValues = {
          // County-related parameter naming variations
          county: "Dublin",
          countyName: "Dublin",
          County: "Dublin",
          countyCork: "Cork",
          countyGalway: "Galway",
          countyKerry: "Kerry",
          countyMayo: "Mayo",

          // Growing conditions
          sunExposure: "Full Sun",
          soilType: "Loam",
          soilPH: "6.5",

          // Plant-related parameters
          plantType: "Vegetable",
          plantName: "Potato",
          plant: "Potato",

          // Time-related parameters
          season: "Summer",
          month: new Date().toLocaleString("en-US", { month: "long" }),
          currentMonth: new Date().toLocaleString("en-US", { month: "long" }),

          // General catch-all parameters
          limit: 10,
          name: "Vegetable",
        };

        try {
          // Detect user context from question to set better defaults
          const { question } = await request.json();
          if (question) {
            const lowerQuestion = question.toLowerCase();

            // Extract county name if mentioned
            const countyMatches = lowerQuestion.match(/county\s+([a-z]+)/i);
            if (countyMatches && countyMatches[1]) {
              const county =
                countyMatches[1].charAt(0).toUpperCase() +
                countyMatches[1].slice(1);
              defaultValues["county"] = county;
              defaultValues["countyName"] = county;
              defaultValues["County"] = county;
            }

            // Extract plant type if mentioned
            if (lowerQuestion.includes("vegetable"))
              defaultValues["plantType"] = "Vegetable";
            if (lowerQuestion.includes("fruit"))
              defaultValues["plantType"] = "Fruit";
            if (lowerQuestion.includes("flower"))
              defaultValues["plantType"] = "Flower";
            if (lowerQuestion.includes("herb"))
              defaultValues["plantType"] = "Herb";

            // Extract specific plant if mentioned
            const commonPlants = [
              "Potato",
              "Carrot",
              "Cabbage",
              "Tomato",
              "Apple",
              "Rose",
              "Tulip",
            ];
            for (const plant of commonPlants) {
              if (lowerQuestion.includes(plant.toLowerCase())) {
                defaultValues["plantName"] = plant;
                defaultValues["plant"] = plant;
                break;
              }
            }
          }
        } catch (error) {
          console.warn(
            "Error extracting context from question:",
            error.message
          );
          // Continue with default values if there's an error
        }

        // Add parameters needed by the query
        for (const param of requiredParams) {
          if (defaultValues[param] !== undefined) {
            queryParams[param] = defaultValues[param];
            console.log(`Using parameter: ${param} = ${defaultValues[param]}`);
          } else {
            // For any unknown parameter, try to derive a reasonable default
            // First check if it's a compound name that contains a known parameter
            let foundMatch = false;
            for (const [key, value] of Object.entries(defaultValues)) {
              if (param.includes(key)) {
                queryParams[param] = value;
                console.log(
                  `Using derived parameter: ${param} = ${value} (from ${key})`
                );
                foundMatch = true;
                break;
              }
            }

            if (!foundMatch) {
              console.warn(`Unknown parameter: ${param}, using empty string`);
              queryParams[param] = "";
            }
          }
        }

        console.log("Query parameters:", JSON.stringify(queryParams));

        // Execute the query with the prepared parameters
        result = await withTimeout(
          async () => session.run(generatedQuery, queryParams),
          10000, // 10 second timeout
          "Neo4j query execution timed out"
        );
      }
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

    // Determine the card type based on the user's question
    const cardType = determineCardTypeFromQuery(question);
    console.log(`Determined card type: ${cardType}`);

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

      answer = await withTimeout(
        async () =>
          generateText(contextualPrompt, {
            maxTokens: 768, // Increased from 512 to allow more detailed responses
            temperature: 0.7,
          }),
        15000, // 15 second timeout for answer generation
        "Answer generation timed out"
      );
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

      answer = await withTimeout(
        async () =>
          generateText(fallbackPrompt, {
            maxTokens: 512, // Increased from 384 to allow more complete responses
            temperature: 0.7,
          }),
        15000, // 15 second timeout for fallback answer generation
        "Fallback answer generation timed out"
      );
    }

    const executionTime = Date.now() - requestStartTime;
    console.log(`Completed stochastic endpoint in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        answer,
        sourceFacts,
        generatedQuery: rawGeneratedQuery, // Return the original query for debugging
        cleanedQuery: generatedQuery, // Also return the cleaned query
        hasKnowledgeGraphData: hasSufficientData, // Flag indicating if answer came from knowledge graph
        cardType, // Include detected card type for card generation
        contextData: contextData, // Include raw Neo4j results for richer card data
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
    const executionTime = Date.now() - requestStartTime;
    console.error(
      `Error in stochastic endpoint after ${executionTime}ms:`,
      error.message
    );

    return new Response(
      JSON.stringify({
        error: "Failed to process your question. Please try again.",
        message: error.message,
        errorType: error.name,
        executionTime,
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
