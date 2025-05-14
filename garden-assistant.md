# Build a green thumb in a sprint

A sustainable Bloom can be built in one week using Astro's island architecture and Irish-specific data sources. This guide outlines the complete technical implementation process, focusing on practical, achievable approaches for rapid development while maintaining sustainability principles.

## Bottom line up front

This implementation guide provides a complete technical blueprint for building an Irish sustainable gardening assistant in one week using Astro.js. The system will leverage Teagasc soil data and Met.ie weather APIs, implement a lightweight GraphRAG knowledge base for gardening information, use simple machine learning for crop recommendations, and deliver an accessible, responsive interface. By following this structured approach with specific code patterns and architecture decisions, developers can quickly build a functional system that helps Irish gardeners make sustainable choices based on local conditions.

## System architecture

The gardening assistant will use Astro's islands architecture, which perfectly matches our needs: mostly static content (plant information, growing guides) with interactive "islands" for tools like plant search, weather widgets, and sustainability tracking.

```
gardening-assistant/
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components
│   │   ├── common/         # Layout elements
│   │   ├── plants/         # Plant-specific components
│   │   ├── weather/        # Weather integration
│   │   ├── tools/          # Garden planning tools
│   │   └── sustainability/ # Sustainability features
│   ├── content/            # Content collections
│   │   ├── plants/         # Plant database
│   │   ├── tasks/          # Gardening tasks by season
│   │   └── regions/        # Irish-specific growing regions
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route definitions
│   │   └── api/            # API endpoints
│   ├── utils/              # Helper functions
│   └── database/           # Database schema and models
├── astro.config.mjs        # Astro configuration
└── package.json
```

### Core components and integration

```typescript
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import db from "@astrojs/db";

export default defineConfig({
  output: "hybrid", // Static generation with dynamic endpoints
  integrations: [
    tailwind(),
    react(), // For interactive components
    db(), // For Astro DB integration
  ],
  vite: {
    ssr: {
      noExternal: ["chart.js", "@radix-ui/*"],
    },
  },
});
```

This configuration enables:

- Hybrid rendering (static content with dynamic API endpoints)
- Tailwind for styling
- React for interactive components
- Astro DB for data storage

## Irish data integration

### Teagasc soil data client

```typescript
// src/utils/teagasc-client.js
const SOIL_API_BASE = "http://soils.teagasc.ie/api";

export async function getSoilDataByLocation(lat, lng) {
  const response = await fetch(
    `${SOIL_API_BASE}/soildata?lat=${lat}&lng=${lng}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch soil data");
  }

  return await response.json();
}

export async function getSoilTypeInformation(soilCode) {
  // Cache soil information - rarely changes
  if (soilTypeCache[soilCode]) {
    return soilTypeCache[soilCode];
  }

  const response = await fetch(`${SOIL_API_BASE}/soiltypes/${soilCode}`);

  if (!response.ok) {
    throw new Error("Failed to fetch soil type information");
  }

  const data = await response.json();
  soilTypeCache[soilCode] = data;
  return data;
}

// Cache soil type information
const soilTypeCache = {};
```

### Met.ie weather integration

```typescript
// src/utils/weather-client.js
import { db } from "astro:db";
import { WeatherData } from "../database/schema";

const WEATHER_API_BASE = "https://weather.apis.ie/graphql";

export async function getCurrentWeather(county) {
  // Check cache first
  const cachedData = await db
    .select()
    .from(WeatherData)
    .where(eq(WeatherData.location, county))
    .orderBy(desc(WeatherData.created_at))
    .limit(1);

  // If data exists and is less than 1 hour old, use it
  if (
    cachedData.length > 0 &&
    new Date().getTime() - cachedData[0].created_at.getTime() < 3600000
  ) {
    return cachedData[0];
  }

  // Otherwise fetch new data via GraphQL API
  const query = `
    {
      forecast(county: "${county}") {
        today {
          temperature
          rainfall
          windSpeed
          windDirection
          humidity
          description
        }
        fiveDay {
          date
          temperature {
            min
            max
          }
          rainfall
          description
        }
      }
    }
  `;

  const response = await fetch(WEATHER_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  // Store in database for caching
  await db.insert(WeatherData).values({
    location: county,
    date: new Date(),
    temperature: data.data.forecast.today.temperature,
    rainfall: data.data.forecast.today.rainfall,
    windSpeed: data.data.forecast.today.windSpeed,
    windDirection: data.data.forecast.today.windDirection,
    humidity: data.data.forecast.today.humidity,
    weatherDescription: data.data.forecast.today.description,
    forecast: JSON.stringify(data.data.forecast.fiveDay),
    source: "Met.ie GraphQL API",
  });

  return data.data.forecast;
}
```

## GraphRAG knowledge base implementation

For our one-week sprint, we'll implement a lightweight GraphRAG system using SQLite and minimal dependencies. This approach provides the benefits of graph-based knowledge while remaining fast to implement.

### Knowledge graph schema

```typescript
// src/database/knowledge-graph.js
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../../garden-knowledge.sqlite"));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    properties TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    type TEXT NOT NULL,
    properties TEXT,
    FOREIGN KEY (source) REFERENCES nodes(id),
    FOREIGN KEY (target) REFERENCES nodes(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
  CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
  CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
  CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type);
`);

export const graphDb = {
  // Add a node to the knowledge graph
  addNode(id, type, properties) {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO nodes (id, type, properties) VALUES (?, ?, ?)"
    );
    stmt.run(id, type, JSON.stringify(properties));
  },

  // Add an edge between nodes
  addEdge(source, target, type, properties = {}) {
    const id = `${source}-${type}-${target}`;
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO edges (id, source, target, type, properties) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, source, target, type, JSON.stringify(properties));
  },

  // Get node by ID
  getNode(id) {
    const stmt = db.prepare("SELECT * FROM nodes WHERE id = ?");
    const node = stmt.get(id);
    if (node) {
      node.properties = JSON.parse(node.properties);
    }
    return node;
  },

  // Get nodes by type
  getNodesByType(type) {
    const stmt = db.prepare("SELECT * FROM nodes WHERE type = ?");
    const nodes = stmt.all(type);
    return nodes.map((node) => ({
      ...node,
      properties: JSON.parse(node.properties),
    }));
  },

  // Get connected nodes (1-hop neighbors)
  getConnectedNodes(nodeId) {
    const stmt = db.prepare(`
      SELECT n.*, e.type as edge_type, e.properties as edge_properties
      FROM edges e
      JOIN nodes n ON e.target = n.id
      WHERE e.source = ?
    `);
    const nodes = stmt.all(nodeId);
    return nodes.map((node) => ({
      ...node,
      properties: JSON.parse(node.properties),
      edge_properties: JSON.parse(node.edge_properties),
    }));
  },

  // Query for plants suitable for specific conditions
  findPlantsBySuitability(conditions) {
    const { soilType, sunExposure, season } = conditions;

    // Build query based on provided conditions
    let query = `
      SELECT DISTINCT p.id, p.properties
      FROM nodes p
      WHERE p.type = 'Plant'
    `;

    const params = [];

    if (soilType) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'THRIVES_IN'
          AND s.type = 'SoilType'
          AND s.id = ?
        )
      `;
      params.push(soilType);
    }

    if (sunExposure) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'NEEDS'
          AND s.type = 'SunExposure'
          AND s.id = ?
        )
      `;
      params.push(sunExposure);
    }

    if (season) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'GROWS_BEST_IN'
          AND s.type = 'Season'
          AND s.id = ?
        )
      `;
      params.push(season);
    }

    const stmt = db.prepare(query);
    const plants = stmt.all(...params);
    return plants.map((plant) => ({
      id: plant.id,
      properties: JSON.parse(plant.properties),
    }));
  },
};
```

### Knowledge graph seeding

```typescript
// src/database/seed-knowledge-graph.js
import { graphDb } from "./knowledge-graph.js";
import irishPlantsData from "../data/irish-plants.json";
import soilTypesData from "../data/soil-types.json";
import seasonsData from "../data/irish-seasons.json";

export async function seedKnowledgeGraph() {
  console.log("Seeding knowledge graph...");

  // Add basic nodes

  // Add seasons
  seasonsData.forEach((season) => {
    graphDb.addNode(season.id, "Season", {
      name: season.name,
      months: season.months,
      temperatures: season.temperatures,
      rainfall: season.rainfall,
    });
  });

  // Add soil types
  soilTypesData.forEach((soil) => {
    graphDb.addNode(soil.id, "SoilType", {
      name: soil.name,
      description: soil.description,
      ph: soil.ph,
      texture: soil.texture,
      nutrients: soil.nutrients,
      drainage: soil.drainage,
    });
  });

  // Add sun exposure types
  const sunExposures = [
    { id: "full-sun", name: "Full Sun", hoursOfSun: "6+ hours" },
    { id: "partial-shade", name: "Partial Shade", hoursOfSun: "3-6 hours" },
    { id: "full-shade", name: "Full Shade", hoursOfSun: "Less than 3 hours" },
  ];

  sunExposures.forEach((sun) => {
    graphDb.addNode(sun.id, "SunExposure", sun);
  });

  // Add plants and their relationships
  irishPlantsData.forEach((plant) => {
    // Add plant node
    graphDb.addNode(plant.id, "Plant", {
      name: plant.name,
      latinName: plant.latinName,
      description: plant.description,
      waterNeeds: plant.waterNeeds,
      imageUrl: plant.imageUrl,
      nativeToIreland: plant.nativeToIreland,
      sustainabilityRating: plant.sustainabilityRating,
    });

    // Add soil relationships
    plant.suitableSoils.forEach((soilId) => {
      graphDb.addEdge(plant.id, soilId, "THRIVES_IN");
    });

    // Add sun exposure relationship
    graphDb.addEdge(plant.id, plant.sunNeeds, "NEEDS");

    // Add growing season relationships
    plant.growingSeasons.forEach((seasonId) => {
      graphDb.addEdge(plant.id, seasonId, "GROWS_BEST_IN");
    });

    // Add companion planting relationships
    plant.companionPlants?.forEach((companionId) => {
      graphDb.addEdge(plant.id, companionId, "GROWS_WELL_WITH");
    });
  });

  console.log("Knowledge graph seeding complete");
}
```

### Query generation for natural language questions

```typescript
// src/utils/graph-query-generator.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export async function naturalLanguageToGraphQuery(question) {
  const prompt = `
Convert this gardening question to a structured query for our graph database.
Questions about plants suitable for conditions should extract soil type, sun exposure, and season.
Question: "${question}"
Output a JSON object with extracted parameters. For example:
{
  "queryType": "plantSuitability",
  "parameters": {
    "soilType": "brown-earth",
    "sunExposure": "partial-shade",
    "season": "summer"
  }
}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You convert natural language gardening questions to structured queries.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  try {
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Failed to parse query result:", error);
    return {
      queryType: "unknown",
      parameters: {},
    };
  }
}
```

## Machine learning for crop recommendations

We'll implement a lightweight decision tree model that can run in the browser and provide practical crop recommendations based on Irish growing conditions.

### Decision tree implementation

```typescript
// src/ml/crop-recommender.js
class DecisionTree {
  constructor() {
    // Pre-built decision tree structure optimized for Irish crops
    this.tree = {
      attribute: "soilPh",
      threshold: 6.0,
      left: {
        attribute: "rainfall",
        threshold: 1000,
        left: ["potatoes", "radishes", "carrots"], // Lower rainfall, acidic soil
        right: ["blueberries", "rhubarb", "strawberries"], // Higher rainfall, acidic soil
      },
      right: {
        attribute: "sunExposure",
        threshold: 0.5, // 0 = full shade, 0.5 = partial, 1 = full sun
        left: ["lettuce", "spinach", "kale"], // Less sun, neutral/alkaline soil
        right: {
          attribute: "temperature",
          threshold: 15,
          left: ["cabbage", "broccoli", "brussels sprouts"], // Cooler, sunny, neutral soil
          right: ["tomatoes", "beans", "courgettes"], // Warmer, sunny, neutral soil
        },
      },
    };
  }

  // Helper function to navigate tree
  _traverseTree(node, sample) {
    if (Array.isArray(node)) {
      return node; // Leaf node with recommendations
    }

    if (sample[node.attribute] < node.threshold) {
      return this._traverseTree(node.left, sample);
    } else {
      return this._traverseTree(node.right, sample);
    }
  }

  // Get recommendations based on garden conditions
  getRecommendations(gardenData) {
    // Normalize inputs
    const sample = {
      soilPh: gardenData.soilPh,
      rainfall: gardenData.rainfall, // Annual average in mm
      temperature: gardenData.temperature, // Current average in celsius
      sunExposure: this._convertSunExposure(gardenData.sunExposure),
    };

    // Get crops from decision tree
    const recommendedCrops = this._traverseTree(this.tree, sample);

    // Add confidence scores (simplified)
    return recommendedCrops.map((crop) => ({
      name: crop,
      confidence: 0.85, // Fixed for this simple implementation
    }));
  }

  // Convert text sun exposure to numeric value
  _convertSunExposure(exposure) {
    const mapping = {
      "full-shade": 0,
      "partial-shade": 0.5,
      "full-sun": 1,
    };
    return mapping[exposure] || 0.5;
  }
}

// Enhanced version using local weather data
export class IrishCropRecommender {
  constructor() {
    this.decisionTree = new DecisionTree();
    this.seasonalModifiers = {
      spring: ["lettuce", "peas", "radishes", "spinach", "onions"],
      summer: ["beans", "courgettes", "tomatoes", "cucumber"],
      autumn: ["kale", "leeks", "broccoli", "brussels sprouts"],
      winter: ["garlic", "broad beans", "winter cabbage"],
    };
  }

  async getRecommendations(gardenData, county) {
    // Get base recommendations from decision tree
    let recommendations = this.decisionTree.getRecommendations(gardenData);

    // Get current weather and season data
    const weather = await getCurrentWeather(county);
    const currentSeason = this._getCurrentSeason();

    // Boost scores for season-appropriate plants
    recommendations = recommendations.map((rec) => {
      if (this.seasonalModifiers[currentSeason].includes(rec.name)) {
        return { ...rec, confidence: Math.min(rec.confidence + 0.1, 1.0) };
      }
      return rec;
    });

    // Add additional seasonal recommendations if list is short
    if (recommendations.length < 5) {
      const additionalCrops = this.seasonalModifiers[currentSeason]
        .filter((crop) => !recommendations.find((r) => r.name === crop))
        .map((crop) => ({ name: crop, confidence: 0.7 }));

      recommendations = [...recommendations, ...additionalCrops].slice(0, 5);
    }

    // Adjust for current weather conditions
    if (weather.rainfall > 20) {
      // Heavy rain recently
      recommendations = recommendations.map((rec) => {
        // Reduce confidence for rain-sensitive crops
        if (["tomatoes", "lettuce"].includes(rec.name)) {
          return { ...rec, confidence: rec.confidence * 0.8 };
        }
        return rec;
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  _getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "autumn";
    return "winter";
  }
}
```

## Database schema and models

We'll use Astro DB (built on SQLite) for our data layer, which provides excellent TypeScript integration and minimal setup time.

### Schema definition

```typescript
// src/database/schema.js
import { defineDb, defineTable, column, SQLiteAdapter } from "astro:db";

export const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    username: column.text({ unique: true }),
    email: column.text({ unique: true }),
    location: column.text(), // County/region in Ireland
    created_at: column.date({ default: "CURRENT_TIMESTAMP" }),
  },
});

export const Gardens = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => Users.columns.id }),
    name: column.text(),
    description: column.text({ optional: true }),
    location: column.text(), // Address or coordinates
    size: column.number(), // Size in square meters
    soilType: column.text(), // Reference to common Irish soil types
    sunExposure: column.text(), // Full sun, partial shade, full shade
    created_at: column.date({ default: "CURRENT_TIMESTAMP" }),
    updated_at: column.date({ default: "CURRENT_TIMESTAMP" }),
  },
});

export const Plants = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    commonName: column.text(),
    latinName: column.text(),
    categoryId: column.number({ references: () => PlantCategories.columns.id }),
    description: column.text(),
    waterNeeds: column.text(), // Low, Medium, High
    sunNeeds: column.text(), // Full sun, partial shade, full shade
    soilPreference: column.text(),
    growingZone: column.text(), // Irish growing zones
    nativeToIreland: column.boolean({ default: false }),
    isPerennial: column.boolean(),
    floweringSeason: column.text({ optional: true }),
    harvestSeason: column.text({ optional: true }),
    pollinatorFriendly: column.boolean({ default: false }),
    pestResistant: column.boolean({ default: false }),
    imageUrl: column.text({ optional: true }),
    sustainabilityRating: column.number(), // 1-5 scale
    waterConservationRating: column.number(), // 1-5 scale
    biodiversityValue: column.number(), // 1-5 scale
  },
});

export const PlantCategories = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    type: column.text(), // Vegetable, Fruit, Herb, Flower, Tree, Shrub, etc.
  },
});

export const GardenPlants = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    gardenId: column.number({ references: () => Gardens.columns.id }),
    plantId: column.number({ references: () => Plants.columns.id }),
    quantity: column.number({ default: 1 }),
    plantingDate: column.date({ optional: true }),
    status: column.text(), // Planned, Planted, Harvested, Removed
    notes: column.text({ optional: true }),
    lastWatered: column.date({ optional: true }),
  },
});

export const WeatherData = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    location: column.text(), // County or coordinates
    date: column.date(),
    temperature: column.number(),
    rainfall: column.number(),
    windSpeed: column.number(),
    windDirection: column.text(),
    humidity: column.number(),
    weatherDescription: column.text(),
    forecast: column.text(), // JSON string of forecast data
    source: column.text(), // e.g., "Met.ie API"
    created_at: column.date({ default: "CURRENT_TIMESTAMP" }),
  },
});

export const SustainabilityMetrics = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    gardenId: column.number({ references: () => Gardens.columns.id }),
    recordDate: column.date(),
    waterUsage: column.number({ optional: true }), // Liters
    compostAmount: column.number({ optional: true }), // Kg
    pesticidesUsed: column.boolean({ default: false }),
    organicPractices: column.boolean({ default: true }),
    rainwaterHarvested: column.number({ optional: true }), // Liters
    foodProduced: column.number({ optional: true }), // Kg
  },
});

export const SeasonalTips = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    month: column.number(), // 1-12
    region: column.text({ optional: true }), // Specific region in Ireland or "All"
    title: column.text(),
    description: column.text(),
    priority: column.number({ default: 1 }), // 1-5 scale
  },
});

// Define the database with all tables
export default defineDb({
  tables: {
    Users,
    Gardens,
    Plants,
    PlantCategories,
    GardenPlants,
    WeatherData,
    SustainabilityMetrics,
    SeasonalTips,
  },
  adapter: new SQLiteAdapter("sqlite.db"),
});
```

### TypeScript interfaces

```typescript
// src/types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  location: string;
  created_at: Date;
}

export interface Garden {
  id: number;
  userId: number;
  name: string;
  description?: string;
  location: string;
  size: number;
  soilType: string;
  sunExposure: string;
  created_at: Date;
  updated_at: Date;
}

export interface Plant {
  id: number;
  commonName: string;
  latinName: string;
  categoryId: number;
  description: string;
  waterNeeds: WaterNeedsType;
  sunNeeds: SunNeedsType;
  soilPreference: string;
  growingZone: string;
  nativeToIreland: boolean;
  isPerennial: boolean;
  floweringSeason?: string;
  harvestSeason?: string;
  pollinatorFriendly: boolean;
  pestResistant: boolean;
  imageUrl?: string;
  sustainabilityRating: number;
  waterConservationRating: number;
  biodiversityValue: number;
}

export type WaterNeedsType = "Low" | "Medium" | "High";
export type SunNeedsType = "Full Sun" | "Partial Shade" | "Full Shade";
export type PlantStatusType = "Planned" | "Planted" | "Harvested" | "Removed";

export interface SustainabilityMetrics {
  id: number;
  gardenId: number;
  recordDate: Date;
  waterUsage?: number;
  compostAmount?: number;
  pesticidesUsed: boolean;
  organicPractices: boolean;
  rainwaterHarvested?: number;
  foodProduced?: number;
}

export interface WeatherData {
  id: number;
  location: string;
  date: Date;
  temperature: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  weatherDescription: string;
  forecast?: any; // Parsed from JSON string
  source: string;
  created_at: Date;
}

export interface PlantRecommendation {
  name: string;
  confidence: number;
  description?: string;
  imageUrl?: string;
  sustainabilityRating?: number;
}
```

## UI components implementation

We'll use shadcn/ui with Tailwind CSS for efficient component development. Here are the key components needed:

### Navigation layout

```jsx
// src/components/common/Layout.astro
---
import { NavigationMenu } from '../ui/NavigationMenu';
import Footer from './Footer.astro';

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} | Bloom</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="min-h-screen bg-green-50">
    <NavigationMenu client:load />

    <main class="container mx-auto py-8 px-4">
      <slot />
    </main>

    <Footer />
  </body>
</html>
```

### Plant card component

```jsx
// src/components/plants/PlantCard.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";

const PlantCard = ({ plant, onSelect }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plant.commonName}</CardTitle>
            <CardDescription className="italic">
              {plant.latinName}
            </CardDescription>
          </div>
          {plant.nativeToIreland && (
            <Badge variant="outline" className="bg-green-100">
              Native
            </Badge>
          )}
        </div>
      </CardHeader>

      {plant.imageUrl && (
        <div className="px-6 pt-2">
          <img
            src={plant.imageUrl}
            alt={plant.commonName}
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}

      <CardContent className="pt-4">
        <p className="line-clamp-3">{plant.description}</p>

        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Water:</span>
            <span>{plant.waterNeeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Sun:</span>
            <span>{plant.sunNeeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Soil:</span>
            <span>{plant.soilPreference}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span>{plant.isPerennial ? "Perennial" : "Annual"}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Sustainability:</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < plant.sustainabilityRating
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <button
          onClick={() => onSelect(plant)}
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
        >
          View Details
        </button>
      </CardFooter>
    </Card>
  );
};

export default PlantCard;
```

### Weather forecast component

```jsx
// src/components/weather/WeatherForecast.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeatherForecast = ({ weatherData }) => {
  // Parse forecast data if it's a string
  const forecast =
    typeof weatherData.forecast === "string"
      ? JSON.parse(weatherData.forecast)
      : weatherData.forecast;

  const chartData = {
    labels: forecast.map((day) =>
      new Date(day.date).toLocaleDateString("en-IE", { weekday: "short" })
    ),
    datasets: [
      {
        label: "Rainfall (mm)",
        data: forecast.map((day) => day.rainfall),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Temperature (°C)",
        data: forecast.map((day) => day.temperature.max),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `5-Day Forecast for ${weatherData.location}`,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Weather in {weatherData.location}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
          <div className="px-4 py-2 bg-blue-100 rounded-lg">
            {weatherData.weatherDescription}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Humidity</span>
            <span className="font-medium">{weatherData.humidity}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Wind</span>
            <span className="font-medium">
              {weatherData.windSpeed} km/h {weatherData.windDirection}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Rainfall</span>
            <span className="font-medium">{weatherData.rainfall} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Updated</span>
            <span className="font-medium">
              {new Date(weatherData.created_at).toLocaleTimeString("en-IE")}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Gardening Advice</h3>
          <p className="text-sm">
            {weatherData.rainfall > 5
              ? "Avoid watering today as rainfall is sufficient. Good day for indoor seedling preparation."
              : weatherData.temperature > 20
              ? "Water plants in the early morning or evening to minimize evaporation."
              : "Moderate conditions today - ideal for general garden maintenance."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
```

### Sustainability metrics component

```jsx
// src/components/sustainability/SustainabilityTracker.jsx
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const SustainabilityTracker = ({ gardenId, existingMetrics = [] }) => {
  const [activeTab, setActiveTab] = useState("record");
  const [formData, setFormData] = useState({
    waterUsage: "",
    compostAmount: "",
    pesticidesUsed: false,
    organicPractices: true,
    rainwaterHarvested: "",
    foodProduced: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/sustainability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gardenId,
          recordDate: new Date(),
          ...formData,
        }),
      });

      if (response.ok) {
        // Show success message and reset form
        setFormData({
          waterUsage: "",
          compostAmount: "",
          pesticidesUsed: false,
          organicPractices: true,
          rainwaterHarvested: "",
          foodProduced: "",
        });
        setActiveTab("view");
      }
    } catch (error) {
      console.error("Failed to save metrics:", error);
    }
  };

  // Calculate summary metrics for charts
  const waterUsageData = {
    labels: ["Harvested Rainwater", "Municipal Water"],
    datasets: [
      {
        data: [
          existingMetrics.reduce(
            (sum, m) => sum + (m.rainwaterHarvested || 0),
            0
          ),
          existingMetrics.reduce((sum, m) => sum + (m.waterUsage || 0), 0) -
            existingMetrics.reduce(
              (sum, m) => sum + (m.rainwaterHarvested || 0),
              0
            ),
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.5)", "rgba(255, 99, 132, 0.5)"],
        borderColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
        borderWidth: 1,
      },
    ],
  };

  const practicesData = {
    labels: ["Organic Practices", "Pesticide Use"],
    datasets: [
      {
        data: [
          existingMetrics.filter((m) => m.organicPractices).length,
          existingMetrics.filter((m) => m.pesticidesUsed).length,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(255, 159, 64, 0.5)"],
        borderColor: ["rgb(75, 192, 192)", "rgb(255, 159, 64)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sustainability Tracker</CardTitle>
        <CardDescription>
          Record and monitor your garden's sustainability metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="record">
              Record Data
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="view">
              View Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterUsage">Water Used (liters)</Label>
                  <Input
                    id="waterUsage"
                    name="waterUsage"
                    type="number"
                    min="0"
                    value={formData.waterUsage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainwaterHarvested">
                    Rainwater Harvested (liters)
                  </Label>
                  <Input
                    id="rainwaterHarvested"
                    name="rainwaterHarvested"
                    type="number"
                    min="0"
                    value={formData.rainwaterHarvested}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compostAmount">Compost Used (kg)</Label>
                  <Input
                    id="compostAmount"
                    name="compostAmount"
                    type="number"
                    min="0"
                    value={formData.compostAmount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodProduced">Food Produced (kg)</Label>
                  <Input
                    id="foodProduced"
                    name="foodProduced"
                    type="number"
                    min="0"
                    value={formData.foodProduced}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-8 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="organicPractices"
                    name="organicPractices"
                    type="checkbox"
                    checked={formData.organicPractices}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="organicPractices">Organic Practices</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="pesticidesUsed"
                    name="pesticidesUsed"
                    type="checkbox"
                    checked={formData.pesticidesUsed}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="pesticidesUsed">Pesticides Used</Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Metrics
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="view">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Water Usage</h3>
                <Doughnut
                  data={waterUsageData}
                  options={{
                    plugins: {
                      title: {
                        display: true,
                        text: "Water Sources",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Gardening Practices
                </h3>
                <Doughnut
                  data={practicesData}
                  options={{
                    plugins: {
                      title: {
                        display: true,
                        text: "Sustainable Practices",
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Recent Metrics</h3>
              {existingMetrics.length > 0 ? (
                <div className="space-y-4">
                  {existingMetrics.slice(0, 5).map((metric, index) => (
                    <div
                      key={index}
                      className="border rounded p-4 grid grid-cols-2 gap-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(metric.recordDate).toLocaleDateString(
                          "en-IE"
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Water Used:</span>{" "}
                        {metric.waterUsage || 0} L
                      </div>
                      <div>
                        <span className="font-medium">Rainwater:</span>{" "}
                        {metric.rainwaterHarvested || 0} L
                      </div>
                      <div>
                        <span className="font-medium">Food Produced:</span>{" "}
                        {metric.foodProduced || 0} kg
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No metrics recorded yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SustainabilityTracker;
```

## Main page implementation

```jsx
// src/pages/index.astro
---
import Layout from '../components/common/Layout.astro';
import { db } from 'astro:db';
import { SeasonalTips, Plants } from '../database/schema';
import { eq } from 'astro:db';
import WeatherForecast from '../components/weather/WeatherForecast';
import PlantRecommendations from '../components/plants/PlantRecommendations';
import { getCurrentWeather } from '../utils/weather-client';

// Get current month
const currentMonth = new Date().getMonth() + 1;

// Get seasonal tips for current month
const seasonalTips = await db.select().from(SeasonalTips)
  .where(eq(SeasonalTips.columns.month, currentMonth))
  .orderBy(SeasonalTips.columns.priority, 'desc')
  .limit(3);

// Get featured sustainable plants
const sustainablePlants = await db.select().from(Plants)
  .where(
    `sustainabilityRating >= 4 AND
     nativeToIreland = true`
  )
  .limit(4);

// Get weather data for Dublin (default)
const weatherData = await getCurrentWeather('Dublin');
---

<Layout title="Sustainable Irish Gardening Assistant">
  <div class="max-w-7xl mx-auto">
    <section class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4 text-green-800">Irish Sustainable Gardening Assistant</h1>
      <p class="text-xl max-w-3xl mx-auto text-gray-600">
        Personalized gardening advice for Irish conditions, focusing on sustainability and local growing practices.
      </p>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4 text-green-700">Seasonal Tips for Irish Gardens</h2>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-medium mb-4">What to do in {new Date().toLocaleString('en-IE', { month: 'long' })}</h3>
            <div class="space-y-4">
              {seasonalTips.map(tip => (
                <div class="border-l-4 border-green-500 pl-4 py-2">
                  <h4 class="font-medium">{tip.title}</h4>
                  <p class="text-gray-600 mt-1">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4 text-green-700">Sustainable Plant Selections</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sustainablePlants.map(plant => (
              <div class="bg-white rounded-lg shadow p-4">
                <div class="flex gap-3">
                  {plant.imageUrl && (
                    <img
                      src={plant.imageUrl}
                      alt={plant.commonName}
                      class="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 class="font-medium">{plant.commonName}</h3>
                    <p class="text-gray-500 text-sm italic">{plant.latinName}</p>
                    <div class="mt-1 flex items-center">
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Native to Ireland
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div class="lg:col-span-1">
        <WeatherForecast weatherData={weatherData} client:load />

        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Soil Guide</h2>
          <p class="mb-4 text-sm">
            Irish soils vary greatly across the country. Understanding your soil type is essential for sustainable gardening.
          </p>

          <div class="space-y-3 text-sm">
            <div>
              <span class="font-medium block">Brown Earth</span>
              <span class="text-gray-600">Fertile soils common in the Midlands region</span>
            </div>
            <div>
              <span class="font-medium block">Gleys</span>
              <span class="text-gray-600">Poorly drained soils found in low-lying areas</span>
            </div>
            <div>
              <span class="font-medium block">Peat</span>
              <span class="text-gray-600">Acidic, organic-rich soils common in boglands</span>
            </div>
            <div>
              <span class="font-medium block">Grey-Brown Podzolics</span>
              <span class="text-gray-600">Good agricultural soils in east and south</span>
            </div>
          </div>

          <a href="/soil-guide" class="block mt-4 text-green-600 hover:text-green-800 font-medium text-sm">
            Complete Irish soil guide →
          </a>
        </div>
      </div>
    </div>
  </div>
</Layout>
```

## API endpoints for recommendations

```js
// src/pages/api/recommendations.js
import { db } from "astro:db";
import { Plants } from "../../database/schema";
import { IrishCropRecommender } from "../../ml/crop-recommender";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { soilType, sunExposure, county, soilPh, temperature, rainfall } =
      data;

    // Initialize crop recommender
    const recommender = new IrishCropRecommender();

    // Get recommendations
    const recommendations = await recommender.getRecommendations(
      { soilPh, temperature, rainfall, sunExposure },
      county
    );

    // Get full plant details for recommendations
    const plantNames = recommendations.map((rec) => rec.name);
    const plants = await db
      .select()
      .from(Plants)
      .where(`commonName IN (${plantNames.map((n) => `'${n}'`).join(",")})`);

    // Merge recommendation data with plant details
    const fullRecommendations = recommendations.map((rec) => {
      const plantDetails = plants.find(
        (p) => p.commonName.toLowerCase() === rec.name.toLowerCase()
      );
      return {
        ...rec,
        ...plantDetails,
      };
    });

    return new Response(
      JSON.stringify({ recommendations: fullRecommendations }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

## One-week implementation steps

Day 1:

- Set up Astro project with TypeScript and required integrations
- Create database schema and initial data models
- Start building core UI components

Day 2:

- Implement Met.ie weather API integration
- Build Teagasc soil data client
- Create weather and soil visualization components

Day 3:

- Implement GraphRAG knowledge base with SQLite
- Seed database with Irish plants and gardening information
- Build plant browsing and search functionality

Day 4:

- Implement decision tree ML model for crop recommendations
- Create recommendations API
- Build recommendation UI components

Day 5:

- Implement sustainability tracking features
- Create garden profile management
- Build seasonal tips components

Day 6:

- Connect all components into cohesive flows
- Implement caching for API calls
- Optimize performance

Day 7:

- Final testing and bug fixes
- Content refinement
- Deployment to production

## Conclusion

This implementation guide provides a complete blueprint for building an Irish sustainable gardening assistant using Astro.js in a one-week timeframe. By leveraging Astro's islands architecture, we can create a primarily static site with interactive islands for dynamic functionality, ensuring excellent performance while providing valuable gardening recommendations.

The system integrates Irish-specific data sources (Teagasc soil data and Met.ie weather), implements a lightweight GraphRAG knowledge base for gardening information, uses simple machine learning for crop recommendations, and provides sustainability tracking features. The component-based architecture makes the system maintainable and extensible for future enhancements.

With this approach, developers can quickly build a functional system that helps Irish gardeners make sustainable choices based on local conditions and weather patterns.
