// src/components/soil/SoilInfo.jsx
import React, { useState, useEffect } from "react";
import { getSoilDataByLocation } from "../../utils/soil-client";

const SoilInfo = () => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [county, setCounty] = useState("Dublin");

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

    // Make sure we listen on document, not window
    document.addEventListener("countyChange", handleCountyChange);

    // Fetch initial data
    fetchSoilData(county);

    return () => {
      document.removeEventListener("countyChange", handleCountyChange);
      window.refreshSoilData = null;
    };
  }, []);

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

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Soil Information for {county}</h2>

        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg">{soilData.soilName}</h3>
          <div className="badge badge-accent mb-2">{soilData.soilType}</div>
          <p className="text-sm">{soilData.description}</p>
        </div>

        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">pH Range</div>
            <div className="stat-value text-lg">
              {soilData.properties.ph.min} - {soilData.properties.ph.max}
            </div>
            <div className="stat-desc">Optimal for most plants: 6.0-7.0</div>
          </div>

          <div className="stat">
            <div className="stat-title">Texture</div>
            <div className="stat-value text-lg">
              {soilData.properties.texture}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Nutrients</div>
            <div className="stat-value text-lg">
              {soilData.properties.nutrients}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Drainage</div>
            <div className="stat-value text-lg">
              {soilData.properties.drainage}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2">
            {soilData.recommendations.map((tip, index) => (
              <li key={index} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Suited Crops</h3>
          <div className="flex flex-wrap gap-2">
            {getSuitedCrops(soilData.soilType).map((crop, index) => (
              <div key={index} className="badge badge-outline">
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

export default SoilInfo;
