import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DeterministicQueryCard from "./DeterministicQueryCard";

export default function GraphRagAssistant() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sourceFacts, setSourceFacts] = useState([]);
  const [showSourceFacts, setShowSourceFacts] = useState(false);
  const [isStochastic, setIsStochastic] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [showGeneratedQuery, setShowGeneratedQuery] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const [showQueryResults, setShowQueryResults] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initialize client-side only
  useEffect(() => {
    // Get saved mode from localStorage if available
    try {
      const savedMode = localStorage.getItem("ragMode");
      if (savedMode === "stochastic") {
        setIsStochastic(true);
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }

    // Mark component as mounted (client-side)
    setIsMounted(true);
  }, []);

  // Add new function to verify API availability
  useEffect(() => {
    async function checkApiAvailability() {
      // Changed from /api/direct-auth-test to /api/vertex-auth-test
      console.log(
        "GraphRAG: Checking API availability at /api/vertex-auth-test"
      );
      try {
        const response = await fetch("/api/vertex-auth-test", {
          method: "GET",
        });

        console.log("GraphRAG: API check response status:", response.status);

        if (!response.ok) {
          const data = await response.json();
          console.error(
            "GraphRAG: API authentication failed response data:",
            data
          );
          const errorMessage = `AI service unavailable: ${
            data.error || "Authentication failed"
          }`;
          console.error("GraphRAG: Setting error message:", errorMessage);
          setApiError(errorMessage);
        } else {
          console.log("GraphRAG: API authentication successful");
        }
      } catch (error) {
        console.error("GraphRAG: API check error:", error);
        console.error("GraphRAG: Error name:", error.name);
        console.error("GraphRAG: Error message:", error.message);
        console.error("GraphRAG: Error stack:", error.stack);
        setApiError(
          "Unable to connect to AI service. Please check your configuration."
        );
      }
    }

    if (isMounted) {
      checkApiAvailability();
    }
  }, [isMounted]);

  // Mode switching functions with localStorage persistence
  const setStochasticMode = () => {
    console.log("Switching to Stochastic mode");
    try {
      localStorage.setItem("ragMode", "stochastic");
    } catch (e) {
      console.error("Error setting localStorage:", e);
    }
    // Clear any previous results when switching modes
    setAnswer("");
    setSourceFacts([]);
    setShowSourceFacts(false);
    setGeneratedQuery("");
    setShowGeneratedQuery(false);
    setQueryResults([]);
    setShowQueryResults(false);

    // Set mode after clearing results
    setIsStochastic(true);
  };

  const setDeterministicMode = () => {
    console.log("Switching to Deterministic mode");
    try {
      localStorage.setItem("ragMode", "deterministic");
    } catch (e) {
      console.error("Error setting localStorage:", e);
    }
    // Clear any previous results when switching modes
    setAnswer("");
    setSourceFacts([]);
    setShowSourceFacts(false);
    setGeneratedQuery("");
    setShowGeneratedQuery(false);
    setQueryResults([]);
    setShowQueryResults(false);

    // Set mode after clearing results
    setIsStochastic(false);
  };

  const askQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSourceFacts([]);
    setGeneratedQuery("");
    setQueryResults([]);
    setApiError(null); // Clear previous errors

    try {
      // Always use stochastic endpoint for free-text questions
      const endpoint = "/api/gardening-question/stochastic";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.answer);
        if (data.sourceFacts && data.sourceFacts.length > 0) {
          setSourceFacts(data.sourceFacts);
        }
        if (data.generatedQuery) {
          setGeneratedQuery(data.generatedQuery);
        }
      } else {
        console.error("Error fetching answer:", data.error);
        setAnswer(
          "Sorry, I encountered an error trying to answer your question. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer(
        "Sorry, I encountered an error trying to answer your question. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeterministicSubmit = async (formData) => {
    setLoading(true);
    setAnswer("");
    setSourceFacts([]);
    setShowSourceFacts(false);
    setGeneratedQuery("");
    setShowGeneratedQuery(false);
    setQueryResults([]);
    setShowQueryResults(false);

    try {
      const response = await fetch("/api/gardening-question/deterministic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAnswer(data.answer);
        if (data.results && data.results.length > 0) {
          setQueryResults(data.results);
        }
        if (data.query) {
          setGeneratedQuery(data.query);
        }
      } else {
        console.error("Error fetching deterministic answer:", data.error);
        setAnswer(
          "Sorry, I encountered an error trying to answer your structured query. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error submitting deterministic query:", error);
      setAnswer(
        "Sorry, I encountered an error trying to answer your structured query. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="graph-rag-assistant w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Irish Gardening RAG Assistant
      </h2>

      {/* Mode toggle buttons */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={setDeterministicMode}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-200 
              ${
                !isStochastic
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }
              focus:z-10 focus:ring-2 focus:ring-emerald-500 focus:text-emerald-700`}
          >
            Deterministic Mode
          </button>
          <button
            type="button"
            onClick={setStochasticMode}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-200 
              ${
                isStochastic
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }
              focus:z-10 focus:ring-2 focus:ring-emerald-500 focus:text-emerald-700`}
          >
            Stochastic Mode
          </button>
        </div>
      </div>

      {/* Input area with strict mode separation */}
      <div className="mb-6">
        {isStochastic && (
          <div className="stochastic-mode-container">
            <form onSubmit={askQuestion}>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ask a gardening question
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What vegetables grow well in County Cork?"
                  className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? "Thinking..." : "Ask"}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isStochastic && (
          <div className="deterministic-mode-container">
            <DeterministicQueryCard onSubmit={handleDeterministicSubmit} />
            {loading && (
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-md">
                  Processing your structured query...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {apiError && (
        <div className="api-error-container p-4 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error:</h3>
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 border rounded-lg bg-base-100 shadow">
          <h3 className="text-lg font-semibold mb-2 text-primary">Answer:</h3>
          <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl max-w-none overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>

          {sourceFacts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-100">
              <button
                onClick={() => setShowSourceFacts(!showSourceFacts)}
                className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
              >
                <svg
                  className={`w-4 h-4 mr-1 transform ${
                    showSourceFacts ? "rotate-90" : ""
                  } transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
                {showSourceFacts
                  ? "Hide Knowledge Source"
                  : "Show Knowledge Source"}
              </button>

              {showSourceFacts && (
                <div className="mt-2 p-3 bg-white rounded border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-2">
                    This answer was generated using these facts from our
                    gardening graph:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {sourceFacts.map((fact, i) => (
                      <li key={i} className="text-gray-600">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(isStochastic || !isStochastic) && generatedQuery && (
            <div className="mt-4 pt-3 border-t border-emerald-100">
              <button
                onClick={() => setShowGeneratedQuery(!showGeneratedQuery)}
                className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
              >
                <svg
                  className={`w-4 h-4 mr-1 transform ${
                    showGeneratedQuery ? "rotate-90" : ""
                  } transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
                {showGeneratedQuery
                  ? "Hide Generated Query"
                  : "Show Generated Query"}
              </button>

              {showGeneratedQuery && (
                <div className="mt-2 p-3 bg-white rounded border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-2">
                    This Cypher query was generated to retrieve information from
                    our graph database:
                  </p>
                  <pre className="text-sm text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                    {generatedQuery}
                  </pre>
                </div>
              )}
            </div>
          )}

          {!isStochastic && queryResults.length > 0 && (
            <div className="mt-4 pt-3 border-t border-emerald-100">
              <button
                onClick={() => setShowQueryResults(!showQueryResults)}
                className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
              >
                <svg
                  className={`w-4 h-4 mr-1 transform ${
                    showQueryResults ? "rotate-90" : ""
                  } transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
                {showQueryResults
                  ? "Hide Detailed Results"
                  : "Show Detailed Results"}
              </button>

              {showQueryResults && (
                <div className="mt-2 p-3 bg-white rounded border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Results from your structured query:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {Object.keys(queryResults[0]).map((header) => (
                            <th
                              key={header}
                              className="p-2 text-left text-gray-700"
                            >
                              {header.replace(/([A-Z])/g, " $1").trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.map((row, i) => (
                          <tr
                            key={i}
                            className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            {Object.values(row).map((value, j) => (
                              <td
                                key={j}
                                className="p-2 text-gray-600 border-t"
                              >
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <p className="mb-1">
          The Irish Gardening Assistant uses GraphRAG technology to provide
          intelligent recommendations:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Graph of Irish plants, soil types, and counties</li>
          <li>
            Personalized recommendations based on your specific garden
            conditions
          </li>
          <li>Open-source LLM for generating detailed gardening advice</li>
        </ul>
      </div>
    </div>
  );
}
