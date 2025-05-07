import React, { useState, useEffect } from "react";
import { getSoilDataByLocation } from "../../utils/soil-client";

const SoilInfo = ({ county = "Dublin" }) => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSoilData() {
      try {
        setLoading(true);
        const data = await getSoilDataByLocation(county);
        setSoilData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch soil data:", err);
        setError("Could not load soil information");
      } finally {
        setLoading(false);
      }
    }

    fetchSoilData();
  }, [county]);

  if (loading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading soil data...</h2>
          <progress className="progress w-56"></progress>
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
          <p className="text-sm">{soilData.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-base-content/60">pH Range</span>
            <span className="font-medium">
              {soilData.properties.ph.min} - {soilData.properties.ph.max}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Texture</span>
            <span className="font-medium">{soilData.properties.texture}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Nutrient Level</span>
            <span className="font-medium">{soilData.properties.nutrients}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Drainage</span>
            <span className="font-medium">{soilData.properties.drainage}</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-1">
            {soilData.recommendations.map((tip, index) => (
              <li key={index} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SoilInfo;
