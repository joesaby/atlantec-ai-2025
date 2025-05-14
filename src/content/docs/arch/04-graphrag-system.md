---
title: "GraphRAG Knowledge System"
description: "Detailed overview of Bloom's Graph-based Retrieval-Augmented Generation system"
category: "arch"
---

# GraphRAG Knowledge System

This document explains Bloom's Graph-based Retrieval-Augmented Generation (GraphRAG) system, which combines a Neo4j graph database with large language models to provide accurate, context-aware gardening recommendations for Irish conditions.

## System Overview

GraphRAG enhances traditional Retrieval-Augmented Generation (RAG) by storing knowledge in a structured graph database rather than vector embeddings, allowing the system to leverage relationships between entities.

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  User Query         │────▶│  Entity Extraction  │────▶│  Knowledge Retrieval│
└─────────────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                                    │
┌─────────────────────┐     ┌─────────────────────┐                │
│  Response Rendering │◀────│  Answer Generation  │◀───────────────┘
└─────────────────────┘     └─────────────────────┘
```

The system follows these steps:
1. Extract entities and intent from user queries
2. Retrieve relevant knowledge from the Neo4j graph database
3. Format the retrieved knowledge as context for the LLM
4. Generate accurate, contextual responses
5. Present results with source attribution

## Knowledge Graph Structure

The Neo4j database contains a specialized knowledge graph of Irish gardening information:

### Core Entities

- **Plants**: Vegetation that can be grown in Irish gardens
- **SoilTypes**: Different soil compositions found in Ireland
- **Counties**: Irish counties with their specific growing conditions
- **Months**: Calendar months with seasonal attributes
- **Seasons**: Irish growing seasons (Spring, Summer, Autumn, Winter)
- **PollinatorTypes**: Types of pollinators attracted to plants

### Key Relationships

```
(Plant)-[:GROWS_WELL_IN]->(SoilType)
(Plant)-[:PLANT_IN]->(Month)
(Plant)-[:HARVEST_IN]->(Month)
(Plant)-[:COMPANION_TO]->(Plant)
(Plant)-[:ANTAGONISTIC_TO]->(Plant)
(Plant)-[:ATTRACTS]->(PollinatorType)
(County)-[:HAS_DOMINANT_SOIL]->(SoilType)
(Month)-[:BELONGS_TO]->(Season)
```

### Sample Schema (Cypher)

```cypher
// Node definitions
CREATE (p:Plant {
  name: String,
  type: String,
  description: String,
  growingSeason: String,
  climateZones: [String]
})

CREATE (s:SoilType {
  type: String,
  characteristics: String,
  pH: Float,
  drainage: String
})

CREATE (m:Month {
  name: String,
  order: Integer,
  season: String
})

// Relationship definitions
CREATE (p:Plant)-[:GROWS_WELL_IN]->(s:SoilType)
CREATE (p:Plant)-[:PLANT_IN]->(m:Month)
CREATE (c:County)-[:HAS_DOMINANT_SOIL]->(s:SoilType)
```

## GraphRAG Implementation

The GraphRAG system is implemented in `src/utils/rag-system.js` with the following core functions:

### 1. Query Processing (`answerGardeningQuestion`)

The main entry point for user queries:

```javascript
export async function answerGardeningQuestion(question, context = {}) {
  try {
    // 1. Extract entities and intent from the question
    const entities = await extractEntities(question);

    // 2. Retrieve relevant information from the database
    const retrievedInfo = await retrieveInformation(
      question,
      entities,
      context
    );

    // 3. Format the context for the LLM
    const promptContext = formatContextForLLM(retrievedInfo, context);

    // 4. Generate the answer using Vertex AI
    const answer = await generateAnswer(question, promptContext);

    return {
      answer,
      sourceFacts: retrievedInfo.facts,
      entities: entities,
    };
  } catch (error) {
    console.error("Error in RAG system:", error);
    return {
      answer:
        "I'm sorry, I couldn't generate an answer due to a technical issue.",
      error: error.message,
    };
  }
}
```

### 2. Entity Extraction (`extractEntities`)

Identifies gardening-related entities in the user query:

```javascript
async function extractEntities(question) {
  const entities = {
    plants: [],
    soilTypes: [],
    counties: [],
    seasons: [],
    months: [],
    activities: [],
  };

  // Extract plant mentions
  const plantQuery = `
    MATCH (p:Plant)
    RETURN p.name AS name, p.type AS type
  `;
  const plants = await runQuery(plantQuery);

  for (const plant of plants) {
    if (question.toLowerCase().includes(plant.name.toLowerCase())) {
      entities.plants.push(plant);
    }
  }

  // Extract other entity types...
  
  return entities;
}
```

### 3. Knowledge Retrieval (`retrieveInformation`)

Queries the Neo4j database for relevant information based on the extracted entities:

```javascript
async function retrieveInformation(question, entities, context) {
  const retrievedInfo = {
    facts: [],
    plants: [],
    soilTypes: [],
    seasonalAdvice: [],
    companionPlants: [],
    antagonisticPlants: [],
  };

  // If the question mentions specific plants, get information about them
  if (entities.plants.length > 0) {
    for (const plant of entities.plants) {
      // Get plant details
      const plantQuery = `
        MATCH (p:Plant {name: $plantName})
        RETURN p.name AS name, p.type AS type, p.description AS description, 
               p.growingSeason AS growingSeason, p.climateZones AS climateZones
      `;
      const plantDetails = await runQuery(plantQuery, {
        plantName: plant.name,
      });

      if (plantDetails.length > 0) {
        retrievedInfo.plants.push(plantDetails[0]);
        retrievedInfo.facts.push(
          `${plantDetails[0].name} is a ${plantDetails[0].type} that ${plantDetails[0].description}`
        );

        // Get related information...
      }
    }
  }

  // Retrieve information for other entity types...
  
  return retrievedInfo;
}
```

### 4. Context Formatting (`formatContextForLLM`)

Structures the retrieved knowledge for the LLM:

```javascript
function formatContextForLLM(retrievedInfo, context) {
  let formattedContext = "Gardening Assistant Context:\n";

  if (retrievedInfo.facts.length > 0) {
    formattedContext += "Facts:\n" + retrievedInfo.facts.join("\n") + "\n";
  }

  if (context.county) {
    formattedContext += `County: ${context.county}\n`;
  }

  if (context.season) {
    formattedContext += `Season: ${context.season}\n`;
  }

  if (context.soilType) {
    formattedContext += `Soil Type: ${context.soilType}\n`;
  }

  return formattedContext;
}
```

### 5. Answer Generation (`generateAnswer`)

Uses the Vertex AI client to generate the final response:

```javascript
async function generateAnswer(question, promptContext) {
  const prompt = `
    You are a gardening assistant. Answer the following question based on the provided context:
    Question: ${question}
    Context: ${promptContext}
  `;

  const response = await generateText(prompt, {
    temperature: 0.7,
    maxTokens: 500,
  });

  return response;
}
```

## Specialized GraphRAG Functions

In addition to the core question-answering functionality, the GraphRAG system provides specialized functions for different gardening scenarios:

### Seasonal Recommendations

```javascript
export async function getSeasonalRecommendations(month, context = {}) {
  // Retrieve plants to plant/harvest in the specified month
  // Get county-specific recommendations if provided
  // Generate seasonal tips using the knowledge graph and LLM
}
```

### Plant Recommendations

```javascript
export async function getPlantRecommendations(criteria = {}) {
  // Build Neo4j query based on filtering criteria
  // Filter by plant type, soil type, county, planting/harvesting months
  // Fetch additional information for each recommended plant
}
```

### Plant Guide Generation

```javascript
export async function generatePlantGuide(plantName) {
  // Find the plant in the database
  // Retrieve comprehensive information about the plant
  // Generate growing tips, care calendar, and problem solutions using LLM
}
```

### Planting Plan Generation

```javascript
export async function generatePlantingPlan(specs) {
  // Get soil type for the specified county
  // Find suitable plants based on specifications
  // Generate layout suggestions and planting schedule
  // Create customized planting guide using LLM
}
```

## Database Connectivity

The system connects to Neo4j through a client defined in `src/database/neo4j-client.js`:

```javascript
import neo4j from 'neo4j-driver';

let driver;

export function getDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

export async function runQuery(cypher, params = {}) {
  const driver = getDriver();
  const session = driver.session();
  
  try {
    const result = await session.run(cypher, params);
    return result.records.map(record => {
      const obj = {};
      for (const key of record.keys) {
        obj[key] = record.get(key);
      }
      return obj;
    });
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
```

## GraphRAG UI Integration

The GraphRAG system integrates with the frontend through specialized UI components:

### GraphRAG Assistant Component

```jsx
// The component in GardenAgent.jsx that handles GraphRAG mode
const handleGraphRAGQuery = async (userInput, conversationHistory) => {
  try {
    // Call the GraphRAG API endpoint
    const response = await fetch("/api/gardening-question/stochastic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: userInput,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get response: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.answer,
      sourceFacts: data.sourceFacts || [],
      generatedQuery: data.generatedQuery || "",
    };
  } catch (error) {
    console.error("Error processing GraphRAG query:", error);
    throw error;
  }
};
```

### Source Fact Display

GraphRAG responses include source attribution to increase transparency and trustworthiness:

```jsx
{message.isGraphRAG && (
  <div className="graph-rag-container my-2">
    {message.sourceFacts && message.sourceFacts.length > 0 && (
      <div className="mt-2">
        <button
          onClick={() => toggleSourceFacts(index)}
          className="btn btn-xs btn-outline btn-success flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 ${
              showSourceFacts ? "rotate-90" : ""
            } transition-transform`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          {showSourceFacts ? "Hide Knowledge Source" : "Show Knowledge Source"}
        </button>

        {showSourceFacts && (
          <div className="mt-2 p-3 bg-base-100 rounded-box shadow-sm">
            <p className="text-xs text-base-content/70 mb-2">
              This answer was generated using these facts from our gardening knowledge graph:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {message.sourceFacts.map((fact, i) => (
                <li key={i} className="text-base-content/80">
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
)}
```

## Knowledge Graph Maintenance

The graph database is maintained through:

1. **Schema Definition**: Defined in `src/database/schema.js`
2. **Data Population Scripts**: Initial data loading and updates
3. **Validation Queries**: Consistency checks for the knowledge graph
4. **Database Backup/Restore**: Procedures for maintaining data integrity

## Advantages of GraphRAG

The GraphRAG approach provides several advantages over traditional vector-based RAG systems:

1. **Relationship-Aware**: Understands relationships between plants, seasons, and growing conditions
2. **Structured Queries**: Uses precise database queries instead of fuzzy similarity matching
3. **Transparent Results**: Provides clear attribution of information sources
4. **Dynamic Updates**: Allows easier updates to the knowledge base
5. **Contextual Understanding**: Better captures the interconnected nature of gardening knowledge

## Performance Optimizations

Several optimizations ensure the GraphRAG system performs efficiently:

1. **Query Batching**: Combines related queries where possible
2. **Connection Pooling**: Reuses Neo4j connections efficiently
3. **Response Caching**: Caches common queries for faster responses
4. **Parallel Retrieval**: Retrieves different types of information in parallel
5. **Selective Querying**: Only queries for information relevant to the user question