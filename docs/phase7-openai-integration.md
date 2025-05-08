# Phase 7: OpenAI Integration for Intelligent Garden Assistant

## Overview

In this phase, we'll enhance the Garden Assistant chat interface by integrating OpenAI's API to provide truly intelligent responses. This will transform our simple pattern-matching implementation into a sophisticated gardening advisor capable of understanding complex questions, providing detailed gardening advice, and generating contextually relevant recommendations using natural language processing.

## Features

- **OpenAI-Powered Responses**: Replace rule-based pattern matching with AI-generated responses
- **Contextual Understanding**: Process complex, multi-part gardening questions
- **Smart Card Selection**: Intelligently select and display the most relevant cards based on query context
- **Conversation Memory**: Maintain context throughout chat conversations
- **Enhanced Personalization**: Generate responses that account for user preferences, location, and garden conditions

## Technical Implementation

### Integration Points

1. **OpenAI API Setup**
   - Securely store and access OpenAI API key from `.env` file
   - Implement API client with error handling and rate limiting
   - Create optimized prompt templates for gardening domain

2. **Message Processing Pipeline**
   - Convert user messages into well-structured prompts
   - Process OpenAI responses and extract relevant information
   - Map AI recommendations to existing card components

3. **Environment Configuration**
   - Handle API key securely with environment variables
   - Set up fallback responses for when API calls fail
   - Configure response caching to minimize API usage

### Components

1. **openai-client.js**
   - Manages connection to OpenAI API
   - Handles authentication, requests, and response parsing
   - Implements error handling and retry logic

2. **GardenAgent.jsx (Enhanced)**
   - Updated to use OpenAI for response generation
   - Maintains conversation history for context
   - Implements message processing pipeline

3. **gardening-prompts.js**
   - Contains optimized prompts for various gardening topics
   - Structures system messages to produce consistent responses
   - Defines output formats for different response types

## Implementation Code

### Environment Setup

Create or update `.env` file in the project root:

```
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4-turbo
MAX_TOKENS=1024
TEMPERATURE=0.7
```

Add `.env` to `.gitignore` file to prevent committing API keys:

```
# API keys and secrets
.env
```

### openai-client.js

```javascript
// src/utils/openai-client.js
import { Configuration, OpenAIApi } from "openai";

// Initialize OpenAI with API key from environment variables
const configuration = new Configuration({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Send a request to the OpenAI API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<Object>} - The response from OpenAI
 */
export async function generateChatResponse(messages, options = {}) {
  try {
    const response = await openai.createChatCompletion({
      model: import.meta.env.OPENAI_MODEL || "gpt-4-turbo",
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    
    // Return a graceful fallback message
    return "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly or ask another gardening question.";
  }
}

/**
 * Process a gardening query and return a structured response
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Structured response with content and optional cards
 */
export async function processGardeningQuery(query, conversationHistory = []) {
  // Construct the full conversation context
  const messages = [
    {
      role: "system",
      content: `You are an expert Irish gardening assistant that specializes in providing advice for gardeners in Ireland.
Your responses should be helpful, informative, and tailored to Irish growing conditions, weather patterns, and native plants.
When responding, consider:
- Irish climate zones and seasonal patterns
- Native and well-adapted plants for Irish gardens
- Sustainable gardening practices suitable for Ireland
- Irish soil types and improvement techniques
- Local pest management strategies

When users ask about plants or gardening tasks, indicate in your response if you recommend SHOWING_PLANT_CARDS or SHOWING_TASK_CARDS.
Format your response as plain text with one of these indicators at the very end if appropriate.`
    },
    // Add previous conversation for context
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    // Add the current query
    { role: "user", content: query }
  ];

  // Generate the response
  const responseText = await generateChatResponse(messages);
  
  // Parse the response to extract any card indicators
  let content = responseText;
  let cardType = null;
  
  if (responseText.includes("SHOWING_PLANT_CARDS")) {
    content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
    cardType = "plant";
  } else if (responseText.includes("SHOWING_TASK_CARDS")) {
    content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
    cardType = "task";
  }
  
  return {
    content,
    cardType
  };
}
```

### gardening-prompts.js

```javascript
// src/utils/gardening-prompts.js

/**
 * System prompt for the gardening assistant
 */
export const GARDENING_SYSTEM_PROMPT = `You are an expert Irish gardening assistant that specializes in providing advice for gardeners in Ireland.
Your responses should be helpful, informative, and tailored to Irish growing conditions, weather patterns, and native plants.

When responding, consider:
- Irish climate zones and seasonal patterns
- Native and well-adapted plants for Irish gardens
- Sustainable gardening practices suitable for Ireland
- Irish soil types and improvement techniques
- Local pest management strategies

When users ask about plants or gardening tasks, indicate in your response if you recommend SHOWING_PLANT_CARDS or SHOWING_TASK_CARDS.
Format your response as plain text with one of these indicators at the very end if appropriate.`;

/**
 * Generate prompts for specific gardening topics
 */
export const TOPIC_PROMPTS = {
  plants: `Based on the user's query, recommend appropriate plants for Irish gardens.
Consider factors like sun exposure, soil type, and maintenance level.
Your response should be informative and helpful.
End your response with SHOWING_PLANT_CARDS to indicate that plant cards should be displayed.`,

  tasks: `Based on the user's query, suggest appropriate gardening tasks.
Consider the current season and typical Irish gardening calendar.
Provide practical advice that is actionable for the user.
End your response with SHOWING_TASK_CARDS to indicate that task cards should be displayed.`,

  soilImprovement: `Provide advice on improving soil quality in Irish gardens.
Consider local soil types and sustainable practices.
Be specific and practical in your recommendations.`,

  pestManagement: `Offer guidance on managing pests in Irish gardens using environmentally friendly methods.
Identify common Irish garden pests when relevant and suggest specific solutions.`,

  sustainability: `Suggest sustainable gardening practices suitable for Irish gardens.
Focus on water conservation, biodiversity, and reducing environmental impact.`
};

/**
 * Generate a query-specific prompt based on user input
 * @param {string} query - The user's question
 * @returns {string} - A specialized prompt for this query type
 */
export function generateQueryPrompt(query) {
  const lowercaseQuery = query.toLowerCase();
  
  if (lowercaseQuery.includes("plant") && 
      (lowercaseQuery.includes("recommend") || lowercaseQuery.includes("suggest"))) {
    return TOPIC_PROMPTS.plants;
  }
  
  if (lowercaseQuery.includes("task") || 
      lowercaseQuery.includes("to do") || 
      lowercaseQuery.includes("job")) {
    return TOPIC_PROMPTS.tasks;
  }
  
  if (lowercaseQuery.includes("soil")) {
    return TOPIC_PROMPTS.soilImprovement;
  }
  
  if (lowercaseQuery.includes("pest") || lowercaseQuery.includes("bug") || 
      lowercaseQuery.includes("insect") || lowercaseQuery.includes("disease")) {
    return TOPIC_PROMPTS.pestManagement;
  }
  
  if (lowercaseQuery.includes("sustainable") || lowercaseQuery.includes("eco") || 
      lowercaseQuery.includes("environment")) {
    return TOPIC_PROMPTS.sustainability;
  }
  
  // Default to general gardening system prompt
  return GARDENING_SYSTEM_PROMPT;
}
```

### Enhanced GardenAgent.jsx

```jsx
// src/components/garden/GardenAgent.jsx
import React, { useState, useRef, useEffect } from "react";
import PlantCard from "../plants/PlantCard";
import TaskCard from "./TaskCard";
import { processGardeningQuery } from "../../utils/openai-client";
import { samplePlants, sampleTasks } from "../../data/plants";

const GardenAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your gardening assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

    // Add user message
    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Open the drawer when chat starts
    if (!drawerOpen && messages.length <= 1) {
      setDrawerOpen(true);
    }

    try {
      // Get previous messages for context (excluding UI-specific fields)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Process the query using OpenAI
      const aiResponse = await processGardeningQuery(input, conversationHistory);
      
      // Build the response object
      let response = {
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
      };
      
      // Add cards if the AI recommended them
      if (aiResponse.cardType === "plant") {
        response.cards = samplePlants.map(plant => ({ type: "plant", data: plant }));
      } else if (aiResponse.cardType === "task") {
        response.cards = sampleTasks.map(task => ({ type: "task", data: task }));
      }

      setMessages(prevMessages => [...prevMessages, response]);
    } catch (error) {
      console.error("Error processing query:", error);
      // Add fallback response in case of error
      const errorResponse = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble accessing my gardening knowledge at the moment. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your gardening assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setDrawerOpen(false);
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <input id="drawer-chat" type="checkbox" className="drawer-toggle" checked={drawerOpen} onChange={() => setDrawerOpen(!drawerOpen)} />
      
      <div className="drawer-content">
        {/* Page content */}
        <div className="w-full mb-6">
          <div className="bg-primary text-primary-content p-4 rounded-t-box">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Garden Assistant Chat
            </h2>
          </div>
          
          {/* Chat input area at the top */}
          <form onSubmit={handleSubmit} className="p-4 bg-base-100 rounded-b-box shadow-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about plants, gardening tips, or seasonal tasks..."
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={input.trim() === "" || isTyping}
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
                <label htmlFor="drawer-chat" className="btn btn-square btn-ghost drawer-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </label>
              )}
            </div>
            <div className="text-xs text-base-content/50 mt-2">
              Try asking about "plant recommendations" or "gardening tasks for spring"
            </div>
          </form>
          
          {/* Display the most recent response if there is one */}
          {messages.length > 1 && (
            <div className="p-4 mt-4">
              <div className="chat chat-start">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-1 bg-primary text-primary-content rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="chat-header">
                  Garden Assistant
                  <time className="text-xs opacity-50 ml-1">{formatTime(messages[messages.length - 1].timestamp)}</time>
                </div>
                <div className="chat-bubble chat-bubble-primary">
                  {messages[messages.length - 1].content}
                </div>
                {/* Display cards if present in the most recent message */}
                {messages[messages.length - 1].cards && messages[messages.length - 1].cards.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4 max-w-3xl">
                    {messages[messages.length - 1].cards.map((card) => renderCard(card))}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-1 bg-primary text-primary-content rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <label htmlFor="drawer-chat" aria-label="close sidebar" className="drawer-overlay"></label>
        <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col">
          {/* Drawer header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Chat History</h3>
            <div className="flex gap-2">
              <button onClick={clearChat} className="btn btn-sm btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </button>
              <label htmlFor="drawer-chat" className="btn btn-sm btn-circle">✕</label>
            </div>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${message.role === "assistant" ? "chat-start" : "chat-end"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    {message.role === "assistant" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-1 bg-primary text-primary-content rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 p-1 bg-secondary text-secondary-content rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="chat-header">
                  {message.role === "assistant" ? "Garden Assistant" : "You"}
                  <time className="text-xs opacity-50 ml-1">{formatTime(message.timestamp)}</time>
                </div>
                <div className={`chat-bubble ${message.role === "assistant" ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                  {message.content}
                </div>
                {/* Display cards if present */}
                {message.cards && message.cards.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-2 mb-4">
                    {message.cards.map((card) => renderCard(card))}
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
```

### Environment Configuration

Update `astro.config.mjs` to include the environment variables:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // ...existing config
  integrations: [react(), tailwind()],
  vite: {
    // Enable environment variables
    envPrefix: 'OPENAI_',
    // Don't expose the API key to the client
    ssr: {
      noExternal: ['openai']
    }
  }
});
```

## Security Considerations

1. **API Key Protection**
   - Store API key in `.env` file (not in version control)
   - Use server-side API calls when possible
   - Set up proper environment variable handling

2. **Rate Limiting**
   - Implement client-side throttling to prevent excessive API calls
   - Add caching for common gardening queries to reduce API usage

3. **Content Filtering**
   - Ensure all user inputs are sanitized
   - Set OpenAI content policy parameters appropriately
   - Monitor and filter inappropriate responses

## Testing Plan

1. **Unit Tests**
   - Test OpenAI client functions with mocked responses
   - Verify prompt generation logic
   - Test response parsing and card selection

2. **Integration Tests**
   - Test end-to-end query processing
   - Verify conversation history maintenance
   - Test error handling and fallbacks

3. **User Acceptance Testing**
   - Test with real gardening queries
   - Verify response quality and relevance
   - Test across different devices and browsers

## Implementation Checklist

- [ ] Set up OpenAI API integration
- [ ] Create environment configuration
- [ ] Implement OpenAI client utility
- [ ] Develop gardening-specific prompts
- [ ] Update GardenAgent component with AI integration
- [ ] Add error handling and fallbacks
- [ ] Implement response caching
- [ ] Test across different gardening query scenarios
- [ ] Document API usage and monitoring

## Deployment Considerations

1. **Environment Variables**
   - Ensure production environment has API keys configured
   - Set up proper secret management in deployment environment

2. **Monitoring**
   - Add logging for API calls
   - Monitor usage to prevent exceeding quotas
   - Track error rates and response quality

3. **Cost Management**
   - Implement caching for common queries
   - Monitor API usage costs
   - Consider batching requests when appropriate