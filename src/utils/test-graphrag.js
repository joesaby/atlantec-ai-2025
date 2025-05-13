/**
 * Test script for GraphRAG implementation
 *
 * This script tests the GraphRAG assistant by sending a series of questions
 * and validating that the responses contain expected information.
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:4321";

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
async function runTest(testCase) {
  console.log(`Running test: ${testCase.id}`);

  try {
    const response = await fetch(`${BASE_URL}${testCase.endpoint}`, {
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
      console.log(`✅ PASSED: ${testCase.id}`);
      return { status: "passed", testCase };
    } else {
      console.log(`❌ FAILED: ${testCase.id}`);
      console.log(`Missing expected content: ${missingContent.join(", ")}`);
      console.log(`Full answer: ${answer}`);
      return { status: "failed", testCase, missingContent, answer };
    }
  } catch (error) {
    console.error(`❌ ERROR: ${testCase.id}`, error);
    return { status: "error", testCase, error: error.message };
  }
}

/**
 * Run all tests and report results
 */
async function runAllTests() {
  console.log("Starting GraphRAG API Tests...");
  console.log("===============================");

  const results = [];

  for (const testCase of TEST_CASES) {
    const result = await runTest(testCase);
    results.push(result);
  }

  // Summarize results
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log("\nTest Results Summary:");
  console.log("=====================");
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
      });

    process.exit(1);
  } else {
    console.log("\nAll tests passed successfully! 🎉");
    process.exit(0);
  }
}

// Run the tests if this file is executed directly
if (process.argv[1].includes("test-graphrag.js")) {
  runAllTests();
}
