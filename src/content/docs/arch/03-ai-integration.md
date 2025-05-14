---
title: "AI Integration Architecture"
description: "Detailed overview of Bloom's AI integration with Vertex AI and OpenAI"
category: "arch"
---

# AI Integration Architecture

This document details how Bloom integrates with AI services to power its gardening assistant capabilities. The application uses a unified client approach that primarily leverages Google Vertex AI's Gemini models while maintaining compatibility with OpenAI.

## AI Integration Overview

```
┌───────────────────────┐
│    Frontend (React)   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   API Endpoints       │
│   (/api/garden.js)    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   Unified AI Client   │
│   (vertex-client.js)  │
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌───────────┐
│ Vertex  │   │  OpenAI   │
│   AI    │   │ (fallback)│
└─────────┘   └───────────┘
```

## Core Components

### 1. Unified AI Client (`vertex-client.js`)

The unified AI client provides a consistent interface for interacting with different AI providers:

```javascript
/**
 * Generates text using Vertex AI Gemini model
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Options for the generation
 * @returns {Promise<string>} The generated text
 */
export async function generateText(prompt, options = {}) {
  // Implementation that handles authentication, request formatting, and response processing
}
```

**Key Features:**
- **Authentication Management**: Handles different authentication flows for local development and production
- **Provider Switching**: Graceful fallback between Vertex AI and OpenAI when needed
- **Response Formatting**: Standardizes response formats regardless of provider
- **Error Handling**: Robust error handling and logging
- **Token Management**: Handles token counting and limitations

### 2. System Prompts

Bloom uses carefully engineered system prompts that define the gardening assistant's personality, knowledge domain, and response format:

```javascript
const GARDENING_ASSISTANT_PROMPT = `
You are a helpful gardening assistant specialized in Irish gardening conditions.
Your expertise includes:
- Plant recommendations for Irish climate and soil conditions
- Seasonal gardening tasks specific to Ireland's growing zones
- Sustainable gardening practices
- Soil information for different Irish counties
...
`;
```

The system prompts are structured with:
- **Personality Definition**: How the assistant should present itself
- **Knowledge Boundaries**: What the assistant knows about (Irish gardening)
- **Response Formats**: How to structure different response types
- **Card Indicators**: Special markers to trigger UI card generation
- **Constraint Guidelines**: What the assistant should avoid doing

### 3. API Endpoints

The main API endpoints for AI interaction include:

#### Standard Gardening Assistant (`/api/garden.js`)

Processes conversational interactions with the gardening assistant:

```javascript
export default async function handler(req, res) {
  try {
    const { query, conversationHistory } = req.body;
    // Process with Vertex AI
    const response = await processGardeningQueryWithVertex(query, conversationHistory);
    return res.status(200).send(response);
  } catch (error) {
    // Error handling
  }
}
```

#### GraphRAG Assistant (`/api/gardening-question/stochastic.js`)

Processes queries using the graph-enhanced RAG system:

```javascript
export default async function handler(req, res) {
  try {
    const { question, conversationHistory } = req.body;
    // Process with GraphRAG
    const answer = await answerGardeningQuestion(question, {
      conversationHistory
    });
    return res.status(200).json(answer);
  } catch (error) {
    // Error handling
  }
}
```

#### Plant Recommendations (`/api/plant-recommendations.js`)

Generates personalized plant suggestions:

```javascript
export default async function handler(req, res) {
  try {
    const { county, soilType, sunExposure, spaceAvailable, goals } = req.body;
    // Get recommendations using AI
    const recommendations = await getPlantRecommendations({
      county, soilType, sunExposure, spaceAvailable, goals
    });
    return res.status(200).json(recommendations);
  } catch (error) {
    // Error handling
  }
}
```

## Integration with Vertex AI

### Authentication Flow

The system implements a flexible authentication mechanism for Vertex AI:

1. **Local Development**:
   - Uses service account key stored in environment variables
   - Supports authentication through Google Application Default Credentials

2. **Production (Netlify)**:
   - Uses service account key stored in Netlify environment variables
   - Implements secure credential handling

```javascript
// Authentication logic
function getAuthClient() {
  // Check if we're in a Netlify environment
  const isNetlify = process.env.NETLIFY || false;
  
  if (isNetlify) {
    // Use service account directly from environment variables
    return new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
  } else {
    // Use Application Default Credentials for local development
    return new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
  }
}
```

### Request Processing

The Vertex AI integration includes sophisticated request handling:

1. **Message Formatting**:
   - Converts between the frontend message format and Vertex AI format
   - Applies appropriate role mappings (user, assistant)

2. **Model Selection**:
   - Primary: `gemini-2.0-flash-001` for efficient response generation
   - Fallback options for different response requirements

3. **Parameter Tuning**:
   - Temperature: 0.7 for creative but consistent responses
   - TopK/TopP: Adjusted for gardening domain accuracy
   - MaxOutputTokens: Dynamic based on query complexity

### Response Processing

Responses from Vertex AI undergo several processing steps:

1. **Content Extraction**:
   - Parses the response to extract the main content
   - Handles different response formats

2. **Card Detection**:
   - Analyzes response content for card indicators
   - Identifies explicit markers like `SHOWING_PLANT_CARDS`
   - Uses NLP patterns to detect implicit card needs

3. **Response Formatting**:
   - Standardizes response format for frontend consumption
   - Ensures consistent structure regardless of provider

## Card Generation System

The AI integration includes a sophisticated card generation system:

### Card Detection Logic

```javascript
export function detectCardType(query, response) {
  // Plant card detection
  if (
    response.includes("SHOWING_PLANT_CARDS") ||
    (containsPlantNames(response) && 
     (query.toLowerCase().includes("recommend") || 
      query.toLowerCase().includes("suggest")))
  ) {
    return CARD_TYPES.PLANT;
  }
  
  // Task card detection
  if (
    response.includes("SHOWING_TASK_CARDS") ||
    (response.toLowerCase().includes("task") && 
     containsMonthNames(response))
  ) {
    return CARD_TYPES.TASK;
  }
  
  // More card type detection logic...
  
  return null; // No card type detected
}
```

### Card Selection Process

When an AI response is received:

1. The system analyzes both the user query and AI response
2. It identifies potential card types based on content
3. It extracts structured data for card generation
4. The appropriate card component is selected for rendering

## Error Handling and Fallbacks

The AI integration implements robust error handling:

1. **Request Failures**:
   - Retries with exponential backoff for temporary failures
   - Falls back to alternative providers when possible
   - Returns graceful error messages to the user

2. **Response Validation**:
   - Validates AI responses for expected format and content
   - Handles inconsistent or unexpected responses
   - Logs detailed error information for debugging

3. **Rate Limiting**:
   - Implements token counting to stay within API limits
   - Queues requests during high traffic periods
   - Provides appropriate user feedback during throttling

## Multi-Mode Operation

The system supports two distinct operational modes:

### 1. Standard Mode

- Direct interaction with the AI model
- Uses the gardening system prompt for knowledge
- Performs card detection on responses
- Simple query-response flow

### 2. GraphRAG Mode

- Enhanced interaction using the graph database
- Retrieves relevant information before generating responses
- Shows source facts used in the response
- Displays generated database queries for transparency

```javascript
// GraphRAG mode toggle handler
const handleGraphRAGQuery = async (userInput, conversationHistory) => {
  // Call the GraphRAG API endpoint
  const response = await fetch("/api/gardening-question/stochastic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: userInput,
      conversationHistory,
    }),
  });
  
  // Process response...
  
  return {
    content: data.answer,
    sourceFacts: data.sourceFacts || [],
    generatedQuery: data.generatedQuery || "",
  };
};
```

## Prompt Engineering Techniques

The system uses several advanced prompt engineering techniques:

1. **Contextual Prompting**:
   - Includes Irish-specific gardening information
   - References local climate and growing conditions

2. **Few-Shot Learning**:
   - Provides examples of ideal responses in the system prompt
   - Shows card formatting examples for consistent outputs

3. **Chain-of-Thought**:
   - Encourages the model to "think step by step"
   - Improves reasoning for complex gardening questions

4. **Structured Output Prompting**:
   - Defines specific output formats for different query types
   - Increases consistency in response structure