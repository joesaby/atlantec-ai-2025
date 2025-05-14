/**
 * API endpoint for Neo4j gardening database queries diagnostics
 */

import {
  verifyConnectivity,
  runQuery,
  closeDriver,
} from "../../../database/neo4j-client.js";

// Set of improved gardening-specific queries
const improvedGardeningQueries = [
  {
    name: "Get all plants with details",
    query: `
      MATCH (p:Plant)
      RETURN p.name AS name, 
             p.type AS type, 
             p.description AS description
      ORDER BY p.name
    `,
    params: {},
  },
  {
    name: "Get companion planting pairs",
    query: `
      MATCH (p1:Plant)-[:COMPANION_TO]->(p2:Plant)
      RETURN p1.name AS plant, p2.name AS companionPlant,
             "Plant these together for better results" AS recommendation
    `,
    params: {},
  },
  {
    name: "Get plants to avoid planting together",
    query: `
      MATCH (p1:Plant)-[:ANTAGONISTIC_TO]->(p2:Plant)
      RETURN p1.name AS plant, p2.name AS avoidPlanting,
             "These plants should not be planted together" AS warning
    `,
    params: {},
  },
  {
    name: "Get plants that attract pollinators",
    query: `
      MATCH (p:Plant)-[:ATTRACTS]->(pol:PollinatorType)
      RETURN p.name AS plant, collect(pol.name) AS attractsPollinators
      ORDER BY p.name
    `,
    params: {},
  },
  {
    name: "Get counties with soil types",
    query: `
      MATCH (c:County)-[:HAS_DOMINANT_SOIL]->(s:SoilType)
      RETURN c.name AS county, s.type AS dominantSoil,
             CASE WHEN s.type IS NULL THEN "Soil type data needs to be added" ELSE "" END AS note
      ORDER BY c.name
    `,
    params: {},
  },
  {
    name: "Get all soil types",
    query: `
      MATCH (s:SoilType)
      RETURN s.type AS soilType, 
             s.description AS description,
             s.characteristics AS characteristics
    `,
    params: {},
  },
  {
    name: "Get plants with their suitable soil types",
    query: `
      MATCH (p:Plant)-[:GROWS_WELL_IN]->(s:SoilType)
      RETURN p.name AS plantName, s AS suitableSoil
      LIMIT 15
    `,
    params: {},
  },
  {
    name: "Count plants by type",
    query: `
      MATCH (p:Plant)
      RETURN CASE WHEN p.type IS NULL THEN 'Unclassified' ELSE p.type END AS plantType,
             count(p) AS count
      ORDER BY count DESC
    `,
    params: {},
  },
  {
    name: "Get all relationship types in the database",
    query: `
      CALL db.relationshipTypes() 
      YIELD relationshipType
      RETURN relationshipType
      ORDER BY relationshipType
    `,
    params: {},
  },
];

export async function GET() {
  try {
    // First verify connectivity
    const connectionStatus = await verifyConnectivity();

    if (!connectionStatus.connected) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to connect to Neo4j database",
        error: connectionStatus.error
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Run each gardening query and collect results
    const queryResults = [];
    
    for (const query of improvedGardeningQueries) {
      try {
        const startTime = Date.now();
        const results = await runQuery(query.query, query.params);
        const duration = Date.now() - startTime;

        queryResults.push({
          name: query.name,
          success: true,
          duration: duration,
          resultCount: results.length,
          results: results.slice(0, 15), // Limit to 15 rows for readability
          hasMore: results.length > 15
        });
      } catch (error) {
        queryResults.push({
          name: query.name,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      status: "success",
      connection: connectionStatus,
      queries: queryResults
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    // Always close the driver to release resources
    await closeDriver();
  }
}