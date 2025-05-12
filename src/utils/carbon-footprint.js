/**
 * Carbon footprint calculation utilities for Irish gardening
 * Estimates CO2e (carbon dioxide equivalent) savings from growing plants vs. buying them
 */

// Average CO2e emissions for store-bought produce by category (in kg CO2e per kg of produce)
// Based on research data for conventional agriculture and food transportation
const STORE_BOUGHT_EMISSIONS = {
  leafyGreens: 2.0, // Lettuce, spinach, kale, etc.
  rootVegetables: 0.4, // Potatoes, carrots, onions, etc.
  fruiting: 1.5, // Tomatoes, peppers, cucumbers, etc.
  legumes: 0.8, // Beans, peas, etc.
  berries: 2.5, // Strawberries, raspberries, etc.
  herbs: 1.2, // Basil, parsley, etc.
  brassicas: 0.6, // Cabbage, broccoli, etc.
  perennialFruit: 0.3, // Apples, pears (lower due to tree carbon sequestration)
  default: 1.0, // Default value if category unknown
};

// Mapping of common Irish garden plants to their categories
const PLANT_CATEGORIES = {
  // Vegetables
  potato: "rootVegetables",
  carrot: "rootVegetables",
  onion: "rootVegetables",
  leek: "rootVegetables",
  garlic: "rootVegetables",
  rhubarb: "perennialFruit",

  // Leafy greens
  lettuce: "leafyGreens",
  spinach: "leafyGreens",
  kale: "leafyGreens",
  cabbage: "brassicas",
  chard: "leafyGreens",

  // Fruiting vegetables
  tomato: "fruiting",
  pepper: "fruiting",
  courgette: "fruiting",
  cucumber: "fruiting",
  pumpkin: "fruiting",

  // Legumes
  pea: "legumes",
  bean: "legumes",
  broadBean: "legumes",

  // Berries
  strawberry: "berries",
  raspberry: "berries",
  blackberry: "berries",
  blueberry: "berries",

  // Herbs
  basil: "herbs",
  parsley: "herbs",
  mint: "herbs",
  thyme: "herbs",
  sage: "herbs",
  rosemary: "herbs",

  // Brassicas
  broccoli: "brassicas",
  cauliflower: "brassicas",
  brusselsSprouts: "brassicas",

  // Perennial fruits
  apple: "perennialFruit",
  pear: "perennialFruit",
  plum: "perennialFruit",
};

// Average water usage for store-bought vs. home-grown produce (liters per kg of produce)
const WATER_USAGE = {
  storeBought: {
    leafyGreens: 180,
    rootVegetables: 50,
    fruiting: 160,
    legumes: 200,
    berries: 220,
    herbs: 150,
    brassicas: 120,
    perennialFruit: 80,
    default: 130,
  },
  homeGrown: {
    leafyGreens: 80,
    rootVegetables: 30,
    fruiting: 100,
    legumes: 60,
    berries: 100,
    herbs: 35,
    brassicas: 70,
    perennialFruit: 50,
    default: 65,
  },
};

// Average expected yields per plant for common Irish garden plants (in kg)
const EXPECTED_YIELDS = {
  potato: 1.5, // per plant
  carrot: 0.15, // per plant
  onion: 0.2, // per plant
  leek: 0.3, // per plant
  garlic: 0.1, // per plant

  lettuce: 0.4, // per plant
  spinach: 0.3, // continuous harvest
  kale: 0.5, // continuous harvest
  cabbage: 1.2, // per plant

  tomato: 3.0, // per plant for season
  pepper: 1.0, // per plant for season
  courgette: 5.0, // per plant for season
  cucumber: 4.0, // per plant for season

  pea: 0.5, // per plant
  bean: 0.7, // per plant

  strawberry: 0.5, // per plant per season
  raspberry: 1.5, // per plant per season
  blackberry: 2.0, // per plant per season

  apple: 15, // per tree (mature)

  // Default yield for plants not specifically listed
  default: 0.5, // kg per plant/area
};

/**
 * Calculate carbon footprint savings for growing plants vs buying them
 * @param {string} plantName - Name of the plant or crop
 * @param {number} quantity - Quantity of plants or area
 * @param {boolean} isOrganic - Whether organic growing methods are used
 * @returns {object} - Carbon footprint metrics
 */
export function calculateCarbonSavings(
  plantName,
  quantity = 1,
  isOrganic = true
) {
  // Normalize plant name to match our dictionary
  const normalizedName = plantName.toLowerCase().replace(/\s+/g, "");

  // Get the plant's category
  const category = PLANT_CATEGORIES[normalizedName] || "default";

  // Get expected yield for this plant
  const yield_kg = EXPECTED_YIELDS[normalizedName] || EXPECTED_YIELDS.default;
  const totalYield = yield_kg * quantity;

  // Get carbon emissions for store-bought equivalent
  const storeBoughtEmissions =
    STORE_BOUGHT_EMISSIONS[category] || STORE_BOUGHT_EMISSIONS.default;

  // Home grown emissions are lower due to no transportation, packaging, refrigeration
  // Organic methods further reduce emissions (no synthetic fertilizers)
  let homeGrownEmissionFactor = 0.3; // 70% reduction compared to commercial
  if (isOrganic) {
    homeGrownEmissionFactor = 0.2; // 80% reduction for organic methods
  }

  const homeGrownEmissions = storeBoughtEmissions * homeGrownEmissionFactor;

  // Calculate carbon savings
  const carbonSavingsPerKg = storeBoughtEmissions - homeGrownEmissions;
  const totalCarbonSavings = carbonSavingsPerKg * totalYield;

  // Calculate water savings
  const storeWaterUsage =
    WATER_USAGE.storeBought[category] || WATER_USAGE.storeBought.default;
  const homeWaterUsage =
    WATER_USAGE.homeGrown[category] || WATER_USAGE.homeGrown.default;
  const waterSavingsPerKg = storeWaterUsage - homeWaterUsage;
  const totalWaterSaved = waterSavingsPerKg * totalYield;

  // Add organic bonus if applicable
  const organicBonus = isOrganic ? totalYield * 0.2 : 0; // Additional CO2e savings from organic practices

  // Special case for perennial plants that sequester carbon
  let carbonSequestered = 0;
  if (category === "perennialFruit") {
    carbonSequestered = quantity * 2; // Approximate kg CO2 sequestered per year by a fruit tree
  }

  // Calculate a sustainability score from 1-5
  let sustainabilityScore = 3; // Default medium score

  // Adjust based on plant type
  if (category === "perennialFruit") sustainabilityScore += 1;
  if (category === "leafyGreens") sustainabilityScore += 0.5;
  if (category === "rootVegetables") sustainabilityScore += 0.5;

  // Adjust for organic
  if (isOrganic) sustainabilityScore += 0.5;

  // Cap the score
  sustainabilityScore = Math.min(5, Math.max(1, sustainabilityScore));

  // Calculate biodiversity and pollinator support bonuses
  const biodiversityBonus = ["perennialFruit", "berries", "herbs"].includes(
    category
  )
    ? true
    : false;

  const pollinatorSupport = [
    "berries",
    "fruiting",
    "herbs",
    "perennialFruit",
  ].includes(category)
    ? true
    : false;

  return {
    plantName,
    category,
    quantity,
    totalYield,
    isOrganic,
    carbonSavingsPerKg,
    totalCarbonSavings,
    waterSaved: Math.round(totalWaterSaved),
    organicBonus: isOrganic ? organicBonus : 0,
    carbonSequestered,
    sustainabilityScore,
    totalEmissionsSaved: totalCarbonSavings + organicBonus + carbonSequestered,
    biodiversityBonus,
    pollinatorSupport,
    sdgContributions: calculateSDGContributions(category, isOrganic),
    // Create an array of active SDGs (those with contributions > 0)
    sdgs: Object.entries(calculateSDGContributions(category, isOrganic))
      .filter(([_, value]) => value > 0)
      .map(([key]) => key),
  };
}

/**
 * Calculate contributions to SDGs based on plant category and growing methods
 * @param {string} category - Plant category
 * @param {boolean} isOrganic - Whether organic methods are used
 * @returns {object} - SDG contributions
 */
function calculateSDGContributions(category, isOrganic) {
  const contributions = {
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
  };

  // All plants contribute to SDG2 (Zero Hunger)
  contributions.sdg2 = 10;

  // Good Health and Well-being (SDG3)
  if (
    ["leafyGreens", "berries", "herbs", "flowers", "perennialFruit"].includes(
      category
    )
  ) {
    contributions.sdg3 = 15; // These plants typically have higher health benefits
  } else {
    contributions.sdg3 = 10;
  }
  if (isOrganic) contributions.sdg3 += 5; // Organic growing provides higher health benefits

  // Quality Education (SDG4)
  contributions.sdg4 = 8; // All gardening contributes to learning
  if (
    ["herbs", "flowers", "uncommonVegetables", "perennialFruit"].includes(
      category
    )
  ) {
    contributions.sdg4 += 5; // These plants often require more knowledge and skill
  }

  // Water conservation (SDG6)
  if (["rootVegetables", "herbs", "leafyGreens"].includes(category)) {
    contributions.sdg6 = 15; // These plants typically use less water
  } else {
    contributions.sdg6 = 8;
  }

  // Affordable and Clean Energy (SDG7)
  if (isOrganic) {
    contributions.sdg7 = 12; // Organic growing uses less energy-intensive inputs
  } else {
    contributions.sdg7 = 5;
  }
  // Extra points for plants that require less energy (no heated greenhouse, etc.)
  if (["rootVegetables", "herbs", "berries"].includes(category)) {
    contributions.sdg7 += 5;
  }

  // Decent Work and Economic Growth (SDG8)
  contributions.sdg8 = 8; // Base value for economic benefit
  if (["perennialFruit", "berries"].includes(category)) {
    contributions.sdg8 += 7; // These can provide economic returns through surplus
  }

  // Industry, Innovation and Infrastructure (SDG9)
  contributions.sdg9 = 5; // Base value for innovation
  if (isOrganic) {
    contributions.sdg9 += 5; // Organic methods often involve innovative approaches
  }
  if (
    ["uncommonVegetables", "perennialFruit", "rarePlants"].includes(category)
  ) {
    contributions.sdg9 += 5; // These categories often involve more innovation
  }

  // Urban greening (SDG11)
  contributions.sdg11 = 12;

  // Responsible consumption (SDG12)
  contributions.sdg12 = 15;
  if (isOrganic) contributions.sdg12 += 5;

  // Climate action (SDG13)
  if (category === "perennialFruit") {
    contributions.sdg13 = 20; // Trees sequester carbon
  } else {
    contributions.sdg13 = 10;
  }
  if (isOrganic) contributions.sdg13 += 5;

  // Life Below Water (SDG14)
  if (isOrganic) {
    contributions.sdg14 = 10; // Organic methods reduce water pollution
  } else {
    contributions.sdg14 = 3;
  }
  // Plants that help filter water or reduce runoff
  if (["perennialFruit", "berries", "leafyGreens"].includes(category)) {
    contributions.sdg14 += 5;
  }

  // Life on land (SDG15)
  if (["perennialFruit", "berries", "herbs"].includes(category)) {
    contributions.sdg15 = 15; // Higher biodiversity value
  } else {
    contributions.sdg15 = 8;
  }
  if (isOrganic) contributions.sdg15 += 7;

  return contributions;
}

/**
 * Calculate overall sustainability metrics for a garden based on plant selection
 * @param {Array} plants - Array of plants with quantities and organic status
 * @returns {object} - Overall garden sustainability metrics
 */
export function calculateGardenSustainability(plants) {
  let totalCarbonSavings = 0;
  let totalWaterSaved = 0;
  let totalOrganicBonus = 0;
  let totalCarbonSequestered = 0;
  let biodiversityScore = 0;
  let pollinatorScore = 0;

  const sdgTotals = {
    sdg2: 0,
    sdg3: 0,
    sdg4: 0,
    sdg6: 0,
    sdg7: 0,
    sdg8: 0,
    sdg9: 0,
    sdg11: 0,
    sdg12: 0,
    sdg13: 0,
    sdg14: 0,
    sdg15: 0,
  };

  plants.forEach((plant) => {
    const metrics = calculateCarbonSavings(
      plant.name,
      plant.quantity || 1,
      plant.isOrganic !== undefined ? plant.isOrganic : true
    );

    totalCarbonSavings += metrics.totalCarbonSavings;
    totalWaterSaved += metrics.waterSaved;
    totalOrganicBonus += metrics.organicBonus;
    totalCarbonSequestered += metrics.carbonSequestered;

    // Update biodiversity and pollinator scores
    if (metrics.biodiversityBonus) biodiversityScore += 1;
    if (metrics.pollinatorSupport) pollinatorScore += 1;

    // Update SDG contributions
    Object.entries(metrics.sdgContributions).forEach(([sdg, value]) => {
      sdgTotals[sdg] += value;
    });
  });

  // Calculate overall sustainability score (1-5)
  const plantCount = plants.length;
  const biodiversityFactor = Math.min(
    1,
    biodiversityScore / (plantCount * 0.7)
  );
  const pollinatorFactor = Math.min(1, pollinatorScore / (plantCount * 0.5));

  let overallScore = 3; // Base score

  // Adjust for carbon savings and biodiversity
  overallScore += biodiversityFactor * 1;
  overallScore += pollinatorFactor * 0.5;

  // Adjust for organic percentage
  const organicCount = plants.filter((p) => p.isOrganic !== false).length;
  const organicPercentage = organicCount / plantCount;
  overallScore += organicPercentage * 0.5;

  // Cap score
  overallScore = Math.min(5, Math.max(1, Math.round(overallScore * 10) / 10));

  return {
    totalCarbonSavings,
    totalWaterSaved,
    totalOrganicBonus,
    totalCarbonSequestered,
    biodiversityScore,
    pollinatorScore,
    sustainabilityScore: overallScore,
    sdgContributions: sdgTotals,
  };
}
