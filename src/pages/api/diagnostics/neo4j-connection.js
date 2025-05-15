/**
 * API endpoint to verify Neo4j Aura connectivity
 */

import {
  verifyConnectivity,
  runQuery,
  closeDriver,
} from "../../../database/neo4j-client.js";

export async function GET() {
  try {
    // Test connectivity
    const connectionStatus = await verifyConnectivity();
    
    let result = { 
      status: connectionStatus
    };
    
    if (connectionStatus.connected) {
      // Run a simple test query if connected
      const queryResult = await runQuery(
        'RETURN "Connected to Neo4j Aura!" AS message'
      );
      result.queryResult = queryResult;
    }
    
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack 
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } finally {
    // Do not close the driver here, as other requests may still need it
    // The driver should only be closed when the application is shutting down
  }
}