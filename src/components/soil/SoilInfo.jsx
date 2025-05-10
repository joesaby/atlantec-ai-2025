// src/components/soil/SoilInfo.jsx
import React, { useState, useEffect } from "react";
import { getSoilDataByLocation } from "../../utils/soil-client";

const SoilInfo = ({ county: countyProp }) => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [county, setCounty] = useState(countyProp || "Dublin");

  useEffect(() => {
    // Listen for county changes - make sure we're listening on the document
    const handleCountyChange = (event) => {
      console.log("SoilInfo received county change:", event.detail);
      setCounty(event.detail);
    };

    // Register global refresh function for direct calls
    window.refreshSoilData = (newCounty) => {
      console.log("SoilInfo direct refresh for county:", newCounty);
      setCounty(newCounty);
      fetchSoilData(newCounty);
    };

    // Check URL for county param on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const countyParam = urlParams.get("county");
    if (countyParam) {
      console.log("SoilInfo found county in URL:", countyParam);
      setCounty(countyParam);
    }

    // Use county from props if provided (takes precedence over URL)
    if (countyProp) {
      console.log("SoilInfo using county from props:", countyProp);
      setCounty(countyProp);
    }

    // Make sure we listen on document, not window
    document.addEventListener("countyChange", handleCountyChange);

    // Fetch initial data
    fetchSoilData(county);

    return () => {
      document.removeEventListener("countyChange", handleCountyChange);
      window.refreshSoilData = null;
    };
  }, [countyProp]);

  useEffect(() => {
    console.log("SoilInfo county state changed to:", county);
    fetchSoilData(county);
  }, [county]);

  async function fetchSoilData(countyName) {
    try {
      console.log("Fetching soil data for:", countyName);
      setLoading(true);
      const data = await getSoilDataByLocation(countyName);
      console.log("Soil data received:", data);
      setSoilData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch soil data:", err);
      setError("Could not load soil information");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading soil data...</h2>
          <span className="loading loading-spinner loading-lg text-accent"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Error</h2>
          <p>{error}</p>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get pH color
  const getPhColor = (ph) => {
    if (ph < 4.5) return "bg-red-600"; // Very acidic
    if (ph < 5.5) return "bg-orange-500"; // Acidic
    if (ph < 6.0) return "bg-yellow-400"; // Slightly acidic
    if (ph < 7.0) return "bg-green-500"; // Neutral - ideal
    if (ph < 7.5) return "bg-green-400"; // Slightly alkaline
    if (ph < 8.0) return "bg-blue-400"; // Alkaline
    return "bg-blue-600"; // Very alkaline
  };

  // Get pH range info
  const phMin = soilData.properties.ph.min;
  const phMax = soilData.properties.ph.max;
  const phMid = (phMin + phMax) / 2;

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">Soil Information for {county}</h2>

        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="font-bold text-lg">{soilData.soilName}</h3>
            <div className="badge badge-accent">
              {soilData.soilType.replace("-", " ")}
            </div>
          </div>
          <p className="text-sm">{soilData.description}</p>
        </div>

        {/* Soil properties cards in a responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <div className="text-sm opacity-70">pH Range</div>
              <div className="font-medium text-lg">
                {phMin} - {phMax}
              </div>

              {/* Improved pH range visualization with better gradient and aligned legends */}
              <div className="mt-2 mb-3">
                <div className="w-full h-3 rounded-md relative overflow-hidden">
                  {/* Background gradient using CSS for smoother transition */}
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{
                      background:
                        "linear-gradient(to right, #dc2626 0%, #dc2626 20%, #facc15 35%, #22c55e 50%, #60a5fa 65%, #2563eb 100%)",
                    }}
                  ></div>

                  {/* Range indicator - highlight the range on the pH scale */}
                  <div
                    className="absolute h-full"
                    style={{
                      left: `${((phMin - 2) / 12) * 100}%`,
                      width: `${((phMax - phMin) / 12) * 100}%`,
                      background: "rgba(255, 255, 255, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow: "0 0 3px rgba(255,255,255,0.5)",
                    }}
                  ></div>
                </div>

                {/* Simplified scale with just key pH values */}
                <div className="flex justify-between mt-1 text-xs opacity-70">
                  <span>2.0</span>
                  <span>7.0</span>
                  <span>14.0</span>
                </div>
              </div>

              <div className="text-xs opacity-70">
                <span className="inline-block w-full text-center">
                  {phMid < 6.0
                    ? "Acidic soil - good for acid-loving plants"
                    : phMid > 7.0
                    ? "Alkaline soil - for alkaline-tolerant plants"
                    : "Neutral soil - ideal for most garden plants"}
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <div className="text-sm opacity-70">Texture</div>
              <div className="font-medium text-lg">
                {soilData.properties.texture}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {getSoilTextureDescription(soilData.properties.texture)}
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <div className="text-sm opacity-70">Drainage</div>
              <div className="font-medium text-lg">
                {soilData.properties.drainage}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {getDrainageDescription(soilData.properties.drainage)}
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="mb-6">
          <h3 className="font-medium text-lg mb-3">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2">
            {soilData.recommendations.map((tip, index) => (
              <li key={index} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-3">Suited Crops</h3>
          <div className="flex flex-wrap gap-2">
            {getSuitedCrops(soilData.soilType).map((crop, index) => (
              <div key={index} className="badge badge-outline p-3">
                {crop}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get crops suited to soil type
function getSuitedCrops(soilType) {
  const cropMap = {
    "brown-earth": [
      "Potatoes",
      "Carrots",
      "Onions",
      "Cabbage",
      "Beetroot",
      "Most vegetables",
    ],
    "grey-brown-podzolic": [
      "Potatoes",
      "Cabbage",
      "Kale",
      "Peas",
      "Beans",
      "Most vegetables",
    ],
    gley: ["Cabbage", "Kale", "Onions", "Celery", "Berries (with drainage)"],
    peat: [
      "Potatoes",
      "Blueberries",
      "Raspberries",
      "Rhubarb",
      "Acid-loving plants",
    ],
    "acid-brown-earth": [
      "Potatoes",
      "Berries",
      "Rhubarb",
      "Acid-loving plants",
    ],
    default: ["Potatoes", "Cabbage", "Onions", "Root vegetables"],
  };

  return cropMap[soilType] || cropMap.default;
}

// Helper functions for soil property descriptions
function getSoilTextureDescription(texture) {
  const descriptions = {
    Clay: "Dense, nutrient-rich soil that retains water well but can be heavy and slow to drain",
    Loamy: "Ideal balanced texture with good drainage and nutrient retention",
    Sandy:
      "Fast-draining soil that warms quickly but may dry out and lose nutrients",
    Silty: "Smooth, fertile soil that holds moisture well",
    "Sandy Loam": "Good balance of drainage and water retention",
    "Clay Loam": "Rich in nutrients with better drainage than pure clay",
    Organic: "High in organic matter, often acidic and moisture-retentive",
  };

  // Default description for any texture
  return (
    descriptions[texture] ||
    "Affects water retention, drainage, and nutrient availability"
  );
}

function getNutrientDescription(level) {
  const descriptions = {
    High: "Fertile soil with abundant plant nutrients",
    Medium: "Moderate fertility suitable for most plants",
    Low: "May require fertilizer supplements for optimal growth",
    "Very Low": "Will need regular fertilizer applications",
    Variable: "Nutrient levels vary across the soil profile",
  };

  return descriptions[level] || "Indicates the soil's natural fertility level";
}

function getDrainageDescription(drainage) {
  const descriptions = {
    Good: "Water drains at an ideal rate for most plants",
    Poor: "Water tends to linger, may need raised beds",
    Moderate: "Balanced drainage suitable for many plants",
    Excessive: "Drains very quickly, may need frequent watering",
    Variable: "Drainage patterns vary across the area",
    "Poor to Very Poor":
      "Prone to waterlogging, best for bog plants or needs significant drainage work",
    "Good but shallow": "Drains well but may have limited depth for roots",
    "Good to Excessive": "Tends to drain quickly, may dry out in summer",
  };

  return descriptions[drainage] || "How well water moves through the soil";
}

export default SoilInfo;
