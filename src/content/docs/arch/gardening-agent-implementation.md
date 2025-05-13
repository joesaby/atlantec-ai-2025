---
title: "Gardening Agent Implementation Documentation"
description: "Gardening Agent Implementation Documentation documentation"
category: "arch"
---

## 1. Overview

The Gardening Agent is an interactive chat-based system that provides personalized gardening advice to users in Ireland. It combines frontend React components with a backend AI integration using Google Vertex AI. The agent supports various features including plant recommendations, seasonal task suggestions, soil information, and sustainability practices.

## 2. Frontend Components

### 2.1 Main Page Structure (`gardening-agent.astro`)

The main page serves as the container for the Gardening Agent interface. Key components include:

- A header section that describes the agent's capabilities
- The primary `GardenAgent` chat interface
- A hidden `GardeningCalendar` component that appears when task-related queries are made
- A "How to Use" guide for the user

### 2.2 GardenAgent Component

`GardenAgent.jsx` is the core interactive component that manages:

- **Chat Functionality**: Handles message history, user input, and displays AI responses
- **UI State Management**: Controls the drawer interface, loading states, and auto-scrolling
- **API Integration**: Communicates with the backend API to process user queries
- **Card Generation**: Displays different types of cards based on AI responses
- **Event Handling**: Dispatches custom events to coordinate with other components

Key implementation details:

- Uses React state hooks to manage messages, input, and UI states
- Implements a submit handler that sends requests to the backend and processes responses
- Dispatches events when task cards are generated to notify other components
- Renders messages with appropriate styling and card containers

### 2.3 Card System

The card system displays structured information based on the query type:

- **CardContainer**: A universal container for all card types that handles expansion states
- **Card Types**:
  - **Plant Cards**: Show plant recommendations with details
  - **Task Cards**: Display gardening tasks with priority and category information
  - **Soil Information Cards**: Provide soil details for specific Irish counties
  - **Sustainability Cards**: Show environmental impact information

The card system includes:

- Consistent styling with expandable/collapsible functionality
- Category-specific rendering logic
- Dynamic content loading based on query analysis

### 2.4 GardeningCalendar Component

The calendar component displays gardening tasks organized by month:

- Shows tasks for the upcoming months
- Allows filtering by task category
- Toggles between default tasks and query-specific tasks
- Receives task cards via a custom event system
- Renders tasks using the `MonthlyTasks` component

### 2.5 Task Rendering

Tasks are displayed using:

- `MonthlyTasks`: Groups tasks by month with expand/collapse functionality
- `TaskCard`: Renders individual task cards with priority badges and category icons

## 3. Backend Implementation

### 3.1 API Endpoint

The main API endpoint (`/api/garden.js`) handles:

- Receiving user queries and conversation history
- Error handling and request validation
- Connecting to the Vertex AI client
- Returning structured responses

### 3.2 AI Integration with Vertex AI

The Vertex AI client (`vertex-client.js`) provides:

- Authentication handling for different environments (local and Netlify)
- A system prompt that defines the agent's personality and response format
- Message formatting between OpenAI and Vertex AI formats
- Response generation using the Gemini model
- Error handling with detailed logging

Key features:

- Uses a detailed gardening system prompt focused on Irish conditions
- Handles both local development and serverless deployment scenarios
- Implements token counting for cost estimation
- Provides a unified client interface for consistency

### 3.3 Card Detection and Generation

The card utilities (`cards.js` and `card-utils.js`) handle:

- Detecting when cards should be shown based on response content
- Selecting appropriate cards based on the query and response
- Formatting card data for different categories
- Extracting entities like plant names, tasks, or soil types

The system uses both:

- Explicit indicators (e.g., "SHOWING_PLANT_CARDS") in the AI response
- Smart detection based on content patterns

## 4. Data Processing Flow

### 4.1 User Query Processing

1. User enters a query in the `GardenAgent` interface
2. The query and conversation history are sent to `/api/garden.js`
3. The API endpoint forwards the request to Vertex AI via `processGardeningQueryWithVertex`
4. Vertex AI generates a response using the gardening system prompt
5. Response is processed to detect card types using `detectCardType`
6. API returns the formatted response to the frontend

### 4.2 Response Handling

1. Frontend receives the response and adds it to the message history
2. Card content is extracted and appropriate cards are generated using `selectCardsForResponse`
3. Cards are rendered in the UI with the corresponding `CardContainer`
4. For task queries, custom events are dispatched to update the calendar
5. UI elements are updated to show expansion options based on card type

### 4.3 Calendar Integration

When task-related queries are made:

1. Task cards are generated and added to the message
2. A custom event `task-cards-available` is dispatched with task data
3. The calendar component receives the event and updates its data
4. User can view the calendar through the "View Calendar" button

## 5. Special Features

### 5.1 Sustainability Information

The system provides sustainability insights by:

- Detecting sustainability-related queries
- Calculating carbon footprint savings for growing plants
- Generating specialized sustainability cards
- Supporting both general gardening sustainability and food-specific sustainability metrics

### 5.2 Irish Soil Information

The system includes:

- County-specific soil data for Ireland
- Soil type detection from user queries
- Specialized soil information cards
- Recommendations based on soil types

### 5.3 Intelligent Card Selection

Cards are selected based on:

- Explicit markers in AI responses
- Content analysis for implicit detection
- Query context analysis
- Entity extraction (plants, counties, soil types)

## 6. Technical Considerations

### 6.1 Frontend Optimizations

- Auto-scrolling ensures newest messages are visible
- Drawer state management prevents UI glitches
- Lazy loading of expanded content
- Responsive design for different screen sizes

### 6.2 Backend Robustness

- Comprehensive error handling
- Logging system for debugging
- Fallback responses for API failures
- Environment-specific authentication

### 6.3 Integration Points

- Custom events for component communication
- Shared utility functions for consistent processing
- Global update functions for cross-component updates
- Modular design for extensibility
