import React, { useState, useRef, useEffect } from "react";
import PlantCard from "../plants/PlantCard";
import TaskCard from "./TaskCard";
import { selectCardsForResponse } from "../../utils/cards";
import { samplePlants } from "../../data/plants";
import { sampleTasks } from "../../data/gardening-tasks";

const GardenAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello there! I'm Bloom, your Irish gardening assistant. How can I help with your garden today? Whether you need plant recommendations, seasonal tasks, or growing tips for our unique Irish climate, I'm here to help you create a thriving garden.",
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
  const messagesEndRef = useRef(null);

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

    // Hide the calendar when starting a new query
    const calendarContainer = document.querySelector('#calendar-container');
    if (calendarContainer) {
      calendarContainer.classList.add('hidden');
    }

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
        throw new Error(`Failed to get response from garden assistant: ${response.status}`);
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
    if (latestMessage && 
        latestMessage.role === "assistant" && 
        latestMessage.cards && 
        latestMessage.cards.length > 0 && 
        latestMessage.cards[0].type === "task") {
      
      // Extract month information from the query if available
      const lastUserMessage = messages.findLast(msg => msg.role === "user");
      const monthInfo = extractMonthInfoFromQuery(lastUserMessage?.content || "");
      
      // Dispatch custom event with task cards data and indicate not to show calendar automatically
      const taskCardsEvent = new CustomEvent('task-cards-available', {
        detail: {
          tasks: latestMessage.cards,
          monthInfo: monthInfo,
          showCalendar: false // Don't show calendar automatically
        }
      });
      window.dispatchEvent(taskCardsEvent);
      console.log('Dispatched task-cards-available event with', latestMessage.cards.length, 'tasks', monthInfo);
    }
  }, [messages]);

  // Extract month information from user query
  const extractMonthInfoFromQuery = (query) => {
    const monthInfo = {};
    const lowercaseQuery = query.toLowerCase();
    
    // Check for seasons mentioned
    if (lowercaseQuery.includes('spring')) {
      monthInfo.season = 'spring';
    } else if (lowercaseQuery.includes('summer')) {
      monthInfo.season = 'summer';
    } else if (lowercaseQuery.includes('autumn') || lowercaseQuery.includes('fall')) {
      monthInfo.season = 'autumn';
    } else if (lowercaseQuery.includes('winter')) {
      monthInfo.season = 'winter';
    }
    
    // Check for specific months mentioned
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    // Find any month mentioned in the query
    const mentionedMonth = months.find(month => lowercaseQuery.includes(month));
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

  // Format timestamp
  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
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

          {/* Chat input area at the top */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-base-100 rounded-b-box shadow-md"
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
              {messages.length > 1 && (
                <label
                  htmlFor="drawer-chat"
                  className="btn btn-square btn-ghost drawer-button"
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
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </label>
              )}
            </div>
            <div className="text-xs text-base-content/50 mt-2">
              Try asking about "plant recommendations" or "gardening tasks for
              spring"
            </div>
          </form>

          {/* Display the most recent response if there is one */}
          {messages.length > 1 && (
            <div className="p-4 mt-4">
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
                      <circle cx="200" cy="200" r="180" fill="#ACE7F5" stroke="none" />

                      {/* Petals (6 circles) */}
                      <g fill="#FDBA2C" stroke="#1B1F23">
                        <circle cx="200" cy="115" r="55"/>   {/* top */}
                        <circle cx="275" cy="145" r="55"/>   {/* top-right */}
                        <circle cx="275" cy="215" r="55"/>   {/* bottom-right */}
                        <circle cx="200" cy="245" r="55"/>   {/* bottom */}
                        <circle cx="125" cy="215" r="55"/>   {/* bottom-left */}
                        <circle cx="125" cy="145" r="55"/>   {/* top-left */}
                      </g>

                      {/* Flower face / centre */}
                      <circle cx="200" cy="180" r="65" fill="#FFC73A" stroke="#1B1F23" />
                      {/* eyes */}
                      <circle cx="182" cy="172" r="7" fill="#1B1F23" stroke="none"/>
                      <circle cx="218" cy="172" r="7" fill="#1B1F23" stroke="none"/>
                      {/* smile */}
                      <path d="M180 198 Q200 215 220 198" stroke="#1B1F23" fill="none"/>

                      {/* Stem */}
                      <line x1="200" y1="245" x2="200" y2="330" stroke="#1B1F23"/>

                      {/* Leaves */}
                      <g fill="#52B788" stroke="#1B1F23">
                        {/* left leaf */}
                        <path d="M200 300
                                Q160 280 130 315
                                Q160 327 200 315 Z"/>
                        {/* right leaf */}
                        <path d="M200 300
                                Q240 280 270 315
                                Q240 327 200 315 Z"/>
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="chat-header">
                  Garden Assistant
                  <time className="text-xs opacity-50 ml-1">
                    {formatTime(messages[messages.length - 1].timestamp)}
                  </time>
                </div>
                
                {/* Show content based on message type */}
                {messages[messages.length - 1].cards && 
                 messages[messages.length - 1].cards.length > 0 && 
                 messages[messages.length - 1].cards[0].type === "task" ? (
                  // For task cards, show a notification with a button to view calendar
                  <div className="chat-bubble chat-bubble-primary">
                    {messages[messages.length - 1].content}
                    <div className="mt-3 alert alert-info shadow-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Your gardening tasks are ready! Check your task calendar.</span>
                      </div>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => {
                          const calendarContainer = document.querySelector('#calendar-container');
                          if (calendarContainer) {
                            calendarContainer.classList.remove('hidden');
                            calendarContainer.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        View Calendar
                      </button>
                    </div>
                  </div>
                ) : messages[messages.length - 1].cards && 
                   messages[messages.length - 1].cards.length > 0 ? (
                  // For other card types (like plant cards), show the cards normally
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4 max-w-3xl">
                    {messages[messages.length - 1].cards.map((card) =>
                      renderCard(card)
                    )}
                  </div>
                ) : (
                  // For regular text messages with no cards
                  <div className="chat-bubble chat-bubble-primary">
                    {messages[messages.length - 1].content}
                  </div>
                )}
              </div>
            </div>
          )}

          {isTyping && (
            <div className="p-4 mt-4">
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 p-1 bg-primary text-primary-content rounded-full"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="chat-bubble chat-bubble-primary flex gap-1 items-center">
                  <span className="loading loading-dots loading-sm"></span>
                  <span>Garden Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat history drawer */}
      <div className="drawer-side z-10">
        <label
          htmlFor="drawer-chat"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col">
          {/* Drawer header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Chat History</h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="btn btn-sm btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Chat
              </button>
              <label htmlFor="drawer-chat" className="btn btn-sm btn-circle">
                ✕
              </label>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${
                  message.role === "assistant" ? "chat-start" : "chat-end"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {message.role === "assistant" ? (
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
                        <circle cx="200" cy="200" r="180" fill="#ACE7F5" stroke="none" />

                        {/* Petals (6 circles) */}
                        <g fill="#FDBA2C" stroke="#1B1F23">
                          <circle cx="200" cy="115" r="55"/>   {/* top */}
                          <circle cx="275" cy="145" r="55"/>   {/* top-right */}
                          <circle cx="275" cy="215" r="55"/>   {/* bottom-right */}
                          <circle cx="200" cy="245" r="55"/>   {/* bottom */}
                          <circle cx="125" cy="215" r="55"/>   {/* bottom-left */}
                          <circle cx="125" cy="145" r="55"/>   {/* top-left */}
                        </g>

                        {/* Flower face / centre */}
                        <circle cx="200" cy="180" r="65" fill="#FFC73A" stroke="#1B1F23" />
                        {/* eyes */}
                        <circle cx="182" cy="172" r="7" fill="#1B1F23" stroke="none"/>
                        <circle cx="218" cy="172" r="7" fill="#1B1F23" stroke="none"/>
                        {/* smile */}
                        <path d="M180 198 Q200 215 220 198" stroke="#1B1F23" fill="none"/>

                        {/* Stem */}
                        <line x1="200" y1="245" x2="200" y2="330" stroke="#1B1F23"/>

                        {/* Leaves */}
                        <g fill="#52B788" stroke="#1B1F23">
                          {/* left leaf */}
                          <path d="M200 300
                                  Q160 280 130 315
                                  Q160 327 200 315 Z"/>
                          {/* right leaf */}
                          <path d="M200 300
                                  Q240 280 270 315
                                  Q240 327 200 315 Z"/>
                        </g>
                      </svg>
                    ) : (
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
                    )}
                  </div>
                </div>
                <div className="chat-header">
                  {message.role === "assistant" ? "Garden Assistant" : "You"}
                  <time className="text-xs opacity-50 ml-1">
                    {formatTime(message.timestamp)}
                  </time>
                </div>
                <div
                  className={`chat-bubble ${
                    message.role === "assistant"
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >
                  {message.content}
                </div>
                {/* Show card indicator in the drawer for assistant messages with cards */}
                {message.role === "assistant" && message.cards && message.cards.length > 0 && (
                  <div className="mt-2">
                    <div className="badge badge-sm">Contains {message.cards.length} card(s)</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenAgent;
