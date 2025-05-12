/**
 * Improved test script for Neo4j gardening database queries
 * This script focuses on practical garden-specific queries with better error handling
 */

import {
  verifyConnectivity,
  runQuery,
  closeDriver,
} from "./database/neo4j-client.js";

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
    name: "Get plants with their suitable soil types (direct node relationships)",
    query: `
      MATCH (p:Plant)-[:GROWS_WELL_IN]->(s:SoilType)
      RETURN p.name AS plantName, s AS suitableSoil
      LIMIT 15
    `,
    params: {},
  },
  {
    name: "Count plants by type (or missing type)",
    query: `
      MATCH (p:Plant)
      RETURN CASE WHEN p.type IS NULL THEN 'Unclassified' ELSE p.type END AS plantType,
             count(p) AS count
      ORDER BY count DESC
    `,
    params: {},
  },
  {
    name: "Get potentially good plants for various soil types using node IDs",
    query: `
      MATCH (p:Plant)-[:GROWS_WELL_IN]->(s)
      WHERE s:SoilType
      RETURN p.name AS plantName, 
             p.type AS plantType,
             id(s) AS soilNodeId
      ORDER BY p.name
      LIMIT 15
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

/**
 * Run improved gardening-specific queries
 */
async function runImprovedGardeningQueries() {
  try {
    // First verify connectivity
    console.log("Testing Neo4j connection...");
    const connectionStatus = await verifyConnectivity();

    if (!connectionStatus.connected) {
      console.error(
        "❌ Failed to connect to Neo4j database. Check credentials and network."
      );
      console.error(`Error: ${connectionStatus.error}`);
      return;
    }

    console.log("✅ Successfully connected to Neo4j Aura database.");
    console.log("\nRunning improved gardening queries...\n");

    // Run each gardening query
    for (const query of improvedGardeningQueries) {
      console.log(`\n📊 QUERY: ${query.name}`);
      console.log(`Cypher: ${query.query.trim().replace(/\n\s*/g, " ")}`);

      try {
        const startTime = Date.now();
        const results = await runQuery(query.query, query.params);
        const duration = Date.now() - startTime;

        console.log(`✅ Query completed in ${duration}ms`);
        console.log(`Results (${results.length} records):`);

        if (results.length > 0) {
          // Display results as a formatted table if there are records
          console.table(results.slice(0, 15)); // Limit to 15 rows for readability

          if (results.length > 15) {
            console.log(`... and ${results.length - 15} more records`);
          }
        } else {
          console.log("No results returned");
        }
      } catch (error) {
        console.error(`❌ Query failed: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Always close the driver to release resources
    console.log("\nClosing Neo4j connection...");
    await closeDriver();
    console.log("Connection closed.");
  }
}

// Run the improved gardening-specific queries
runImprovedGardeningQueries();
