import React, { useState, useRef, useEffect, createRef } from "react";
import { selectCardsForResponse, CARD_TYPES } from "../../utils/cards";
import { samplePlants } from "../../data/plants";
import { sampleTasks } from "../../data/gardening-tasks";
import CardContainer from "./CardContainer";
import ChatAvatar from "../common/ChatAvatar";
import { isSoilQuery, extractCountyFromQuery } from "../../utils/soil-client";
import {
  extractMonthInfoFromQuery,
  formatTimeString,
} from "../../utils/date-utils";
import GardeningCalendar from "./GardeningCalendar";

const GardenAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello there! I'm Bloom, your Irish gardening assistant. How can I help with your garden today? Whether you need plant recommendations, seasonal tasks, or growing tips for our unique Irish climate, I'm here to help you create a thriving garden.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [providerInfo, setProviderInfo] = useState({
    provider: "vertex",
    model: "gemini-2.0-flash-001",
  });
  const [soilInfoExpanded, setSoilInfoExpanded] = useState(false);
  const [taskInfoExpanded, setTaskInfoExpanded] = useState(false);
  const [plantsExpanded, setPlantsExpanded] = useState(false);
  const [sustainabilityExpanded, setSustainabilityExpanded] = useState(false);
  const [calendarOverlayOpen, setCalendarOverlayOpen] = useState(false);
  const [currentCalendarTasks, setCurrentCalendarTasks] = useState([]);
  const messagesEndRef = useRef(null);
  const calendarOverlayRef = useRef(null);

  // Prevent drawer from closing when clicking expanded content
  useEffect(() => {
    // Force drawer to stay open if content is expanded
    if (soilInfoExpanded || taskInfoExpanded || sustainabilityExpanded) {
      setDrawerOpen(true);

      // Force the body to have scrolling enabled
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";

      // Completely remove the drawer behavior by temporarily disabling the drawer toggle
      const drawerToggle = document.getElementById("drawer-chat");
      if (drawerToggle) {
        drawerToggle.disabled = true;
      }

      return () => {
        // Re-enable the drawer toggle when components are collapsed
        if (drawerToggle) {
          drawerToggle.disabled = false;
        }
      };
    }
  }, [soilInfoExpanded, taskInfoExpanded, sustainabilityExpanded]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when card expansion state changes
  useEffect(() => {
    // Only auto-scroll if the user is expanding/collapsing the latest message
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [
    plantsExpanded,
    soilInfoExpanded,
    taskInfoExpanded,
    sustainabilityExpanded,
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Reset any expanded state when submitting a new query
    if (soilInfoExpanded) setSoilInfoExpanded(false);
    if (taskInfoExpanded) setTaskInfoExpanded(false);
    if (sustainabilityExpanded) setSustainabilityExpanded(false);
    if (plantsExpanded) setPlantsExpanded(false);

    // Add user message
    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    // Open the drawer when chat starts
    if (!drawerOpen && messages.length <= 1) {
      setDrawerOpen(true);
    }

    try {
      // Get previous messages for context (excluding UI-specific fields)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call the API endpoint instead of using Vertex AI directly
      const requestBody = JSON.stringify({
        query: input,
        conversationHistory,
      });

      console.log("Sending request to garden API:", requestBody);

      const response = await fetch("/api/garden", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", response.status, errorText);
        throw new Error(
          `Failed to get response from garden assistant: ${response.status}`
        );
      }

      const responseText = await response.text();
      console.log("API response text:", responseText);

      let aiResponse;
      try {
        aiResponse = JSON.parse(responseText);
        // Log the LLM response to the console
        console.log("LLM Response:", aiResponse);
      } catch (error) {
        console.error("Error parsing API response:", error);
        throw new Error("Invalid response format from garden assistant");
      }

      // Check if this is a soil-related query
      const isSoilRelated = isSoilQuery(input);

      // Extract county if present in the query
      const county = isSoilRelated ? extractCountyFromQuery(input) : null;

      console.log("Soil related query:", isSoilRelated, "County:", county);

      // Select appropriate cards to display based on the response
      const cards = selectCardsForResponse(input, aiResponse);
      console.log("Selected cards:", cards);
      console.log("Card count:", cards.length);

      // Build the response object
      let responseObj = {
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
      };

      // Add cards if they were selected
      if (cards && cards.length > 0) {
        responseObj.cards = cards;
      }

      // Add soil info if it's a soil-related query
      if (isSoilRelated) {
        responseObj.soilInfo = {
          showSoilInfo: true,
          county: county || "Dublin", // Default to Dublin if no county specified
        };
        console.log("Adding soil info to response:", responseObj.soilInfo);
      }

      setMessages((prevMessages) => [...prevMessages, responseObj]);

      // After the message is added, make sure to scroll properly
      setTimeout(() => {
        // Ensure the message is visible by scrolling to it
        const messageElements = document.querySelectorAll(
          "[data-message-index]"
        );
        if (messageElements.length > 0) {
          const lastMessageElement =
            messageElements[messageElements.length - 1];
          if (lastMessageElement) {
            lastMessageElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }

        // Ensure document scrolling is enabled
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
      }, 200);
    } catch (error) {
      console.error("Error processing query:", error);
      // Add fallback response in case of error
      const errorResponse = {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble accessing my gardening knowledge at the moment. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Dispatch event when task cards are generated
  useEffect(() => {
    // When we have task cards, dispatch an event to notify the calendar component but don't show it yet
    const latestMessage = messages[messages.length - 1];
    if (
      latestMessage &&
      latestMessage.role === "assistant" &&
      latestMessage.cards &&
      latestMessage.cards.length > 0 &&
      latestMessage.cards[0].type === "task"
    ) {
      // Extract month information from the query if available
      const lastUserMessage = messages.findLast((msg) => msg.role === "user");
      const monthInfo = extractMonthInfoFromQuery(
        lastUserMessage?.content || ""
      );

      // Dispatch custom event with task cards data and indicate not to show calendar automatically
      const taskCardsEvent = new CustomEvent("task-cards-available", {
        detail: {
          tasks: latestMessage.cards,
          monthInfo: monthInfo,
          showCalendar: false, // Don't show calendar automatically
        },
      });
      window.dispatchEvent(taskCardsEvent);
      console.log(
        "Dispatched task-cards-available event with",
        latestMessage.cards.length,
        "tasks",
        monthInfo
      );
    }
  }, [messages]);

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello there! I'm Bloom, your Irish gardening assistant. How can I help with your garden today? Whether you need plant recommendations, seasonal tasks, or growing tips for our unique Irish climate, I'm here to help you create a thriving garden.",
        timestamp: new Date(),
      },
    ]);
    setDrawerOpen(false);
  };

  // Format timestamp - Use the utility function
  const formatTime = (date) => {
    return formatTimeString(date);
  };

  // Determine the card container type based on message content
  const getCardType = (message) => {
    if (message.soilInfo) {
      return "soil";
    } else if (message.cards && message.cards.length > 0) {
      if (message.cards[0].type === CARD_TYPES.TASK) {
        return "task";
      } else if (message.cards[0].type === CARD_TYPES.SUSTAINABILITY) {
        return "sustainability";
      } else {
        return "plant";
      }
    }
    return null;
  };

  return (
    <>
      {/* Calendar Modal Overlay - completely separate from drawer */}
      {calendarOverlayOpen && (
        <div
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setCalendarOverlayOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto bg-base-100 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-base-100 border-b border-base-300">
              <h2 className="text-xl font-bold">Garden Task Calendar</h2>
              <button
                className="btn btn-sm btn-circle"
                onClick={() => setCalendarOverlayOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <GardeningCalendar months={3} queryTasks={currentCalendarTasks} />
            </div>
          </div>
        </div>
      )}

      <div className="drawer drawer-end">
        <input
          id="drawer-chat"
          type="checkbox"
          className="drawer-toggle"
          checked={drawerOpen}
          onChange={() => setDrawerOpen(!drawerOpen)}
        />

        <div className="drawer-content">
          {/* Page content */}
          <div className="w-full mb-6">
            <div className="bg-primary text-primary-content p-4 rounded-t-box">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Garden Assistant Chat
                <span className="text-xs font-normal opacity-70 ml-2">
                  Powered by Google Vertex AI ({providerInfo.model})
                </span>
              </h2>
            </div>

            {/* Display all messages in the main chat area */}
            <div className="p-4 mt-4 flex flex-col gap-4">
              {messages.map((message, index) => (
                <div key={index} data-message-index={index}>
                  {/* Only display user messages that have a response (skip the initial welcome message) */}
                  {message.role === "user" ? (
                    <div className="chat chat-end mb-2">
                      <ChatAvatar type="user" />
                      <div className="chat-header">
                        You
                        <time className="text-xs opacity-50 ml-1">
                          {formatTime(message.timestamp)}
                        </time>
                      </div>
                      <div className="chat-bubble chat-bubble-secondary">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="chat chat-start">
                      <ChatAvatar type="assistant" />
                      <div className="chat-header">
                        Garden Assistant
                        <time className="text-xs opacity-50 ml-1">
                          {formatTime(message.timestamp)}
                        </time>
                      </div>

                      {/* Show content based on message type */}
                      <div>
                        {/* Chat bubble message content */}
                        <div
                          className="chat-bubble bg-emerald-800 text-white mb-2 overflow-hidden break-words whitespace-pre-wrap"
                          style={{
                            maxWidth: "90vw",
                            overflowWrap: "break-word",
                          }}
                        >
                          {message.content}
                        </div>

                        {/* Card container (if applicable) */}
                        {(message.cards?.length > 0 || message.soilInfo) && (
                          <div className="card-container">
                            {/* Use the CardContainer component for all card types */}
                            <CardContainer
                              message={message}
                              index={index}
                              messagesLength={messages.length}
                              type={getCardType(message)}
                              isExpanded={
                                getCardType(message) === "soil"
                                  ? soilInfoExpanded
                                  : getCardType(message) === "task"
                                  ? taskInfoExpanded
                                  : getCardType(message) === "sustainability"
                                  ? sustainabilityExpanded
                                  : plantsExpanded
                              }
                              setExpanded={
                                getCardType(message) === "soil"
                                  ? setSoilInfoExpanded
                                  : getCardType(message) === "task"
                                  ? setTaskInfoExpanded
                                  : getCardType(message) === "sustainability"
                                  ? setSustainabilityExpanded
                                  : setPlantsExpanded
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {isTyping && (
              <div className="p-4 mt-4">
                <div className="chat chat-start">
                  <ChatAvatar type="assistant" />
                  <div className="chat-bubble bg-emerald-800 text-white flex gap-1 items-center">
                    <span className="loading loading-dots loading-sm"></span>
                    <span>Garden Assistant is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chat input area at the bottom */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-base-100 rounded-b-box shadow-md mt-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about plants, gardening tips, or seasonal tasks..."
                  className="input input-bordered flex-1"
                  suppressHydrationWarning={true}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isTyping}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-base-content/50 mt-2">
                Try asking about "plant recommendations", "sustainability of
                potatoes", or "carbon footprint of growing vegetables"
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GardenAgent;
