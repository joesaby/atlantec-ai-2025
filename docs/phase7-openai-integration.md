# Phase 7: AI Integration for Intelligent Garden Assistant

## Overview

In this phase, we'll enhance the Garden Assistant chat interface by integrating AI services to provide truly intelligent responses. This will transform our simple pattern-matching implementation into a sophisticated gardening advisor capable of understanding complex questions, providing detailed gardening advice, and generating contextually relevant recommendations using natural language processing.

This implementation supports both OpenAI and Google Cloud Vertex AI, allowing you to choose the LLM provider that best suits your needs.

## Features

- **AI-Powered Responses**: Replace rule-based pattern matching with AI-generated responses (OpenAI or Vertex AI)
- **Provider Flexibility**: Switch between OpenAI and Google Cloud Vertex AI as needed
- **Contextual Understanding**: Process complex, multi-part gardening questions
- **Smart Card Selection**: Intelligently select and display the most relevant cards based on query context
- **Conversation Memory**: Maintain context throughout chat conversations
- **Enhanced Personalization**: Generate responses that account for user preferences, location, and garden conditions

## Technical Implementation

### Integration Points

1. **AI Provider Setup**
   - Support for both OpenAI and Google Cloud Vertex AI
   - Securely store and access API keys from `.env` file
   - Implement unified client interface with provider-specific adapters
   - Create optimized prompt templates for gardening domain

2. **Message Processing Pipeline**
   - Convert user messages into well-structured prompts
   - Process AI responses and extract relevant information
   - Map AI recommendations to existing card components
   - Handle provider-specific message formats

3. **Environment Configuration**
   - Configure which AI provider to use via environment variables
   - Handle API keys securely with environment variables
   - Set up fallback responses for when API calls fail
   - Configure response caching to minimize API usage

### Components

1. **ai-client.js**
   - Provides a unified interface for AI services
   - Dynamically selects between OpenAI and Vertex AI based on configuration
   - Exposes consistent methods regardless of the underlying provider

2. **openai-client.js**
   - Manages connection to OpenAI API
   - Handles authentication, requests, and response parsing
   - Implements error handling and retry logic

3. **vertex-client.js**
   - Manages connection to Google Cloud Vertex AI
   - Converts between OpenAI and Vertex AI message formats
   - Implements error handling and token counting

4. **cards.js**
   - Handles smart card selection based on query content
   - Provides utilities to find relevant plant and task cards
   - Supports advanced card filtering and custom card creation

5. **GardenAgent.jsx (Enhanced)**
   - Updated to use AI services for response generation
   - Maintains conversation history for context
   - Implements message processing pipeline
   - Adapts to different AI provider responses

6. **gardening-prompts.js**
   - Contains optimized prompts for various gardening topics
   - Structures system messages to produce consistent responses
   - Defines output formats for different response types

## Implementation Code

### Environment Setup

Create or update `.env` file in the project root based on the included `.env.example`:

```
# AI Provider Configuration
# Choose which AI provider to use (OpenAI or Vertex AI)
USE_VERTEX_AI=false

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo
MAX_TOKENS=1024
TEMPERATURE=0.7

# Google Cloud Vertex AI Configuration
VERTEX_PROJECT_ID=your_google_cloud_project_id
VERTEX_LOCATION=us-central1
VERTEX_MODEL=gemini-1.0-pro
# Note: For Vertex AI, you'll need to set up Google Cloud authentication
# through service account credentials or application default credentials
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

### cards.js

```javascript
// src/utils/cards.js
import { samplePlants } from '../data/plants';
import { sampleTasks } from '../data/gardening-tasks';

/**
 * Card types supported by the system
 */
export const CARD_TYPES = {
  PLANT: 'plant',
  TASK: 'task',
  SOIL: 'soil',
  SUSTAINABILITY: 'sustainability'
};

/**
 * Selects appropriate cards to display based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {object} llmResponse - The structured response from the LLM
 * @param {string} llmResponse.content - The text content of the response
 * @param {string} llmResponse.cardType - The type of card to show (if any)
 * @returns {Array} - Array of card objects to display
 */
export function selectCardsForResponse(query, llmResponse) {
  const { content, cardType } = llmResponse;
  let cards = [];

  switch (cardType) {
    case CARD_TYPES.PLANT:
      cards = getPlantCards(query, content);
      break;
    case CARD_TYPES.TASK:
      cards = getTaskCards(query, content);
      break;
    default:
      // No cards to display
      break;
  }

  return cards;
}

/**
 * Returns plant cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of plant card objects
 */
function getPlantCards(query, content) {
  // For now, return all sample plants
  // In a more advanced implementation, this would filter plants based on the query
  return samplePlants.map(plant => ({ 
    type: CARD_TYPES.PLANT, 
    data: plant 
  }));
}

/**
 * Returns task cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of task card objects
 */
function getTaskCards(query, content) {
  // For now, return all sample tasks
  // In a more advanced implementation, this would filter tasks based on the query
  return sampleTasks.map(task => ({ 
    type: CARD_TYPES.TASK, 
    data: task 
  }));
}

/**
 * Advanced card selection that uses LLM embedding or keyword extraction
 * to find the most relevant cards for a given query
 * @param {string} query - The user's gardening question
 * @param {string} cardType - The type of card to retrieve
 * @param {number} limit - Maximum number of cards to return
 * @returns {Promise<Array>} - Promise resolving to an array of card objects
 */
export async function getRelevantCards(query, cardType, limit = 3) {
  // This is a placeholder for more advanced card selection logic
  // In a full implementation, this would:
  // 1. Extract keywords from the query
  // 2. Use embeddings to find semantic matches
  // 3. Apply filters for properties mentioned in the query
  
  // For now, return a subset of our sample data
  switch (cardType) {
    case CARD_TYPES.PLANT:
      return samplePlants
        .slice(0, limit)
        .map(plant => ({ type: CARD_TYPES.PLANT, data: plant }));
    
    case CARD_TYPES.TASK:
      return sampleTasks
        .slice(0, limit)
        .map(task => ({ type: CARD_TYPES.TASK, data: task }));
    
    default:
      return [];
  }
}

/**
 * Extension point for adding custom card processing logic
 * based on specific user intent detected in queries
 * @param {string} query - The user's query
 * @param {object} intentData - Intent data extracted from the query
 * @returns {Array} - Array of card objects
 */
export function processCardsByIntent(query, intentData) {
  // This could handle specific intents like:
  // - Seasonal planting recommendations
  // - Soil type specific plants
  // - Plants by color or feature
  // - Tasks filtered by difficulty or season
  
  // Mock implementation for now
  if (intentData.intent === 'seasonal_planting') {
    const season = intentData.season || 'spring';
    // Filter plants by season
    return samplePlants
      .filter(plant => plant.floweringSeason?.toLowerCase().includes(season))
      .map(plant => ({ type: CARD_TYPES.PLANT, data: plant }));
  }
  
  // Default to empty array if no matching intent
  return [];
}

/**
 * Creates a new custom card from LLM-generated content
 * @param {string} type - The type of card to create
 * @param {object} data - The data for the card
 * @returns {object} - A new card object
 */
export function createCustomCard(type, data) {
  // Generate a unique ID for the card
  const id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  switch (type) {
    case CARD_TYPES.PLANT:
      return {
        type,
        data: {
          id,
          commonName: data.name || 'Custom Plant',
          latinName: data.latinName || '',
          description: data.description || '',
          waterNeeds: data.waterNeeds || 'Medium',
          sunNeeds: data.sunNeeds || 'Partial Sun',
          soilPreference: data.soilPreference || 'Well-draining',
          nativeToIreland: data.nativeToIreland || false,
          isPerennial: data.isPerennial || false,
          imageUrl: data.imageUrl || '/images/plants/wildflowers.jpg', // Default image
          sustainabilityRating: data.sustainabilityRating || 3,
          biodiversityValue: data.biodiversityValue || 3
        }
      };
      
    case CARD_TYPES.TASK:
      return {
        type,
        data: {
          id,
          title: data.title || 'Custom Task',
          description: data.description || '',
          category: data.category || 'Maintenance',
          priority: data.priority || 'Medium'
        }
      };
      
    default:
      return { type, data: { id, ...data } };
  }
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
import { selectCardsForResponse } from "../../utils/cards";

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
      
      // Select appropriate cards to display based on the response
      const cards = selectCardsForResponse(input, aiResponse);
      
      // Build the response object
      let response = {
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
      };
      
      // Add cards if they were selected
      if (cards && cards.length > 0) {
        response.cards = cards;
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

### ai-client.js

```javascript
// src/utils/ai-client.js
// Unified client for AI services (OpenAI and Vertex AI)

/**
 * This module provides a unified interface for AI services,
 * allowing the application to switch between OpenAI and Vertex AI
 * based on configuration.
 */

// Dynamic imports based on environment configuration
let client = null;

/**
 * Initialize the AI client based on environment configuration
 * @returns {Promise<Object>} The initialized AI client
 */
export async function initializeAIClient() {
  // Determine which client to use based on environment variable
  const useVertexAI = import.meta.env.USE_VERTEX_AI === 'true';
  
  if (useVertexAI) {
    // Use Vertex AI
    const { 
      generateVertexResponse, 
      processGardeningQueryWithVertex,
      countTokens 
    } = await import('./vertex-client.js');
    
    client = {
      generateChatResponse: generateVertexResponse,
      processGardeningQuery: processGardeningQueryWithVertex,
      countTokens,
      provider: 'vertex'
    };
  } else {
    // Use OpenAI (default)
    const { 
      generateChatResponse, 
      processGardeningQuery 
    } = await import('./openai-client.js');
    
    client = {
      generateChatResponse,
      processGardeningQuery,
      countTokens: async () => 0, // OpenAI client doesn't have this yet
      provider: 'openai'
    };
  }
  
  return client;
}

/**
 * Get the current AI client (initializes if needed)
 * @returns {Promise<Object>} The AI client
 */
export async function getAIClient() {
  if (!client) {
    client = await initializeAIClient();
  }
  return client;
}

/**
 * Process a gardening query using the configured AI provider
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Structured response with content and optional cards
 */
export async function processQuery(query, conversationHistory = []) {
  const aiClient = await getAIClient();
  return aiClient.processGardeningQuery(query, conversationHistory);
}

/**
 * Generate a chat response using the configured AI provider
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The text response from the model
 */
export async function generateResponse(messages, options = {}) {
  const aiClient = await getAIClient();
  return aiClient.generateChatResponse(messages, options);
}

/**
 * Get information about the current AI provider
 * @returns {Promise<Object>} Information about the current provider
 */
export async function getProviderInfo() {
  const aiClient = await getAIClient();
  return {
    provider: aiClient.provider,
    model: aiClient.provider === 'vertex' 
      ? (import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro')
      : (import.meta.env.OPENAI_MODEL || 'gpt-4-turbo')
  };
}

export default {
  initializeAIClient,
  getAIClient,
  processQuery,
  generateResponse,
  getProviderInfo
};
```

### vertex-client.js

```javascript
// src/utils/vertex-client.js
// Client for Google Cloud Vertex AI Generative Models

/**
 * This module provides a client for interacting with Google Cloud Vertex AI
 * generative models. It can be used as an alternative to the OpenAI client
 * for garden assistant queries.
 * 
 * Prerequisites:
 * - Google Cloud project with Vertex AI API enabled
 * - Service account with appropriate permissions
 * - Google Cloud credentials configured properly
 * 
 * Install dependencies:
 * npm install @google-cloud/vertexai
 */

import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex with project and location from environment variables
const vertexAI = new VertexAI({
  project: import.meta.env.VERTEX_PROJECT_ID,
  location: import.meta.env.VERTEX_LOCATION || 'us-central1',
});

// System prompt for gardening assistance
const GARDENING_SYSTEM_INSTRUCTION = `You are an expert Irish gardening assistant that specializes in providing advice for gardeners in Ireland.
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
 * Generate a chat response using Google Vertex AI
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The text response from the model
 */
export async function generateVertexResponse(messages, options = {}) {
  try {
    // Convert messages format from OpenAI style to Vertex AI style
    const vertexMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Initialize the model
    const modelName = import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro';
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      systemInstruction: {
        role: 'system',
        parts: [{ text: GARDENING_SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 1024,
        topP: options.top_p || 1,
      }
    });

    // Create the request
    const request = {
      contents: vertexMessages,
    };

    // Generate content
    const response = await generativeModel.generateContent(request);
    const responseText = response.response.candidates[0].content.parts[0].text;

    return responseText;
  } catch (error) {
    console.error("Error calling Vertex AI API:", error);
    
    // Return a graceful fallback message
    return "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly or ask another gardening question.";
  }
}

/**
 * Process a gardening query and return a structured response using Vertex AI
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Structured response with content and optional cards
 */
export async function processGardeningQueryWithVertex(query, conversationHistory = []) {
  // Prepare the conversation history
  const vertexConversation = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    content: msg.content
  }));
  
  // Add the current query
  vertexConversation.push({ role: 'user', content: query });
  
  // Generate the response
  const responseText = await generateVertexResponse(vertexConversation);
  
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

/**
 * Count tokens in a message for cost estimation
 * @param {Array} messages - Messages to count tokens for
 * @returns {Promise<number>} - Estimated token count
 */
export async function countTokens(messages) {
  try {
    // Convert messages format from OpenAI style to Vertex AI style
    const vertexMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Initialize the model
    const modelName = import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro';
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
    });

    // Create the request
    const request = {
      contents: vertexMessages,
    };

    // Count tokens
    const response = await generativeModel.countTokens(request);
    return response.totalTokens;
  } catch (error) {
    console.error("Error counting tokens:", error);
    return 0;
  }
}

export default {
  generateVertexResponse,
  processGardeningQueryWithVertex,
  countTokens
};
```

## Implementation Checklist

- [ ] Set up AI provider integration (OpenAI and Vertex AI)
- [ ] Create environment configuration with provider selection
- [ ] Implement unified AI client interface
- [ ] Implement OpenAI client utility
- [ ] Implement Vertex AI client utility  
- [ ] Develop gardening-specific prompts
- [ ] Create cards utility for intelligent card selection
- [ ] Update GardenAgent component with AI integration
- [ ] Add error handling and fallbacks
- [ ] Implement response caching
- [ ] Test across different gardening query scenarios and providers
- [ ] Document API usage and monitoring

## Deployment Considerations

1. **Environment Variables**
   - Ensure production environment has API keys configured for chosen provider
   - Set up proper secret management in deployment environment
   - Configure USE_VERTEX_AI flag to select desired provider

2. **Provider-Specific Authentication**
   - For OpenAI: Configure API key
   - For Vertex AI: Set up Google Cloud authentication (service account or ADC)

3. **Monitoring**
   - Add logging for API calls
   - Monitor usage to prevent exceeding quotas
   - Track error rates and response quality
   - Set up provider-specific monitoring (OpenAI dashboard, Google Cloud monitoring)

4. **Cost Management**
   - Implement caching for common queries
   - Monitor API usage costs across providers
   - Consider batching requests when appropriate
   - Analyze cost-effectiveness of each provider for your specific usage patterns