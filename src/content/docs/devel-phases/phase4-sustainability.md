---
title: "Phase 4: Sustainability Tracking System"
description: "Phase 4: Sustainability Tracking System documentation"
category: "devel-phases"
---

This phase implements a sustainability tracking system that helps Irish gardeners monitor and improve their environmental impact. Users can record sustainable gardening practices, track resource usage, and see their progress over time. The system also tracks contribution to UN Sustainable Development Goals (SDGs).

## Implementation Steps

### 1. Create a Sustainability Metrics Database

First, create a database of sustainable gardening metrics and practices:

```javascript
// src/data/sustainability-metrics.js

/**
 * Database of sustainable gardening metrics and best practices
 * Tailored to Irish gardening conditions
 */

// UN Sustainable Development Goals relevant to gardening
export const sdgGoals = {
  sdg2: {
    id: "sdg2",
    number: 2,
    name: "Zero Hunger",
    description: "Growing your own food contributes to food security",
    icon: "🌽",
    color: "#d3a029",
  },
  sdg6: {
    id: "sdg6",
    number: 6,
    name: "Clean Water and Sanitation",
    description: "Water conservation practices protect this precious resource",
    icon: "💧",
    color: "#26bde2",
  },
  sdg11: {
    id: "sdg11",
    number: 11,
    name: "Sustainable Cities and Communities",
    description:
      "Green spaces improve urban environments and community well-being",
    icon: "🏙️",
    color: "#fd9d24",
  },
  sdg12: {
    id: "sdg12",
    number: 12,
    name: "Responsible Consumption and Production",
    description: "Sustainable resource use and waste reduction",
    icon: "♻️",
    color: "#bf8b2e",
  },
  sdg13: {
    id: "sdg13",
    number: 13,
    name: "Climate Action",
    description: "Practices that help mitigate climate change",
    icon: "🌍",
    color: "#3f7e44",
  },
  sdg15: {
    id: "sdg15",
    number: 15,
    name: "Life on Land",
    description: "Supporting biodiversity and ecosystem health",
    icon: "🦋",
    color: "#56c02b",
  },
};

// Resource conservation categories with practices
export const sustainablePractices = {
  water: {
    name: "Water Conservation",
    icon: "droplet",
    description:
      "Conserving water is particularly important during Irish dry spells which are becoming more common due to climate change.",
    sdgs: ["sdg6", "sdg12"],
    practices: [
      {
        id: "water-1",
        name: "Rainwater Harvesting",
        description:
          "Collecting rainwater for garden use. With Ireland's average rainfall of 1000+ mm annually, this can significantly reduce mains water usage.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg6", "sdg12"],
        tips: "Install water butts on downpipes from gutters. A typical Irish roof can collect about 85,000 liters of water annually.",
      },
      {
        id: "water-2",
        name: "Mulching",
        description:
          "Applying organic mulch to retain soil moisture and reduce evaporation.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg6", "sdg12", "sdg15"],
        tips: "Apply a 5-7cm layer of mulch around plants but keep away from stems. Grass clippings, compost, and leaf mould work well in Irish gardens.",
      },
      {
        id: "water-3",
        name: "Drought-Tolerant Planting",
        description:
          "Using plants that require minimal watering once established.",
        impact: "medium",
        difficulty: "easy",
        tips: "Native plants like Sea Holly, Red Valerian, and Wild Marjoram are adapted to Irish conditions and need less water.",
      },
      {
        id: "water-4",
        name: "Irrigation Efficiency",
        description:
          "Using water-efficient irrigation methods like drip systems or soaker hoses.",
        impact: "high",
        difficulty: "medium",
        tips: "Water plants at the base rather than overhead, and water in morning or evening to reduce evaporation.",
      },
    ],
  },
  soil: {
    name: "Soil Health",
    icon: "layers",
    description:
      "Healthy soil is the foundation of sustainable gardening and increases carbon sequestration.",
    sdgs: ["sdg13", "sdg15"],
    practices: [
      {
        id: "soil-1",
        name: "Composting",
        description:
          "Creating and using compost from garden and kitchen waste.",
        impact: "high",
        difficulty: "easy",
        tips: "A good compost mix for Irish conditions includes brown materials (cardboard, dried leaves) and green materials (grass clippings, vegetable scraps) in a ratio of 3:1.",
      },
      {
        id: "soil-2",
        name: "No-Dig Gardening",
        description:
          "Avoiding digging or tilling to preserve soil structure and microorganisms.",
        impact: "high",
        difficulty: "easy",
        tips: "Add compost to the top of beds rather than digging it in. Works particularly well with raised beds that are common in wetter Irish areas.",
      },
      {
        id: "soil-3",
        name: "Green Manures",
        description:
          "Growing cover crops to improve soil quality when beds would otherwise be empty.",
        impact: "medium",
        difficulty: "easy",
        tips: "Phacelia, clover, and winter rye work well in Irish conditions and can be sown after summer crops are harvested.",
      },
      {
        id: "soil-4",
        name: "Reducing Peat Usage",
        description:
          "Avoiding peat-based composts to help preserve Irish peatlands.",
        impact: "high",
        difficulty: "medium",
        tips: "Use peat-free compost for potting. Make your own compost for garden beds using local materials.",
      },
    ],
  },
  biodiversity: {
    name: "Biodiversity",
    icon: "flower",
    description:
      "Enhancing biodiversity supports wildlife and creates a balanced garden ecosystem.",
    sdgs: ["sdg15"],
    practices: [
      {
        id: "biodiversity-1",
        name: "Native Plant Growing",
        description:
          "Including Irish native plants in your garden to support local wildlife.",
        impact: "high",
        difficulty: "easy",
        tips: "Irish natives like Hawthorn, Blackthorn, Wild Strawberry, and Primrose support pollinators and other wildlife.",
      },
      {
        id: "biodiversity-2",
        name: "Wildlife Habitats",
        description:
          "Creating habitats like bug hotels, hedgehog houses, or bird boxes.",
        impact: "medium",
        difficulty: "easy",
        tips: "Use local materials to create shelters. Even a small pile of logs can provide habitat for insects and small animals.",
      },
      {
        id: "biodiversity-3",
        name: "Pollinator Support",
        description:
          "Growing flowers that support bees, butterflies, and other pollinators.",
        impact: "high",
        difficulty: "easy",
        tips: "Plant flowers that bloom from early spring to late autumn to provide continuous food sources. All-Ireland Pollinator Plan provides region-specific advice.",
      },
      {
        id: "biodiversity-4",
        name: "Chemical-Free Gardening",
        description:
          "Avoiding artificial pesticides and herbicides to protect wildlife.",
        impact: "high",
        difficulty: "medium",
        tips: "Use companion planting and physical barriers like netting for pest control. Encourage natural predators like ladybirds and birds.",
      },
    ],
  },
  resources: {
    name: "Resource Conservation",
    icon: "recycle",
    description:
      "Reducing waste and conserving resources lowers your garden's environmental impact.",
    sdgs: ["sdg12"],
    practices: [
      {
        id: "resources-1",
        name: "Seed Saving",
        description:
          "Collecting and storing seeds from your plants for future growing seasons.",
        impact: "medium",
        difficulty: "medium",
        tips: "Focus on open-pollinated varieties. Store seeds in paper envelopes in a cool, dry place. Irish climate requires proper drying before storage.",
      },
      {
        id: "resources-2",
        name: "Repurposing Materials",
        description: "Using recycled or repurposed materials in the garden.",
        impact: "medium",
        difficulty: "easy",
        tips: "Old baths can become planters, pallets can be used for vertical gardens, and plastic bottles can be used as cloches in spring.",
      },
      {
        id: "resources-3",
        name: "Tool Maintenance",
        description:
          "Properly maintaining and repairing tools rather than replacing them.",
        impact: "low",
        difficulty: "easy",
        tips: "Clean tools after use and store them in a dry place to prevent rust, which is common in Ireland's damp climate. Sharpen blades annually.",
      },
      {
        id: "resources-4",
        name: "Local Material Sourcing",
        description:
          "Sourcing materials locally to reduce transportation impacts.",
        impact: "medium",
        difficulty: "medium",
        tips: "Use local stone, wood, and soil. Consider community sharing of resources like compost, mulch, or even tools.",
      },
    ],
  },
  carbon: {
    name: "Carbon Footprint",
    icon: "leaf",
    description:
      "Reducing your garden's carbon footprint helps combat climate change.",
    sdgs: ["sdg13"],
    practices: [
      {
        id: "carbon-1",
        name: "Tree Planting",
        description: "Planting trees or shrubs to sequester carbon.",
        impact: "high",
        difficulty: "medium",
        tips: "Native trees like Rowan, Hazel, and Holly work well in smaller Irish gardens. A single tree can absorb about 1 tonne of CO2 over its lifetime.",
      },
      {
        id: "carbon-2",
        name: "Reduced Lawn Mowing",
        description:
          "Mowing less frequently to reduce emissions from petrol mowers.",
        impact: "low",
        difficulty: "easy",
        tips: "Consider creating a wildflower meadow area or using a push mower for smaller lawns. Irish grasses often grow rapidly in our mild, wet climate.",
      },
      {
        id: "carbon-3",
        name: "Growing Food",
        description:
          "Growing your own food to reduce food miles and packaging.",
        impact: "medium",
        difficulty: "medium",
        tips: "Focus on crops that grow well in Ireland and have high yields like potatoes, kale, and berries. Extend seasons with simple protection.",
      },
      {
        id: "carbon-4",
        name: "Perennial Growing",
        description:
          "Growing perennial vegetables and fruits that don't need replanting each year.",
        impact: "medium",
        difficulty: "easy",
        tips: "Rhubarb, asparagus, and fruit bushes are well-suited to Irish gardens and provide harvests year after year with minimal input.",
      },
    ],
  },
};

// Get all practices as a flat array
export const getAllPractices = () => {
  const allPractices = [];

  Object.values(sustainablePractices).forEach((category) => {
    category.practices.forEach((practice) => {
      // If practice doesn't have sdgs defined, use category sdgs
      if (!practice.sdgs && category.sdgs) {
        practice.sdgs = [...category.sdgs];
      }

      allPractices.push({
        ...practice,
        category: category.name,
      });
    });
  });

  return allPractices;
};

// Get practices by impact level
export const getPracticesByImpact = (impactLevel) => {
  return getAllPractices().filter(
    (practice) => practice.impact === impactLevel
  );
};

// Get practice by ID
export const getPracticeById = (id) => {
  let foundPractice = null;

  Object.values(sustainablePractices).forEach((category) => {
    const practice = category.practices.find((p) => p.id === id);
    if (practice) {
      // If practice doesn't have sdgs defined, use category sdgs
      if (!practice.sdgs && category.sdgs) {
        practice.sdgs = [...category.sdgs];
      }

      foundPractice = {
        ...practice,
        category: category.name,
      };
    }
  });

  return foundPractice;
};
```

### 2. Create a User Progress Store

Create a store to track user progress and SDG impact:

```javascript
// src/utils/sustainability-store.js

// Use localStorage to persist user data
const STORAGE_KEY = "irish-garden-sustainability";

// Default user progress data
const defaultUserProgress = {
  activePractices: [],
  resourceUsage: {
    water: [],
    compost: [],
    harvest: [],
  },
  milestones: [],
  score: 0,
  sdgScores: {
    sdg2: 0, // Zero Hunger
    sdg6: 0, // Clean Water
    sdg11: 0, // Sustainable Cities
    sdg12: 0, // Responsible Consumption
    sdg13: 0, // Climate Action
    sdg15: 0, // Life on Land
  },
};

// Helper to get user data from localStorage
const getUserProgress = () => {
  if (typeof window === "undefined") {
    return defaultUserProgress;
  }

  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : defaultUserProgress;
};

// Helper to save user data to localStorage
const saveUserProgress = (data) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Add a sustainable practice to user's active practices
export const addSustainablePractice = (
  practiceId,
  implementationDate = new Date()
) => {
  const userProgress = getUserProgress();

  // Import the metrics dynamically
  let practice = null;
  try {
    // Find the practice from the sustainability metrics
    if (typeof window !== "undefined") {
      const {
        sustainablePractices,
      } = require("../data/sustainability-metrics");

      for (const category of Object.values(sustainablePractices)) {
        const foundPractice = category.practices.find(
          (p) => p.id === practiceId
        );
        if (foundPractice) {
          practice = foundPractice;
          practice.category = category.name;
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error finding practice:", error);
  }

  // Check if practice is already active
  if (!userProgress.activePractices.some((p) => p.id === practiceId)) {
    userProgress.activePractices.push({
      id: practiceId,
      implementedOn: implementationDate.toISOString(),
      notes: "",
    });

    // Update sustainability score
    userProgress.score += 10;

    // Update SDG scores if the practice has SDG tags
    if (practice && practice.sdgs) {
      practice.sdgs.forEach((sdg) => {
        if (!userProgress.sdgScores) {
          userProgress.sdgScores = { ...defaultUserProgress.sdgScores };
        }

        if (userProgress.sdgScores[sdg] !== undefined) {
          // Add points based on impact
          const impactPoints =
            practice.impact === "high"
              ? 15
              : practice.impact === "medium"
              ? 10
              : 5;
          userProgress.sdgScores[sdg] += impactPoints;
        }
      });
    }

    saveUserProgress(userProgress);
  }

  return userProgress;
};

// Remove a practice from user's active practices
export const removeSustainablePractice = (practiceId) => {
  const userProgress = getUserProgress();

  // Find the practice from sustainability metrics
  let practice = null;
  try {
    // Similar code to find the practice as in addSustainablePractice
    // ...
  } catch (error) {
    console.error("Error finding practice:", error);
  }

  userProgress.activePractices = userProgress.activePractices.filter(
    (p) => p.id !== practiceId
  );

  // Update sustainability score
  userProgress.score = Math.max(0, userProgress.score - 10);

  // Update SDG scores if the practice has SDG tags
  if (practice && practice.sdgs) {
    practice.sdgs.forEach((sdg) => {
      if (!userProgress.sdgScores) {
        userProgress.sdgScores = { ...defaultUserProgress.sdgScores };
      }

      if (userProgress.sdgScores[sdg] !== undefined) {
        // Remove points based on impact
        const impactPoints =
          practice.impact === "high"
            ? 15
            : practice.impact === "medium"
            ? 10
            : 5;
        userProgress.sdgScores[sdg] = Math.max(
          0,
          userProgress.sdgScores[sdg] - impactPoints
        );
      }
    });
  }

  saveUserProgress(userProgress);
  return userProgress;
};

// Update notes for a practice
export const updatePracticeNotes = (practiceId, notes) => {
  const userProgress = getUserProgress();

  const practiceIndex = userProgress.activePractices.findIndex(
    (p) => p.id === practiceId
  );
  if (practiceIndex !== -1) {
    userProgress.activePractices[practiceIndex].notes = notes;
    saveUserProgress(userProgress);
  }

  return userProgress;
};

// Record resource usage (water, compost, harvest)
export const recordResourceUsage = (
  resourceType,
  amount,
  date = new Date()
) => {
  const userProgress = getUserProgress();

  if (!userProgress.resourceUsage[resourceType]) {
    userProgress.resourceUsage[resourceType] = [];
  }

  userProgress.resourceUsage[resourceType].push({
    date: date.toISOString(),
    amount: amount,
  });

  saveUserProgress(userProgress);
  return userProgress;
};

// Get all user progress data
export const getAllUserProgress = () => {
  const progress = getUserProgress();
  // Ensure SDG scores are initialized
  if (!progress.sdgScores) {
    progress.sdgScores = { ...defaultUserProgress.sdgScores };
    saveUserProgress(progress);
  }
  return progress;
};

// Calculate sustainability score
export const calculateSustainabilityScore = () => {
  const userProgress = getUserProgress();
  return userProgress.score;
};

// Get SDG scores
export const getSDGScores = () => {
  const userProgress = getUserProgress();
  if (!userProgress.sdgScores) {
    userProgress.sdgScores = { ...defaultUserProgress.sdgScores };
    saveUserProgress(userProgress);
  }
  return userProgress.sdgScores;
};

// Calculate overall SDG impact percentage
export const calculateSDGImpact = () => {
  const sdgScores = getSDGScores();
  // Maximum possible score per SDG based on our implementation
  const maxPerSDG = 100;
  const totalSDGs = Object.keys(sdgScores).length;

  const totalScore = Object.values(sdgScores).reduce(
    (sum, score) => sum + score,
    0
  );
  const maxScore = maxPerSDG * totalSDGs;

  const impact = Math.min(100, Math.round((totalScore / maxScore) * 100));
  return impact;
};

// Recalculate all SDG scores based on active practices
export const recalculateSDGScores = () => {
  if (typeof window === "undefined") return null;

  const userProgress = getUserProgress();
  // Reset SDG scores
  userProgress.sdgScores = { ...defaultUserProgress.sdgScores };

  try {
    const { sustainablePractices } = require("../data/sustainability-metrics");

    // For each active practice
    userProgress.activePractices.forEach((activePractice) => {
      // Find the practice data
      let practice = null;
      for (const category of Object.values(sustainablePractices)) {
        const foundPractice = category.practices.find(
          (p) => p.id === activePractice.id
        );
        if (foundPractice) {
          practice = foundPractice;
          break;
        }
      }

      // Update SDG scores if the practice has SDG tags
      if (practice && practice.sdgs) {
        practice.sdgs.forEach((sdg) => {
          if (userProgress.sdgScores[sdg] !== undefined) {
            // Add points based on impact
            const impactPoints =
              practice.impact === "high"
                ? 15
                : practice.impact === "medium"
                ? 10
                : 5;
            userProgress.sdgScores[sdg] += impactPoints;
          }
        });
      }
    });

    saveUserProgress(userProgress);
    return userProgress;
  } catch (error) {
    console.error("Error recalculating SDG scores:", error);
    return userProgress;
  }
};

// Reset all user data
export const resetUserProgress = () => {
  saveUserProgress(defaultUserProgress);
  return defaultUserProgress;
};
```