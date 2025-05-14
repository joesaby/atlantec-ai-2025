---
title: "Architecture Overview"
description: "Comprehensive overview of Bloom's architecture and system design"
category: "arch"
---

# Architecture Overview

Bloom is an AI-powered gardening assistant designed specifically for Irish gardeners. This document provides a high-level overview of Bloom's architecture, design patterns, and key components.

## System Architecture

Bloom follows a modern web application architecture with the following key components:

```
┌───────────────────────┐
│      Web Frontend     │
│  (Astro + React + UI) │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│      API Layer        │
│  (Serverless Functions)│
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌───────────┐
│ AI      │   │  Data     │
│ Services│   │  Services │
└─────────┘   └───────────┘
```

### Core Components

1. **Frontend Layer**
   - Astro framework for static and dynamic content
   - React components for interactive elements
   - TailwindCSS with daisyUI for styling
   - Responsive design for mobile and desktop

2. **API Layer**
   - Serverless functions deployed on Netlify
   - RESTful endpoints for data access
   - Authentication and data validation
   - Error handling and logging

3. **AI Services**
   - Google Vertex AI (Gemini models) integration
   - OpenAI compatibility layer
   - Prompt engineering for gardening knowledge
   - Response formatting and card extraction

4. **Data Services**
   - Neo4j graph database for knowledge representation
   - GraphRAG (Graph Retrieval-Augmented Generation)
   - Irish soil and weather data integration
   - Plant and sustainability data storage

## Key Design Patterns

### 1. Conversational UI Pattern

The primary user interaction happens through a chat-based interface that:
- Processes natural language questions about gardening
- Maintains conversation context for follow-up questions
- Renders responses with specialized card layouts
- Extracts structured data from AI responses

### 2. GraphRAG Knowledge System

Bloom uses a graph-based retrieval system to enhance AI responses:
- Stores gardening knowledge in a Neo4j graph database
- Represents relationships between plants, conditions, and practices
- Queries relevant knowledge based on user questions
- Augments AI generation with retrieved knowledge

### 3. Card-Based Information Display

Information is organized into expandable cards that:
- Group related content into visual components
- Support different types of data (plants, tasks, soil info)
- Provide consistent visual styling
- Allow progressive disclosure of detailed information

### 4. Multi-Provider AI Strategy

The system supports multiple AI providers:
- Primary: Google Vertex AI (Gemini models)
- Alternative: OpenAI models
- Unified client interface for consistency
- Provider-specific optimizations

## Feature Modules

Bloom is organized into several core feature modules:

1. **Gardening Assistant**: Conversational AI interface for gardening advice
2. **Plant Recommendations**: Personalized plant suggestions based on conditions
3. **Seasonal Planner**: Monthly gardening tasks and calendar
4. **Soil Information**: Irish county-specific soil data and advice
5. **Sustainability Tracker**: Environmental impact of gardening choices
6. **Weather Integration**: Current and forecast weather data
7. **GraphRAG System**: Knowledge graph for enhanced recommendations

## Development Phases

Bloom has been implemented through a series of incremental development phases:

1. **Phase 1: Setup & Data Integration**
   - Project foundation and Astro setup
   - Weather and soil data integration 
   - County-specific information models

2. **Phase 2: Plant Recommendation System**
   - Plant database creation
   - Recommendation engine implementation
   - Interactive plant cards and filtering

3. **Phase 3: Seasonal Planning**
   - Monthly gardening tasks calendar
   - Seasonal overview and planning tools
   - Task prioritization and categorization

4. **Phase 4: Sustainability Tracking**
   - Environmental impact metrics
   - SDG (Sustainable Development Goals) integration
   - Resource usage tracking

5. **Phase 5: GraphRAG Implementation**
   - Neo4j knowledge graph setup
   - Graph-based recommendations
   - AI augmentation with structured knowledge

6. **Phase 6: Gardening Agent Chat Interface**
   - Conversational UI implementation
   - Dynamic card rendering in responses
   - Message history management

7. **Phase 7: AI Integration**
   - Vertex AI and OpenAI provider support
   - Enhanced prompt engineering
   - Context-aware response generation

For detailed information on phase dependencies, refer to the [Phase Dependencies and Progression](/docs/devel-phases/phase-dependencies) document.

## Development & Deployment Flow

```
Development → Build → Deployment → Monitoring
    │            │         │            │
    ▼            ▼         ▼            ▼
  Local     Static Site  Netlify     Logging
Development  Generation  Functions   System
```

- **Development**: Local environment with Astro dev server
- **Build**: Static site generation with dynamic islands
- **Deployment**: Netlify for hosting and serverless functions
- **Monitoring**: Built-in logging system for operation monitoring

## Technical Stack

- **Frontend**: 
  - Astro 4.x
  - React 18
  - TailwindCSS
  - daisyUI

- **Backend**:
  - Netlify Functions
  - Neo4j Graph Database
  - Node.js

- **AI/ML**:
  - Google Vertex AI (Gemini Pro)
  - OpenAI compatibility
  - GraphRAG implementation

- **DevOps**:
  - GitHub for source control
  - Netlify for CI/CD and hosting
  - Environment-based configuration

## System Integration

The different modules of Bloom are integrated through:

1. **API Contracts**: Well-defined interfaces between components
2. **Event System**: Custom events for cross-component communication
3. **Shared Utilities**: Common functions for data processing and UI operations
4. **Context Providers**: React contexts for sharing state between components
5. **URL Parameters**: State persistence across page navigation

## Performance Considerations

Bloom implements several performance optimizations:

1. **Static Generation**: Pre-rendered content for fast initial loads
2. **Dynamic Islands**: Interactive components loaded on demand
3. **Response Caching**: Cached AI responses for common queries
4. **Lazy Loading**: Images and components loaded as needed
5. **Database Indexing**: Optimized Neo4j queries for fast lookups

## Security Measures

The application incorporates several security features:

1. **Environment Isolation**: Separation of development and production environments
2. **API Key Management**: Secure handling of AI provider credentials
3. **Input Validation**: Protection against injection attacks
4. **CORS Configuration**: Controlled access to API endpoints
5. **Logging Controls**: Redaction of sensitive information in logs

## Additional Architecture Documents

- [Frontend Architecture](02-frontend-architecture.md): Detailed component structure
- [AI Integration](03-ai-integration.md): AI services implementation
- [GraphRAG System](04-graphrag-system.md): Knowledge graph implementation
- [Logging System](05-logging-system.md): Monitoring and debugging infrastructure

## Future Architectural Considerations

As Bloom continues to evolve, several architectural enhancements are planned:

1. **Progressive Web App**: Enhanced offline capabilities
2. **Edge Computing**: Move more functionality to edge functions
3. **User Profiles**: Personalized gardening recommendations
4. **Mobile App Integration**: Native companion applications
5. **IoT Integration**: Support for garden sensors and automation