/**
 * Test script for GraphRAG plant recommendations
 *
 * This script tests the plant recommendation engine by sending different requests
 * and validating that the responses contain expected plant types.
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:4321";

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
async function runRecommendationTest(testCase) {
  console.log(`Running recommendation test: ${testCase.id}`);

  try {
    const response = await fetch(`${BASE_URL}${testCase.endpoint}`, {
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
      console.log(`❌ FAILED: ${testCase.id}`);
      console.log(
        `Expected at least ${testCase.minimumRecommendations} recommendations, got ${recommendations.length}`
      );
      return {
        status: "failed",
        testCase,
        reason: "Insufficient recommendations",
        actual: recommendations.length,
      };
    }

    // Check if any of the expected content is present
    const allRecommendationsText =
      JSON.stringify(recommendations).toLowerCase();
    const foundContent = testCase.expectedContent.filter((keyword) =>
      allRecommendationsText.includes(keyword.toLowerCase())
    );

    if (foundContent.length > 0) {
      console.log(`✅ PASSED: ${testCase.id}`);
      return { status: "passed", testCase };
    } else {
      console.log(`❌ FAILED: ${testCase.id}`);
      console.log(
        `None of the expected content was found: ${testCase.expectedContent.join(
          ", "
        )}`
      );
      return {
        status: "failed",
        testCase,
        reason: "Missing expected content",
        recommendations,
      };
    }
  } catch (error) {
    console.error(`❌ ERROR: ${testCase.id}`, error);
    return { status: "error", testCase, error: error.message };
  }
}

/**
 * Run all recommendation tests and report results
 */
async function runAllRecommendationTests() {
  console.log("Starting GraphRAG Plant Recommendation Tests...");
  console.log("=============================================");

  const results = [];

  for (const testCase of RECOMMENDATION_TEST_CASES) {
    const result = await runRecommendationTest(testCase);
    results.push(result);
  }

  // Summarize results
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log("\nRecommendation Test Results Summary:");
  console.log("===================================");
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Errors: ${errors}`);

  if (failed > 0 || errors > 0) {
    console.log("\nFailed Tests:");
    results
      .filter((r) => r.status !== "passed")
      .forEach((result) => {
        console.log(`- ${result.testCase.id}: ${result.status.toUpperCase()}`);
        if (result.reason) {
          console.log(`  Reason: ${result.reason}`);
        }
      });

    return false;
  } else {
    console.log("\nAll recommendation tests passed successfully! 🎉");
    return true;
  }
}

// Export for use in the main test script
export { runAllRecommendationTests };

// Run the tests if this file is executed directly
if (process.argv[1].includes("test-plant-recommendations.js")) {
  runAllRecommendationTests();
}
