/**
 * API endpoint for testing the GraphRAG implementation
 */

// Test cases with questions and expected content in answers
const TEST_CASES = [
  {
    id: "basic-recommendation",
    question: "What vegetables grow well in County Cork?",
    context: {
      county: "Cork",
      sunExposure: "Full Sun",
      soilType: "",
      gardenType: "Vegetable Garden",
    },
    expectedContent: ["Cork", "vegetable"],
    endpoint: "/api/gardening-question",
  },
  {
    id: "companion-planting",
    question: "What are good companion plants for potatoes?",
    context: {
      county: "Dublin",
      sunExposure: "Full Sun",
      soilType: "",
      gardenType: "Vegetable Garden",
    },
    expectedContent: ["potato", "companion"],
    endpoint: "/api/gardening-question",
  },
  {
    id: "native-plants",
    question: "Can you recommend native Irish plants for my garden?",
    context: {
      county: "Galway",
      sunExposure: "Partial Shade",
      soilType: "Peat",
      gardenType: "Wildlife Garden",
    },
    expectedContent: ["native", "Irish"],
    endpoint: "/api/gardening-question",
  },
  {
    id: "soil-advice",
    question: "How should I prepare clay soil for planting?",
    context: {
      county: "Kildare",
      sunExposure: "Full Sun",
      soilType: "Clay",
      gardenType: "Vegetable Garden",
    },
    expectedContent: ["clay", "soil", "improve", "drainage"],
    endpoint: "/api/gardening-question",
  },
];

/**
 * Run a single test case
 */
async function runTest(testCase, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}${testCase.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: testCase.question,
        context: testCase.context,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const answer = data.answer.toLowerCase();

    // Check if all expected content is present in the answer
    const missingContent = testCase.expectedContent.filter(
      (keyword) => !answer.includes(keyword.toLowerCase())
    );

    if (missingContent.length === 0) {
      return { 
        status: "passed", 
        testCase,
        answer
      };
    } else {
      return { 
        status: "failed", 
        testCase, 
        missingContent, 
        answer 
      };
    }
  } catch (error) {
    return { 
      status: "error", 
      testCase, 
      error: error.message 
    };
  }
}

export async function GET(request) {
  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    const results = [];
    
    for (const testCase of TEST_CASES) {
      const result = await runTest(testCase, baseUrl);
      results.push(result);
    }

    // Summarize results
    const passed = results.filter((r) => r.status === "passed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const errors = results.filter((r) => r.status === "error").length;

    const summary = {
      total: results.length,
      passed,
      failed,
      errors,
      allPassed: failed === 0 && errors === 0
    };

    return new Response(JSON.stringify({
      summary,
      results
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}