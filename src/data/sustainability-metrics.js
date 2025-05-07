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