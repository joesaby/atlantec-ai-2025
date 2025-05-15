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

// Helper to run Cypher queries with parameter validation
export async function runQuery(query, params = {}) {
  const session = neo4jDriver.session();
  try {
    // Validate and sanitize parameters to prevent malformed queries
    const safeParams = {};
    
    // Extract all required parameters from the query using regex
    const paramRegex = /\$([a-zA-Z0-9_]+)/g;
    const requiredParams = new Set();
    let match;
    
    while ((match = paramRegex.exec(query)) !== null) {
      requiredParams.add(match[1]);
    }
    
    // Check for missing parameters and set default values
    const missingParams = [];
    
    for (const param of requiredParams) {
      if (params[param] === undefined) {
        missingParams.push(param);
      } else {
        // Copy valid parameters to safe params object
        safeParams[param] = params[param];
      }
    }
    
    // Handle missing parameters
    if (missingParams.length > 0) {
      console.error(`Missing required parameters: ${missingParams.join(', ')}`);
      
      // Add default values for certain common parameters
      const defaultValues = {
        'sunExposure': 'Full Sun',
        'county': 'Dublin',
        'plantType': []
      };
      
      // Add default values for missing parameters where possible
      for (const param of missingParams) {
        if (defaultValues[param] !== undefined) {
          console.warn(`Using default value for missing parameter: ${param} = ${defaultValues[param]}`);
          safeParams[param] = defaultValues[param];
        } else {
          // For parameters with no defaults, throw an error
          throw new Error(`Missing required parameter: ${param}`);
        }
      }
    }
    
    // Execute the query with validated parameters
    const result = await session.run(query, safeParams);
    
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
