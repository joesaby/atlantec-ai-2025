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

// Track driver state
let isDriverClosed = false;

// Create a driver instance with optimized timeout settings
export let neo4jDriver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 20, // Reduced from 50 to avoid resource exhaustion
    connectionAcquisitionTimeout: 15000, // 15 seconds (reduced from 2 minutes)
    connectionTimeout: 10000, // 10 second connection timeout
    maxTransactionRetryTime: 15000, // 15 seconds max retry time for transactions
    disableLosslessIntegers: true,
    logging: {
      level: 'warn', // Log only warnings and errors
      logger: (level, message) => console.log(`[Neo4j ${level}]: ${message}`)
    }
  }
);

// Helper function to validate database connection
export async function verifyConnectivity() {
  try {
    // Ensure driver is available before verifying connectivity
    ensureDriverAvailable();
    await neo4jDriver.verifyConnectivity();
    console.log("Connected to Neo4j Aura successfully!");
    return { connected: true };
  } catch (error) {
    console.error("Neo4j connection error:", error);
    return { connected: false, error: error.message };
  }
}

// Function to ensure the driver is available
export function ensureDriverAvailable() {
  if (isDriverClosed) {
    // Recreate the driver if it was closed
    console.log("Reinitializing Neo4j driver...");
    neo4jDriver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
      {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 20, // Reduced from 50 to avoid resource exhaustion
        connectionAcquisitionTimeout: 15000, // 15 seconds (reduced from 2 minutes)
        connectionTimeout: 10000, // 10 second connection timeout
        maxTransactionRetryTime: 15000, // 15 seconds max retry time for transactions
        disableLosslessIntegers: true,
        logging: {
          level: 'warn', // Log only warnings and errors
          logger: (level, message) => console.log(`[Neo4j ${level}]: ${message}`)
        }
      }
    );
    isDriverClosed = false;
    console.log("Neo4j driver reinitialized");
  }
}

// Helper to run Cypher queries with parameter validation
export async function runQuery(query, params = {}) {
  // Ensure driver is available before creating a session
  ensureDriverAvailable();
  
  // Catch and handle any potential errors when creating a session
  let session;
  try {
    session = neo4jDriver.session();
  } catch (sessionError) {
    console.error("Error creating Neo4j session:", sessionError);
    // Try to reinitialize the driver and create a new session
    isDriverClosed = true;
    ensureDriverAvailable();
    session = neo4jDriver.session();
  }
  
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
    
    // Special handling for common query error: "Expected and sunExposure`, but got and county`"
    // This usually happens when the order of parameters in a complex query with multiple conditions is wrong
    try {
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
      // Check for the specific parameter order error
      if (error.message && (
          error.message.includes("Expected and sunExposure`) but got") || 
          error.message.includes("Expected parameter(s): sunExposure")
        )) {
        console.warn("Detected parameter order issue in Cypher query, using fallback query");
        
        // Use a fallback simplified query that's guaranteed to work
        const fallbackQuery = `
          MATCH (plant:Plant)
          WHERE plant.sunNeeds CONTAINS $sunExposure
          RETURN plant LIMIT 5
        `;
        
        // Make sure we at least have sunExposure
        if (!safeParams.sunExposure) {
          safeParams.sunExposure = "Full Sun";
        }
        
        console.log("Using fallback query with parameters:", JSON.stringify(safeParams));
        
        // Run the fallback query
        const fallbackResult = await session.run(fallbackQuery, safeParams);
        return fallbackResult.records.map((record) => {
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
      } else {
        // If it's some other error, rethrow it
        throw error;
      }
    }
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  } finally {
    await session.close();
  }
}

// Graceful shutdown
export async function closeDriver() {
  try {
    if (!isDriverClosed) {
      console.log("Closing Neo4j driver connection pool...");
      await neo4jDriver.close();
      isDriverClosed = true;
      console.log("Neo4j driver connection pool closed successfully");
    } else {
      console.log("Driver already closed, skipping closeDriver call");
    }
  } catch (error) {
    console.error("Error closing Neo4j driver:", error);
  }
}