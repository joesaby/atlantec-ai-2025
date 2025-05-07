// We'll use a simple in-memory store for MVP testing
// Later this will be replaced with Astro DB or SQLite

class InMemoryDatabase {
  constructor() {
    this.plants = [];
    this.gardens = [];
    this.tips = [];
    this.nextId = {
      plants: 1,
      gardens: 1,
      tips: 1,
    };
  }

  // Plants
  addPlant(plant) {
    const newPlant = {
      id: this.nextId.plants++,
      ...plant,
    };
    this.plants.push(newPlant);
    return newPlant;
  }

  getPlants() {
    return [...this.plants];
  }

  getPlantById(id) {
    return this.plants.find((p) => p.id === id);
  }

  // Gardens
  addGarden(garden) {
    const newGarden = {
      id: this.nextId.gardens++,
      ...garden,
    };
    this.gardens.push(newGarden);
    return newGarden;
  }

  getGardens() {
    return [...this.gardens];
  }

  getGardenById(id) {
    return this.gardens.find((g) => g.id === id);
  }

  // Tips
  addTip(tip) {
    const newTip = {
      id: this.nextId.tips++,
      ...tip,
    };
    this.tips.push(newTip);
    return newTip;
  }

  getTips() {
    return [...this.tips];
  }

  getTipsByMonth(month) {
    return this.tips.filter((t) => t.month === month);
  }
}

export const db = new InMemoryDatabase();

// Add some initial data
export function seedDatabase() {
  // Add some plants
  db.addPlant({
    commonName: "Potato",
    latinName: "Solanum tuberosum",
    description: "A staple crop in Ireland, well-suited to the local climate.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Well-drained loam",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Summer to Autumn",
    imageUrl: "https://example.com/images/potato.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 2,
  });

  db.addPlant({
    commonName: "Cabbage",
    latinName: "Brassica oleracea var. capitata",
    description: "Thrives in cool Irish conditions with good moisture.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Fertile, well-drained",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Year-round depending on variety",
    imageUrl: "https://example.com/images/cabbage.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 2,
  });

  db.addPlant({
    commonName: "Irish Wildflower Mix",
    latinName: "Various",
    description:
      "A mixture of native Irish wildflowers to support pollinators.",
    waterNeeds: "Low",
    sunNeeds: "Full Sun to Partial Shade",
    soilPreference: "Various",
    nativeToIreland: true,
    isPerennial: true,
    floweringSeason: "Spring to Autumn",
    imageUrl: "https://example.com/images/wildflowers.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 5,
    biodiversityValue: 5,
  });

  // Add seasonal tips
  const currentMonth = new Date().getMonth() + 1; // 1-12

  db.addTip({
    month: currentMonth,
    title: "Prepare Your Soil",
    description:
      "Now is a good time to prepare beds for planting. Add compost to enrich the soil.",
    priority: 1,
  });

  db.addTip({
    month: currentMonth,
    title: "Plant Weather-Appropriate Crops",
    description:
      "Select crops suited to current weather conditions and your soil type.",
    priority: 2,
  });

  db.addTip({
    month: currentMonth,
    title: "Set Up Rainwater Collection",
    description:
      "With Ireland's rainfall, now is a good time to set up water collection systems.",
    priority: 3,
  });

  return db;
}
