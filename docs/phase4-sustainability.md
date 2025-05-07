# Phase 4: Sustainability Tracking System

This phase implements a sustainability tracking system that helps Irish gardeners monitor and improve their environmental impact. Users can record sustainable gardening practices, track resource usage, and see their progress over time.

## Implementation Steps

### 1. Create a Sustainability Metrics Database

First, create a database of sustainable gardening metrics and practices:

```javascript
// src/data/sustainability-metrics.js

/**
 * Database of sustainable gardening metrics and best practices
 * Tailored to Irish gardening conditions
 */

// Resource conservation categories with practices
export const sustainablePractices = {
  water: {
    name: 'Water Conservation',
    icon: 'droplet',
    description: 'Conserving water is particularly important during Irish dry spells which are becoming more common due to climate change.',
    practices: [
      {
        id: 'water-1',
        name: 'Rainwater Harvesting',
        description: 'Collecting rainwater for garden use. With Ireland\'s average rainfall of 1000+ mm annually, this can significantly reduce mains water usage.',
        impact: 'high',
        difficulty: 'medium',
        tips: 'Install water butts on downpipes from gutters. A typical Irish roof can collect about 85,000 liters of water annually.'
      },
      {
        id: 'water-2',
        name: 'Mulching',
        description: 'Applying organic mulch to retain soil moisture and reduce evaporation.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Apply a 5-7cm layer of mulch around plants but keep away from stems. Grass clippings, compost, and leaf mould work well in Irish gardens.'
      },
      {
        id: 'water-3',
        name: 'Drought-Tolerant Planting',
        description: 'Using plants that require minimal watering once established.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Native plants like Sea Holly, Red Valerian, and Wild Marjoram are adapted to Irish conditions and need less water.'
      },
      {
        id: 'water-4',
        name: 'Irrigation Efficiency',
        description: 'Using water-efficient irrigation methods like drip systems or soaker hoses.',
        impact: 'high',
        difficulty: 'medium',
        tips: 'Water plants at the base rather than overhead, and water in morning or evening to reduce evaporation.'
      }
    ]
  },
  soil: {
    name: 'Soil Health',
    icon: 'layers',
    description: 'Healthy soil is the foundation of sustainable gardening and increases carbon sequestration.',
    practices: [
      {
        id: 'soil-1',
        name: 'Composting',
        description: 'Creating and using compost from garden and kitchen waste.',
        impact: 'high',
        difficulty: 'easy',
        tips: 'A good compost mix for Irish conditions includes brown materials (cardboard, dried leaves) and green materials (grass clippings, vegetable scraps) in a ratio of 3:1.'
      },
      {
        id: 'soil-2',
        name: 'No-Dig Gardening',
        description: 'Avoiding digging or tilling to preserve soil structure and microorganisms.',
        impact: 'high',
        difficulty: 'easy',
        tips: 'Add compost to the top of beds rather than digging it in. Works particularly well with raised beds that are common in wetter Irish areas.'
      },
      {
        id: 'soil-3',
        name: 'Green Manures',
        description: 'Growing cover crops to improve soil quality when beds would otherwise be empty.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Phacelia, clover, and winter rye work well in Irish conditions and can be sown after summer crops are harvested.'
      },
      {
        id: 'soil-4',
        name: 'Reducing Peat Usage',
        description: 'Avoiding peat-based composts to help preserve Irish peatlands.',
        impact: 'high',
        difficulty: 'medium',
        tips: 'Use peat-free compost for potting. Make your own compost for garden beds using local materials.'
      }
    ]
  },
  biodiversity: {
    name: 'Biodiversity',
    icon: 'flower',
    description: 'Enhancing biodiversity supports wildlife and creates a balanced garden ecosystem.',
    practices: [
      {
        id: 'biodiversity-1',
        name: 'Native Plant Growing',
        description: 'Including Irish native plants in your garden to support local wildlife.',
        impact: 'high',
        difficulty: 'easy',
        tips: 'Irish natives like Hawthorn, Blackthorn, Wild Strawberry, and Primrose support pollinators and other wildlife.'
      },
      {
        id: 'biodiversity-2',
        name: 'Wildlife Habitats',
        description: 'Creating habitats like bug hotels, hedgehog houses, or bird boxes.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Use local materials to create shelters. Even a small pile of logs can provide habitat for insects and small animals.'
      },
      {
        id: 'biodiversity-3',
        name: 'Pollinator Support',
        description: 'Growing flowers that support bees, butterflies, and other pollinators.',
        impact: 'high',
        difficulty: 'easy',
        tips: 'Plant flowers that bloom from early spring to late autumn to provide continuous food sources. All-Ireland Pollinator Plan provides region-specific advice.'
      },
      {
        id: 'biodiversity-4',
        name: 'Chemical-Free Gardening',
        description: 'Avoiding artificial pesticides and herbicides to protect wildlife.',
        impact: 'high',
        difficulty: 'medium',
        tips: 'Use companion planting and physical barriers like netting for pest control. Encourage natural predators like ladybirds and birds.'
      }
    ]
  },
  resources: {
    name: 'Resource Conservation',
    icon: 'recycle',
    description: 'Reducing waste and conserving resources lowers your garden\'s environmental impact.',
    practices: [
      {
        id: 'resources-1',
        name: 'Seed Saving',
        description: 'Collecting and storing seeds from your plants for future growing seasons.',
        impact: 'medium',
        difficulty: 'medium',
        tips: 'Focus on open-pollinated varieties. Store seeds in paper envelopes in a cool, dry place. Irish climate requires proper drying before storage.'
      },
      {
        id: 'resources-2',
        name: 'Repurposing Materials',
        description: 'Using recycled or repurposed materials in the garden.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Old baths can become planters, pallets can be used for vertical gardens, and plastic bottles can be used as cloches in spring.'
      },
      {
        id: 'resources-3',
        name: 'Tool Maintenance',
        description: 'Properly maintaining and repairing tools rather than replacing them.',
        impact: 'low',
        difficulty: 'easy',
        tips: 'Clean tools after use and store them in a dry place to prevent rust, which is common in Ireland\'s damp climate. Sharpen blades annually.'
      },
      {
        id: 'resources-4',
        name: 'Local Material Sourcing',
        description: 'Sourcing materials locally to reduce transportation impacts.',
        impact: 'medium',
        difficulty: 'medium',
        tips: 'Use local stone, wood, and soil. Consider community sharing of resources like compost, mulch, or even tools.'
      }
    ]
  },
  carbon: {
    name: 'Carbon Footprint',
    icon: 'leaf',
    description: 'Reducing your garden\'s carbon footprint helps combat climate change.',
    practices: [
      {
        id: 'carbon-1',
        name: 'Tree Planting',
        description: 'Planting trees or shrubs to sequester carbon.',
        impact: 'high',
        difficulty: 'medium',
        tips: 'Native trees like Rowan, Hazel, and Holly work well in smaller Irish gardens. A single tree can absorb about 1 tonne of CO2 over its lifetime.'
      },
      {
        id: 'carbon-2',
        name: 'Reduced Lawn Mowing',
        description: 'Mowing less frequently to reduce emissions from petrol mowers.',
        impact: 'low',
        difficulty: 'easy',
        tips: 'Consider creating a wildflower meadow area or using a push mower for smaller lawns. Irish grasses often grow rapidly in our mild, wet climate.'
      },
      {
        id: 'carbon-3',
        name: 'Growing Food',
        description: 'Growing your own food to reduce food miles and packaging.',
        impact: 'medium',
        difficulty: 'medium',
        tips: 'Focus on crops that grow well in Ireland and have high yields like potatoes, kale, and berries. Extend seasons with simple protection.'
      },
      {
        id: 'carbon-4',
        name: 'Perennial Growing',
        description: 'Growing perennial vegetables and fruits that don\'t need replanting each year.',
        impact: 'medium',
        difficulty: 'easy',
        tips: 'Rhubarb, asparagus, and fruit bushes are well-suited to Irish gardens and provide harvests year after year with minimal input.'
      }
    ]
  }
};

// Get all practices as a flat array
export const getAllPractices = () => {
  const allPractices = [];
  
  Object.values(sustainablePractices).forEach(category => {
    category.practices.forEach(practice => {
      allPractices.push({
        ...practice,
        category: category.name
      });
    });
  });
  
  return allPractices;
};

// Get practices by impact level
export const getPracticesByImpact = (impactLevel) => {
  return getAllPractices().filter(practice => practice.impact === impactLevel);
};

// Get practice by ID
export const getPracticeById = (id) => {
  let foundPractice = null;
  
  Object.values(sustainablePractices).forEach(category => {
    const practice = category.practices.find(p => p.id === id);
    if (practice) {
      foundPractice = {
        ...practice,
        category: category.name
      };
    }
  });
  
  return foundPractice;
};
```

### 2. Create a User Progress Store

Create a simple store to track user progress:

```javascript
// src/utils/sustainability-store.js

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
```

### 3. Create a Sustainability Practice Card

Create a component to display individual sustainable practices:

```jsx
// src/components/sustainability/PracticeCard.jsx
import React, { useState } from 'react';
import { addSustainablePractice, removeSustainablePractice, getAllUserProgress } from '../../utils/sustainability-store';

const PracticeCard = ({ practice, isActive = false, onStatusChange }) => {
  const [active, setActive] = useState(isActive);
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to get impact badge color
  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
      default:
        return 'badge-ghost';
    }
  };

  // Helper function to get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'hard':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'easy':
        return 'badge-success';
      default:
        return 'badge-ghost';
    }
  };

  const handleToggleActive = () => {
    if (active) {
      removeSustainablePractice(practice.id);
    } else {
      addSustainablePractice(practice.id);
    }
    
    setActive(!active);
    
    if (onStatusChange) {
      onStatusChange(practice.id, !active);
    }
  };

  return (
    <div className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-l-4 ${active ? 'border-success' : 'border-base-300'}`}>
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-base flex items-center gap-2">
            {practice.name}
            {active && (
              <div className="badge badge-success badge-sm">Active</div>
            )}
          </h3>
          <div className="flex gap-1">
            <div className={`badge badge-sm ${getImpactColor(practice.impact)}`}>
              {practice.impact} impact
            </div>
            <div className={`badge badge-sm ${getDifficultyColor(practice.difficulty)}`}>
              {practice.difficulty}
            </div>
          </div>
        </div>
        
        <p className="text-sm my-2">{practice.description}</p>
        
        <div className="flex justify-between items-center mt-2">
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide tips' : 'Show tips'}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button 
            className={`btn btn-sm ${active ? 'btn-outline btn-error' : 'btn-success'}`}
            onClick={handleToggleActive}
          >
            {active ? 'Remove' : 'Add to my practices'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 bg-base-200 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Irish Gardening Tips:</h4>
            <p className="text-xs">{practice.tips}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCard;
```

### 4. Create a Sustainability Category Card

Create a component to display a category of sustainable practices:

```jsx
// src/components/sustainability/CategoryCard.jsx
import React, { useState } from 'react';
import PracticeCard from './PracticeCard';

const CategoryCard = ({ category, activePracticeIds = [], onPracticeStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const icon = category.icon || 'leaf';
  const iconMap = {
    leaf: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    droplet: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    layers: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    flower: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    recycle: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path