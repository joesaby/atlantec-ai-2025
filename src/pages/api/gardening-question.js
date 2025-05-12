/**
 * API route for handling gardening questions using the GraphRAG system
 */

import { answerGardeningQuestion } from "../../utils/rag-system.js";

// Mark this endpoint as server-rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    const { question, context = {} } = await request.json();

    if (!question) {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process the month/season if not provided
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });
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

    // Enhance context with season and month information
    const enhancedContext = {
      ...context,
      currentMonth: context.currentMonth || currentMonth,
      currentSeason: context.currentSeason || currentSeason,
    };

    // Use the RAG system to answer the question
    const response = await answerGardeningQuestion(question, enhancedContext);

    return new Response(
      JSON.stringify({
        answer: response.answer,
        sourceFacts: response.sourceFacts,
        entities: response.entities,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing gardening question:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process your question. Please try again later.",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
