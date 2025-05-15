// Use localStorage to persist user data
import logger from "./unified-logger.js";
import {
  emitPracticeAdded,
  emitPracticeRemoved,
  emitDataChanged,
} from "./sustainability-events";

const STORAGE_KEY = "irish-garden-sustainability";

// Check if localStorage is available (client-side)
const isClient = typeof window !== "undefined" && window.localStorage;

// Default user progress data
const defaultUserProgress = {
  activePractices: [],
  resourceUsage: {
    water: [],
    compost: [],
    harvest: [],
    carbon: [],
    energy: [],
    waste: [],
  },
  milestones: [],
  score: 0,
  sdgScores: {
    sdg2: 0, // Zero Hunger
    sdg3: 0, // Good Health and Well-being
    sdg4: 0, // Quality Education
    sdg6: 0, // Clean Water
    sdg7: 0, // Affordable and Clean Energy
    sdg8: 0, // Decent Work and Economic Growth
    sdg9: 0, // Industry, Innovation and Infrastructure
    sdg11: 0, // Sustainable Cities
    sdg12: 0, // Responsible Consumption
    sdg13: 0, // Climate Action
    sdg14: 0, // Life Below Water
    sdg15: 0, // Life on Land
  },
};

// Helper to get user data from localStorage
const getUserProgress = () => {
  if (!isClient) {
    logger.debug("Running in SSR mode, returning default progress", {
      component: "SustainabilityStore",
    });
    return defaultUserProgress;
  }

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return defaultUserProgress;
    }

    const parsedData = JSON.parse(storedData);

    // Ensure sdgScores object exists in case we're loading older data
    if (!parsedData.sdgScores) {
      parsedData.sdgScores = { ...defaultUserProgress.sdgScores };
    }

    return parsedData;
  } catch (error) {
    logger.error("Error accessing localStorage", {
      component: "SustainabilityStore",
      error: error.message,
    });
    return defaultUserProgress;
  }
};

// Helper to save user data to localStorage
const saveUserProgress = (data) => {
  if (!isClient) {
    logger.debug("Running in SSR mode, can't save progress", {
      component: "SustainabilityStore",
    });
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error("Error saving to localStorage", {
      component: "SustainabilityStore",
      error: error.message,
    });
  }
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
    // In client-side code, we can use dynamic imports
    if (isClient) {
      const {
        sustainablePractices,
      } = require("../data/sustainability-metrics");

      // Look for the practice in all categories
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
    logger.error("Error finding practice", {
      component: "SustainabilityStore",
      practiceId,
      error: error.message,
    });
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
    logger.debug("Updated user progress after adding practice", {
      component: "SustainabilityStore",
      practiceId,
      practicesCount: userProgress.activePractices.length,
    });

    // Emit event when a practice is added (if in client mode)
    if (isClient) {
      // Use the imported emitPracticeAdded function
      emitPracticeAdded(practiceId);

      // Also emit a general data changed event
      emitDataChanged("practice-added", {
        practiceId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return userProgress;
};

// Remove a practice from user's active practices
export const removeSustainablePractice = (practiceId) => {
  const userProgress = getUserProgress();

  // Import the metrics dynamically
  let practice = null;
  try {
    // In client-side code, we can use dynamic imports
    if (isClient) {
      const {
        sustainablePractices,
      } = require("../data/sustainability-metrics");

      // Look for the practice in all categories
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
    logger.error("Error finding practice", {
      component: "SustainabilityStore",
      practiceId,
      error: error.message,
    });
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
  logger.debug("Updated user progress after removing practice", {
    component: "SustainabilityStore",
    practiceId,
    practicesCount: userProgress.activePractices.length,
  });

  // Emit event when a practice is removed (if in client mode)
  if (isClient) {
    // Use the imported emitPracticeRemoved function
    emitPracticeRemoved(practiceId);

    // Also emit a general data changed event
    emitDataChanged("practice-removed", {
      practiceId,
      timestamp: new Date().toISOString(),
    });
  }

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

// Record resource usage (water, compost, harvest, carbon, energy, waste)
export const recordResourceUsage = (
  resourceType,
  amount,
  date = new Date(),
  metadata = {}
) => {
  const userProgress = getUserProgress();

  if (!userProgress.resourceUsage[resourceType]) {
    userProgress.resourceUsage[resourceType] = [];
  }

  userProgress.resourceUsage[resourceType].push({
    date: date.toISOString(),
    amount: amount,
    metadata: metadata,
  });

  // Update sustainability metrics based on this resource usage
  updateSustainabilityMetricsFromResource(resourceType, amount, metadata);

  saveUserProgress(userProgress);

  // Emit data changed event
  if (isClient) {
    emitDataChanged("resource-usage-updated", {
      resourceType,
      amount,
      timestamp: date.toISOString(),
    });
  }

  return userProgress;
};

// Update sustainability metrics based on resource usage
export const updateSustainabilityMetricsFromResource = (
  resourceType,
  amount,
  metadata = {}
) => {
  const userProgress = getUserProgress();

  // Update relevant SDG scores based on resource type
  switch (resourceType) {
    case "water":
      // SDG 6: Clean Water
      // Negative impact if using more water, positive if conserving
      if (amount < 0) {
        // Water conservation (negative amount means saved water)
        userProgress.sdgScores.sdg6 += Math.abs(amount) * 0.05;
      } else {
        // Water usage - small negative impact
        userProgress.sdgScores.sdg6 -= amount * 0.01;
      }
      break;

    case "compost":
      // SDG 12: Responsible Consumption, SDG 15: Life on Land
      userProgress.sdgScores.sdg12 += amount * 0.1;
      userProgress.sdgScores.sdg15 += amount * 0.1;
      break;

    case "harvest":
      // SDG 2: Zero Hunger, SDG 12: Responsible Consumption
      userProgress.sdgScores.sdg2 += amount * 0.1;
      userProgress.sdgScores.sdg12 += amount * 0.05;
      break;

    case "carbon":
      // SDG 13: Climate Action
      if (amount < 0) {
        // Carbon reduction (negative amount means reduced emissions)
        userProgress.sdgScores.sdg13 += Math.abs(amount) * 0.2;
      } else {
        // Carbon emissions - negative impact
        userProgress.sdgScores.sdg13 -= amount * 0.1;
      }
      break;

    case "energy":
      // SDG 7: Affordable and Clean Energy
      if (amount < 0) {
        // Energy saving (negative amount means saved energy)
        userProgress.sdgScores.sdg7 += Math.abs(amount) * 0.15;
      } else {
        // Energy usage - small negative impact
        userProgress.sdgScores.sdg7 -= amount * 0.05;
      }
      break;

    case "waste":
      // SDG 11: Sustainable Cities, SDG 12: Responsible Consumption
      userProgress.sdgScores.sdg11 += amount * 0.1;
      userProgress.sdgScores.sdg12 += amount * 0.15;
      break;
  }

  // Cap SDG scores between 0 and 100
  Object.keys(userProgress.sdgScores).forEach((sdg) => {
    userProgress.sdgScores[sdg] = Math.max(
      0,
      Math.min(100, userProgress.sdgScores[sdg])
    );
  });

  // Calculate overall sustainability score (average of SDG scores)
  const sdgValues = Object.values(userProgress.sdgScores);
  const totalScore = sdgValues.reduce((sum, score) => sum + score, 0);
  userProgress.score = Math.round(totalScore / sdgValues.length);

  saveUserProgress(userProgress);
  return userProgress;
};

// Create carbon offset from harvest or waste reduction
export const recordCarbonOffset = (amount, sourceType, date = new Date()) => {
  const userProgress = getUserProgress();

  // Ensure carbon array exists
  if (!userProgress.resourceUsage.carbon) {
    userProgress.resourceUsage.carbon = [];
  }

  // Record a negative carbon amount (offset) with metadata about the source
  userProgress.resourceUsage.carbon.push({
    date: date.toISOString(),
    amount: -Math.abs(amount), // Force negative (reduction)
    metadata: {
      activity: "offset",
      source: sourceType, // 'harvest', 'waste', 'compost', etc.
    },
  });

  // Update sustainability metrics
  updateSustainabilityMetricsFromResource("carbon", -Math.abs(amount), {
    activity: "offset",
    source: sourceType,
  });

  saveUserProgress(userProgress);

  // Emit data changed event
  if (isClient) {
    emitDataChanged("carbon-offset-recorded", {
      amount: -Math.abs(amount),
      source: sourceType,
      timestamp: date.toISOString(),
    });
  }

  return userProgress;
};

// Calculate total carbon impact (emissions minus offsets)
export const calculateNetCarbonImpact = () => {
  const userProgress = getUserProgress();

  if (
    !userProgress.resourceUsage.carbon ||
    userProgress.resourceUsage.carbon.length === 0
  ) {
    return { emissions: 0, reductions: 0, netImpact: 0 };
  }

  let emissions = 0;
  let reductions = 0;

  userProgress.resourceUsage.carbon.forEach((entry) => {
    const amount = parseFloat(entry.amount);
    if (amount >= 0) {
      emissions += amount;
    } else {
      reductions += Math.abs(amount);
    }
  });

  return {
    emissions,
    reductions,
    netImpact: emissions - reductions,
  };
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

// Get practice by ID
export const getPracticeById = (id) => {
  let foundPractice = null;

  try {
    if (isClient) {
      const {
        sustainablePractices,
      } = require("../data/sustainability-metrics");

      // Look for the practice in all categories
      for (const category of Object.values(sustainablePractices)) {
        const practice = category.practices.find((p) => p.id === id);
        if (practice) {
          foundPractice = {
            ...practice,
            category: category.name,
          };
          break;
        }
      }
    }
  } catch (error) {
    logger.error("Error finding practice by ID", {
      component: "SustainabilityStore",
      id,
      error: error.message,
    });
  }

  return foundPractice;
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
  logger.debug("Calculated SDG impact", {
    component: "SustainabilityStore",
    impact,
    totalScore,
  });
  return impact;
};

// Recalculate all SDG scores based on active practices
export const recalculateSDGScores = () => {
  if (!isClient) return null;

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

    logger.debug("Recalculated SDG scores", {
      component: "SustainabilityStore",
      sdgScores: userProgress.sdgScores,
      practicesCount: userProgress.activePractices.length,
    });
    saveUserProgress(userProgress);

    // Emit an event to notify that SDG scores have been recalculated
    if (isClient) {
      emitDataChanged("sdg-scores-recalculated", {
        timestamp: new Date().toISOString(),
        scoresUpdated: Object.keys(userProgress.sdgScores).length,
      });
    }

    return userProgress;
  } catch (error) {
    logger.error("Error recalculating SDG scores", {
      component: "SustainabilityStore",
      error: error.message,
    });
    return userProgress;
  }
};

// Reset all user data
export const resetUserProgress = () => {
  saveUserProgress(defaultUserProgress);
  return defaultUserProgress;
};

// Get all accepted and completed challenges
export const getChallengeProgress = () => {
  if (!isClient) {
    return { accepted: [], completed: [] };
  }

  try {
    const acceptedChallenges = [];
    const completedChallenges = [];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Check each month for accepted/completed challenges
    months.forEach((month) => {
      const isAccepted = localStorage.getItem(`accepted-challenge-${month}`);
      const isCompleted = localStorage.getItem(`completed-challenge-${month}`);

      if (isAccepted === "true") {
        acceptedChallenges.push(month);
      }

      if (isCompleted === "true") {
        completedChallenges.push(month);
      }
    });

    return {
      accepted: acceptedChallenges,
      completed: completedChallenges,
    };
  } catch (error) {
    logger.error("Error getting challenge progress", {
      component: "SustainabilityStore",
      error: error.message,
    });
    return { accepted: [], completed: [] };
  }
};

// Add points for completed challenges and update user sustainability stats
export const completeChallenge = (month, sdgIds = []) => {
  if (!isClient) return null;

  try {
    const userProgress = getUserProgress();

    // Save completion status
    localStorage.setItem(`completed-challenge-${month}`, "true");

    // Add points for challenge completion
    userProgress.score += 15;

    // Update SDG scores based on the challenge's SDGs
    if (sdgIds && sdgIds.length > 0) {
      sdgIds.forEach((sdgId) => {
        if (
          userProgress.sdgScores &&
          userProgress.sdgScores[sdgId] !== undefined
        ) {
          userProgress.sdgScores[sdgId] += 10;
        }
      });
    }

    saveUserProgress(userProgress);
    return userProgress;
  } catch (error) {
    logger.error("Error completing challenge", {
      component: "SustainabilityStore",
      month,
      error: error.message,
    });
    return null;
  }
};

// Helper to update practice data (progress, notes, goals, etc.)
export const updatePracticeData = (practiceId, data) => {
  if (!isClient) {
    logger.debug("Running in SSR mode, can't update practice data", {
      component: "SustainabilityStore",
    });
    return null;
  }

  try {
    const userProgress = getUserProgress();

    // Find the practice in activePractices
    const practiceIndex = userProgress.activePractices.findIndex(
      (practice) => practice.id === practiceId
    );

    if (practiceIndex === -1) {
      logger.warn("Practice not found in user's active practices", {
        component: "SustainabilityStore",
        practiceId,
      });
      return null;
    }

    // Update practice with new data
    userProgress.activePractices[practiceIndex] = {
      ...userProgress.activePractices[practiceIndex],
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    saveUserProgress(userProgress);

    // Emit data change event
    if (isClient) {
      emitDataChanged("practice-data-updated", {
        practiceId,
        data,
        timestamp: new Date().toISOString(),
      });
    }

    return userProgress;
  } catch (error) {
    logger.error("Error updating practice data", {
      component: "SustainabilityStore",
      practiceId,
      error: error.message,
    });
    return null;
  }
};
