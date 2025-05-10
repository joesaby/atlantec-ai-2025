import React, { useState, useRef, useEffect, createRef } from "react";
import PlantCard from "../plants/PlantCard";
import TaskCard from "./TaskCard";
import SoilInfo from "../soil/SoilInfo";
import GardeningCalendar from "./GardeningCalendar";
import { selectCardsForResponse } from "../../utils/cards";
import { samplePlants } from "../../data/plants";
import { sampleTasks } from "../../data/gardening-tasks";

// Function to convert markdown to HTML
const markdownToHtml = (text) => {
  if (!text) return "";

  return (
    text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Headers - h3 and h4 only for chat context
      .replace(
        /^### (.*?)$/gm,
        '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>'
      )
      .replace(
        /^#### (.*?)$/gm,
        '<h4 class="text-md font-bold mt-2 mb-1">$1</h4>'
      )
      // Lists
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(
        /<li>.*?<\/li>(\n<li>.*?<\/li>)+/g,
        (match) => `<ul class="list-disc list-inside my-2">${match}</ul>`
      )
      .replace(/^(\d+)\. (.*?)$/gm, "<li>$2</li>")
      .replace(/<li>.*?<\/li>(\n<li>.*?<\/li>)+/g, (match) => {
        if (match.startsWith("<ul>")) return match;
        return `<ol class="list-decimal list-inside my-2">${match}</ol>`;
      })
      // Links
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-accent underline" target="_blank">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, "<br />")
  );
};

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
  const [calendarOverlayOpen, setCalendarOverlayOpen] = useState(false);
  const [currentCalendarTasks, setCurrentCalendarTasks] = useState([]);
  const messagesEndRef = useRef(null);
  const calendarOverlayRef = useRef(null);

  // Prevent drawer from closing when clicking expanded content
  useEffect(() => {
    // Force drawer to stay open if content is expanded
    if (soilInfoExpanded || taskInfoExpanded) {
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
  }, [soilInfoExpanded, taskInfoExpanded]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Reset any expanded state when submitting a new query
    if (soilInfoExpanded) setSoilInfoExpanded(false);
    if (taskInfoExpanded) setTaskInfoExpanded(false);

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

  // Extract month information from user query
  const extractMonthInfoFromQuery = (query) => {
    const monthInfo = {};
    const lowercaseQuery = query.toLowerCase();

    // Check for seasons mentioned
    if (lowercaseQuery.includes("spring")) {
      monthInfo.season = "spring";
    } else if (lowercaseQuery.includes("summer")) {
      monthInfo.season = "summer";
    } else if (
      lowercaseQuery.includes("autumn") ||
      lowercaseQuery.includes("fall")
    ) {
      monthInfo.season = "autumn";
    } else if (lowercaseQuery.includes("winter")) {
      monthInfo.season = "winter";
    }

    // Check for specific months mentioned
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    // Find any month mentioned in the query
    const mentionedMonth = months.find((month) =>
      lowercaseQuery.includes(month)
    );
    if (mentionedMonth) {
      // Convert month name to number (1-12)
      monthInfo.month = months.indexOf(mentionedMonth) + 1;

      // If a specific month is mentioned (without season), we only want to show that month
      if (!monthInfo.season) {
        monthInfo.isSingleMonth = true;
        monthInfo.months = 1;
      }
    }

    // Check for number of months specification
    const monthsMatch = lowercaseQuery.match(/next\s+(\d+)\s+months/);
    if (monthsMatch && monthsMatch[1]) {
      monthInfo.months = parseInt(monthsMatch[1], 10);
    }

    return monthInfo;
  };

  // Check if a query is related to soil
  const isSoilQuery = (query) => {
    const soilKeywords = [
      "soil",
      "dirt",
      "earth",
      "ground",
      "loam",
      "clay",
      "sandy",
      "peat",
      "ph level",
      "acidic",
      "alkaline",
      "drainage",
      "soil type",
    ];

    const lowercaseQuery = query.toLowerCase();
    return soilKeywords.some((keyword) => lowercaseQuery.includes(keyword));
  };

  // Extract county name from a query if present
  const extractCountyFromQuery = (query) => {
    const irishCounties = [
      "carlow",
      "cavan",
      "clare",
      "cork",
      "donegal",
      "dublin",
      "galway",
      "kerry",
      "kildare",
      "kilkenny",
      "laois",
      "leitrim",
      "limerick",
      "longford",
      "louth",
      "mayo",
      "meath",
      "monaghan",
      "offaly",
      "roscommon",
      "sligo",
      "tipperary",
      "waterford",
      "westmeath",
      "wexford",
      "wicklow",
    ];

    const lowercaseQuery = query.toLowerCase();
    const foundCounty = irishCounties.find((county) =>
      lowercaseQuery.includes(county)
    );
    return foundCounty
      ? foundCounty.charAt(0).toUpperCase() + foundCounty.slice(1)
      : null;
  };

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

  // Format timestamp - Update to handle client/server time zone differences
  const formatTime = (date) => {
    const d = new Date(date);
    // Use UTC methods to ensure consistent time formatting between server and client
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Render different card types
  const renderCard = (card) => {
    switch (card.type) {
      case "plant":
        return <PlantCard plant={card.data} key={card.data.id} />;
      case "task":
        return <TaskCard task={card.data} key={card.data.id} />;
      default:
        return null;
    }
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
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 p-1 bg-secondary text-secondary-content rounded-full"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
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
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          {/* Smiley Flower Icon for "Bloom" garden assistant */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 400 400"
                            className="h-10 w-10 p-0.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="8"
                          >
                            {/* Background circle */}
                            <circle
                              cx="200"
                              cy="200"
                              r="180"
                              fill="#ACE7F5"
                              stroke="none"
                            />

                            {/* Petals (6 circles) */}
                            <g fill="#FDBA2C" stroke="#1B1F23">
                              <circle cx="200" cy="115" r="55" /> {/* top */}
                              <circle cx="275" cy="145" r="55" />{" "}
                              {/* top-right */}
                              <circle cx="275" cy="215" r="55" />{" "}
                              {/* bottom-right */}
                              <circle cx="200" cy="245" r="55" /> {/* bottom */}
                              <circle cx="125" cy="215" r="55" />{" "}
                              {/* bottom-left */}
                              <circle cx="125" cy="145" r="55" />{" "}
                              {/* top-left */}
                            </g>

                            {/* Flower face / centre */}
                            <circle
                              cx="200"
                              cy="180"
                              r="65"
                              fill="#FFC73A"
                              stroke="#1B1F23"
                            />
                            {/* eyes */}
                            <circle
                              cx="182"
                              cy="172"
                              r="7"
                              fill="#1B1F23"
                              stroke="none"
                            />
                            <circle
                              cx="218"
                              cy="172"
                              r="7"
                              fill="#1B1F23"
                              stroke="none"
                            />
                            {/* smile */}
                            <path
                              d="M180 198 Q200 215 220 198"
                              stroke="#1B1F23"
                              fill="none"
                            />

                            {/* Stem */}
                            <line
                              x1="200"
                              y1="245"
                              x2="200"
                              y2="330"
                              stroke="#1B1F23"
                            />

                            {/* Leaves */}
                            <g fill="#52B788" stroke="#1B1F23">
                              {/* left leaf */}
                              <path
                                d="M200 300
                                      Q160 280 130 315
                                      Q160 327 200 315 Z"
                              />
                              {/* right leaf */}
                              <path
                                d="M200 300
                                      Q240 280 270 315
                                      Q240 327 200 315 Z"
                              />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div className="chat-header">
                        Garden Assistant
                        <time className="text-xs opacity-50 ml-1">
                          {formatTime(message.timestamp)}
                        </time>
                      </div>

                      {/* Show content based on message type */}
                      {message.soilInfo ? (
                        // For soil-related queries, show the SoilInfo component
                        <div>
                          <div className="chat-bubble bg-emerald-800 text-white mb-2">
                            {message.content}
                          </div>
                          <div className="mt-2 max-w-3xl">
                            <div className="alert alert-success mb-4 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="stroke-current shrink-0 h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  Here are some extra soil details for{" "}
                                  {message.soilInfo.county}
                                </span>
                              </div>
                              <button
                                className="btn btn-sm"
                                onClick={() => {
                                  if (index === messages.length - 1) {
                                    // Toggle expanded state
                                    const newExpandedState = !soilInfoExpanded;
                                    setSoilInfoExpanded(newExpandedState);

                                    // First ensure the document has normal scroll
                                    document.documentElement.style.overflow =
                                      "auto";
                                    document.body.style.overflow = "auto";
                                    document.body.style.height = "auto";

                                    // If expanding, wait for component to render then scroll
                                    if (newExpandedState) {
                                      setTimeout(() => {
                                        // Find the soil info component that was just rendered
                                        const soilInfoEl =
                                          document.querySelector(
                                            "[data-message-index='" +
                                              index +
                                              "'] .soil-info-component"
                                          );

                                        if (soilInfoEl) {
                                          // Calculate position to ensure the info is visible with some padding
                                          const soilInfoRect =
                                            soilInfoEl.getBoundingClientRect();
                                          const targetY =
                                            window.scrollY +
                                            soilInfoRect.top -
                                            150;

                                          // Scroll to make the collapse button visible
                                          window.scrollTo({
                                            top: targetY,
                                            behavior: "smooth",
                                          });
                                        } else {
                                          // Fallback if we can't find the component
                                          window.scrollTo({
                                            top: window.scrollY + 200,
                                            behavior: "smooth",
                                          });
                                        }
                                      }, 100);
                                    } else {
                                      // When collapsing, scroll back to the message
                                      const messageEl = document.querySelector(
                                        `[data-message-index="${index}"]`
                                      );
                                      if (messageEl) {
                                        // Get position of the message
                                        const messageRect =
                                          messageEl.getBoundingClientRect();

                                        // Calculate where to scroll to show the message
                                        const targetY =
                                          window.scrollY +
                                          messageRect.top -
                                          100;

                                        // Smooth scroll back to the message
                                        window.scrollTo({
                                          top: targetY,
                                          behavior: "smooth",
                                        });
                                      }
                                    }
                                  }
                                }}
                              >
                                {index === messages.length - 1 &&
                                soilInfoExpanded
                                  ? "Collapse"
                                  : "Expand"}
                              </button>
                            </div>
                            {index === messages.length - 1 &&
                              soilInfoExpanded && (
                                <SoilInfo county={message.soilInfo.county} />
                              )}
                          </div>
                        </div>
                      ) : message.cards &&
                        message.cards.length > 0 &&
                        message.cards[0].type === "task" ? (
                        // For task cards, show a notification with an expand/collapse button
                        <div>
                          <div className="chat-bubble bg-emerald-800 text-white mb-2">
                            {message.content}
                          </div>
                          <div className="mt-2 max-w-3xl">
                            <div className="alert alert-success mb-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="stroke-current flex-shrink-0 h-6 w-6 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  Check out the Calendar for seasonal gardening
                                  tasks you can do in your garden
                                </span>
                              </div>
                              <button
                                className="btn btn-sm"
                                onClick={(e) => {
                                  // Prevent event bubbling
                                  e.stopPropagation();

                                  // Only let the most recent task message control the calendar
                                  if (index === messages.length - 1) {
                                    // Toggle expanded state
                                    const newExpandedState = !taskInfoExpanded;
                                    setTaskInfoExpanded(newExpandedState);
                                  }
                                }}
                              >
                                {index === messages.length - 1 &&
                                taskInfoExpanded
                                  ? "Collapse"
                                  : "Expand"}
                              </button>
                            </div>
                            {/* Show the calendar inline when expanded */}
                            {index === messages.length - 1 &&
                              taskInfoExpanded && (
                                <div
                                  className="mt-4 calendar-wrapper"
                                  style={{
                                    position: "relative",
                                    zIndex: 100,
                                    overflow: "visible",
                                  }}
                                  onMouseDown={(e) => {
                                    // Prevent drawer toggle from triggering
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    // Prevent clicks from bubbling up to drawer elements
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                >
                                  <GardeningCalendar
                                    months={3}
                                    queryTasks={message.cards}
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      ) : message.cards && message.cards.length > 0 ? (
                        // For plant cards, show with expand/collapse functionality
                        <div>
                          <div className="chat-bubble bg-emerald-800 text-white mb-2">
                            {message.content}
                          </div>
                          <div className="mt-2 max-w-3xl">
                            {/* Add a notification banner with expand/collapse button for plant recommendations */}
                            <div className="alert alert-success mb-4 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="stroke-current shrink-0 h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  {message.cards.length > 3 && !plantsExpanded
                                    ? `Showing top 3 of ${message.cards.length} plant recommendations`
                                    : `${message.cards.length} Plant recommendations for your garden`}
                                </span>
                              </div>
                              {message.cards.length > 3 && (
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    if (index === messages.length - 1) {
                                      // Toggle expanded state
                                      setPlantsExpanded(!plantsExpanded);

                                      // Ensure proper scrolling
                                      document.documentElement.style.overflow =
                                        "auto";
                                      document.body.style.overflow = "auto";

                                      // When expanding, scroll to show more content
                                      // When collapsing, scroll back to the message
                                      setTimeout(() => {
                                        const messageEl =
                                          document.querySelector(
                                            `[data-message-index="${index}"]`
                                          );
                                        if (messageEl) {
                                          const messageRect =
                                            messageEl.getBoundingClientRect();
                                          const targetY =
                                            window.scrollY +
                                            messageRect.top -
                                            100;
                                          window.scrollTo({
                                            top: targetY,
                                            behavior: "smooth",
                                          });
                                        }
                                      }, 100);
                                    }
                                  }}
                                >
                                  {index === messages.length - 1 &&
                                  plantsExpanded
                                    ? "Show Less"
                                    : "Show All"}
                                </button>
                              )}
                            </div>

                            {/* Only render plant cards based on expanded state */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4">
                              {message.cards
                                .slice(
                                  0,
                                  index === messages.length - 1 &&
                                    !plantsExpanded &&
                                    message.cards.length > 3
                                    ? 3
                                    : message.cards.length
                                )
                                .map((card) => renderCard(card))}
                            </div>

                            {/* Show a "Show More" button if applicable */}
                            {index === messages.length - 1 &&
                              !plantsExpanded &&
                              message.cards.length > 3 && (
                                <div className="mt-6 pb-2 text-center bg-base-200 rounded-lg py-3 animate-pulse">
                                  <button
                                    onClick={() => setPlantsExpanded(true)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Show {message.cards.length - 3} More Plants
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      ) : (
                        // For regular text messages with no cards
                        <div
                          className="chat-bubble bg-emerald-800 text-white"
                          dangerouslySetInnerHTML={{
                            __html: markdownToHtml(message.content),
                          }}
                        ></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {isTyping && (
              <div className="p-4 mt-4">
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 400 400"
                        className="h-10 w-10 p-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="8"
                      >
                        {/* Background circle */}
                        <circle
                          cx="200"
                          cy="200"
                          r="180"
                          fill="#ACE7F5"
                          stroke="none"
                        />

                        {/* Petals (6 circles) */}
                        <g fill="#FDBA2C" stroke="#1B1F23">
                          <circle cx="200" cy="115" r="55" /> {/* top */}
                          <circle cx="275" cy="145" r="55" /> {/* top-right */}
                          <circle cx="275" cy="215" r="55" />{" "}
                          {/* bottom-right */}
                          <circle cx="200" cy="245" r="55" /> {/* bottom */}
                          <circle cx="125" cy="215" r="55" />{" "}
                          {/* bottom-left */}
                          <circle cx="125" cy="145" r="55" /> {/* top-left */}
                        </g>

                        {/* Flower face / centre */}
                        <circle
                          cx="200"
                          cy="180"
                          r="65"
                          fill="#FFC73A"
                          stroke="#1B1F23"
                        />
                        {/* eyes */}
                        <circle
                          cx="182"
                          cy="172"
                          r="7"
                          fill="#1B1F23"
                          stroke="none"
                        />
                        <circle
                          cx="218"
                          cy="172"
                          r="7"
                          fill="#1B1F23"
                          stroke="none"
                        />
                        {/* smile */}
                        <path
                          d="M180 198 Q200 215 220 198"
                          stroke="#1B1F23"
                          fill="none"
                        />

                        {/* Stem */}
                        <line
                          x1="200"
                          y1="245"
                          x2="200"
                          y2="330"
                          stroke="#1B1F23"
                        />

                        {/* Leaves */}
                        <g fill="#52B788" stroke="#1B1F23">
                          {/* left leaf */}
                          <path
                            d="M200 300
                                  Q160 280 130 315
                                  Q160 327 200 315 Z"
                          />
                          {/* right leaf */}
                          <path
                            d="M200 300
                                  Q240 280 270 315
                                  Q240 327 200 315 Z"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
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
                Try asking about "plant recommendations" or "gardening tasks for
                spring"
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GardenAgent;
