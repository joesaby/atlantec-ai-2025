import { getCurrentWeather } from "../utils/weather-client.js";

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
    if (weather && weather.rainfall > 20) {
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
