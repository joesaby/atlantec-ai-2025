// Use localStorage to persist user data
import logger from './unified-logger.js';

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
  if (!isClient) {
    logger.debug("Running in SSR mode, returning default progress", { component: "SustainabilityStore" });
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
      error: error.message
    });
    return defaultUserProgress;
  }
};

// Helper to save user data to localStorage
const saveUserProgress = (data) => {
  if (!isClient) {
    logger.debug("Running in SSR mode, can't save progress", { component: "SustainabilityStore" });
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error("Error saving to localStorage", {
      component: "SustainabilityStore",
      error: error.message
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
      error: error.message
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
      practicesCount: userProgress.activePractices.length
    });
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
      error: error.message
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
    practicesCount: userProgress.activePractices.length
  });
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
      error: error.message
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
    totalScore
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
      practicesCount: userProgress.activePractices.length
    });
    saveUserProgress(userProgress);
    return userProgress;
  } catch (error) {
    logger.error("Error recalculating SDG scores", {
      component: "SustainabilityStore",
      error: error.message
    });
    return userProgress;
  }
};

// Reset all user data
export const resetUserProgress = () => {
  saveUserProgress(defaultUserProgress);
  return defaultUserProgress;
};
