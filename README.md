# Bloom - AI Gardening Assistant

![Bloom Logo](/public/images/bloom-logo.svg|width=200)

Bloom is an interactive AI-powered gardening assistant designed specifically for Irish gardeners. It helps users select suitable plants, implement sustainable gardening practices, and access personalized advice based on their local conditions.

**Live Demo:** [https://irish-gardening.netlify.app/](https://irish-gardening.netlify.app/)

## 🌱 Main Features

### AI Gardening Assistant

The core of Bloom is the conversational AI assistant that provides:

- Natural language interactions for gardening advice
- Personalized plant recommendations based on user conditions
- Seasonal planting guidance with climate considerations
- Sustainable gardening practices tailored to Irish environments
- Troubleshooting help for common gardening problems

### Demonstrator Features

Bloom includes several specialized modules:

- **Weather & Soil Integration**: Real-time weather data and soil information for Irish counties
- **Plant Recommendation Engine**: Smart plant suggestions based on location, soil type, and garden conditions
- **Seasonal Garden Planner**: Monthly task calendar and seasonal overview for year-round gardening
- **Sustainability Tracker**: Tools to measure and improve the environmental impact of garden practices
- **GraphRAG Knowledge System**: Graph-based retrieval augmented generation for highly accurate gardening information

## 🛠️ Architecture

Bloom is built with a modern web technology stack:

- **Frontend**: Astro framework with React components and TailwindCSS/daisyUI
- **AI Integration**: Unified client supporting multiple AI providers (OpenAI and Google Vertex AI)
- **Data Storage**: Structured gardening knowledge in GraphRAG system
- **API Layer**: Serverless functions for weather data, plant recommendations, and AI interactions

```
Architecture Overview:
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Web Frontend │────▶│   API Layer   │────▶│  AI Services  │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  UI Components│     │ Data Services │     │ Knowledge Base│
└───────────────┘     └───────────────┘     └───────────────┘
```

## 🌍 Deployment

Bloom is deployed on Netlify and available at:
[https://irish-gardening.netlify.app/](https://irish-gardening.netlify.app/)

## 📚 Documentation

For detailed information about the project, including

1. [Getting started](https://irish-gardening.netlify.app/docs/)
2. [Architecture](https://irish-gardening.netlify.app/docs/arch/01-architecture-overview)
3. [Development phases](https://irish-gardening.netlify.app/docs/devel-phases/phase-dependencies)

## 📅 Project Timeline

```mermaid
timeline
    title Bloom Project Development Timeline
    section Research Phase
        May 2-6, 2025 : Initial research on agriculture, energy, flood management
                      : Exploration of SDG enhancement opportunities
                      : Documentation in src/content/docs/research/
    section Planning Phase
        May 6-7, 2025 : Development planning and roadmap creation
                      : Phase dependencies documentation
                      : Docs in src/content/docs/devel-phases/
    section Implementation Phase
        May 7-8, 2025 : Astro framework & React components setup
                      : TailwindCSS/daisyUI implementation
                      : Sample UI cards and demonstrator pages
        May 8-10, 2025 : Gardening Agent implementation
                       : Soil and weather data integration
                       : Dynamic card rendering system
        May 12-13, 2025 : GraphRAG system implementation
                        : Knowledge graph integration
                        : Enhanced AI response quality
    section Finalization Phase
        May 13-14, 2025 : Rebranding from "Garden Assistant" to "Bloom"
                        : Theme, icons and brand asset updates
                        : Documentation finalization
```

## 💚 Sustainability Focus

Bloom promotes sustainable gardening practices by:

- Encouraging native plant selection
- Providing water conservation guidance
- Offering biodiversity enhancement advice
- Measuring environmental impact of gardening choices
- Supporting sustainable food production
