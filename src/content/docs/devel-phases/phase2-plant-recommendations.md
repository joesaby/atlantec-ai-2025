---
title: "Phase 2: Plant Recommendation System"
description: "Phase 2: Plant Recommendation System documentation"
category: "devel-phases"
---

This phase implements a recommendation system that suggests suitable plants based on the user's garden conditions including soil type, sunlight, and location. We'll create interactive daisyUI components to collect user input and display personalized plant recommendations.

## Implementation Steps

### 1. Create a Plant Database

First, let's create a database of plants suitable for Irish gardens:

```javascript
// src/data/plants.js

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
];
```

### 2. Create the Recommendation Engine

Create a utility that provides recommendations based on garden conditions:

```javascript
// src/utils/plant-recommender.js
import { plants } from "../data/plants";
import { getSoilDataByLocation } from "./soil-client";

/**
 * Recommends plants based on user's garden conditions
 * @param {Object} conditions - Garden conditions
 * @param {string} conditions.county - Irish county
 * @param {string} conditions.sunExposure - 'Full Sun', 'Partial Shade', or 'Full Shade'
 * @param {Array} conditions.plantType - Types of plants the user wants to grow
 * @param {boolean} conditions.nativeOnly - Whether to only show native plants
 * @returns {Promise<Array>} Array of recommended plants with scores
 */
export async function getPlantRecommendations(conditions) {
  try {
    // Get soil data for the specified county
    const soilData = await getSoilDataByLocation(conditions.county);

    // Filter and score plants based on conditions
    const scoredPlants = plants
      .filter((plant) => !conditions.nativeOnly || plant.nativeToIreland)
      .filter((plant) => {
        if (!conditions.plantType || conditions.plantType.length === 0) {
          return true;
        }

        const plantTypes = [];
        if (plant.harvestSeason) plantTypes.push("vegetable", "fruit");
        if (plant.floweringSeason) plantTypes.push("flower");
        if (
          plant.isPerennial &&
          plant.commonName.toLowerCase().includes("tree")
        ) {
          plantTypes.push("tree");
        }

        return conditions.plantType.some((type) => plantTypes.includes(type));
      })
      .map((plant) => {
        let score = 0;

        // Score based on soil suitability (0-30 points)
        if (plant.suitableSoilTypes.includes(soilData.soilType)) {
          score += 30;
        }

        // Score based on sun exposure (0-25 points)
        if (plant.sunNeeds === conditions.sunExposure) {
          score += 25;
        } else if (plant.sunNeeds.includes(conditions.sunExposure)) {
          score += 15;
        }

        // Bonus for native plants (0-10 points)
        if (plant.nativeToIreland) {
          score += 10;
        }

        // Sustainability bonus (0-15 points)
        score += plant.sustainabilityRating * 3;

        return {
          ...plant,
          score,
          matchPercentage: Math.min(Math.round((score / 80) * 100), 100),
        };
      })
      .sort((a, b) => b.score - a.score);

    return scoredPlants.slice(0, 8);
  } catch (error) {
    console.error("Error generating plant recommendations:", error);
    throw new Error("Failed to generate plant recommendations");
  }
}
```

### 3. Create a Plant Recommendation Form

Build a form to collect user garden information using daisyUI components:

```jsx
// src/components/plants/PlantRecommendationForm.jsx
import React, { useState } from "react";

const PlantRecommendationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    county: "Dublin",
    sunExposure: "Full Sun",
    plantType: [],
    nativeOnly: false,
  });

  const irishCounties = [
    "Antrim",
    "Armagh",
    "Carlow",
    "Cavan",
    "Clare",
    "Cork",
    "Derry",
    "Donegal",
    "Down",
    "Dublin",
    "Fermanagh",
    "Galway",
    "Kerry",
    "Kildare",
    "Kilkenny",
    "Laois",
    "Leitrim",
    "Limerick",
    "Longford",
    "Louth",
    "Mayo",
    "Meath",
    "Monaghan",
    "Offaly",
    "Roscommon",
    "Sligo",
    "Tipperary",
    "Tyrone",
    "Waterford",
    "Westmeath",
    "Wexford",
    "Wicklow",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "nativeOnly") {
        setFormData({
          ...formData,
          nativeOnly: checked,
        });
      } else {
        const plantTypesCopy = [...formData.plantType];
        if (checked) {
          plantTypesCopy.push(value);
        } else {
          const index = plantTypesCopy.indexOf(value);
          if (index > -1) {
            plantTypesCopy.splice(index, 1);
          }
        }
        setFormData({
          ...formData,
          plantType: plantTypesCopy,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">Find Plants for Your Garden</h2>
        <p className="text-sm mb-4">
          Tell us about your garden conditions and we'll recommend plants that
          will thrive.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">County</span>
            </label>
            <select
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              {irishCounties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt">
                We'll use this to determine your soil type and climate
              </span>
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Sunlight Exposure</span>
            </label>
            <div className="flex flex-col gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Full Sun"
                  checked={formData.sunExposure === "Full Sun"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">Full Sun (6+ hours)</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Partial Shade"
                  checked={formData.sunExposure === "Partial Shade"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">Partial Shade (3-6 hours)</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Full Shade"
                  checked={formData.sunExposure === "Full Shade"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">
                  Full Shade (less than 3 hours)
                </span>
              </label>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">What would you like to grow?</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="vegetable"
                  checked={formData.plantType.includes("vegetable")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Vegetables</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="fruit"
                  checked={formData.plantType.includes("fruit")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Fruits</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="flower"
                  checked={formData.plantType.includes("flower")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Flowers</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="tree"
                  checked={formData.plantType.includes("tree")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Trees/Shrubs</span>
              </label>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="nativeOnly"
                checked={formData.nativeOnly}
                onChange={handleInputChange}
                className="checkbox checkbox-success"
              />
              <span className="label-text">Show only native Irish plants</span>
            </label>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Finding Plants...
                </>
              ) : (
                "Get Recommendations"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantRecommendationForm;
```

### 4. Create a Plant Card Component

Create a card to display plant information:

```jsx
// src/components/plants/PlantCard.jsx
import React from "react";

const PlantCard = ({ plant }) => {
  return (
    <div className="card bg-base-100 shadow-xl h-full">
      <figure className="px-4 pt-4">
        <img
          src={
            plant.imageUrl ||
            "https://placehold.co/300x200/e2e8f0/1e293b?text=Plant+Image"
          }
          alt={plant.commonName}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg">
          {plant.commonName}
          {plant.matchPercentage >= 90 && (
            <div className="badge badge-success">Best Match</div>
          )}
        </h2>
        <p className="text-xs italic text-base-content/60">{plant.latinName}</p>

        <div className="flex items-center my-2">
          <div
            className="radial-progress text-primary"
            style={{
              "--value": plant.matchPercentage,
              "--size": "3rem",
              "--thickness": "3px",
            }}
          >
            <span className="text-xs">{plant.matchPercentage}%</span>
          </div>
          <span className="text-sm ml-2">Match for your garden</span>
        </div>

        <p className="text-sm">{plant.description}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {plant.nativeToIreland && (
            <div className="badge badge-outline badge-success">Native</div>
          )}
          {plant.isPerennial && (
            <div className="badge badge-outline">Perennial</div>
          )}
          {plant.sunNeeds && (
            <div className="badge badge-outline">{plant.sunNeeds}</div>
          )}
          {plant.waterNeeds && (
            <div className="badge badge-outline">Water: {plant.waterNeeds}</div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center mb-1">
            <span className="text-xs w-32">Sustainability:</span>
            <progress
              className="progress progress-success h-2 flex-1"
              value={plant.sustainabilityRating * 20}
              max="100"
            ></progress>
          </div>
          <div className="flex items-center mb-1">
            <span className="text-xs w-32">Water Conservation:</span>
            <progress
              className="progress progress-info h-2 flex-1"
              value={plant.waterConservationRating * 20}
              max="100"
            ></progress>
          </div>
          <div className="flex items-center">
            <span className="text-xs w-32">Biodiversity:</span>
            <progress
              className="progress progress-accent h-2 flex-1"
              value={plant.biodiversityValue * 20}
              max="100"
            ></progress>
          </div>
        </div>

        <div className="card-actions justify-end mt-3">
          <button className="btn btn-sm btn-outline btn-primary">
            Growing Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
```

### 5. Create a Recommendation Results Component

Create a component to display the recommendation results:

```jsx
// src/components/plants/PlantRecommendations.jsx
import React from "react";
import PlantCard from "./PlantCard";

const PlantRecommendations = ({ recommendations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Finding Perfect Plants</h2>
          <p className="mb-4">Analyzing your garden conditions...</p>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">No Matching Plants Found</h2>
          <p>Try adjusting your garden criteria to see more plants.</p>
          <div className="mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 opacity-20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 12V19H10V12H3V10H10V3H12V10H19V12H12Z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">
          Recommended Plants for Your Garden
          <div className="badge badge-accent">
            {recommendations.length} matches
          </div>
        </h2>
        <p className="text-sm mb-4">
          Based on your garden conditions, these plants should thrive in your
          garden.
        </p>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantRecommendations;
```

### 6. Create an API Endpoint for Plant Recommendations

Create an Astro API endpoint to handle recommendation requests:

```javascript
// src/pages/api/plant-recommendations.js
import { getPlantRecommendations } from "../../utils/plant-recommender";

export async function POST({ request }) {
  try {
    const data = await request.json();

    if (!data.county || !data.sunExposure) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: county and sunExposure are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const recommendations = await getPlantRecommendations(data);

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in plant-recommendations API:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate plant recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

### 7. Create a Recommendation Page

Create an Astro page to integrate the recommendation components:

```astro
---
// src/pages/plant-recommendations.astro
import Layout from '../layouts/Layout.astro';
import PlantRecommendationForm from '../components/plants/PlantRecommendationForm';
import PlantRecommendations from '../components/plants/PlantRecommendations';
---

<Layout title="Plant Recommendations">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2 text-center">Find the Perfect Plants for Your Irish Garden</h1>
    <p class="text-center text-base-content/70 mb-8 max-w-2xl mx-auto">
      Our plant recommendation system uses your garden conditions to suggest plants that will thrive in your specific Irish garden, promoting sustainability and biodiversity.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div id="recommendation-form"></div>

        <div class="card bg-base-100 shadow-xl mt-6">
          <div class="card-body">
            <h3 class="font-bold text-lg">Why This Matters</h3>
            <div class="py-2">
              <ul class="list-disc list-inside text-sm space-y-2">
                <li>Plants suited to your conditions are healthier and require fewer resources</li>
                <li>Native plants support local pollinators and wildlife</li>
                <li>Matching plants to soil type reduces the need for amendments</li>
                <li>Well-matched plants are more resistant to pests and diseases</li>
                <li>Sustainable gardening practices benefit the environment</li>
              </ul>
            </div>
            <div class="card-actions mt-2">
              <div class="stats stats-vertical shadow w-full">
                <div class="stat">
                  <div class="stat-title">Gardens in Ireland</div>
                  <div class="stat-value text-primary">1.2M+</div>
                  <div class="stat-desc">Potential for positive impact</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Native Species</div>
                  <div class="stat-value text-secondary">800+</div>
                  <div class="stat-desc">Support local ecosystems</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2" id="results-container">
        <div class="card bg-base-100 shadow-xl h-full">
          <div class="card-body flex flex-col justify-center items-center text-center p-8">
            <h2 class="card-title text-2xl mb-4">Your Recommendations Will Appear Here</h2>
            <p class="mb-6">Fill out the form to get personalized plant recommendations for your garden.</p>
            <div class="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 opacity-20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M15,21H9V12H3L12,3L21,12H15V21Z" />
              </svg>
            </div>
            <div class="text-sm opacity-70">
              <p>Our recommendation engine considers your location, soil type, sunlight, and preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</Layout>

<script>
  // Client-side code to handle form submission and display results
  import React from 'react';
  import ReactDOM from 'react-dom';
  import PlantRecommendationForm from '../components/plants/PlantRecommendationForm';
  import PlantRecommendations from '../components/plants/PlantRecommendations';

  document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('recommendation-form');
    const resultsContainer = document.getElementById('results-container');
    let isLoading = false;
    let recommendations = [];

    async function fetchRecommendations(formData) {
      isLoading = true;
      renderComponents();

      try {
        const response = await fetch('/api/plant-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        recommendations = data.recommendations;
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        recommendations = [];
      } finally {
        isLoading = false;
        renderComponents();
      }
    }

    function renderComponents() {
      // Render the form
      ReactDOM.render(
        React.createElement(PlantRecommendationForm, {
          onSubmit: fetchRecommendations,
          isLoading
        }),
        formContainer
      );

      // Render the results
      ReactDOM.render(
        React.createElement(PlantRecommendations, {
          recommendations,
          isLoading
        }),
        resultsContainer
      );
    }

    // Initial render
    renderComponents();
  });
</script>
```

## Testing

To validate that this phase is working correctly:

1. Verify the page loads with the recommendation form and empty results state
2. Test the form by:
   - Selecting different counties
   - Choosing different sun exposure options
   - Selecting various plant types
   - Toggling the native plants filter
3. Check that the Plant Cards display:
   - Plant images
   - Match percentage
   - Plant details and badges
   - Sustainability metrics
4. Verify that the recommendations update when:
   - Changing county (affects soil type)
   - Adjusting sun exposure
   - Modifying plant type preferences
   - Toggling native plants filter
5. Test error states by:
   - Temporarily disabling network connection
   - Submitting invalid form data

## Next Steps

After successfully implementing this phase, you'll have a working plant recommendation system. Next phases will build on this to:

1. Add detailed growing guides for each plant
2. Implement seasonal planting calendars
3. Create a garden planning tool