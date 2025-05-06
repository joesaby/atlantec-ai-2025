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
