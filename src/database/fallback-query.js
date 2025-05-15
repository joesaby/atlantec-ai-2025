/**
 * Fallback Query Module
 *
 * This module provides a mechanism to progressively relax query parameters
 * when the initial query returns no results.
 */

import { neo4jDriver } from "./neo4j-client.js";

/**
 * Executes a query with fallback mechanisms that progressively relax constraints
 * until results are found or all fallback options are exhausted.
 *
 * @param {Object} params - The initial query parameters
 * @param {string} params.countyName - The county name
 * @param {string} params.plantType - The plant type
 * @param {string} params.soilType - The soil type
 * @param {string} params.season - The season
 * @param {string} params.growingProperty - The growing property to query for
 * @param {Function} buildQuery - Function that builds a Cypher query from parameters
 * @returns {Object} - Results and debug information about the query process
 */
export async function executeWithFallback(params, buildQuery) {
  // Make a copy of the original parameters for reference
  const originalParams = { ...params };

  // Track the fallback iterations
  const fallbackAttempts = [];

  // Start with all parameters
  let currentParams = { ...params };
  let result = await executeQuery(currentParams, buildQuery);

  // Log the first attempt
  fallbackAttempts.push({
    attempt: 1,
    params: { ...currentParams },
    resultCount: result.records.length,
    query: result.query,
  });

  // If we got results on the first try, return them
  if (result.records.length > 0) {
    return {
      success: true,
      records: result.records,
      query: result.query,
      params: currentParams,
      fallbackUsed: false,
      fallbackAttempts,
    };
  }

  // Start fallback process - try removing one parameter at a time
  const fallbackStrategies = [
    // Strategy 1: Remove soil type constraint
    () => {
      const newParams = { ...currentParams, soilType: null };
      return {
        params: newParams,
        description: `Removed soil type (${currentParams.soilType}) constraint`,
      };
    },

    // Strategy 2: Remove plant type constraint
    () => {
      const newParams = { ...currentParams, plantType: null };
      return {
        params: newParams,
        description: `Removed plant type (${currentParams.plantType}) constraint`,
      };
    },

    // Strategy 3: Remove season constraint
    () => {
      const newParams = { ...currentParams, season: null };
      return {
        params: newParams,
        description: `Removed season (${currentParams.season}) constraint`,
      };
    },

    // Strategy 4: Keep only county and plant type
    () => {
      const newParams = {
        ...currentParams,
        soilType: null,
        season: null,
      };
      return {
        params: newParams,
        description: "Kept only county and plant type constraints",
      };
    },

    // Strategy 5: Keep only county and soil type
    () => {
      const newParams = {
        ...currentParams,
        plantType: null,
        season: null,
      };
      return {
        params: newParams,
        description: "Kept only county and soil type constraints",
      };
    },

    // Strategy 6: Keep only county
    () => {
      const newParams = {
        ...currentParams,
        plantType: null,
        soilType: null,
        season: null,
      };
      return {
        params: newParams,
        description: "Kept only county constraint",
      };
    },

    // Strategy 7: Remove county, keep others
    () => {
      const newParams = {
        ...currentParams,
        countyName: null,
      };
      return {
        params: newParams,
        description: `Removed county (${currentParams.countyName}) constraint`,
      };
    },

    // Strategy 8: Use only plant type
    () => {
      const newParams = {
        ...currentParams,
        countyName: null,
        soilType: null,
        season: null,
      };
      return {
        params: newParams,
        description: "Kept only plant type constraint",
      };
    },

    // Strategy 9: Most basic query, minimal constraints
    () => {
      const newParams = {
        countyName: null,
        plantType: null,
        soilType: null,
        season: null,
        growingProperty: currentParams.growingProperty,
      };
      return {
        params: newParams,
        description: "Used minimal constraints, only keeping growing property",
      };
    },
  ];

  // Try each fallback strategy in sequence until we get results
  for (let i = 0; i < fallbackStrategies.length; i++) {
    const strategy = fallbackStrategies[i];
    const { params: newParams, description } = strategy();
    currentParams = newParams;

    // Execute query with new params
    result = await executeQuery(currentParams, buildQuery);

    // Log this attempt
    fallbackAttempts.push({
      attempt: i + 2, // +2 because we already did attempt 1
      params: { ...currentParams },
      resultCount: result.records.length,
      description,
      query: result.query,
    });

    // If we got results, break out of the loop
    if (result.records.length > 0) {
      break;
    }
  }

  // Return results with fallback information
  return {
    success: result.records.length > 0,
    records: result.records,
    query: result.query,
    originalParams,
    currentParams,
    fallbackUsed: result.records.length > 0 && fallbackAttempts.length > 1,
    fallbackAttempts,
  };
}

/**
 * Helper function to execute a single query
 *
 * @param {Object} params - Query parameters
 * @param {Function} buildQuery - Function to build Cypher query
 * @returns {Object} - Query results
 */
async function executeQuery(params, buildQuery) {
  const query = buildQuery(params);
  console.log(`Executing query with params:`, params);
  console.log(`Query: ${query}`);

  const session = neo4jDriver.session();
  let records = [];

  try {
    const result = await session.run(query);
    records = result.records || [];

    // Format records for easier consumption
    const formattedRecords = records.map((record) => {
      const recordObj = {};
      record.keys.forEach((key) => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });

    return {
      records: formattedRecords,
      query,
    };
  } finally {
    await session.close();
  }
}

/**
 * Utility function to build a custom Cypher query based on available parameters
 * This allows for dynamic query generation when some parameters are null
 *
 * @param {Object} params - Query parameters, some may be null
 * @param {string} nodeType - The primary node type to query
 * @param {string} propertyName - The property to filter on
 * @returns {string} - A Cypher query
 */
export function buildDynamicQuery(params, nodeType, propertyName) {
  // Start with basic MATCH clause
  let query = `MATCH (n:${nodeType})`;
  const whereConditions = [];

  // Add conditions based on available parameters
  if (params[propertyName]) {
    whereConditions.push(`n.${propertyName} = "${params[propertyName]}"`);
  }

  // Add WHERE clause if we have conditions
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(" AND ")}`;
  }

  // Return limited results
  query += ` RETURN n LIMIT 10`;

  return query;
}
