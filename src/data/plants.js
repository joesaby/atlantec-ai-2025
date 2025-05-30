/**
 * Database of plants suitable for Irish gardens
 * Including information about growing conditions and sustainability
 */
export const plants = [
  {
    id: 1,
    commonName: "Potato",
    latinName: "Solanum tuberosum",
    description: "A staple crop in Ireland, well-suited to the local climate.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Well-drained loam",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Summer to Autumn",
    imageUrl: "/images/plants/potato.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 2,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "peat",
      "acid-brown-earth",
    ],
  },
  {
    id: 2,
    commonName: "Cabbage",
    latinName: "Brassica oleracea var. capitata",
    description: "Thrives in cool Irish conditions with good moisture.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Fertile, well-drained",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Year-round depending on variety",
    imageUrl: "/images/plants/cabbage.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 2,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic", "gley"],
  },
  {
    id: 3,
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
    imageUrl: "/images/plants/wildflowers.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 5,
    biodiversityValue: 5,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "acid-brown-earth",
      "peat",
      "gley",
    ],
  },
  {
    id: 4,
    commonName: "Leek",
    latinName: "Allium ampeloprasum",
    description: "A hardy vegetable well-suited to the Irish climate.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Well-drained loam",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Autumn to Winter",
    imageUrl: "/images/plants/leek.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 4,
    biodiversityValue: 2,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic"],
  },
  {
    id: 5,
    commonName: "Kale",
    latinName: "Brassica oleracea var. sabellica",
    description:
      "Extremely hardy and nutritious leafy vegetable that thrives in cool Irish weather.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Fertile loam",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Autumn to Winter",
    imageUrl: "/images/plants/kale.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 4,
    biodiversityValue: 3,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic", "gley"],
  },
  {
    id: 6,
    commonName: "Hawthorn",
    latinName: "Crataegus monogyna",
    description:
      "Native Irish tree/shrub excellent for hedgerows and supporting wildlife.",
    waterNeeds: "Low",
    sunNeeds: "Full Sun",
    soilPreference: "Wide range of soils",
    nativeToIreland: true,
    isPerennial: true,
    floweringSeason: "Spring",
    imageUrl: "/images/plants/hawthorn.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 5,
    biodiversityValue: 5,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "gley",
      "peat",
      "acid-brown-earth",
    ],
  },
  {
    id: 7,
    commonName: "Irish Primrose",
    latinName: "Primula vulgaris",
    description: "Beautiful native wildflower that blooms in early spring.",
    waterNeeds: "Medium",
    sunNeeds: "Partial Shade",
    soilPreference: "Moist, humus-rich soil",
    nativeToIreland: true,
    isPerennial: true,
    floweringSeason: "Spring",
    imageUrl: "/images/plants/primrose.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 4,
    biodiversityValue: 4,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "acid-brown-earth",
    ],
  },
  {
    id: 8,
    commonName: "Carrot",
    latinName: "Daucus carota",
    description:
      "Root vegetable that grows well in Irish climate with proper soil preparation.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Sandy loam",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Summer to Autumn",
    imageUrl: "/images/plants/carrot.jpg",
    sustainabilityRating: 3,
    waterConservationRating: 4,
    biodiversityValue: 2,
    suitableSoilTypes: ["brown-earth", "acid-brown-earth"],
  },
  {
    id: 9,
    commonName: "Rhubarb",
    latinName: "Rheum rhabarbarum",
    description:
      "Hardy perennial vegetable that produces year after year in Irish gardens.",
    waterNeeds: "High",
    sunNeeds: "Partial Shade",
    soilPreference: "Rich, well-drained soil",
    nativeToIreland: false,
    isPerennial: true,
    harvestSeason: "Spring to Summer",
    imageUrl: "/images/plants/rhubarb.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 2,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic"],
  },
  {
    id: 10,
    commonName: "Apple Tree (Irish Varieties)",
    latinName: "Malus domestica",
    description:
      "Heritage Irish apple varieties adapted to local climate conditions.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Well-drained loam",
    nativeToIreland: false,
    isPerennial: true,
    harvestSeason: "Autumn",
    imageUrl: "/images/plants/apple.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 4,
    biodiversityValue: 4,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic"],
  },
  {
    id: 11,
    commonName: "Blackberry",
    latinName: "Rubus fruticosus",
    description: "Wild bramble that grows abundantly throughout Ireland.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun to Partial Shade",
    soilPreference: "Well-drained, slightly acidic",
    nativeToIreland: true,
    isPerennial: true,
    harvestSeason: "Late Summer to Autumn",
    imageUrl: "/images/plants/blackberry.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 5,
    biodiversityValue: 5,
    suitableSoilTypes: ["brown-earth", "acid-brown-earth", "peat"],
  },
  {
    id: 12,
    commonName: "Onion",
    latinName: "Allium cepa",
    description:
      "Versatile crop that stores well for winter use in Irish kitchens.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun",
    soilPreference: "Well-drained, fertile soil",
    nativeToIreland: false,
    isPerennial: false,
    harvestSeason: "Late Summer",
    imageUrl: "/images/plants/onion.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 4,
    biodiversityValue: 2,
    suitableSoilTypes: ["brown-earth", "grey-brown-podzolic"],
  },
  {
    id: 13,
    commonName: "Foxglove",
    latinName: "Digitalis purpurea",
    description:
      "Stunning native Irish wildflower with tall spikes of tubular flowers. Note: All parts are toxic if ingested.",
    waterNeeds: "Medium",
    sunNeeds: "Partial Shade",
    soilPreference: "Well-drained woodland soil",
    nativeToIreland: true,
    isPerennial: true,
    floweringSeason: "Early Summer",
    imageUrl: "/images/plants/foxglove.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 4,
    biodiversityValue: 5,
    suitableSoilTypes: ["brown-earth", "acid-brown-earth", "peat"],
  },
  {
    id: 14,
    commonName: "Wild Strawberry",
    latinName: "Fragaria vesca",
    description:
      "Native woodland plant producing small, intensely flavored berries. Excellent ground cover for gardens.",
    waterNeeds: "Medium",
    sunNeeds: "Partial Shade to Full Sun",
    soilPreference: "Rich, moist soil",
    nativeToIreland: true,
    isPerennial: true,
    harvestSeason: "Summer",
    imageUrl: "/images/plants/wild-strawberry.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 4,
    biodiversityValue: 4,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "acid-brown-earth",
    ],
  },
  {
    id: 15,
    commonName: "Fuchsia",
    latinName: "Fuchsia magellanica",
    description:
      "Thrives in Ireland's mild, damp climate with their beautiful pendulous flowers. Often seen in hedgerows in western regions.",
    waterNeeds: "Medium",
    sunNeeds: "Partial Shade",
    soilPreference: "Moist, well-drained soil",
    nativeToIreland: false,
    isPerennial: true,
    floweringSeason: "Summer to Autumn",
    imageUrl: "/images/plants/fuchsia.jpg",
    sustainabilityRating: 4,
    waterConservationRating: 3,
    biodiversityValue: 4,
    suitableSoilTypes: [
      "brown-earth",
      "acid-brown-earth",
      "grey-brown-podzolic",
    ],
  },
  {
    id: 16,
    commonName: "Hydrangea",
    latinName: "Hydrangea macrophylla",
    description:
      "Perfect for Irish gardens, thriving in the slightly acidic soil common in many areas. Flower color changes based on soil pH.",
    waterNeeds: "High",
    sunNeeds: "Partial Shade",
    soilPreference: "Moist, acidic soil",
    nativeToIreland: false,
    isPerennial: true,
    floweringSeason: "Summer to Autumn",
    imageUrl: "/images/plants/hydrangea.jpg",
    sustainabilityRating: 3,
    waterConservationRating: 2,
    biodiversityValue: 3,
    suitableSoilTypes: ["acid-brown-earth", "peat"],
  },
  {
    id: 17,
    commonName: "Heather",
    latinName: "Calluna vulgaris",
    description:
      "Hardy evergreen shrub providing year-round interest and texture in Irish gardens. Particularly beautiful on hillsides and moorlands.",
    waterNeeds: "Low",
    sunNeeds: "Full Sun to Partial Shade",
    soilPreference: "Acidic, well-drained soil",
    nativeToIreland: true,
    isPerennial: true,
    floweringSeason: "Summer to Autumn",
    imageUrl: "/images/plants/heather.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 5,
    biodiversityValue: 4,
    suitableSoilTypes: ["acid-brown-earth", "peat"],
  },
  {
    id: 18,
    commonName: "Raspberry",
    latinName: "Rubus idaeus",
    description:
      "Hardy cane fruit that thrives in Irish gardens, producing delicious summer berries rich in antioxidants.",
    waterNeeds: "Medium",
    sunNeeds: "Full Sun to Partial Shade",
    soilPreference: "Moist, well-drained, slightly acidic soil",
    nativeToIreland: false,
    isPerennial: true,
    harvestSeason: "Summer to Early Autumn",
    imageUrl: "/images/plants/raspberry.jpg",
    sustainabilityRating: 5,
    waterConservationRating: 4,
    biodiversityValue: 4,
    suitableSoilTypes: ["brown-earth", "acid-brown-earth"],
  },
  {
    id: 19,
    commonName: "Gooseberry",
    latinName: "Ribes uva-crispa",
    description:
      "Traditional Irish fruit bush that produces tart berries perfect for cooking. Performs well in our cool, moist climate.",
    waterNeeds: "Medium",
    sunNeeds: "Partial Shade",
    soilPreference: "Moist, well-drained soil rich in organic matter",
    nativeToIreland: false,
    isPerennial: true,
    harvestSeason: "Summer",
    imageUrl: "/images/plants/gooseberry.jpg", // Using generic image as placeholder
    sustainabilityRating: 4,
    waterConservationRating: 4,
    biodiversityValue: 3,
    suitableSoilTypes: [
      "brown-earth",
      "grey-brown-podzolic",
      "acid-brown-earth",
    ],
  },
];

export const samplePlants = plants;
