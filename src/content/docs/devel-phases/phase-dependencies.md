---
title: "Development Phase Dependencies and Progression"
description: "Understanding how the development phases connect and build upon each other"
category: "devel-phases"
---

# Development Phase Dependencies and Progression

This document outlines how the different development phases of Bloom are interconnected, helping developers understand the progression and dependencies between phases.

## Phase Progression Overview

```
Phase 1 (Setup & Data) ──► Phase 2 (Plants) ──► Phase 3 (Seasonal) ──► Phase 4 (Sustainability)
                                                                          │
                                                                          ▼
Phase 7 (OpenAI Integration) ◄── Phase 6 (Chat UI) ◄── Phase 5 (GraphRAG)
```

## Key Dependencies Between Phases

### Phase 1 → Phase 2
- Phase 1 establishes core data structures (soil types, weather information) that Phase 2 relies on
- Components like `CountySelector` created in Phase 1 are reused in Phase 2
- Plant recommendations leverage soil and county data models established in Phase 1

### Phase 2 → Phase 3
- Phase 3's seasonal planner builds on the plant database created in Phase 2
- Plant growth timelines inform seasonal task recommendations
- Plant cards from Phase 2 are integrated into the seasonal planning interface

### Phase 3 → Phase 4
- Sustainability tracking extends seasonal planning with environmental impact metrics
- Gardening tasks from Phase 3 gain sustainability scores and SDG impact ratings
- The UI framework for task cards is extended to include sustainability features

### Phase 4 → Phase 5
- Phase 5's GraphRAG system incorporates all previous data models into a knowledge graph
- Sustainability metrics from Phase 4 become properties in the knowledge graph
- More sophisticated recommendations build on the foundation of basic recommendations

### Phase 5 → Phase 6
- The Gardening Agent's conversational UI is powered by the GraphRAG engine
- Card generation in responses is based on GraphRAG's recommendations
- Context-aware chat leverages the comprehensive knowledge graph

### Phase 6 → Phase 7
- Phase 7 enhances the chat interface with more intelligent AI providers
- The chat message processing pipeline is extended with OpenAI/Vertex capabilities
- The core UI remains the same, but gains additional intelligence

## Shared Components Across Phases

Throughout the development phases, several key components evolve and are reused:

| Component Type | Shared Across Phases |
|----------------|----------------------|
| Card System    | Phases 2, 3, 4, 5, 6 |
| Data Models    | All Phases           |
| County Selector| Phases 1, 2, 3, 4, 5 |
| API Endpoints  | Phases 2, 5, 6, 7    |
| UI Elements    | All Phases           |

## Recommended Implementation Order

For developers new to the project, we recommend following the phase order as designed, but with these specific dependencies in mind:

1. **Start with Phase 1** - Establish the core infrastructure and data models
2. **Implement Phase 2** - Build the plant recommendation system
3. **Choose a path**:
   - For UI-focused development: Continue to Phase 3 → 4
   - For AI-focused development: Skip to Phase 5, then return to Phase 3-4
   - For full-stack implementation: Follow the complete sequence

## Testing Across Phases

When implementing features that span multiple phases, cross-phase testing is essential:

- Test how county selection affects both weather data (Phase 1) and plant recommendations (Phase 2)
- Verify that seasonal tasks (Phase 3) align with plant-specific recommendations (Phase 2)
- Ensure GraphRAG features (Phase 5) correctly incorporate sustainability data (Phase 4)

## Future Enhancements

As the application evolves, any new phases should build upon this foundation:

- **Potential Phase 8**: Collaborative gardening features would extend Phases 6 and 7
- **Potential Phase 9**: Mobile app integration would reuse components from all previous phases
- **Potential Phase 10**: IoT garden monitoring would extend Phase 1's data models with sensor data