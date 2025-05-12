import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./GraphRagAssistant.css"; // Import CSS for markdown styling

export default function GraphRagAssistant() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sourceFacts, setSourceFacts] = useState([]);
  const [showSourceFacts, setShowSourceFacts] = useState(false);

  const askQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSourceFacts([]);
    setShowSourceFacts(false);

    try {
      const response = await fetch("/api/gardening-question", {
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

  return (
    <div className="graph-rag-assistant w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Irish Gardening RAG Assistant
      </h2>

      <form onSubmit={askQuestion} className="mb-6">
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

      {answer && (
        <div className="answer-container p-4 bg-emerald-50 rounded-lg">
          <h3 className="text-lg font-semibold text-emerald-600 mb-2">
            Answer:
          </h3>
          <div className="prose max-w-none markdown-content">
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
                    gardening knowledge graph:
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
