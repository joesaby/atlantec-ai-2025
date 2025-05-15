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

/**
 * Helper function to run a function with a timeout
 */
async function withTimeout(fn, timeoutMs = 10000, timeoutMessage = 'Operation timed out') {
  return Promise.race([
    fn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

export async function GET(request) {
  const requestStartTime = Date.now();
  // Set an overall timeout for the entire test suite
  const overallTimeout = setTimeout(() => {
    console.error('RAG system test timeout reached (60 seconds). Forcing process to continue.');
    // We can't actually abort the request, but this log will help diagnose timeouts
  }, 60000); // 60 second overall timeout
  
  try {
    console.log(`Starting rag-system-test at ${new Date().toISOString()}`);
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
          // Wrap the question answering in a timeout
          const answer = await withTimeout(
            async () => answerGardeningQuestion(test.question, test.context),
            15000, // 15 second timeout per question
            `Question "${test.question}" timed out after 15 seconds`
          );
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
        // Test seasonal recommendations with timeout
        const seasonalRecs = await withTimeout(
          async () => getSeasonalRecommendations(currentMonth, { county }),
          10000, // 10 second timeout for seasonal recommendations
          `Seasonal recommendations for ${currentMonth} timed out after 10 seconds`
        );
        
        result.seasonal = {
          month: currentMonth,
          season: currentSeason,
          plantsToPlant: seasonalRecs.plantsToPlant || [],
          plantsToHarvest: seasonalRecs.plantsToHarvest || [],
          seasonalTip: seasonalRecs.seasonalTip || ""
        };
      }

      if (testType === 'all' || testType === 'plants') {
        // Test plant recommendations with timeout
        const plantCriteria = {
          plantType: "Vegetable",
          plantingMonth: currentMonth,
        };

        const plantRecs = await withTimeout(
          async () => getPlantRecommendations(plantCriteria),
          10000, // 10 second timeout for plant recommendations
          `Plant recommendations for ${currentMonth} timed out after 10 seconds`
        );
        
        result.plants = {
          criteria: plantCriteria,
          recommendations: plantRecs
        };
      }
      
      // Clear the overall timeout since we've completed successfully
      clearTimeout(overallTimeout);
      
      console.log(`Completed rag-system-test in ${Date.now() - requestStartTime}ms`);
      
      return new Response(JSON.stringify({
        ...result,
        executionTime: Date.now() - requestStartTime
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      // Clear the timeout on error
      clearTimeout(overallTimeout);
      
      console.error(`Error in rag-system-test after ${Date.now() - requestStartTime}ms:`, error.message);
      
      return new Response(JSON.stringify({
        status: "error",
        message: error.message,
        stack: error.stack,
        dbStatus,
        executionTime: Date.now() - requestStartTime
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    // Clear the timeout on error
    clearTimeout(overallTimeout);
    
    console.error(`Error in rag-system-test after ${Date.now() - requestStartTime}ms:`, error.message);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      stack: error.stack,
      executionTime: Date.now() - requestStartTime
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    // Do not close the driver here, as other requests may still need it
    // The driver should only be closed when the application is shutting down
  }
}