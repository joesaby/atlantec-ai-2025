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
  sdg3: {
    id: "sdg3",
    number: 3,
    name: "Good Health and Well-being",
    description: "Gardening promotes physical and mental well-being",
    icon: "❤️",
    color: "#4c9f38",
  },
  sdg4: {
    id: "sdg4",
    number: 4,
    name: "Quality Education",
    description: "Gardens provide learning opportunities and skill development",
    icon: "📚",
    color: "#c5192d",
  },
  sdg6: {
    id: "sdg6",
    number: 6,
    name: "Clean Water and Sanitation",
    description: "Water conservation practices protect this precious resource",
    icon: "💧",
    color: "#26bde2",
  },
  sdg7: {
    id: "sdg7",
    number: 7,
    name: "Affordable and Clean Energy",
    description: "Sustainable gardening reduces energy consumption",
    icon: "⚡",
    color: "#fcc30b",
  },
  sdg8: {
    id: "sdg8",
    number: 8,
    name: "Decent Work and Economic Growth",
    description: "Local food production creates economic opportunities",
    icon: "💼",
    color: "#a21942",
  },
  sdg9: {
    id: "sdg9",
    number: 9,
    name: "Industry, Innovation and Infrastructure",
    description: "Sustainable gardening promotes innovative techniques",
    icon: "🔧",
    color: "#fd6925",
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
  sdg14: {
    id: "sdg14",
    number: 14,
    name: "Life Below Water",
    description: "Gardening practices that protect water ecosystems",
    icon: "🌊",
    color: "#0a97d9",
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
  health: {
    name: "Health and Well-being",
    icon: "heart",
    description:
      "Gardening promotes physical exercise, mental well-being, and provides nutritious food.",
    sdgs: ["sdg3", "sdg2"],
    practices: [
      {
        id: "health-1",
        name: "Therapeutic Gardening",
        description:
          "Creating a garden space dedicated to mental well-being and relaxation.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg3"],
        tips: "Include fragrant herbs like lavender and rosemary, which thrive in Irish gardens and have calming properties. Add seating where you can relax and enjoy the garden sensory experience.",
      },
      {
        id: "health-2",
        name: "Nutritional Planning",
        description:
          "Growing a diversity of nutrient-rich vegetables and fruits for a balanced diet.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg2", "sdg3"],
        tips: "Focus on nutrient-dense crops like kale, berries, and herbs that grow well in Ireland's climate and provide essential vitamins and minerals.",
      },
      {
        id: "health-3",
        name: "Physical Activity Tracking",
        description:
          "Monitoring the physical benefits of gardening activities as exercise.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg3"],
        tips: "Just 30 minutes of moderate gardening activities burns approximately 125-200 calories. Track different activities from digging (high intensity) to planting (moderate).",
      },
      {
        id: "health-4",
        name: "Culinary Herb Garden",
        description:
          "Growing herbs for cooking that enhance flavor while reducing salt and using medicinal properties.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg3", "sdg12"],
        tips: "Herbs like parsley, mint, and thyme are easy to grow in Ireland's climate and can be used fresh or dried for year-round use.",
      },
    ],
  },
  education: {
    name: "Garden Education",
    icon: "book-open",
    description:
      "Gardens provide tremendous learning opportunities for all ages.",
    sdgs: ["sdg4", "sdg12"],
    practices: [
      {
        id: "education-1",
        name: "Garden Journaling",
        description:
          "Keeping detailed records of garden activities, observations and learnings.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg4"],
        tips: "Document planting dates, weather conditions, successes and failures. Include photographs to track plant development across Ireland's growing season.",
      },
      {
        id: "education-2",
        name: "Plant Identification",
        description:
          "Learning to identify common plants, weeds, and beneficial insects in your garden.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg4", "sdg15"],
        tips: "Start with common Irish native plants and gradually expand your knowledge. Use plant identification apps to help with learning.",
      },
      {
        id: "education-3",
        name: "Garden Sharing",
        description:
          "Sharing garden knowledge and skills with family, friends, or community.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg4", "sdg11"],
        tips: "Organize garden visits, create a blog, or participate in local garden clubs to exchange knowledge about successful techniques for Irish growing conditions.",
      },
      {
        id: "education-4",
        name: "Experimental Plots",
        description:
          "Dedicating a small area to experiment with new plants or techniques.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg4", "sdg9"],
        tips: "Start small with controlled experiments, like comparing different mulching materials or trialing unusual vegetable varieties suited to Irish conditions.",
      },
    ],
  },
  energy: {
    name: "Clean Energy",
    icon: "sun",
    description:
      "Implementing energy-efficient and renewable energy practices in gardening.",
    sdgs: ["sdg7", "sdg13"],
    practices: [
      {
        id: "energy-1",
        name: "Manual Tools",
        description:
          "Using hand tools instead of power equipment whenever possible.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg7", "sdg13"],
        tips: "Quality hand tools are often more practical in small Irish gardens and eliminate fossil fuel use. Proper maintenance keeps them efficient.",
      },
      {
        id: "energy-2",
        name: "Solar Garden Lighting",
        description:
          "Installing solar-powered lighting for garden illumination.",
        impact: "low",
        difficulty: "easy",
        sdgs: ["sdg7", "sdg13"],
        tips: "Position solar lights to maximize exposure during daylight hours, even in Ireland's cloudier conditions. Modern solar lights work well even with indirect light.",
      },
      {
        id: "energy-3",
        name: "Passive Solar Structures",
        description:
          "Designing garden structures to capture and store solar energy.",
        impact: "medium",
        difficulty: "high",
        sdgs: ["sdg7", "sdg9", "sdg13"],
        tips: "Coldframes, cloches, and small polytunnels oriented south maximize limited Irish sunshine. Using thermal mass (water barrels, stones) stores heat for overnight release.",
      },
      {
        id: "energy-4",
        name: "Natural Windbreaks",
        description:
          "Planting hedges and trees to reduce energy needs by blocking wind.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg7", "sdg13", "sdg15"],
        tips: "Dense evergreen hedges on the windward side (often west in Ireland) can reduce heat loss from structures by up to 30% and protect tender plants.",
      },
    ],
  },
  economic: {
    name: "Garden Economy",
    icon: "euro-sign",
    description:
      "Using gardening to create economic benefits and opportunities.",
    sdgs: ["sdg8", "sdg12"],
    practices: [
      {
        id: "economic-1",
        name: "Seed and Plant Sharing",
        description:
          "Creating networks for exchanging seeds, cuttings, and divided plants.",
        impact: "medium",
        difficulty: "easy",
        sdgs: ["sdg8", "sdg11", "sdg12"],
        tips: "Organize community seed swaps or join online groups specific to Irish growing conditions to exchange locally-adapted varieties.",
      },
      {
        id: "economic-2",
        name: "Food Preservation",
        description:
          "Preserving garden harvests for year-round use and added value.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg2", "sdg8", "sdg12"],
        tips: "Traditional methods like freezing berries, making jams, and storing root vegetables work well for preserving Irish garden produce through winter months.",
      },
      {
        id: "economic-3",
        name: "Micro-Enterprise",
        description:
          "Developing small garden-based businesses from surplus harvest.",
        impact: "high",
        difficulty: "high",
        sdgs: ["sdg8", "sdg12"],
        tips: "Start with high-value crops like herbs, cut flowers, or unusual vegetable varieties. Research local regulations for selling home-grown produce in Ireland.",
      },
      {
        id: "economic-4",
        name: "Garden Tool Library",
        description: "Creating or joining a community tool-sharing initiative.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg8", "sdg11", "sdg12"],
        tips: "Coordinate with neighbors or local groups to share expensive or occasionally-used tools like shredders, pressure washers, or specialized pruners.",
      },
    ],
  },
  innovation: {
    name: "Garden Innovation",
    icon: "lightbulb",
    description:
      "Implementing innovative gardening techniques and technologies.",
    sdgs: ["sdg9", "sdg11"],
    practices: [
      {
        id: "innovation-1",
        name: "Smart Garden Systems",
        description:
          "Implementing simple technology to optimize garden management.",
        impact: "medium",
        difficulty: "high",
        sdgs: ["sdg9", "sdg6", "sdg12"],
        tips: "Try moisture sensors or simple timers for irrigation to adapt to Ireland's variable rainfall patterns. Start simple and expand as needed.",
      },
      {
        id: "innovation-2",
        name: "Vertical Growing Systems",
        description:
          "Using vertical space to increase growing capacity in small areas.",
        impact: "medium",
        difficulty: "medium",
        sdgs: ["sdg9", "sdg11", "sdg2"],
        tips: "Living walls, trellises, and stackable containers work well for herbs, greens, and strawberries even in limited Irish urban gardens.",
      },
      {
        id: "innovation-3",
        name: "Hydroponics/Aquaponics",
        description:
          "Growing plants using nutrient-rich water rather than soil.",
        impact: "high",
        difficulty: "high",
        sdgs: ["sdg9", "sdg6", "sdg2"],
        tips: "Small-scale systems can be effective indoors or in protected structures, extending Ireland's growing season. Start with simple passive systems before investing in pumps or more complex setups.",
      },
      {
        id: "innovation-4",
        name: "Biochar Production",
        description:
          "Making and using biochar to sequester carbon and improve soil.",
        impact: "high",
        difficulty: "high",
        sdgs: ["sdg9", "sdg13", "sdg15"],
        tips: "Small-scale methods using garden waste can be done safely with proper research. Biochar works well in Ireland's often acidic soils when properly activated with compost.",
      },
    ],
  },
  waterProtection: {
    name: "Water Protection",
    icon: "droplet",
    description:
      "Gardening practices that protect water quality and aquatic ecosystems.",
    sdgs: ["sdg14", "sdg6"],
    practices: [
      {
        id: "water-protection-1",
        name: "Rain Gardens",
        description:
          "Creating planted depressions that absorb and filter rainwater runoff.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg14", "sdg6", "sdg11"],
        tips: "Especially valuable in Irish urban areas with heavy rainfall. Use native moisture-loving plants that can handle both wet and dry conditions.",
      },
      {
        id: "water-protection-2",
        name: "Permeable Surfaces",
        description:
          "Using permeable materials for paths and patios to allow water infiltration.",
        impact: "high",
        difficulty: "high",
        sdgs: ["sdg14", "sdg6", "sdg11"],
        tips: "Gravel, permeable paving, or spaced stepping stones work well in Ireland's wet climate and reduce waterway pollution from surface runoff.",
      },
      {
        id: "water-protection-3",
        name: "Buffer Zones",
        description:
          "Creating vegetated areas around water features to filter runoff.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg14", "sdg15", "sdg6"],
        tips: "If your garden borders any water feature, leave at least 2 meters of densely planted native vegetation to capture pollutants before they reach the water.",
      },
      {
        id: "water-protection-4",
        name: "Chemical-Free Maintenance",
        description:
          "Eliminating synthetic fertilizers and pesticides to prevent water pollution.",
        impact: "high",
        difficulty: "medium",
        sdgs: ["sdg14", "sdg6", "sdg3"],
        tips: "Use compost tea, seaweed extract, and other natural alternatives suitable for Irish growing conditions instead of synthetic products that can leach into waterways.",
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

  // Calculate SDG impacts based on crop type and amount
  const sdgImpacts = {
    sdg2: 10 * amount, // Food security (Zero Hunger)
    sdg3: 5 * amount, // Health benefits (Good Health and Well-being)
    sdg4: 2 * amount, // Learning opportunity (Quality Education)
    sdg6: 8 * amount, // Water conservation (Clean Water)
    sdg7: 4 * amount, // Energy savings (Affordable and Clean Energy)
    sdg8: 3 * amount, // Economic value (Decent Work and Economic Growth)
    sdg9: 2 * amount, // Innovation potential (Industry, Innovation and Infrastructure)
    sdg11: 5 * amount, // Community impact (Sustainable Cities)
    sdg12: 10 * amount, // Responsible consumption
    sdg13: 8 * amount, // Climate action
    sdg14: 3 * amount, // Water ecosystem protection (Life Below Water)
    sdg15: 5 * amount, // Biodiversity (Life on Land)
  };

  // Adjust impacts based on crop type
  if (["kale", "cabbage", "spinach", "lettuce"].includes(crop)) {
    sdgImpacts.sdg3 += 5 * amount; // Leafy greens are especially nutritious (SDG3)
  }

  if (["apples", "strawberries", "berries"].includes(crop)) {
    sdgImpacts.sdg15 += 5 * amount; // Fruit supports pollinators (SDG15)
    sdgImpacts.sdg3 += 3 * amount; // Fruits provide additional health benefits
  }

  if (["herbs", "basil", "parsley", "mint", "thyme"].includes(crop)) {
    sdgImpacts.sdg3 += 4 * amount; // Herbs have medicinal properties
    sdgImpacts.sdg9 += 3 * amount; // Herbs represent culinary innovation
  }

  if (["potatoes", "onions", "carrots"].includes(crop)) {
    sdgImpacts.sdg2 += 5 * amount; // Root vegetables provide significant food security
    sdgImpacts.sdg8 += 3 * amount; // Economic staples
  }

  return {
    crop,
    amount,
    carbonSaved,
    packagingSaved,
    foodMilesSaved,
    waterSaved: amount * 20, // Rough estimate: 20L water saved per kg
    transportEmissionsSaved: ((foodMilesSaved * 0.1) / 1000) * amount, // Rough estimate of transport emissions
    sdgImpacts, // Include SDG impacts in the return object
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

  // Calculate SDG impacts based on garden area and yield
  const sdgImpacts = {
    sdg2: totalYield * 2.5, // Food security (Zero Hunger)
    sdg3: totalYield * 2.0, // Health benefits (Good Health and Well-being)
    sdg4: areaInSquareMeters * 1.0, // Learning opportunity (Quality Education)
    sdg6: totalYield * 2.0, // Water conservation (Clean Water)
    sdg7: totalYield * 1.0, // Energy savings (Affordable and Clean Energy)
    sdg8: totalYield * 0.75, // Economic value (Decent Work and Economic Growth)
    sdg9: areaInSquareMeters * 0.5, // Innovation potential (Industry, Innovation and Infrastructure)
    sdg11: areaInSquareMeters * 1.25, // Community impact (Sustainable Cities)
    sdg12: totalYield * 2.5, // Responsible consumption
    sdg13: totalYield * 2.0, // Climate action
    sdg14: totalYield * 0.75, // Water ecosystem protection (Life Below Water)
    sdg15: areaInSquareMeters * 1.5, // Biodiversity (Life on Land)
  };

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
    sdgImpacts, // Include SDG impacts in the return object
  };
};
