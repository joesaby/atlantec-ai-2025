/**
 * Test Fallback Query Mechanism
 *
 * This script tests the fallback query mechanism that progressively relaxes
 * constraints when initial queries don't return results.
 *
 * Example: A query for Sligo-Clay-Vegetable returns nothing
 * Iteration 2: Sligo-Clay returns nothing
 * Iteration 3: Sligo-Vegetable returns something -> Success
 */

import { executeWithFallback } from "./database/fallback-query.js";
import { verifyConnectivity, closeDriver } from "./database/neo4j-client.js";
import chalk from "chalk";

// Define test cases with parameters unlikely to return direct matches
const testCases = [
  {
    name: "Test Case 1: Sligo-Clay-Vegetable",
    params: {
      countyName: "Sligo",
      plantType: "Vegetable",
      soilType: "Clay",
      season: "Winter",
      growingProperty: "waterNeeds",
    },
  },
  {
    name: "Test Case 2: Dublin-Peat-Tree",
    params: {
      countyName: "Dublin",
      plantType: "Tree",
      soilType: "Peat",
      season: "Summer",
      growingProperty: "sunNeeds",
    },
  },
  {
    name: "Test Case 3: Kerry-Sandy-Wildflower",
    params: {
      countyName: "Kerry",
      plantType: "Wildflower",
      soilType: "Sandy",
      season: "Spring",
      growingProperty: "soilPreference",
    },
  },
];

// Function to build a Cypher query based on parameters - simplified for testing
function buildTestQuery(params) {
  // Different query patterns based on what we're looking for
  if (
    params.growingProperty === "harvestSeason" ||
    params.growingProperty === "growingSeason"
  ) {
    // Query for seasonal information - handle potentially null parameters
    let cypherQuery = `MATCH (plant:Plant)`;
    const whereConditions = [];
    const additionalMatches = [];

    if (params.countyName) {
      additionalMatches.push(`MATCH (county:County {name: "${params.countyName}"})
                              MATCH (plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)`);
    }

    if (params.soilType) {
      additionalMatches.push(
        `MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType {name: "${params.soilType}"})`
      );
    }

    if (params.season) {
      additionalMatches.push(`MATCH (plant)-[:${
        params.growingProperty === "harvestSeason" ? "HARVEST_IN" : "PLANT_IN"
      }]->(month:Month)
      WHERE month.season = "${params.season}"`);
    }

    if (params.plantType) {
      whereConditions.push(`plant.type = "${params.plantType}"`);
    }

    // Add all additional MATCH clauses
    cypherQuery += " " + additionalMatches.join(" ");

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      cypherQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add RETURN clause with appropriate fields
    cypherQuery += `
      RETURN plant.name as plantName, plant.latinName as latinName, plant.description as description
      LIMIT 5
    `;

    return cypherQuery;
  } else {
    // General query for soil preference or other properties - handle potentially null parameters
    let cypherQuery = `MATCH (plant:Plant)`;
    const whereConditions = [];
    const additionalMatches = [];

    if (params.countyName) {
      additionalMatches.push(`MATCH (county:County {name: "${params.countyName}"})
                              MATCH (plant)-[:SUITABLE_FOR]->(gc:GrowingCondition)-[:SUITABLE_FOR]->(county)`);
    }

    if (params.soilType) {
      additionalMatches.push(
        `MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType {name: "${params.soilType}"})`
      );
    }

    if (params.plantType) {
      whereConditions.push(`plant.type = "${params.plantType}"`);
    }

    // Add all additional MATCH clauses
    cypherQuery += " " + additionalMatches.join(" ");

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      cypherQuery += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // Add RETURN clause with appropriate fields
    cypherQuery += `
      RETURN plant.name as plantName, plant.latinName as latinName, plant.description as description
      LIMIT 5
    `;

    return cypherQuery;
  }
}

// Main test function
async function testFallbackQuery() {
  console.log(chalk.blue("=".repeat(80)));
  console.log(chalk.blue.bold("TESTING FALLBACK QUERY MECHANISM"));
  console.log(chalk.blue("=".repeat(80)));

  try {
    // Verify database connection
    const connectionStatus = await verifyConnectivity();
    if (!connectionStatus.connected) {
      console.error(chalk.red("❌ Failed to connect to Neo4j database"));
      return;
    }

    console.log(chalk.green("✅ Connected to Neo4j database"));

    // Run each test case
    for (const testCase of testCases) {
      console.log(chalk.yellow("\n" + "-".repeat(80)));
      console.log(chalk.yellow.bold(`RUNNING ${testCase.name}`));
      console.log(chalk.yellow("-".repeat(80)));

      console.log("Initial Parameters:");
      console.log(JSON.stringify(testCase.params, null, 2));

      // Execute with fallback
      const fallbackResult = await executeWithFallback(
        testCase.params,
        buildTestQuery
      );

      // Print results
      console.log("\nFallback Query Results:");
      console.log(chalk.cyan(`Success: ${fallbackResult.success}`));
      console.log(chalk.cyan(`Fallback Used: ${fallbackResult.fallbackUsed}`));
      console.log(
        chalk.cyan(`Total Attempts: ${fallbackResult.fallbackAttempts.length}`)
      );

      if (fallbackResult.success) {
        console.log(
          chalk.green(`Found ${fallbackResult.records.length} records`)
        );

        // Find which attempt succeeded
        const successfulAttempt = fallbackResult.fallbackAttempts.find(
          (attempt) => attempt.resultCount > 0
        );

        if (successfulAttempt) {
          console.log(
            chalk.green(`Successful on attempt #${successfulAttempt.attempt}`)
          );

          if (successfulAttempt.description) {
            console.log(
              chalk.green(`Strategy: ${successfulAttempt.description}`)
            );
          }

          console.log("Final parameters:");
          console.log(JSON.stringify(fallbackResult.currentParams, null, 2));
        }

        // Show sample of found records
        if (fallbackResult.records.length > 0) {
          console.log("\nSample Results:");
          console.log(
            JSON.stringify(fallbackResult.records.slice(0, 2), null, 2)
          );
        }
      } else {
        console.log(
          chalk.red("❌ No results found after all fallback attempts")
        );
      }

      // Show detailed attempts log
      console.log("\nDetailed Fallback Attempts:");
      fallbackResult.fallbackAttempts.forEach((attempt, index) => {
        const attemptColor = attempt.resultCount > 0 ? chalk.green : chalk.gray;
        console.log(attemptColor(`Attempt #${attempt.attempt}:`));
        console.log(attemptColor(`  Results: ${attempt.resultCount}`));
        if (attempt.description) {
          console.log(attemptColor(`  Strategy: ${attempt.description}`));
        }
        console.log(
          attemptColor(`  Params: ${JSON.stringify(attempt.params)}`)
        );

        // Only show first few lines of query for readability
        const queryExcerpt =
          attempt.query.split("\n").slice(0, 3).join("\n") +
          (attempt.query.split("\n").length > 3 ? "\n..." : "");
        console.log(attemptColor(`  Query: ${queryExcerpt}`));
      });
    }

    console.log(chalk.blue("\n" + "=".repeat(80)));
    console.log(chalk.blue.bold("FALLBACK QUERY TESTING COMPLETED"));
    console.log(chalk.blue("=".repeat(80)));
  } catch (error) {
    console.error(chalk.red("Error running fallback query test:"), error);
  } finally {
    // Close the database connection
    await closeDriver();
  }
}

// Run the test
testFallbackQuery();
