import React, { useState } from "react";
import {
  calculateFoodGrowingImpact,
  calculateAnnualGardenImpact,
  foodCarbonFootprint,
} from "../../data/sustainability-metrics";

const FoodSustainabilityInfo = ({ crop, quantity, gardenArea }) => {
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  // Calculate impact based on the specific crop and quantity if provided
  const specificImpact =
    crop && quantity ? calculateFoodGrowingImpact(crop, quantity) : null;

  // Calculate garden impact based on area if provided
  const gardenImpact = gardenArea
    ? calculateAnnualGardenImpact(gardenArea)
    : calculateAnnualGardenImpact(10); // Default to 10m²

  // Format a number with units
  const formatWithUnit = (value, unit, decimals = 1) => {
    return `${value.toFixed(decimals)} ${unit}`;
  };

  // Create impact level component (1-5 scale)
  const ImpactLevel = ({ level, icon, label, color }) => {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xl mb-1">{icon}</div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-5 rounded-full ${
                i < level ? color || "bg-success" : "bg-base-300"
              }`}
            ></div>
          ))}
        </div>
        <div className="text-xs mt-1 text-center">{label}</div>
      </div>
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden max-w-full">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-4">
        <h3 className="text-xl font-bold flex items-center gap-2 flex-wrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <span className="truncate">Sustainability Impact: {crop ? `Growing ${crop}` : "Food Growing"}</span>
        </h3>
      </div>

      <div className="card-body">
        {/* Visual impact indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-base-200 rounded-lg mb-4">
          <ImpactLevel
            level={crop === "herbs" ? 5 : 4}
            icon="🌍"
            label="Carbon Reduction"
            color="bg-green-500"
          />
          <ImpactLevel
            level={3}
            icon="💧"
            label="Water Saved"
            color="bg-blue-500"
          />
          <ImpactLevel
            level={crop === "apple" || crop === "strawberries" ? 5 : 3}
            icon="🦋"
            label="Biodiversity"
            color="bg-yellow-500"
          />
        </div>

        {/* Primary metrics */}
        {specificImpact ? (
          <div className="stats stats-vertical sm:stats-horizontal shadow w-full text-center flex-wrap">
            <div className="stat">
              <div className="stat-figure text-success text-3xl">🌍</div>
              <div className="stat-title">Carbon Saved</div>
              <div className="stat-value text-success text-lg md:text-xl">
                {specificImpact.carbonSaved.toFixed(2)} kg
              </div>
              <div className="stat-desc">CO₂ compared to store-bought</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-info text-3xl">📦</div>
              <div className="stat-title">Packaging Saved</div>
              <div className="stat-value text-info">
                {specificImpact.packagingSaved.toFixed(0)} g
              </div>
              <div className="stat-desc">Less plastic waste</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary text-3xl">🚚</div>
              <div className="stat-title">Food Miles</div>
              <div className="stat-value text-secondary">
                {specificImpact.foodMilesSaved} km
              </div>
              <div className="stat-desc">Transport distance eliminated</div>
            </div>
          </div>
        ) : (
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full text-center">
            <div className="stat">
              <div className="stat-figure text-success text-3xl">🌱</div>
              <div className="stat-title">Annual Yield</div>
              <div className="stat-value text-success">
                {gardenImpact.totalYield} kg
              </div>
              <div className="stat-desc">From {gardenArea || 10}m² garden</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-info text-3xl">🌍</div>
              <div className="stat-title">Carbon Impact</div>
              <div className="stat-value text-info">
                {gardenImpact.carbonSaved.toFixed(1)} kg
              </div>
              <div className="stat-desc">CO₂ saved per year</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary text-3xl">🍽️</div>
              <div className="stat-title">Meals Provided</div>
              <div className="stat-value text-secondary">
                {gardenImpact.mealCount}
              </div>
              <div className="stat-desc">Approximate servings</div>
            </div>
          </div>
        )}

        <button
          className="btn btn-sm btn-outline mt-3"
          onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
        >
          {showDetailedMetrics ? "Hide Details" : "Show Detailed Metrics"}
        </button>

        {showDetailedMetrics && (
          <div className="mt-4 space-y-4">
            <div className="bg-base-200 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Detailed Environmental Impact</h4>

              {specificImpact ? (
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="font-semibold">Water Saved:</td>
                      <td>
                        {formatWithUnit(specificImpact.waterSaved, "liters")}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Transport Emissions:</td>
                      <td>
                        {formatWithUnit(
                          specificImpact.transportEmissionsSaved,
                          "kg CO₂"
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Food Miles Eliminated:</td>
                      <td>
                        {formatWithUnit(specificImpact.foodMilesSaved, "km", 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">
                        Packaging Waste Avoided:
                      </td>
                      <td>
                        {formatWithUnit(specificImpact.packagingSaved, "g", 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="font-semibold">Water Saved:</td>
                      <td>
                        {formatWithUnit(gardenImpact.waterSaved, "liters", 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Packaging Eliminated:</td>
                      <td>
                        {formatWithUnit(
                          gardenImpact.packagingSaved * 1000,
                          "g",
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Food Miles Reduced:</td>
                      <td>
                        {formatWithUnit(gardenImpact.foodMilesSaved, "km", 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Estimated Value:</td>
                      <td>€{gardenImpact.moneyValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Carbon Footprint Comparison</h4>
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Store-Bought (kg CO₂/kg)</th>
                    <th>Home-Grown (kg CO₂/kg)</th>
                    <th>Reduction</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(foodCarbonFootprint.storeBought).map((crop) => {
                    const storeBought = foodCarbonFootprint.storeBought[crop];
                    const homeGrown = foodCarbonFootprint.homeGrown[crop];
                    const reduction = (
                      ((storeBought - homeGrown) / storeBought) *
                      100
                    ).toFixed(0);

                    return (
                      <tr
                        key={crop}
                        className={
                          specificImpact && crop === specificImpact.crop
                            ? "bg-base-300"
                            : ""
                        }
                      >
                        <td className="capitalize">{crop}</td>
                        <td>{storeBought.toFixed(2)}</td>
                        <td>{homeGrown.toFixed(2)}</td>
                        <td className="text-success">{reduction}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="divider"></div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-base-content/70">
            Data sources: Environmental impact studies on Irish gardening
            practices
          </span>
          <span className="badge badge-outline badge-sm">
            Updated {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FoodSustainabilityInfo;
