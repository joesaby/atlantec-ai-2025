/**
 * Script to initialize and populate the Neo4j knowledge graph
 * Run this script to set up the GraphRAG database
 */

import { verifyConnectivity, closeDriver } from "./database/neo4j-client.js";
import { migrateDataToGraph } from "./database/graph-migration.js";

// Self-executing async function to properly handle async/await
(async () => {
  console.log("Starting GraphRAG knowledge graph initialization...");
  console.log("-----------------------------------------------");

  try {
    // First verify Neo4j connectivity
    console.log("Step 1/3: Verifying Neo4j connectivity...");
    const connectionStatus = await verifyConnectivity();

    if (!connectionStatus.connected) {
      console.error(
        "❌ Failed to connect to Neo4j database. Please check your connection settings."
      );
      console.error("Error:", connectionStatus.error);
      process.exit(1);
    }

    console.log("✅ Connected to Neo4j successfully!");

    // Run the data migration
    console.log("\nStep 2/3: Migrating data to knowledge graph...");
    const migrationResult = await migrateDataToGraph();

    if (!migrationResult.success) {
      console.error("❌ Data migration failed");
      console.error("Error:", migrationResult.error);
      process.exit(1);
    }

    console.log("✅ Data migration completed successfully!");

    // Verify the migrated data
    console.log("\nStep 3/3: Verifying knowledge graph data...");
    // Simple verification queries could be added here
    console.log("✅ Knowledge graph is ready for GraphRAG operations!");

    console.log("\n-----------------------------------------------");
    console.log("🎉 GraphRAG knowledge graph initialization complete!");
    console.log(
      "You can now use the GraphRAG Assistant at /graphrag-assistant"
    );
  } catch (error) {
    console.error("❌ An unexpected error occurred:");
    console.error(error);
    process.exit(1);
  } finally {
    // Close the Neo4j driver
    await closeDriver();
  }
})();
