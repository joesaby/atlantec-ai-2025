# Phase 5: GraphRAG Integration for Advanced Plant Recommendations

This phase enhances the Irish gardening assistant with a GraphRAG (Graph-based Retrieval Augmented Generation) system to provide more sophisticated plant recommendations and gardening advice using graph databases and open-source LLMs.

## Objectives

1. Build a knowledge graph of Irish gardening entities and their relationships
2. Implement a RAG system using an open-source LLM
3. Create an API to query the combined system
4. Enhance the UI to leverage the new capabilities
5. Design a feedback loop to improve recommendations over time

## Implementation Steps

### 1. Knowledge Graph Database Implementation

First, we'll implement a graph database using Neo4j to model our gardening domain:

```javascript
// src/database/schema.js

/**
 * Neo4j schema for the Irish Garden Assistant knowledge graph
 * This file contains the schemas and relationships for our graph database
 */

/**
 * Node Types:
 * - Plant: Plants that can be grown in Irish gardens
 * - SoilType: Different types of soil found in Ireland
 * - County: Irish counties with their specific growing conditions
 * - ClimateZone: Climate zones in Ireland
 * - GardeningTask: Tasks to be performed in the garden
 * - Month: Months of the year (for seasonal planning)
 * - GardeningPractice: Sustainable gardening practices
 * - PollinatorType: Types of pollinators (bees, butterflies, etc.)
 * - PlantDisease: Common plant diseases in Ireland
 * - PlantPest: Common garden pests in Ireland
 * 
 * Relationship Types:
 * - GROWS_WELL_IN: Plant grows well in a specific soil type
 * - HAS_DOMINANT_SOIL: County has a dominant soil type
 * - SUITABLE_FOR: Plant is suitable for a specific county
 * - BELONGS_TO: County belongs to a climate zone
 * - PERFORMED_IN: Task is performed in a specific month
 * - APPLIES_TO: Task applies to a specific plant
 * - COMPANION_TO: Plant is a good companion to another plant
 * - ANTAGONISTIC_TO: Plant should not be grown near another plant
 * - ATTRACTS: Plant attracts a specific pollinator
 * - SUSCEPTIBLE_TO: Plant is susceptible to a specific disease
 * - VULNERABLE_TO: Plant is vulnerable to a specific pest
 * - HELPS_PREVENT: Plant helps prevent a specific disease
 * - DETERS: Plant deters a specific pest
 */

// Example Cypher queries for creating our schema
const schemaQueries = [
  // Create constraints
  'CREATE CONSTRAINT plant_name IF NOT EXISTS FOR (p:Plant) REQUIRE p.name IS UNIQUE',
  'CREATE CONSTRAINT soil_type IF NOT EXISTS FOR (s:SoilType) REQUIRE s.name IS UNIQUE',
  'CREATE CONSTRAINT county_name IF NOT EXISTS FOR (c:County) REQUIRE c.name IS UNIQUE',
  'CREATE CONSTRAINT month_name IF NOT EXISTS FOR (m:Month) REQUIRE m.name IS UNIQUE',
  
  // Create indexes
  'CREATE INDEX plant_native IF NOT EXISTS FOR (p:Plant) ON (p.nativeToIreland)',
  'CREATE INDEX plant_perennial IF NOT EXISTS FOR (p:Plant) ON (p.isPerennial)',
  'CREATE INDEX plant_water IF NOT EXISTS FOR (p:Plant) ON (p.waterNeeds)',
  'CREATE INDEX plant_sun IF NOT EXISTS FOR (p:Plant) ON (p.sunNeeds)',
];

// Export the schema queries
export const getSchemaQueries = () => schemaQueries;
```

### 2. Data Migration and Graph Population

Create a script to migrate existing data to the graph database:

```javascript
// src/database/graph-migration.js

import { plants } from '../data/plants';
import { gardeningTasks } from '../data/gardening-tasks';
import { sustainablePractices } from '../data/sustainability-metrics';
import { COUNTY_SOIL_MAPPING, IRISH_SOIL_TYPES } from '../utils/soil-client';
import { neo4jDriver } from './neo4j-client';

/**
 * Migrate existing data to Neo4j graph database
 */
export async function migrateDataToGraph() {
  const session = neo4jDriver.session();
  
  try {
    // Create months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (const [index, month] of months.entries()) {
      await session.run(
        `MERGE (m:Month {name: $name, number: $number})`,
        { name: month, number: index + 1 }
      );
    }
    
    // Create soil types
    for (const [code, soilData] of Object.entries(IRISH_SOIL_TYPES)) {
      await session.run(
        `MERGE (s:SoilType {
          code: $code,
          name: $name,
          description: $description,
          phMin: $phMin,
          phMax: $phMax,
          texture: $texture,
          nutrients: $nutrients,
          drainage: $drainage
        })`,
        {
          code,
          name: soilData.name,
          description: soilData.description,
          phMin: soilData.ph.min,
          phMax: soilData.ph.max,
          texture: soilData.texture,
          nutrients: soilData.nutrients,
          drainage: soilData.drainage
        }
      );
    }
    
    // Create counties and link to soil types
    for (const [county, soilType] of Object.entries(COUNTY_SOIL_MAPPING)) {
      await session.run(
        `MERGE (c:County {name: $county})
         WITH c
         MATCH (s:SoilType {code: $soilType})
         MERGE (c)-[:HAS_DOMINANT_SOIL]->(s)`,
        { county: county.charAt(0).toUpperCase() + county.slice(1), soilType }
      );
    }
    
    // Migrate plants
    for (const plant of plants) {
      // Create plant node
      await session.run(
        `MERGE (p:Plant {
          id: $id,
          name: $name,
          latinName: $latinName,
          description: $description,
          waterNeeds: $waterNeeds,
          sunNeeds: $sunNeeds,
          soilPreference: $soilPreference,
          nativeToIreland: $nativeToIreland,
          isPerennial: $isPerennial,
          imageUrl: $imageUrl,
          sustainabilityRating: $sustainabilityRating,
          waterConservationRating: $waterConservationRating,
          biodiversityValue: $biodiversityValue
        })`,
        {
          id: plant.id.toString(),
          name: plant.commonName,
          latinName: plant.latinName,
          description: plant.description,
          waterNeeds: plant.waterNeeds,
          sunNeeds: plant.sunNeeds,
          soilPreference: plant.soilPreference,
          nativeToIreland: plant.nativeToIreland,
          isPerennial: plant.isPerennial,
          imageUrl: plant.imageUrl || '',
          sustainabilityRating: plant.sustainabilityRating,
          waterConservationRating: plant.waterConservationRating,
          biodiversityValue: plant.biodiversityValue
        }
      );
      
      // Connect plants to soil types
      for (const soilType of plant.suitableSoilTypes) {
        await session.run(
          `MATCH (p:Plant {id: $plantId})
           MATCH (s:SoilType {code: $soilType})
           MERGE (p)-[:GROWS_WELL_IN]->(s)`,
          { plantId: plant.id.toString(), soilType }
        );
      }
      
      // Add harvest or flowering season
      if (plant.harvestSeason) {
        await session.run(
          `MATCH (p:Plant {id: $plantId})
           SET p.harvestSeason = $season`,
          { plantId: plant.id.toString(), season: plant.harvestSeason }
        );
      }
      
      if (plant.floweringSeason) {
        await session.run(
          `MATCH (p:Plant {id: $plantId})
           SET p.floweringSeason = $season`,
          { plantId: plant.id.toString(), season: plant.floweringSeason }
        );
      }
    }
    
    // Migrate gardening tasks
    for (const monthData of gardeningTasks) {
      const monthNumber = monthData.month;
      const monthName = new Date(2000, monthNumber - 1, 1).toLocaleString('en-IE', { month: 'long' });
      
      for (const task of monthData.tasks) {
        // Create task node
        await session.run(
          `MERGE (t:GardeningTask {
            id: $id,
            title: $title,
            description: $description,
            category: $category,
            priority: $priority
          })`,
          {
            id: task.id,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority
          }
        );
        
        // Connect task to month
        await session.run(
          `MATCH (t:GardeningTask {id: $taskId})
           MATCH (m:Month {number: $monthNumber})
           MERGE (t)-[:PERFORMED_IN]->(m)`,
          { taskId: task.id, monthNumber }
        );
      }
    }
    
    // Add companion planting relationships (example data)
    const companionPlantings = [
      { plant1: 'Potato', plant2: 'Cabbage', relationship: 'ANTAGONISTIC_TO', notes: 'Potatoes and cabbage compete for nutrients' },
      { plant1: 'Potato', plant2: 'Marigold', relationship: 'COMPANION_TO', notes: 'Marigolds repel nematodes that attack potatoes' },
      { plant1: 'Cabbage', plant2: 'Onion', relationship: 'COMPANION_TO', notes: 'Onions repel cabbage worms and loopers' },
      { plant1: 'Carrot', plant2: 'Leek', relationship: 'COMPANION_TO', notes: 'Leeks repel carrot flies, carrots repel leek moths' },
      { plant1: 'Kale', plant2: 'Potato', relationship: 'ANTAGONISTIC_TO', notes: 'Both are heavy feeders and compete for nutrients' }
    ];
    
    for (const cp of companionPlantings) {
      await session.run(
        `MATCH (p1:Plant) WHERE p1.name = $plant1
         MATCH (p2:Plant) WHERE p2.name = $plant2
         MERGE (p1)-[:${cp.relationship} {notes: $notes}]->(p2)`,
        { plant1: cp.plant1, plant2: cp.plant2, notes: cp.notes }
      );
    }
    
    // Create pollinator types and relationships
    const pollinators = ['Bees', 'Butterflies', 'Hoverflies', 'Moths', 'Beetles'];
    const pollinatorAttractions = [
      { plant: 'Irish Wildflower Mix', pollinators: ['Bees', 'Butterflies', 'Hoverflies'] },
      { plant: 'Irish Primrose', pollinators: ['Bees', 'Butterflies'] },
      { plant: 'Hawthorn', pollinators: ['Bees', 'Butterflies', 'Moths'] },
      { plant: 'Apple Tree (Irish Varieties)', pollinators: ['Bees', 'Hoverflies'] }
    ];
    
    // Create pollinator nodes
    for (const pollinator of pollinators) {
      await session.run(
        `MERGE (p:PollinatorType {name: $name})`,
        { name: pollinator }
      );
    }
    
    // Create ATTRACTS relationships
    for (const attraction of pollinatorAttractions) {
      for (const pollinator of attraction.pollinators) {
        await session.run(
          `MATCH (plant:Plant) WHERE plant.name = $plantName
           MATCH (poll:PollinatorType) WHERE poll.name = $pollinator
           MERGE (plant)-[:ATTRACTS]->(poll)`,
          { plantName: attraction.plant, pollinator }
        );
      }
    }
    
    console.log('Data migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error during data migration:', error);
    return { success: false, error: error.message };
  } finally {
    await session.close();
  }
}
```

### 3. Neo4j Database Client

Create a client for connecting to the Neo4j database:

```javascript
// src/database/neo4j-client.js

import neo4j from 'neo4j-driver';

// Configuration (should be moved to environment variables)
const NEO4J_URI = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// Create a driver instance
export const neo4jDriver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  }
);

// Helper function to validate database connection
export async function verifyConnectivity() {
  try {
    await neo4jDriver.verifyConnectivity();
    return { connected: true };
  } catch (error) {
    console.error('Neo4j connection error:', error);
    return { connected: false, error: error.message };
  }
}

// Helper to run Cypher queries
export async function runQuery(query, params = {}) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(record => {
      return record.keys.reduce((obj, key) => {
        const value = record.get(key);
        // Handle Neo4j node objects
        if (value && value.properties) {
          obj[key] = value.properties;
        } else {
          obj[key] = value;
        }
        return obj;
      }, {});
    });
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Graceful shutdown
export async function closeDriver() {
  await neo4jDriver.close();
}
```

### 4. Graph-Based Recommendation Engine

Implement a new recommendation engine using graph queries:

```javascript
// src/utils/graph-recommender.js

import { runQuery } from '../database/neo4j-client';

/**
 * Get plant recommendations using graph traversal
 * @param {Object} conditions - Garden conditions
 * @param {string} conditions.county - Irish county
 * @param {string} conditions.sunExposure - 'Full Sun', 'Partial Shade', or 'Full Shade'
 * @param {Array} conditions.plantType - Types of plants the user wants to grow
 * @param {boolean} conditions.nativeOnly - Whether to only show native plants
 * @returns {Promise<Array>} Array of recommended plants
 */
export async function getGraphPlantRecommendations(conditions) {
  try {
    // Base query parts
    let matchClause = `
      MATCH (county:County {name: $county})-[:HAS_DOMINANT_SOIL]->(soil:SoilType)
      MATCH (plant:Plant)-[:GROWS_WELL_IN]->(soil)
      WHERE plant.sunNeeds CONTAINS $sunExposure
    `;
    
    // Additional filters based on conditions
    if (conditions.nativeOnly) {
      matchClause += ` AND plant.nativeToIreland = true`;
    }
    
    // Filter by plant type
    if (conditions.plantType && conditions.plantType.length > 0) {
      const plantTypeConditions = [];
      
      if (conditions.plantType.includes('vegetable') || conditions.plantType.includes('fruit')) {
        plantTypeConditions.push(`plant.harvestSeason IS NOT NULL`);
      }
      
      if (conditions.plantType.includes('flower')) {
        plantTypeConditions.push(`plant.floweringSeason IS NOT NULL`);
      }
      
      if (conditions.plantType.includes('tree')) {
        plantTypeConditions.push(`(plant.isPerennial = true AND plant.name CONTAINS 'Tree')`);
      }
      
      if (plantTypeConditions.length > 0) {
        matchClause += ` AND (${plantTypeConditions.join(' OR ')})`;
      }
    }
    
    // Complete the query with return statement and ordering
    const query = `
      ${matchClause}
      OPTIONAL MATCH (plant)-[:ATTRACTS]->(pollinator:PollinatorType)
      OPTIONAL MATCH (plant)-[r:COMPANION_TO|ANTAGONISTIC_TO]->(otherPlant)
      RETURN 
        plant,
        collect(DISTINCT pollinator.name) AS pollinators,
        collect(DISTINCT {
          type: type(r), 
          plantName: otherPlant.name, 
          notes: r.notes
        }) AS plantRelationships,
        count(DISTINCT pollinator) AS pollinatorCount,
        CASE 
          WHEN plant.nativeToIreland = true THEN 10 
          ELSE 0 
        END +
        CASE 
          WHEN plant.sunNeeds = $sunExposure THEN 25 
          ELSE 15 
        END +
        30 + 
        (plant.sustainabilityRating * 3) AS score
      ORDER BY score DESC
      LIMIT 8
    `;
    
    const result = await runQuery(query, {
      county: conditions.county,
      sunExposure: conditions.sunExposure
    });
    
    // Transform Neo4j results to match the existing application structure
    return result.map(record => {
      const plant = record.plant;
      const score = record.score;
      
      return {
        id: parseInt(plant.id),
        commonName: plant.name,
        latinName: plant.latinName,
        description: plant.description,
        waterNeeds: plant.waterNeeds,
        sunNeeds: plant.sunNeeds,
        soilPreference: plant.soilPreference,
        nativeToIreland: plant.nativeToIreland,
        isPerennial: plant.isPerennial,
        harvestSeason: plant.harvestSeason,
        floweringSeason: plant.floweringSeason,
        imageUrl: plant.imageUrl,
        sustainabilityRating: plant.sustainabilityRating,
        waterConservationRating: plant.waterConservationRating,
        biodiversityValue: plant.biodiversityValue,
        
        // New graph-specific properties
        score,
        matchPercentage: Math.min(Math.round((score / 80) * 100), 100),
        pollinators: record.pollinators.filter(p => p !== null),
        plantRelationships: record.plantRelationships.filter(r => r.type !== null),
        pollinatorCount: record.pollinatorCount
      };
    });
  } catch (error) {
    console.error('Graph recommendation error:', error);
    throw new Error('Failed to generate graph-based plant recommendations');
  }
}

/**
 * Get plants with a specific relationship to a given plant
 * @param {string} plantName - The name of the plant to find relationships for
 * @param {string} relationshipType - The type of relationship ('COMPANION_TO' or 'ANTAGONISTIC_TO')
 * @returns {Promise<Array>} Array of related plants
 */
export async function getRelatedPlants(plantName, relationshipType = 'COMPANION_TO') {
  try {
    const query = `
      MATCH (plant:Plant {name: $plantName})-[:${relationshipType}]->(related:Plant)
      RETURN related
    `;
    
    const result = await runQuery(query, { plantName });
    
    return result.map(record => record.related);
  } catch (error) {
    console.error('Related plants query error:', error);
    throw new Error('Failed to find related plants');
  }
}

/**
 * Get plants that attract specific pollinators
 * @param {Array} pollinatorTypes - Array of pollinator type names
 * @returns {Promise<Array>} Array of plants that attract the specified pollinators
 */
export async function getPlantsForPollinators(pollinatorTypes) {
  try {
    const query = `
      MATCH (plant:Plant)-[:ATTRACTS]->(pollinator:PollinatorType)
      WHERE pollinator.name IN $pollinatorTypes
      RETURN plant, collect(DISTINCT pollinator.name) AS attractedPollinators
      ORDER BY size(attractedPollinators) DESC
    `;
    
    const result = await runQuery(query, { pollinatorTypes });
    
    return result.map(record => ({
      ...record.plant,
      pollinators: record.attractedPollinators
    }));
  } catch (error) {
    console.error('Pollinator plants query error:', error);
    throw new Error('Failed to find plants for pollinators');
  }
}
```

### 5. LLM Integration with Ollama

Set up an integration with an open-source LLM using Ollama:

```javascript
// src/utils/llm-client.js

/**
 * Client for interacting with an open-source LLM via Ollama
 * We're using Ollama to run LLMs locally
 * Supported models: mistral, llama2, mixtral
 */

// Configuration
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = process.env.DEFAULT_LLM || 'mistral';
const MAX_TOKENS = 1024;

/**
 * Generate a response from the LLM
 * @param {string} prompt - The input prompt to send to the LLM
 * @param {Object} options - Additional options
 * @param {string} options.model - LLM model to use (default: mistral)
 * @param {number} options.temperature - Sampling temperature (default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens to generate (default: 1024)
 * @returns {Promise<string>} The generated text
 */
export async function generateText(prompt, options = {}) {
  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature || 0.7;
  const maxTokens = options.maxTokens || MAX_TOKENS;
  
  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('LLM generation error:', error);
    throw new Error('Failed to generate LLM response');
  }
}

/**
 * Health check for the LLM service
 * @returns {Promise<Object>} Health status
 */
export async function checkLLMHealth() {
  try {
    // Simple prompt to verify the LLM service is responding
    const response = await generateText('Say "LLM is working"', {
      maxTokens: 20,
      temperature: 0.1
    });
    
    return {
      healthy: response.includes('LLM is working'),
      model: DEFAULT_MODEL
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}
```

### 6. RAG Implementation

Create the RAG (Retrieval Augmented Generation) system:

```javascript
// src/utils/rag-system.js

import { runQuery } from '../database/neo4j-client';
import { generateText } from './llm-client';

/**
 * Generate a gardening guide for a plant using RAG
 * @param {string} plantName - The name of the plant
 * @returns {Promise<Object>} The generated gardening guide
 */
export async function generatePlantGuide(plantName) {
  try {
    // Retrieve plant information from the graph
    const plantQuery = `
      MATCH (plant:Plant {name: $plantName})
      OPTIONAL MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType)
      OPTIONAL MATCH (plant)-[:ATTRACTS]->(pollinator:PollinatorType)
      OPTIONAL MATCH (plant)-[r:COMPANION_TO]->(companion:Plant)
      OPTIONAL MATCH (plant)-[a:ANTAGONISTIC_TO]->(antagonist:Plant)
      RETURN 
        plant,
        collect(DISTINCT soil.name) AS suitableSoils,
        collect(DISTINCT pollinator.name) AS pollinators,
        collect(DISTINCT companion.name) AS companions,
        collect(DISTINCT antagonist.name) AS antagonists
    `;
    
    const plantResults = await runQuery(plantQuery, { plantName });
    
    if (plantResults.length === 0) {
      throw new Error(`Plant not found: ${plantName}`);
    }
    
    const plantData = plantResults[0];
    
    // Get gardening tasks related to this type of plant
    const tasksQuery = `
      MATCH (task:GardeningTask)
      WHERE task.title CONTAINS $plantName OR task.description CONTAINS $plantName
      MATCH (task)-[:PERFORMED_IN]->(month:Month)
      RETURN task, month.name AS monthName
      ORDER BY month.number
    `;
    
    const taskResults = await runQuery(tasksQuery, { plantName });
    
    // Construct context for the LLM prompt
    const context = {
      plant: plantData.plant,
      suitableSoils: plantData.suitableSoils.filter(s => s !== null),
      pollinators: plantData.pollinators.filter(p => p !== null),
      companions: plantData.companions.filter(c => c !== null),
      antagonists: plantData.antagonists.filter(a => a !== null),
      tasks: taskResults.map(t => ({
        title: t.task.title,
        month: t.monthName,
        description: t.task.description
      }))
    };
    
    // Create the LLM prompt
    const prompt = `
      You are an Irish gardening expert. Create a comprehensive growing guide for ${plantName} in the Irish climate. 
      
      Here is information about the plant:
      ${JSON.stringify(context, null, 2)}
      
      Create a structured growing guide that includes:
      1. Introduction to the plant and its suitability for Irish gardens
      2. Soil requirements and preparation
      3. When and how to plant in the Irish growing season
      4. Care instructions (watering, feeding, etc.)
      5. Common problems and solutions
      6. Harvesting/flowering information
      7. Companion planting recommendations
      8. Tips specific to Irish growing conditions
      
      Format your response in markdown with clear sections. Keep the content factual, practical, and specifically tailored to Irish gardening conditions. The ideal length is 600-800 words.
    `;
    
    // Generate the guide using the LLM
    const generatedGuide = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return {
      plantName,
      guide: generatedGuide,
      context: context
    };
  } catch (error) {
    console.error('Plant guide generation error:', error);
    throw new Error('Failed to generate plant guide');
  }
}

/**
 * Answer a gardening question using RAG
 * @param {string} question - The gardening question
 * @param {Object} userContext - Additional context (county, garden conditions, etc.)
 * @returns {Promise<string>} The generated answer
 */
export async function answerGardeningQuestion(question, userContext = {}) {
  try {
    // Extract potential entities from the question
    const entityTypes = [
      { type: 'Plant', label: 'plants' },
      { type: 'SoilType', label: 'soils' },
      { type: 'PollinatorType', label: 'pollinators' },
      { type: 'GardeningTask', label: 'tasks' },
      { type: 'County', label: 'counties' }
    ];
    
    // Retrieve context for entities mentioned in the question
    const contextQueries = entityTypes.map(entityType => {
      return `
        MATCH (entity:${entityType.type})
        WHERE toLower($question) CONTAINS toLower(entity.name)
        RETURN entity, '${entityType.label}' AS type
        LIMIT 5
      `;
    });
    
    const combinedQuery = contextQueries.join(' UNION ');
    const entityResults = await runQuery(combinedQuery, { question });
    
    // Group entities by type
    const groupedEntities = entityResults.reduce((groups, result) => {
      const type = result.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(result.entity);
      return groups;
    }, {});
    
    // If plant entities were found, get additional information
    let plantDetails = [];
    if (groupedEntities.plants && groupedEntities.plants.length > 0) {
      for (const plant of groupedEntities.plants) {
        const plantQuery = `
          MATCH (plant:Plant {name: $plantName})
          OPTIONAL MATCH (plant)-[:GROWS_WELL_IN]->(soil:SoilType)
          RETURN plant, collect(soil.name) AS soils
        `;
        const detailResults = await runQuery(plantQuery, { plantName: plant.name });
        if (detailResults.length > 0) {
          plantDetails.push({
            ...detailResults[0].plant,
            soils: detailResults[0].soils.filter(s => s !== null)
          });
        }
      }
    }
    
    // County-specific information if relevant
    let countyInfo = null;
    if (userContext.county || (groupedEntities.counties && groupedEntities.counties.length > 0)) {
      const countyName = userContext.county || groupedEntities.counties[0].name;
      const countyQuery = `
        MATCH (county:County {name: $countyName})-[:HAS_DOMINANT_SOIL]->(soil:SoilType)
        RETURN county.name AS county, soil.name AS soilType, soil.description AS soilDescription
      `;
      const countyResults = await runQuery(countyQuery, { countyName });
      if (countyResults.length > 0) {
        countyInfo = countyResults[0];
      }
    }
    
    // Build context for the LLM
    const context = {
      entities: groupedEntities,
      plantDetails,
      countyInfo,
      userGarden: userContext
    };
    
    // Create the LLM prompt
    const prompt = `
      You are an Irish gardening expert assistant. Answer the following gardening question with specific, accurate, and helpful information tailored to Irish growing conditions.
      
      Question: ${question}
      
      Here is relevant context to help you answer:
      ${JSON.stringify(context, null, 2)}
      
      Additional instructions:
      - If the context doesn't contain enough information to fully answer the question, acknowledge this but provide the best advice you can based on general Irish gardening principles
      - Consider the specific needs of Irish gardens (climate, soil types, rainfall patterns, etc.)
      - If the question mentions a specific county, tailor your answer to that region's conditions
      - Keep your answer concise but comprehensive (under 300 words)
      - If appropriate, suggest follow-up resources or actions
      
      Your answer:
    `;
    
    // Generate the answer using the LLM
    const answer = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 800
    });
    
    return answer;
  } catch (error) {
    console.error('Question answering error:', error);
    throw new Error('Failed to answer gardening question');
  }
}

/**
 * Generate a custom planting plan using RAG
 * @param {Object} gardenConditions - The garden conditions
 * @returns {Promise<Object>} The generated planting plan
 */
export async function generatePlantingPlan(gardenConditions) {
  try {
    const { county, sunExposure, spaceAvailable, goals = [] } = gardenConditions;
    
    // Retrieve appropriate plants based on conditions
    const plantsQuery = `
      MATCH (county:County {name: $county})-[:HAS_DOMINANT_SOIL]->(soil:SoilType)
      MATCH (plant:Plant)-[:GROWS_WELL_IN]->(soil)
      WHERE plant.sunNeeds CONTAINS $sunExposure
      RETURN plant
      LIMIT 20
    `;
    
    const plantResults = await runQuery(plantsQuery, { 
      county, 
      sunExposure 
    });
    
    // Get companion planting information
    const companionQuery = `
      MATCH (p1:Plant)-[r:COMPANION_TO|ANTAGONISTIC_TO]->(p2:Plant)
      WHERE p1.name IN $plantNames AND p2.name IN $plantNames
      RETURN p1.name AS plant1, type(r) AS relationship, p2.name AS plant2
    `;
    
    const plantNames = plantResults.map(result => result.plant.name);
    const companionResults = await runQuery(companionQuery, { plantNames });
    
    // Build context for the LLM
    const context = {
      county,
      sunExposure,
      spaceAvailable,
      goals,
      availablePlants: plantResults.map(result => result.plant),
      companionships: companionResults
    };
    
    // Create the LLM prompt
    const prompt = `
      You are an expert Irish garden designer. Create a personalized planting plan for a garden with the following conditions:
      
      ${JSON.stringify(context, null, 2)}
      
      Based on this information, create a detailed planting plan that:
      1. Selects appropriate plants from the available list
      2. Arranges them optimally considering companion planting relationships
      3. Considers the garden goals: ${goals.join(', ')}
      4. Accounts for the available space: ${spaceAvailable}
      5. Provides a planting schedule appropriate for Irish growing seasons
      6. Includes specific tips for success in ${county}'s conditions
      
      Format your response as a structured planting plan with clear sections. Include a visual layout representation using ASCII art if helpful.
    `;
    
    // Generate the planting plan using the LLM
    const generatedPlan = await generateText(prompt, {
      temperature: 0.8,
      maxTokens: 1500
    });
    
    return {
      conditions: gardenConditions,
      plan: generatedPlan
    };
  } catch (error) {
    console.error('Planting plan generation error:', error);
    throw new Error('Failed to generate planting plan');
  }
}
```

### 7. Create API Endpoints

Create new API endpoints for the GraphRAG functionality:

```javascript
// src/pages/api/graph-recommendations.js

import { getGraphPlantRecommendations } from '../../utils/graph-recommender';

export async function POST({ request }) {
  try {
    const data = await request.json();

    if (!data.county || !data.sunExposure) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: county and sunExposure are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recommendations = await getGraphPlantRecommendations(data);

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in graph-recommendations API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate graph-based recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

```javascript
// src/pages/api/plant-guide.js

import { generatePlantGuide } from '../../utils/rag-system';

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const plantName = url.searchParams.get('plant');

    if (!plantName) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameter: plant name is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const guideData = await generatePlantGuide(plantName);

    return new Response(JSON.stringify(guideData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in plant-guide API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate plant guide" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

```javascript
// src/pages/api/gardening-question.js

import { answerGardeningQuestion } from '../../utils/rag-system';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { question, context } = data;

    if (!question) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: question is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const answer = await answerGardeningQuestion(question, context || {});

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in gardening-question API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to answer gardening question" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

```javascript
// src/pages/api/planting-plan.js

import { generatePlantingPlan } from '../../utils/rag-system';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { county, sunExposure, spaceAvailable, goals } = data;

    if (!county || !sunExposure || !spaceAvailable) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: county, sunExposure, and spaceAvailable are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const planData = await generatePlantingPlan(data);

    return new Response(JSON.stringify(planData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in planting-plan API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate planting plan" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

### 8. Enhanced Plant Detail Component

Create a component that leverages the GraphRAG capabilities:

```jsx
// src/components/plants/EnhancedPlantDetail.jsx

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const EnhancedPlantDetail = ({ plantName }) => {
  const [plantGuide, setPlantGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPlantGuide = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/plant-guide?plant=${encodeURIComponent(plantName)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPlantGuide(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch plant guide:', err);
        setError('Could not load plant guide');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (plantName) {
      fetchPlantGuide();
    }
  }, [plantName]);
  
  if (isLoading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Generating Plant Guide...</h2>
          <p className="mb-4">Our AI is creating a detailed guide for {plantName}</p>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Error</h2>
          <p>{error}</p>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!plantGuide) {
    return null;
  }
  
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">Complete Growing Guide: {plantName}</h2>
        
        <div className="divider"></div>
        
        <div className="prose max-w-none">
          <ReactMarkdown>{plantGuide.guide}</ReactMarkdown>
        </div>
        
        <div className="mt-6">
          <div className="flex flex-wrap gap-2 mb-2">
            <h3 className="text-sm font-bold">Associated Plants:</h3>
            {plantGuide.context.companions.map((companion, index) => (
              <div key={`companion-${index}`} className="badge badge-success">
                ✓ {companion}
              </div>
            ))}
            {plantGuide.context.antagonists.map((antagonist, index) => (
              <div key={`antagonist-${index}`} className="badge badge-error">
                ✗ {antagonist}
              </div>
            ))}
          </div>
          
          {plantGuide.context.pollinators.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              <h3 className="text-sm font-bold">Attracts:</h3>
              {plantGuide.context.pollinators.map((pollinator, index) => (
                <div key={`pollinator-${index}`} className="badge badge-info">
                  {pollinator}
                </div>
              ))}
            </div>
          )}
          
          <div className="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm">This guide was generated by our AI assistant using knowledge from our Irish gardening database. If you notice any inaccuracies, please provide feedback!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlantDetail;
```

### 9. Gardening Assistant

Create a gardening assistant component using the RAG system:

```jsx
// src/components/tools/GardeningAssistant.jsx

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const GardeningAssistant = ({ userCounty = 'Dublin' }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const sampleQuestions = [
    "When should I plant potatoes in County Kerry?",
    "Which plants will help attract bees to my garden?",
    "How do I deal with slugs on my cabbage plants naturally?",
    "What are good companion plants for tomatoes?",
    "How can I improve clay soil in my Dublin garden?"
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/gardening-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context: {
            county: userCounty
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get answer');
      }
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error('Error getting answer:', err);
      setError('Failed to answer your question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSampleQuestion = (q) => {
    setQuestion(q);
    // Auto-submit the sample question
    setTimeout(() => {
      document.getElementById('question-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };
  
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary mb-2">Irish Gardening Assistant</h2>
        <p className="text-sm mb-4">Ask any gardening question specific to Irish conditions, and our AI assistant will provide personalized advice.</p>
        
        <form id="question-form" onSubmit={handleSubmit} className="mb-6">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Ask a gardening question..."
                className="input input-bordered w-full"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button 
                className="btn btn-primary"
                type="submit"
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Thinking...
                  </>
                ) : 'Ask'}
              </button>
            </div>
          </div>
        </form>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {answer && (
          <div className="bg-base-200 rounded-box p-4 mt-2 mb-4">
            <h3 className="font-medium mb-2">Answer:</h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        )}
        
        <div className="divider">Try These Questions</div>
        
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, index) => (
            <button
              key={index}
              className="btn btn-sm btn-outline"
              onClick={() => handleSampleQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>
        
        <div className="alert alert-info mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Answers are generated using our Irish gardening knowledge graph and open-source AI. They're tailored to your location in {userCounty}.</span>
        </div>
      </div>
    </div>
  );
};

export default GardeningAssistant;
```

### 10. Create AI Planting Plan Component

Create a component for generating AI planting plans:

```jsx
// src/components/tools/AIPlantingPlan.jsx

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const AIPlantingPlan = ({ userCounty = 'Dublin' }) => {
  const [formData, setFormData] = useState({
    county: userCounty,
    sunExposure: 'Full Sun',
    spaceAvailable: 'Medium (3-5 square meters)',
    goals: []
  });
  
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      const goalsCopy = [...formData.goals];
      if (checked) {
        goalsCopy.push(value);
      } else {
        const index = goalsCopy.indexOf(value);
        if (index > -1) {
          goalsCopy.splice(index, 1);
        }
      }
      setFormData({
        ...formData,
        goals: goalsCopy
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/planting-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate planting plan');
      }
      
      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      console.error('Error generating plan:', err);
      setError('Failed to generate planting plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">AI Planting Plan Generator</h2>
        <p className="text-sm mb-4">Create a custom planting plan for your Irish garden using our AI assistant.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">County</span>
                </label>
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  {['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 
                    'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 
                    'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 
                    'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 
                    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'].map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Sunlight Exposure</span>
                </label>
                <select
                  name="sunExposure"
                  value={formData.sunExposure}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="Full Sun">Full Sun (6+ hours)</option>
                  <option value="Partial Shade">Partial Shade (3-6 hours)</option>
                  <option value="Full Shade">Full Shade (less than 3 hours)</option>
                </select>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Available Space</span>
                </label>
                <select
                  name="spaceAvailable"
                  value={formData.spaceAvailable}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="Small (1-2 square meters)">Small (1-2 square meters)</option>
                  <option value="Medium (3-5 square meters)">Medium (3-5 square meters)</option>
                  <option value="Large (6-10 square meters)">Large (6-10 square meters)</option>
                  <option value="Very Large (10+ square meters)">Very Large (10+ square meters)</option>
                </select>
              </div>
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Garden Goals (select all that apply)</span>
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Growing Food', label: 'Growing Food' },
                    { value: 'Attracting Wildlife', label: 'Attracting Wildlife' },
                    { value: 'Low Maintenance', label: 'Low Maintenance' },
                    { value: 'Colorful Display', label: 'Colorful Display' },
                    { value: 'Child Friendly', label: 'Child Friendly' },
                    { value: 'Sustainability', label: 'Sustainability' },
                    { value: 'Year-round Interest', label: 'Year-round Interest' },
                    { value: 'Irish Native Plants', label: 'Irish Native Plants' }
                  ].map((goal) => (
                    <label key={goal.value} className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        name="goals"
                        value={goal.value}
                        checked={formData.goals.includes(goal.value)}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="label-text">{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Planting Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div>
            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {plan ? (
              <div className="bg-base-200 rounded-box p-4 h-full overflow-auto">
                <h3 className="font-medium mb-2">Your Custom Planting Plan:</h3>
                <div className="prose max-w-none">
                  <ReactMarkdown>{plan}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-sm h-full flex items-center justify-center text-center p-6">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-2">Your Planting Plan Will Appear Here</h3>
                <p className="text-sm opacity-70">
                  Fill out the form and submit to generate a custom planting plan tailored to your garden's conditions and your goals.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlantingPlan;
```

### 11. Create a GraphRAG Demo Page

Create an Astro page to showcase the GraphRAG capabilities:

```astro
---
// src/pages/graph-rag-demo.astro
import Layout from '../layouts/Layout.astro';
import GardeningAssistant from '../components/tools/GardeningAssistant';
import AIPlantingPlan from '../components/tools/AIPlantingPlan';
import EnhancedPlantDetail from '../components/plants/EnhancedPlantDetail';
import CountySelector from '../components/common/CountySelector';
---

<Layout title="GraphRAG Gardening Assistant">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2 text-center">Irish GraphRAG Gardening Assistant</h1>
    <p class="text-center text-base-content/70 mb-8 max-w-2xl mx-auto">
      Experience our advanced gardening assistant powered by knowledge graphs and AI to provide personalized, intelligent gardening advice for Irish conditions.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="card bg-primary text-primary-content p-6">
        <h2 class="text-xl font-bold mb-2">What is GraphRAG?</h2>
        <p class="mb-4">GraphRAG combines knowledge graphs with retrieval-augmented generation for more accurate, contextual, and interconnected gardening recommendations.</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Understands plant relationships (companions, soil preferences)</li>
          <li>Connects county-specific data with plant recommendations</li>
          <li>Provides context-aware answers tailored to Irish conditions</li>
          <li>Generates detailed growing guides using structured knowledge</li>
        </ul>
      </div>
      
      <div class="card bg-base-200 p-6">
        <h2 class="text-xl font-bold mb-2">How It Works</h2>
        <div class="overflow-x-auto">
          <ol class="list-decimal list-inside space-y-2">
            <li><span class="font-medium">Knowledge Graph:</span> Connects plants, counties, soils, and gardening practices</li>
            <li><span class="font-medium">Graph Queries:</span> Find complex patterns and relationships</li>
            <li><span class="font-medium">Context Retrieval:</span> Extract relevant knowledge for your query</li>
            <li><span class="font-medium">LLM Enhancement:</span> Generate natural responses using an open-source LLM</li>
            <li><span class="font-medium">Personalization:</span> Tailor everything to your specific garden's conditions</li>
          </ol>
        </div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title">Select Your County</h2>
        <p class="text-sm mb-4">Choose your county to get personalized gardening advice and recommendations.</p>
        
        <div id="county-selector-container"></div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <GardeningAssistant client:load county="Dublin" />
      <AIPlantingPlan client:load county="Dublin" />
    </div>
    
    <div class="mb-8">
      <EnhancedPlantDetail client:load plantName="Potato" />
    </div>
    
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title text-primary">Explore More Plants with Enhanced Guides</h2>
        <p class="text-sm mb-4">Select a plant to see its AI-generated growing guide based on our knowledge graph.</p>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Cabbage', 'Irish Wildflower Mix', 'Kale', 'Blackberry', 'Hawthorn', 'Irish Primrose', 'Rhubarb', 'Apple Tree (Irish Varieties)'].map((plantName) => (
            <button 
              class="btn btn-outline"
              onclick={`window.location.href = '/plant-guide?plant=${encodeURIComponent(plantName)}'`}
            >
              {plantName}
            </button>
          ))}
        </div>
      </div>
    </div>
  </main>
</Layout>

<script>
  // Client-side JavaScript to handle county selection
  import React from 'react';
  import ReactDOM from 'react-dom';
  import CountySelector from '../components/common/CountySelector';
  import GardeningAssistant from '../components/tools/GardeningAssistant';
  import AIPlantingPlan from '../components/tools/AIPlantingPlan';

  document.addEventListener('DOMContentLoaded', () => {
    const countySelectorContainer = document.getElementById('county-selector-container');
    let selectedCounty = 'Dublin';

    function handleCountyChange(county) {
      selectedCounty = county;
      
      // Update components that depend on county
      const gardeningAssistantContainer = document.querySelector('gardening-assistant');
      const planningToolContainer = document.querySelector('ai-planting-plan');
      
      if (gardeningAssistantContainer) {
        ReactDOM.render(
          React.createElement(GardeningAssistant, { county: selectedCounty }),
          gardeningAssistantContainer
        );
      }
      
      if (planningToolContainer) {
        ReactDOM.render(
          React.createElement(AIPlantingPlan, { county: selectedCounty }),
          planningToolContainer
        );
      }
    }

    // Initial render of county selector
    ReactDOM.render(
      React.createElement(CountySelector, {
        selectedCounty,
        onChange: handleCountyChange
      }),
      countySelectorContainer
    );
  });
</script>
```

### 12. Create a Plant Guide Page

Create a detailed plant guide page:

```astro
---
// src/pages/plant-guide.astro
import Layout from '../layouts/Layout.astro';
import EnhancedPlantDetail from '../components/plants/EnhancedPlantDetail';
---

<Layout title="Plant Growing Guide">
  <main class="container mx-auto px-4 py-8">
    <div class="text-sm breadcrumbs mb-4">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/plant-recommendations">Plant Recommendations</a></li>
        <li>Growing Guide</li>
      </ul>
    </div>
    
    <div id="plant-guide-container">
      <div class="card w-full bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Loading Plant Guide...</h2>
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    </div>
  </main>
</Layout>

<script>
  // Client-side JavaScript to handle plant guide loading
  import React from 'react';
  import ReactDOM from 'react-dom';
  import EnhancedPlantDetail from '../components/plants/EnhancedPlantDetail';

  document.addEventListener('DOMContentLoaded', () => {
    const plantGuideContainer = document.getElementById('plant-guide-container');
    
    // Get plant name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const plantName = urlParams.get('plant') || 'Potato';
    
    // Update page title
    document.title = `${plantName} Growing Guide | Irish Garden Assistant`;
    
    // Render the plant guide component
    ReactDOM.render(
      React.createElement(EnhancedPlantDetail, { plantName }),
      plantGuideContainer
    );
  });
</script>
```

## Setup and Configuration

### Neo4j Setup

1. Install Neo4j Desktop or use Neo4j AuraDB (cloud service)
2. Create a new database with authentication
3. Update environment variables:
   ```
   NEO4J_URI=neo4j://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password
   ```

### Ollama Setup

1. Install Ollama (https://ollama.ai/)
2. Pull the Mistral model:
   ```
   ollama pull mistral
   ```
3. Configure environment variables:
   ```
   OLLAMA_ENDPOINT=http://localhost:11434/api/generate
   DEFAULT_LLM=mistral
   ```

### Add to package.json

Add the necessary dependencies:

```json
"dependencies": {
  // existing dependencies
  "neo4j-driver": "^5.7.0",
  "react-markdown": "^8.0.7",
  "ollama": "^0.1.0"
}
```

## Data Migration

Run the data migration script to populate the graph database:

```bash
node scripts/migrate-to-graph.js
```

## Integration Tests

Create tests to verify the GraphRAG functionality:

```javascript
// tests/graph-rag.test.js

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { verifyConnectivity, closeDriver } from '../src/database/neo4j-client';
import { getGraphPlantRecommendations } from '../src/utils/graph-recommender';
import { generatePlantGuide, answerGardeningQuestion } from '../src/utils/rag-system';
import { checkLLMHealth } from '../src/utils/llm-client';

describe('GraphRAG System Tests', () => {
  // Set timeout for long-running tests
  beforeAll(async () => {
    // Verify Neo4j connection
    const neo4jConnection = await verifyConnectivity();
    expect(neo4jConnection.connected).toBe(true);
    
    // Verify LLM service
    const llmHealth = await checkLLMHealth();
    expect(llmHealth.healthy).toBe(true);
  }, 10000);
  
  afterAll(async () => {
    await closeDriver();
  });
  
  it('should get graph-based plant recommendations', async () => {
    const conditions = {
      county: 'Dublin',
      sunExposure: 'Full Sun',
      plantType: ['vegetable'],
      nativeOnly: false
    };
    
    const recommendations = await getGraphPlantRecommendations(conditions);
    
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]).toHaveProperty('matchPercentage');
    expect(recommendations[0]).toHaveProperty('pollinators');
  }, 15000);
  
  it('should generate a plant guide using RAG', async () => {
    const plantName = 'Potato';
    
    const guideData = await generatePlantGuide(plantName);
    
    expect(guideData).toHaveProperty('plantName', plantName);
    expect(guideData).toHaveProperty('guide');
    expect(guideData).toHaveProperty('context');
    expect(guideData.guide.length).toBeGreaterThan(100);
  }, 20000);
  
  it('should answer a gardening question using RAG', async () => {
    const question = 'When should I plant potatoes in Ireland?';
    
    const answer = await answerGardeningQuestion(question, { county: 'Dublin' });
    
    expect(answer).toBeTruthy();
    expect(answer.length).toBeGreaterThan(50);
  }, 20000);
});
```

## Deployment Considerations

1. **Production Environment Setup**:
   - Set up Neo4j AuraDB for the graph database in production
   - Configure a server with sufficient resources to run Ollama
   - Use environment variables for all configuration

2. **Environment Variables**:
   - `NEO4J_URI`: Neo4j connection URI
   - `NEO4J_USER`: Neo4j username
   - `NEO4J_PASSWORD`: Neo4j password
   - `OLLAMA_ENDPOINT`: Ollama API endpoint
   - `DEFAULT_LLM`: Default LLM model to use

3. **Backup and Restore**:
   - Implement regular backups of the Neo4j database
   - Create scripts to restore the database if needed

4. **Performance Monitoring**:
   - Add monitoring for Neo4j connection performance
   - Track LLM response times and errors
   - Implement query caching for common requests

## Future Enhancements

1. **User Feedback Loop**:
   - Implement a feedback system for plant guides and answers
   - Use feedback to improve recommendations

2. **Additional LLM Models**:
   - Add support for more LLM models like Llama 3, Phi-3
   - Allow users to choose their preferred model

3. **Visual Graph Explorer**:
   - Add a visual interface to explore the garden knowledge graph
   - Allow users to see relationships between plants, soils, and other entities

4. **Seasonal Data Integration**:
   - Enhance the knowledge graph with more detailed seasonal information
   - Generate month-specific gardening plans

5. **Mobile Integration**:
   - Develop a mobile-friendly interface for garden planning on the go
   - Add offline capability for garden planning

## Conclusion

The GraphRAG integration adds powerful new capabilities to the Irish gardening assistant:

1. **Deeper Insights**: By modeling the complex relationships between plants, soils, counties, and gardening practices in a knowledge graph, we can provide more nuanced recommendations and advice.

2. **Contextual Understanding**: The RAG system ensures that LLM responses are grounded in accurate Irish gardening knowledge and specific garden conditions.

3. **Enhanced User Experience**: Natural language interaction and personalized garden plans make the system more accessible and useful for gardeners of all experience levels.

4. **Sustainability Focus**: The knowledge graph makes it easier to identify and recommend sustainable gardening practices specific to Irish conditions.

This integration demonstrates the power of combining structured knowledge with generative AI to create a more intelligent, accurate, and helpful gardening assistant specifically tailored to Irish gardening conditions.