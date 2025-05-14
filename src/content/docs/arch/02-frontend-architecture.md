---
title: "Frontend Architecture"
description: "Detailed overview of Bloom's frontend component structure and design patterns"
category: "arch"
---

# Frontend Architecture

This document details the frontend architecture of Bloom, focusing on the component structure, state management, and user interface design patterns.

## Component Hierarchy

Bloom uses a modular component architecture organized by domain-specific features:

```
src/components/
├── common/         # Shared UI components
├── garden/         # Garden planning components
├── plants/         # Plant recommendation components
├── soil/           # Soil information components
├── sustainability/ # Sustainability tracking components
├── graphrag/       # GraphRAG knowledge components
├── weather/        # Weather integration components
└── tools/          # Utility components
```

### Core Components

#### 1. Chat Interface (`GardenAgent.jsx`)

The primary user interaction happens through a conversational UI implemented in the `GardenAgent` component. This component:

- Manages the chat interaction flow
- Processes user queries through the API
- Renders AI responses with appropriate styling
- Coordinates the display of specialized information cards
- Toggles between standard mode and GraphRAG mode
- Manages conversation history and state

**Key Features:**
- Custom chat bubble rendering with markdown support
- Dynamic card generation based on query context
- Source citation for GraphRAG responses
- Auto-scrolling to maintain conversation flow
- Responsive design for mobile and desktop

**State Management:**
```jsx
const [messages, setMessages] = useState([/* Initial welcome message */]);
const [input, setInput] = useState("");
const [isTyping, setIsTyping] = useState(false);
const [drawerOpen, setDrawerOpen] = useState(false);
// Card expansion states
const [soilInfoExpanded, setSoilInfoExpanded] = useState(false);
const [taskInfoExpanded, setTaskInfoExpanded] = useState(false);
// GraphRAG mode state
const [isGraphRAGMode, setIsGraphRAGMode] = useState(false);
const [sourceFacts, setSourceFacts] = useState([]);
```

#### 2. Card System

Information is organized into expandable cards that provide structured data visualization:

**Card Container (`CardContainer.jsx`):**
- Universal container for all specialized card types
- Manages expansion/collapse behavior
- Provides consistent styling across card types
- Routes content to appropriate specialized components

**Specialized Card Types:**
- `PlantCard`: Displays plant information with images and growing details
- `TaskCard`: Shows gardening tasks with priority levels and seasonal context
- `SoilCard`: Presents county-specific soil information
- `SustainabilityCard`: Visualizes environmental impact metrics

**Implementation Pattern:**
```jsx
<CardContainer
  message={message}
  index={index}
  messagesLength={messages.length}
  type={getCardType(message)}
  isExpanded={...}
  setExpanded={...}
/>
```

#### 3. Calendar System

The calendar system visualizes gardening tasks over time:

**GardeningCalendar Component:**
- Shows tasks organized by month
- Combines default seasonal tasks with AI-recommended tasks
- Provides filtering options by task category
- Uses event-based communication with the chat interface

**MonthlyTasks Component:**
- Groups tasks within a specific month
- Implements collapsible sections for each month
- Color-codes tasks by priority and type

## Pages and Routes

Bloom's frontend is organized into the following main pages:

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/` | `index.astro` | Landing page with feature overview |
| `/gardening-agent` | `gardening-agent.astro` | Main chat interface |
| `/plant-recommendations` | `plant-recommendations.astro` | Plant suggestion form |
| `/plant-guide` | `plant-guide.astro` | Detailed plant information |
| `/soil-information` | `soil-information.astro` | Soil data by county |
| `/sustainability-guide` | `sustainability-guide.astro` | Sustainable practices |
| `/garden-planner` | `garden-planner.astro` | Seasonal planning tool |
| `/graphrag-assistant` | `graphrag-assistant.astro` | Graph-based knowledge assistant |
| `/docs/[...slug]` | `[...slug].astro` | Documentation system |

## State Management

Bloom uses a combination of state management approaches:

1. **Component State**: React's `useState` for component-specific state
2. **Custom Events**: Browser events for cross-component communication
3. **URL Parameters**: For sharing state between page loads
4. **Local Storage**: For persisting user preferences and history

**Example of Custom Event Communication:**
```jsx
// When we have task cards, dispatch an event to notify the calendar component
const taskCardsEvent = new CustomEvent("task-cards-available", {
  detail: {
    tasks: latestMessage.cards,
    monthInfo: monthInfo,
    showCalendar: false,
  },
});
window.dispatchEvent(taskCardsEvent);
```

## UI Design Patterns

### 1. Responsive Drawer Pattern

The chat interface uses a responsive drawer pattern that:
- Displays as a full-screen chat on mobile devices
- Shows as a side drawer on larger screens
- Ensures important content remains visible during card expansion

### 2. Progressive Disclosure

Information is revealed progressively through:
- Collapsible card sections that expand when needed
- "Show more" toggles for detailed information
- Tabbed interfaces for related but distinct content

### 3. Conversational UI

The conversational interface follows these patterns:
- Clear visual distinction between user and assistant messages
- Timestamps for message context
- Visual indicators during AI response generation
- Support for markdown and formatted text in responses

## API Integration Pattern

Frontend components interact with the backend through a consistent API pattern:

1. **Request Construction**:
```jsx
const requestBody = JSON.stringify({
  query: input,
  conversationHistory
});
```

2. **Fetch Request**:
```jsx
const response = await fetch("/api/garden", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: requestBody,
});
```

3. **Response Processing**:
```jsx
if (!response.ok) {
  // Error handling
}
const responseText = await response.text();
const aiResponse = JSON.parse(responseText);
```

4. **Card Selection**:
```jsx
const cards = selectCardsForResponse(input, aiResponse);
```

5. **State Update**:
```jsx
setMessages(prevMessages => [...prevMessages, responseObj]);
```

## Asset Management

Bloom follows these asset management patterns:

- **Images**: Stored in `public/images/` with subdirectories by category
- **Styles**: Combined approach with global styles and component-specific styling
- **Icons**: Mix of SVG inline icons and imported icon libraries
- **Fonts**: Web-safe fonts with custom typography styling

## Rendering Optimizations

The frontend implements several optimizations:

1. **Lazy Loading**: Deferred loading of expanded card content
2. **Auto-Scrolling**: Smart scrolling that follows the conversation flow
3. **Debounced Handlers**: Prevents excessive re-renders during typing
4. **Conditional Rendering**: Only renders complex components when needed

## GraphRAG Mode Integration

The frontend implements a specialized GraphRAG mode that:

1. Toggles between standard and GraphRAG modes via UI control
2. Renders source facts and knowledge graph information
3. Displays generated database queries for transparency
4. Uses a distinct visual style to indicate GraphRAG mode

**GraphRAG Toggle Implementation:**
```jsx
const toggleGraphRAGMode = () => {
  // Reset expanded states
  setSoilInfoExpanded(false);
  setTaskInfoExpanded(false);
  // Toggle the mode
  setIsGraphRAGMode(!isGraphRAGMode);
  // Add a system message about the mode change
  const systemMessage = {
    role: "assistant",
    content: !isGraphRAGMode
      ? "I've switched to GraphRAG mode. This uses a knowledge graph..."
      : "I've switched back to standard mode...",
    timestamp: new Date(),
  };
  setMessages(prevMessages => [...prevMessages, systemMessage]);
};
```