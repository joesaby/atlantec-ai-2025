/**
 * API endpoint for testing plant recommendations
 */

// Test cases for plant recommendations with different parameters
const RECOMMENDATION_TEST_CASES = [
  {
    id: "dublin-full-sun",
    parameters: {
      county: "Dublin",
      sunExposure: "Full Sun",
      nativeOnly: false,
      plantType: ["vegetable"],
    },
    expectedContent: ["cabbage", "potato", "onion"],
    minimumRecommendations: 3,
    endpoint: "/api/graph-recommendations",
  },
  {
    id: "galway-native-only",
    parameters: {
      county: "Galway",
      sunExposure: "Partial Shade",
      nativeOnly: true,
      plantType: ["flower"],
    },
    expectedContent: ["irish", "native"],
    minimumRecommendations: 1,
    endpoint: "/api/graph-recommendations",
  },
  {
    id: "cork-fruit-plants",
    parameters: {
      county: "Cork",
      sunExposure: "Full Sun",
      nativeOnly: false,
      plantType: ["fruit"],
    },
    expectedContent: ["apple", "berry", "fruit"],
    minimumRecommendations: 2,
    endpoint: "/api/graph-recommendations",
  },
];

/**
 * Run a single test case for plant recommendations
 */
async function runRecommendationTest(testCase, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}${testCase.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCase.parameters),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.recommendations || [];

    // Check if we have the minimum number of recommendations
    if (recommendations.length < testCase.minimumRecommendations) {
      return {
        status: "failed",
        testCase,
        reason: "Insufficient recommendations",
        expected: testCase.minimumRecommendations,
        actual: recommendations.length,
        recommendations
      };
    }

    // Check if any of the expected content is present
    const allRecommendationsText = JSON.stringify(recommendations).toLowerCase();
    const foundContent = testCase.expectedContent.filter((keyword) =>
      allRecommendationsText.includes(keyword.toLowerCase())
    );

    if (foundContent.length > 0) {
      return { 
        status: "passed", 
        testCase,
        foundKeywords: foundContent,
        recommendations
      };
    } else {
      return {
        status: "failed",
        testCase,
        reason: "Missing expected content",
        expectedContent: testCase.expectedContent,
        recommendations
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
    
    for (const testCase of RECOMMENDATION_TEST_CASES) {
      const result = await runRecommendationTest(testCase, baseUrl);
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