/**
 * Neo4j client for connecting to Neo4j Aura
 */

import neo4j from "neo4j-driver";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Neo4j Aura connection credentials from .env
const NEO4J_URI =
  process.env.NEO4J_URI || "neo4j+s://20647e1f.databases.neo4j.io";
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "";

// Create a driver instance
export const neo4jDriver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true,
  }
);

// Helper function to validate database connection
export async function verifyConnectivity() {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log("Connected to Neo4j Aura successfully!");
    return { connected: true };
  } catch (error) {
    console.error("Neo4j connection error:", error);
    return { connected: false, error: error.message };
  }
}

// Helper to run Cypher queries
export async function runQuery(query, params = {}) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => {
      return record.keys.reduce((obj, key) => {
        const value = record.get(key);
        // Handle Neo4j node objects
        if (value && value.properties) {
          obj[key] = value.properties;
        } else {
          obj[key] = value;
        }
        return obj;
      }, {});
    });
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Graceful shutdown
export async function closeDriver() {
  await neo4jDriver.close();
}
