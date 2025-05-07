// Use localStorage to persist user data
const STORAGE_KEY = 'irish-garden-sustainability';

// Default user progress data
const defaultUserProgress = {
  activePractices: [],
  resourceUsage: {
    water: [],
    compost: [],
    harvest: []
  },
  milestones: [],
  score: 0
};

// Helper to get user data from localStorage
const getUserProgress = () => {
  if (typeof window === 'undefined') {
    return defaultUserProgress;
  }
  
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : defaultUserProgress;
};

// Helper to save user data to localStorage
const saveUserProgress = (data) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Add a sustainable practice to user's active practices
export const addSustainablePractice = (practiceId, implementationDate = new Date()) => {
  const userProgress = getUserProgress();
  
  // Check if practice is already active
  if (!userProgress.activePractices.some(p => p.id === practiceId)) {
    userProgress.activePractices.push({
      id: practiceId,
      implementedOn: implementationDate.toISOString(),
      notes: ''
    });
    
    // Update sustainability score
    userProgress.score += 10;
    
    saveUserProgress(userProgress);
  }
  
  return userProgress;
};

// Remove a practice from user's active practices
export const removeSustainablePractice = (practiceId) => {
  const userProgress = getUserProgress();
  
  userProgress.activePractices = userProgress.activePractices.filter(p => p.id !== practiceId);
  
  // Update sustainability score
  userProgress.score = Math.max(0, userProgress.score - 10);
  
  saveUserProgress(userProgress);
  return userProgress;
};

// Update notes for a practice
export const updatePracticeNotes = (practiceId, notes) => {
  const userProgress = getUserProgress();
  
  const practiceIndex = userProgress.activePractices.findIndex(p => p.id === practiceId);
  if (practiceIndex !== -1) {
    userProgress.activePractices[practiceIndex].notes = notes;
    saveUserProgress(userProgress);
  }
  
  return userProgress;
};

// Record resource usage (water, compost, harvest)
export const recordResourceUsage = (resourceType, amount, date = new Date()) => {
  const userProgress = getUserProgress();
  
  if (!userProgress.resourceUsage[resourceType]) {
    userProgress.resourceUsage[resourceType] = [];
  }
  
  userProgress.resourceUsage[resourceType].push({
    date: date.toISOString(),
    amount: amount
  });
  
  saveUserProgress(userProgress);
  return userProgress;
};

// Get all user progress data
export const getAllUserProgress = () => {
  return getUserProgress();
};

// Calculate sustainability score
export const calculateSustainabilityScore = () => {
  const userProgress = getUserProgress();
  return userProgress.score;
};

// Reset all user data
export const resetUserProgress = () => {
  saveUserProgress(defaultUserProgress);
  return defaultUserProgress;
};