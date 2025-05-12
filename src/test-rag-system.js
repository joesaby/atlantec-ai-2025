/**
 * Test script for the RAG (Retrieval-Augmented Generation) system
 * This demonstrates how the Irish Garden Assistant uses graph-based knowledge retrieval
 * combined with Vertex AI to answer gardening questions
 */

import {
  answerGardeningQuestion,
  getSeasonalRecommendations,
  getPlantRecommendations,
} from "./utils/rag-system.js";
import { verifyConnectivity, closeDriver } from "./database/neo4j-client.js";

// Get the current month for context
const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
const monthsToSeasons = {
  January: "Winter",
  February: "Winter",
  March: "Spring",
  April: "Spring",
  May: "Spring",
  June: "Summer",
  July: "Summer",
  August: "Summer",
  September: "Autumn",
  October: "Autumn",
  November: "Autumn",
  December: "Winter",
};
const currentSeason = monthsToSeasons[currentMonth] || "Spring";

/**
 * Run test questions through the RAG system
 */
async function testRagSystem() {
  try {
    // First verify database connectivity
    console.log("Connecting to Neo4j database...");
    const dbStatus = await verifyConnectivity();

    if (!dbStatus.connected) {
      console.error(
        "❌ Failed to connect to Neo4j database. Check credentials and network."
      );
      return;
    }

    console.log("✅ Successfully connected to Neo4j database.");
    console.log("\n------------- TESTING RAG SYSTEM -------------\n");

    // Test questions that use different aspects of the graph database
    const testQuestions = [
      {
        title: "Question about a specific plant",
        question: "When should I plant potatoes in Ireland?",
        context: { county: "Dublin" },
      },
      {
        title: "Question about companion planting",
        question: "What plants grow well with cabbage?",
        context: { soilType: "Loam" },
      },
      {
        title: "Question about seasonal gardening",
        question: `What should I plant in ${currentMonth}?`,
        context: { county: "Cork" },
      },
      {
        title: "Question about soil types",
        question: "What plants grow well in clay soil?",
        context: {},
      },
    ];

    // Process each test question
    for (const test of testQuestions) {
      console.log(`\n📝 ${test.title}:`);
      console.log(`Question: "${test.question}"`);

      if (Object.keys(test.context).length > 0) {
        console.log("Context:", JSON.stringify(test.context));
      }

      console.log("\nProcessing...");
      const start = Date.now();

      const result = await answerGardeningQuestion(test.question, test.context);

      const duration = Date.now() - start;
      console.log(`(Completed in ${duration}ms)\n`);

      console.log("Answer:");
      console.log(result.answer);

      console.log("\nSource facts used:");
      if (result.sourceFacts && result.sourceFacts.length > 0) {
        result.sourceFacts.forEach((fact) => console.log(`- ${fact}`));
      } else {
        console.log("No specific source facts used.");
      }

      console.log("\nEntities extracted:");
      console.log(JSON.stringify(result.entities, null, 2));

      console.log("\n------------------------------------------\n");
    }

    // Test seasonal recommendations
    console.log(
      "\n------------- TESTING SEASONAL RECOMMENDATIONS -------------\n"
    );

    console.log(`Getting recommendations for ${currentMonth}...`);
    const seasonalRecs = await getSeasonalRecommendations(currentMonth, {
      county: "Dublin",
    });

    console.log(
      `\n🌱 Plants to sow/plant in ${currentMonth} (${seasonalRecs.season}):`
    );
    if (seasonalRecs.plantsToPlant.length > 0) {
      seasonalRecs.plantsToPlant.forEach((plant) => {
        console.log(`- ${plant.name} (${plant.type}): ${plant.description}`);
      });
    } else {
      console.log("No planting recommendations for this month.");
    }

    console.log(`\n🌽 Plants to harvest in ${currentMonth}:`);
    if (seasonalRecs.plantsToHarvest.length > 0) {
      seasonalRecs.plantsToHarvest.forEach((plant) => {
        console.log(`- ${plant.name} (${plant.type}): ${plant.description}`);
      });
    } else {
      console.log("No harvesting recommendations for this month.");
    }

    console.log("\n🌱 Seasonal Tip from Vertex AI:");
    console.log(seasonalRecs.seasonalTip);

    // Test plant recommendations
    console.log(
      "\n------------- TESTING PLANT RECOMMENDATIONS -------------\n"
    );

    const plantCriteria = {
      plantType: "Vegetable",
      plantingMonth: currentMonth,
    };

    console.log(`Finding vegetables that can be planted in ${currentMonth}...`);
    const plantRecs = await getPlantRecommendations(plantCriteria);

    console.log(`\nFound ${plantRecs.length} recommended plants:`);

    if (plantRecs.length > 0) {
      plantRecs.forEach((plant) => {
        console.log(`\n🌱 ${plant.name} (${plant.type})`);
        console.log(`   Description: ${plant.description}`);
        console.log(`   Planting months: ${plant.plantingMonths.join(", ")}`);
        console.log(
          `   Harvesting months: ${plant.harvestingMonths.join(", ")}`
        );

        if (plant.companionPlants && plant.companionPlants.length > 0) {
          console.log(
            `   Companion plants: ${plant.companionPlants.join(", ")}`
          );
        }

        if (plant.plantsToAvoid && plant.plantsToAvoid.length > 0) {
          console.log(`   Plants to avoid: ${plant.plantsToAvoid.join(", ")}`);
        }
      });
    } else {
      console.log("No plants match the criteria.");
    }

    console.log("\n------------------------------------------\n");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Close the database connection
    console.log("Closing database connection...");
    await closeDriver();
    console.log("Connection closed.");
  }
}

// Run the test
testRagSystem();
