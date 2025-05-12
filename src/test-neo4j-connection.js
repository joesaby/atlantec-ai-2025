/**
 * Test script to verify Neo4j Aura connectivity
 */

import {
  verifyConnectivity,
  runQuery,
  closeDriver,
} from "./database/neo4j-client.js";

async function testConnection() {
  try {
    // Test connectivity
    const connectionStatus = await verifyConnectivity();
    console.log("Connection status:", connectionStatus);

    if (connectionStatus.connected) {
      // Run a simple test query if connected
      console.log("Running test query...");
      const result = await runQuery(
        'RETURN "Connected to Neo4j Aura!" AS message'
      );
      console.log("Query result:", result);
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Close the driver
    await closeDriver();
  }
}

// Run the test
testConnection();
