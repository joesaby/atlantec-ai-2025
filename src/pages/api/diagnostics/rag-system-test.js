/**
 * API endpoint to test the RAG (Retrieval-Augmented Generation) system
 */

import {
  answerGardeningQuestion,
  getSeasonalRecommendations,
  getPlantRecommendations,
} from "../../../utils/rag-system.js";
import { verifyConnectivity, closeDriver } from "../../../database/neo4j-client.js";

// Get the current month for context
const getCurrentMonthAndSeason = () => {
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
  return {
    currentMonth,
    currentSeason: monthsToSeasons[currentMonth] || "Spring"
  };
};

export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const county = url.searchParams.get('county') || 'Dublin';
    const testType = url.searchParams.get('test') || 'all';
    
    // First verify database connectivity
    const dbStatus = await verifyConnectivity();

    if (!dbStatus.connected) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Failed to connect to Neo4j database",
        dbStatus
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { currentMonth, currentSeason } = getCurrentMonthAndSeason();
    const result = { dbStatus };

    // Only run the tests requested
    try {
      if (testType === 'all' || testType === 'questions') {
        // Test questions that use different aspects of the graph database
        const testQuestions = [
          {
            title: "Question about a specific plant",
            question: "When should I plant potatoes in Ireland?",
            context: { county },
          },
          {
            title: "Question about companion planting",
            question: "What plants grow well with cabbage?",
            context: { soilType: "Loam" },
          },
          {
            title: "Question about seasonal gardening",
            question: `What should I plant in ${currentMonth}?`,
            context: { county },
          },
          {
            title: "Question about soil types",
            question: "What plants grow well in clay soil?",
            context: {},
          },
        ];

        // Process each test question
        const questionResults = [];
        for (const test of testQuestions) {
          const start = Date.now();
          const answer = await answerGardeningQuestion(test.question, test.context);
          const duration = Date.now() - start;
          
          questionResults.push({
            title: test.title,
            question: test.question,
            context: test.context,
            answer: answer.answer,
            sourceFacts: answer.sourceFacts || [],
            entities: answer.entities || {},
            duration
          });
        }
        
        result.questions = questionResults;
      }

      if (testType === 'all' || testType === 'seasonal') {
        // Test seasonal recommendations
        const seasonalRecs = await getSeasonalRecommendations(currentMonth, {
          county,
        });
        
        result.seasonal = {
          month: currentMonth,
          season: currentSeason,
          plantsToPlant: seasonalRecs.plantsToPlant || [],
          plantsToHarvest: seasonalRecs.plantsToHarvest || [],
          seasonalTip: seasonalRecs.seasonalTip || ""
        };
      }

      if (testType === 'all' || testType === 'plants') {
        // Test plant recommendations
        const plantCriteria = {
          plantType: "Vegetable",
          plantingMonth: currentMonth,
        };

        const plantRecs = await getPlantRecommendations(plantCriteria);
        
        result.plants = {
          criteria: plantCriteria,
          recommendations: plantRecs
        };
      }
      
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        status: "error",
        message: error.message,
        stack: error.stack,
        dbStatus
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    // Close the database connection
    await closeDriver();
  }
}