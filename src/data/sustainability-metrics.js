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

// Carbon footprint data for common foods (kg CO2e per kg of food)
export const foodCarbonFootprint = {
  // Store-bought foods
  storeBought: {
    potatoes: 0.5,
    onions: 0.4,
    carrots: 0.5,
    kale: 0.4,
    cabbage: 0.5,
    apples: 0.6,
    strawberries: 1.1,
    tomatoes: 2.1, // Higher for store-bought as often grown in heated greenhouses in Ireland
    herbs: 1.0,
  },
  // Home-grown foods (significantly lower due to no transportation, packaging, etc.)
  homeGrown: {
    potatoes: 0.08,
    onions: 0.06,
    carrots: 0.07,
    kale: 0.05,
    cabbage: 0.05,
    apples: 0.1,
    strawberries: 0.15,
    tomatoes: 0.2, // Assumes some protection but no heating
    herbs: 0.01, // Extremely low impact when grown at home
  },
  // Average food miles for store-bought produce in Ireland (km)
  averageFoodMiles: {
    localFarmers: 50,
    domesticProduce: 200,
    europeanImports: 1500,
    globalImports: 10000,
    homeGrown: 0,
  },
  // Plastic packaging savings (g per kg of produce)
  packagingSaved: {
    averageVegetable: 25,
    leafyGreens: 40,
    fruits: 30,
    herbs: 15,
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
        sdgs: ["sdg6", "sdg13"],
        tips: "Native plants like Sea Holly, Red Valerian, and Wild Marjoram are adapted to Irish conditions and need less water.",
      },
      {
        id: "water-4",
        name: "Irrigation Efficiency",
        description:
          "Using water-efficient irrigation methods like drip systems or soaker hoses.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg6", "sdg12"],
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
        sdgs: ["sdg13", "sdg15", "sdg12"],
        tips: "A good compost mix for Irish conditions includes brown materials (cardboard, dried leaves) and green materials (grass clippings, vegetable scraps) in a ratio of 3:1.",
      },
      {
        id: "soil-2",
        name: "No-Dig Gardening",
        description:
          "Avoiding digging or tilling to preserve soil structure and microorganisms.",
        impact: "high",
        difficulty: "easy",
        sdgs: ["sdg13", "sdg15"],
        tips: "Add compost to the top of beds rather than digging it in. Works particularly well with raised beds that are common in wetter Irish areas.",
      },
      {
        id: "soil-3",
        name: "Green Manures",
        description:
          "Growing cover crops to improve soil quality when beds would otherwise be empty.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg13", "sdg15", "sdg12"],
        tips: "Phacelia, clover, and winter rye work well in Irish conditions and can be sown after summer crops are harvested.",
      },
      {
        id: "soil-4",
        name: "Reducing Peat Usage",
        description:
          "Avoiding peat-based composts to help preserve Irish peatlands.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg13", "sdg15"],
        tips: "Use peat-free compost for potting. Make your own compost for garden beds using local materials.",
      },
    ],
  },
  biodiversity: {
    name: "Biodiversity",
    icon: "flower",
    description:
      "Enhancing biodiversity supports wildlife and creates a balanced garden ecosystem.",
    sdgs: ["sdg15", "sdg11"],
    practices: [
      {
        id: "biodiversity-1",
        name: "Native Plant Growing",
        description:
          "Including Irish native plants in your garden to support local wildlife.",
        impact: "high",
        difficulty: "easy",
        sdgs: ["sdg15", "sdg11"],
        tips: "Irish natives like Hawthorn, Blackthorn, Wild Strawberry, and Primrose support pollinators and other wildlife.",
      },
      {
        id: "biodiversity-2",
        name: "Wildlife Habitats",
        description:
          "Creating habitats like bug hotels, hedgehog houses, or bird boxes.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg15", "sdg11"],
        tips: "Use local materials to create shelters. Even a small pile of logs can provide habitat for insects and small animals.",
      },
      {
        id: "biodiversity-3",
        name: "Pollinator Support",
        description:
          "Growing flowers that support bees, butterflies, and other pollinators.",
        impact: "high",
        difficulty: "easy",
        sdgs: ["sdg15", "sdg11", "sdg2"],
        tips: "Plant flowers that bloom from early spring to late autumn to provide continuous food sources. All-Ireland Pollinator Plan provides region-specific advice.",
      },
      {
        id: "biodiversity-4",
        name: "Chemical-Free Gardening",
        description:
          "Avoiding artificial pesticides and herbicides to protect wildlife.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg15", "sdg11", "sdg12"],
        tips: "Use companion planting and physical barriers like netting for pest control. Encourage natural predators like ladybirds and birds.",
      },
    ],
  },
  foodGrowing: {
    name: "Food Growing",
    icon: "seedling",
    description:
      "Growing your own food has significant environmental and health benefits while contributing to food security and resilience.",
    sdgs: ["sdg2", "sdg12", "sdg13", "sdg11"],
    practices: [
      {
        id: "food-1",
        name: "Vegetable Gardening",
        description:
          "Growing your own vegetables reduces food miles, eliminates packaging waste, and lets you use organic growing methods.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg2", "sdg12", "sdg13"],
        tips: "Start with easy crops like potatoes, kale, and onions that grow well in Irish conditions. Growing just 4m² of vegetables can save approximately 5kg of CO₂ emissions monthly.",
        impactStats: {
          carbonSaved: "1-2kg CO₂ per kg of produce compared to store-bought",
          packagingSaved: "25-40g plastic per kg of produce",
          waterSaved: "Up to 70% less water than commercial farming",
          pesticidesAvoided: "100% if using organic methods",
        },
        visualImpact: {
          carbonIcon: "🌍",
          carbonLevel: 4,
          waterIcon: "💧",
          waterLevel: 3,
          biodiversityIcon: "🦋",
          biodiversityLevel: 3,
        },
      },
      {
        id: "food-2",
        name: "Herb Growing",
        description:
          "Growing herbs provides fresh flavors with minimal space while having an extremely low environmental footprint.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg2", "sdg12"],
        tips: "Herbs like parsley, chives, and mint thrive in the Irish climate and can be grown in pots on a windowsill. Store-bought herbs often have high food miles and excessive packaging.",
        impactStats: {
          carbonSaved: "Up to 99% less carbon compared to store-bought herbs",
          packagingSaved:
            "Eliminates approximately 15g plastic per typical herb package",
          freshness: "Harvest as needed for maximum nutrition and flavor",
        },
        visualImpact: {
          carbonIcon: "🌍",
          carbonLevel: 5,
          waterIcon: "💧",
          waterLevel: 4,
          biodiversityIcon: "🦋",
          biodiversityLevel: 2,
        },
      },
      {
        id: "food-3",
        name: "Fruit Growing",
        description:
          "Growing fruit trees and bushes provides years of harvests with minimal maintenance while enhancing garden biodiversity.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg2", "sdg13", "sdg15"],
        tips: "Apple trees, blackcurrants, and strawberries are particularly suited to Irish gardens. A single mature apple tree can provide up to 100kg of fruit annually while sequestering carbon.",
        impactStats: {
          carbonSequestered: "15-20kg CO₂ annually per mature fruit tree",
          carbonSaved: "0.5-1kg CO₂ per kg of fruit compared to store-bought",
          biodiversityGain: "Supports pollinators and 10+ wildlife species",
          localResilience:
            "Increases local food security and reduces dependency",
        },
        visualImpact: {
          carbonIcon: "🌍",
          carbonLevel: 5,
          waterIcon: "💧",
          waterLevel: 3,
          biodiversityIcon: "🦋",
          biodiversityLevel: 5,
        },
      },
      {
        id: "food-4",
        name: "Seasonal Eating",
        description:
          "Aligning growing and eating patterns with natural seasons reduces energy needs for growing and storing food.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg12", "sdg13", "sdg2"],
        tips: "Plan your Irish garden around succession planting for year-round harvests. Winter vegetables like kale and leeks can provide fresh food during colder months.",
        impactStats: {
          energySaved:
            "Up to 90% less energy than importing out-of-season produce",
          nutritionalGain:
            "Freshly harvested seasonal produce contains up to 50% more nutrients",
          resilienceGain: "Reduces dependency on global supply chains",
        },
        visualImpact: {
          carbonIcon: "🌍",
          carbonLevel: 4,
          waterIcon: "💧",
          waterLevel: 4,
          biodiversityIcon: "🦋",
          biodiversityLevel: 3,
        },
      },
      {
        id: "food-5",
        name: "Seed-to-Table Tracking",
        description:
          "Recording the complete journey of your food from planting to harvest and consumption.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg12", "sdg2"],
        tips: "Keep a simple garden journal tracking planting dates, harvests, and meals made. This creates awareness of the full food cycle and helps improve future growing.",
        impactStats: {
          awarenessGain: "Increases appreciation for food production by 78%",
          wasteReduction: "Typically reduces food waste by 25-30%",
          skillBuilding: "Develops self-reliance and food production knowledge",
        },
        visualImpact: {
          carbonIcon: "🌍",
          carbonLevel: 3,
          waterIcon: "💧",
          waterLevel: 3,
          biodiversityIcon: "🦋",
          biodiversityLevel: 2,
        },
      },
    ],
  },
  resources: {
    name: "Resource Conservation",
    icon: "recycle",
    description:
      "Reducing waste and conserving resources lowers your garden's environmental impact.",
    sdgs: ["sdg12", "sdg11"],
    practices: [
      {
        id: "resources-1",
        name: "Seed Saving",
        description:
          "Collecting and storing seeds from your plants for future growing seasons.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg12", "sdg11", "sdg2"],
        tips: "Focus on open-pollinated varieties. Store seeds in paper envelopes in a cool, dry place. Irish climate requires proper drying before storage.",
      },
      {
        id: "resources-2",
        name: "Repurposing Materials",
        description: "Using recycled or repurposed materials in the garden.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg12", "sdg11"],
        tips: "Old baths can become planters, pallets can be used for vertical gardens, and plastic bottles can be used as cloches in spring.",
      },
      {
        id: "resources-3",
        name: "Tool Maintenance",
        description:
          "Properly maintaining and repairing tools rather than replacing them.",
        impact: "low",
        difficulty: "easy",
        sdgs: ["sdg12"],
        tips: "Clean tools after use and store them in a dry place to prevent rust, which is common in Ireland's damp climate. Sharpen blades annually.",
      },
      {
        id: "resources-4",
        name: "Local Material Sourcing",
        description:
          "Sourcing materials locally to reduce transportation impacts.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg12", "sdg11", "sdg13"],
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
        sdgs: ["sdg13", "sdg15"],
        tips: "Native trees like Rowan, Hazel, and Holly work well in smaller Irish gardens. A single tree can absorb about 1 tonne of CO2 over its lifetime.",
      },
      {
        id: "carbon-2",
        name: "Reduced Lawn Mowing",
        description:
          "Mowing less frequently to reduce emissions from petrol mowers.",
        impact: "low",
        difficulty: "easy",
        sdgs: ["sdg13", "sdg15"],
        tips: "Consider creating a wildflower meadow area or using a push mower for smaller lawns. Irish grasses often grow rapidly in our mild, wet climate.",
      },
      {
        id: "carbon-3",
        name: "Growing Food",
        description:
          "Growing your own food to reduce food miles and packaging.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg2", "sdg12", "sdg13"],
        tips: "Focus on crops that grow well in Ireland and have high yields like potatoes, kale, and berries. Extend seasons with simple protection.",
      },
      {
        id: "carbon-4",
        name: "Perennial Growing",
        description:
          "Growing perennial vegetables and fruits that don't need replanting each year.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg2", "sdg12", "sdg13"],
        tips: "Rhubarb, asparagus, and fruit bushes are well-suited to Irish gardens and provide harvests year after year with minimal input.",
      },
    ],
  },
};

// Calculate food growing impact based on user input
export const calculateFoodGrowingImpact = (
  crop,
  amount,
  method = "homeGrown"
) => {
  // Default values if crop not in database
  const storeBoughtCarbon = foodCarbonFootprint.storeBought[crop] || 0.5;
  const homeGrownCarbon = foodCarbonFootprint.homeGrown[crop] || 0.08;

  // Calculate the difference in carbon footprint
  const carbonSaved = (storeBoughtCarbon - homeGrownCarbon) * amount;

  // Estimate packaging saved (in grams)
  let packagingType = "averageVegetable";
  if (["kale", "cabbage"].includes(crop)) packagingType = "leafyGreens";
  if (["apples", "strawberries"].includes(crop)) packagingType = "fruits";
  if (["basil", "parsley", "mint", "thyme"].includes(crop))
    packagingType = "herbs";

  const packagingSaved =
    foodCarbonFootprint.packagingSaved[packagingType] * amount;

  // Food miles saved
  const foodMilesSaved = foodCarbonFootprint.averageFoodMiles.domesticProduce;

  return {
    crop,
    amount,
    carbonSaved,
    packagingSaved,
    foodMilesSaved,
    waterSaved: amount * 20, // Rough estimate: 20L water saved per kg
    transportEmissionsSaved: ((foodMilesSaved * 0.1) / 1000) * amount, // Rough estimate of transport emissions
  };
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

// New helper functions for food impact visualization

// Get food carbon savings by crop type
export const getFoodCarbonSavings = (cropType, quantity = 1) => {
  const storeBought = foodCarbonFootprint.storeBought[cropType] || 0.5;
  const homeGrown = foodCarbonFootprint.homeGrown[cropType] || 0.08;
  return (storeBought - homeGrown) * quantity;
};

// Calculate annual impact based on garden size
export const calculateAnnualGardenImpact = (areaInSquareMeters = 10) => {
  // Average Irish yield per square meter
  const yieldPerSquareMeter = 4; // kg per square meter per year (conservative estimate)
  const totalYield = areaInSquareMeters * yieldPerSquareMeter;

  // Conservative estimates of impact
  return {
    totalYield: totalYield, // kg of produce
    carbonSaved: totalYield * 0.4, // kg CO2 saved (conservative average)
    packagingSaved: totalYield * 0.03, // kg of packaging saved
    waterSaved: totalYield * 20, // liters of water saved
    moneyValue: totalYield * 5, // Euro value (approximately €5 per kg average)
    mealCount: Math.round(totalYield / 0.25), // Approx number of meal portions
    foodMilesSaved:
      totalYield * foodCarbonFootprint.averageFoodMiles.domesticProduce,
  };
};
