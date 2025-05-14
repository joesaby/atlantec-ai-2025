// Import directly from the src directory using Node.js-style paths
import { neo4jDriver } from "../../../database/neo4j-client.js";
import { generateText } from "../../../utils/vertex-client.js";

// Mark this endpoint as server-rendered
export const prerender = false;

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

    // Step 1: Generate a Cypher query using LLM
    console.log("Generating Cypher query with Vertex AI...");
    const cypherPrompt = `
You are an expert in Neo4j and Cypher query language. 
Create a Cypher query to extract information from a garden knowledge graph database about the following question:
"${question}"

The graph database has the following structure:
- Nodes with labels: Plant, County, SoilType, GrowingCondition, Pest, Disease, Season, BeneficialInsect
- Relationships between nodes like: GROWS_IN, HAS_SOIL, SUITABLE_FOR, AFFECTED_BY, TREATED_WITH, PLANTED_IN, ATTRACTS

Plants have properties like:
- name (e.g., "Potato", "Cabbage", "Kale")
- type (e.g., "Vegetable", "Fruit", "Flower", "Tree")
- properties: soilPreference, sunNeeds, waterNeeds, biodiversityValue

Counties have a name property (e.g., "Dublin", "Cork", "Galway").

SoilTypes have properties:
- name (e.g., "Clay", "Loam", "Sandy")
- properties: texture, drainage, nutrients

GrowingCondition nodes connect plants to soil types and counties.

BeneficialInsect nodes have a name property (e.g., "Bee", "Butterfly").

IMPORTANT GUIDELINES:
1. For queries about vegetables and county-specific needs, use:
   MATCH (county:County {name: "CountyName"})
   MATCH (plant:Plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)
   WHERE plant.type = "Vegetable"

2. For queries about companion planting, find plants that share similar growing conditions:
   MATCH (plant1:Plant {name: "Specific Plant"})-[:SUITABLE_FOR]->(condition:GrowingCondition)<-[:SUITABLE_FOR]-(plant2:Plant)
   WHERE NOT plant1 = plant2

3. For questions about soils, use the HAS_SOIL relationship:
   MATCH (soil:SoilType {name: "Clay"})<-[:HAS_SOIL]-(condition:GrowingCondition)<-[:SUITABLE_FOR]-(plant:Plant)

4. For questions about planting times, use the PLANTED_IN relationship:
   MATCH (plant:Plant)-[:PLANTED_IN]->(season:Season {name: "March"})

5. For questions about pollinators, use the ATTRACTS relationship:
   MATCH (plant:Plant)-[:ATTRACTS]->(insect:BeneficialInsect)
   WHERE insect.name IN ["Butterfly", "Bee"]

Return only the Cypher query without any explanation or markdown formatting. Do not use backticks or code blocks.
`;

    console.log("Sending prompt to Vertex AI...");
    const rawGeneratedQuery = await generateText(cypherPrompt, {
      maxTokens: 1024,
      temperature: 0.2,
    });
    console.log("Received response from Vertex AI");

    // Clean the query from any markdown formatting
    const generatedQuery = cleanCypherQuery(rawGeneratedQuery);
    console.log("Cleaned Cypher query:", generatedQuery);

    // Step 2: Execute the generated Cypher query against Neo4j
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
        contextData = result.records.map((record) => {
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

    // Format the retrieved data into a readable context
    const sourceFacts = contextData.map((item) => {
      // Create a human-readable representation of each data item
      return Object.entries(item)
        .map(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        })
        .join(", ");
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

    // Step 3: Generate an answer based on whether we have data or not
    let answer;

    const userQuestion = question ? question.trim() : null;

    if (hasSufficientData) {
      // If we have data, use it to generate a contextual answer
      const formatContext = JSON.stringify(contextData, null, 2);
      const contextualPrompt = userQuestion
        ? `
You are a gardening assistant specializing in Irish gardens and growing conditions.
Please answer the following specific question from a gardener:

"${userQuestion}"

Use the following structured data to inform your answer:

${formatContext}

Your response should:
1. Directly address the question asked.
2. Use specific plants and data from the structured information.
3. Be educational and practical for Irish gardeners.
4. Include specific plant names, their Latin names (e.g., *Malus domestica*), and practical advice about growing them.
5. Mention the requirements where relevant.
6. If information about rainfall or temperature is provided, include that as context.
7. Format your response as a comprehensive gardening guide.

IMPORTANT: Your entire response MUST be in valid Markdown format. This includes:
- Headings (e.g., # Main Title, ## Section, ### Subsection)
- Lists (bulleted using - or * , or numbered using 1.)
- Bold text (e.g., **Important Note**)
- Italic text (e.g., *Latin name*)
- Paragraphs (separated by a blank line in the Markdown source)
`
        : `
You are a gardening assistant specializing in Irish gardens and growing conditions.
Please provide a comprehensive guide about plants that grow well in Irish conditions.

Use only the following data to formulate your response:
${formatContext}

Include specific plant names, practical advice about growing them, and contextual information about the growing conditions.

IMPORTANT: Your entire response MUST be in valid Markdown format. Ensure you use:
- A clear title (e.g., # Main Title)
- Sections with subheadings (e.g., ## Section, ### Subsection)
- Bullet points for lists (e.g., - Tip 1, * Tip 2) or numbered lists (e.g., 1. Step 1)
- Emphasis using *italics* (e.g., *Malus domestica*) or **bold** (e.g., **Critical Information**).
- Paragraphs (separated by a blank line in the Markdown source).
- A summary section at the end.
`;

      answer = await generateText(contextualPrompt, {
        maxTokens: 1024,
        temperature: 0.7,
      });
    } else {
      // If we don't have data, use the LLM directly without mentioning limitations
      const fallbackPrompt = userQuestion
        ? `
You are a gardening assistant specializing in Irish gardens and growing conditions.
The user has asked the following question about gardening in Ireland:

"${userQuestion}"

Although I don't have specific data matching these exact criteria in my knowledge graph, please provide:
1. General advice about growing plants in Irish conditions
2. Information about how soil typically affects plant growth
3. General gardening tips for Ireland
4. Typical requirements for plants
5. Alternative approaches they might consider

Start by acknowledging that you don't have exact matches for their criteria, but then provide helpful general information.

IMPORTANT: Your entire response MUST be in valid Markdown format. Use Markdown for all formatting, including:
- Headings (e.g., # Main Title, ## Section)
- Bullet points (e.g., - Advice 1)
- Emphasis (e.g., *important point* or **very important**)
- Paragraphs (separated by a blank line in the Markdown source)
`
        : `
You are a gardening assistant specializing in Irish gardens and growing conditions.

The user was looking for information about plants that grow well in Irish conditions.

Although I don't have specific data matching these exact criteria in my knowledge graph, please provide:
1. A helpful overview about growing plants in Irish conditions
2. Information about how soil typically affects plant growth
3. General gardening tips for Ireland
4. Typical requirements for plants
5. Suggestions for alternatives that might work better in these conditions

Start with an acknowledgment that you don't have exact matches for their criteria, but then provide helpful general information.

IMPORTANT: Your entire response MUST be in valid Markdown format. Use Markdown for all formatting, including:
- Headings (e.g., # Main Title, ## Section)
- Bullet points (e.g., - Advice 1)
- Emphasis (e.g., *important point* or **very important**)
- Paragraphs (separated by a blank line in the Markdown source)
`;

      answer = await generateText(fallbackPrompt, {
        maxTokens: 1024,
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
