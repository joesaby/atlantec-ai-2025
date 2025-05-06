import { graphDb } from "./knowledge-graph.js";

// Sample data for our knowledge graph
const irishPlantsData = [
  {
    id: "cabbage",
    name: "Cabbage",
    latinName: "Brassica oleracea var. capitata",
    description: "Hardy vegetable that grows well in cool Irish conditions",
    waterNeeds: "Medium",
    imageUrl: "/images/plants/cabbage.jpg",
    nativeToIreland: false,
    sustainabilityRating: 4,
    suitableSoils: ["brown-earth", "loam"],
    sunNeeds: "full-sun",
    growingSeasons: ["spring", "autumn"],
    companionPlants: ["thyme", "mint"],
  },
  {
    id: "potato",
    name: "Potato",
    latinName: "Solanum tuberosum",
    description: "Staple Irish crop that grows well in most soil types",
    waterNeeds: "Medium",
    imageUrl: "/images/plants/potato.jpg",
    nativeToIreland: false,
    sustainabilityRating: 4,
    suitableSoils: ["brown-earth", "peat"],
    sunNeeds: "full-sun",
    growingSeasons: ["spring"],
    companionPlants: ["horseradish", "marigold"],
  },
  {
    id: "hawthorn",
    name: "Hawthorn",
    latinName: "Crataegus monogyna",
    description: "Native Irish tree with white flowers and red berries",
    waterNeeds: "Low",
    imageUrl: "/images/plants/hawthorn.jpg",
    nativeToIreland: true,
    sustainabilityRating: 5,
    suitableSoils: ["brown-earth", "grey-brown-podzolic"],
    sunNeeds: "partial-shade",
    growingSeasons: ["spring"],
    companionPlants: [],
  },
  {
    id: "kale",
    name: "Kale",
    latinName: "Brassica oleracea var. sabellica",
    description: "Hardy leafy green that withstands cold Irish winters",
    waterNeeds: "Medium",
    imageUrl: "/images/plants/kale.jpg",
    nativeToIreland: false,
    sustainabilityRating: 5,
    suitableSoils: ["brown-earth", "loam"],
    sunNeeds: "full-sun",
    growingSeasons: ["autumn", "winter"],
    companionPlants: ["onion", "beetroot"],
  },
];

const soilTypesData = [
  {
    id: "brown-earth",
    name: "Brown Earth",
    description: "Fertile soils common in the Midlands region",
    ph: "6.0-7.0",
    texture: "Loamy",
    nutrients: "High",
    drainage: "Good",
  },
  {
    id: "grey-brown-podzolic",
    name: "Grey-Brown Podzolic",
    description: "Good agricultural soils in east and south",
    ph: "5.5-6.5",
    texture: "Clay loam",
    nutrients: "Medium",
    drainage: "Moderate",
  },
  {
    id: "peat",
    name: "Peat",
    description: "Acidic, organic-rich soils common in boglands",
    ph: "4.0-5.5",
    texture: "Organic",
    nutrients: "Low",
    drainage: "Poor",
  },
  {
    id: "loam",
    name: "Loam",
    description: "Ideal garden soil with balanced properties",
    ph: "6.0-7.0",
    texture: "Loamy",
    nutrients: "High",
    drainage: "Excellent",
  },
];

const seasonsData = [
  {
    id: "spring",
    name: "Spring",
    months: ["March", "April", "May"],
    temperatures: { min: 5, max: 15 },
    rainfall: "Moderate",
  },
  {
    id: "summer",
    name: "Summer",
    months: ["June", "July", "August"],
    temperatures: { min: 10, max: 20 },
    rainfall: "Low",
  },
  {
    id: "autumn",
    name: "Autumn",
    months: ["September", "October", "November"],
    temperatures: { min: 5, max: 15 },
    rainfall: "High",
  },
  {
    id: "winter",
    name: "Winter",
    months: ["December", "January", "February"],
    temperatures: { min: 0, max: 10 },
    rainfall: "High",
  },
];

export async function seedKnowledgeGraph() {
  console.log("Seeding knowledge graph...");

  // Add basic nodes

  // Add seasons
  seasonsData.forEach((season) => {
    graphDb.addNode(season.id, "Season", {
      name: season.name,
      months: season.months,
      temperatures: season.temperatures,
      rainfall: season.rainfall,
    });
  });

  // Add soil types
  soilTypesData.forEach((soil) => {
    graphDb.addNode(soil.id, "SoilType", {
      name: soil.name,
      description: soil.description,
      ph: soil.ph,
      texture: soil.texture,
      nutrients: soil.nutrients,
      drainage: soil.drainage,
    });
  });

  // Add sun exposure types
  const sunExposures = [
    { id: "full-sun", name: "Full Sun", hoursOfSun: "6+ hours" },
    { id: "partial-shade", name: "Partial Shade", hoursOfSun: "3-6 hours" },
    { id: "full-shade", name: "Full Shade", hoursOfSun: "Less than 3 hours" },
  ];

  sunExposures.forEach((sun) => {
    graphDb.addNode(sun.id, "SunExposure", sun);
  });

  // Add plants and their relationships
  irishPlantsData.forEach((plant) => {
    // Add plant node
    graphDb.addNode(plant.id, "Plant", {
      name: plant.name,
      latinName: plant.latinName,
      description: plant.description,
      waterNeeds: plant.waterNeeds,
      imageUrl: plant.imageUrl,
      nativeToIreland: plant.nativeToIreland,
      sustainabilityRating: plant.sustainabilityRating,
    });

    // Add soil relationships
    plant.suitableSoils.forEach((soilId) => {
      graphDb.addEdge(plant.id, soilId, "THRIVES_IN");
    });

    // Add sun exposure relationship
    graphDb.addEdge(plant.id, plant.sunNeeds, "NEEDS");

    // Add growing season relationships
    plant.growingSeasons.forEach((seasonId) => {
      graphDb.addEdge(plant.id, seasonId, "GROWS_BEST_IN");
    });

    // Add companion planting relationships
    plant.companionPlants?.forEach((companionId) => {
      graphDb.addEdge(plant.id, companionId, "GROWS_WELL_WITH");
    });
  });

  console.log("Knowledge graph seeding complete");
}
