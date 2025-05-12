import React, { useState } from "react";
import { calculateCarbonSavings } from "../../utils/carbon-footprint";
import { sdgGoals } from "../../data/sustainability-metrics";

/**
 * Component to display sustainability score and carbon footprint savings for plants
 */
const SustainabilityScore = ({
  plantName,
  quantity = 1,
  isOrganic = true,
  showDetailedBreakdown = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate sustainability metrics
  const metrics = calculateCarbonSavings(plantName, quantity, isOrganic);

  // Choose message based on sustainability score
  let sustainabilityMessage = "";
  if (metrics.sustainabilityScore >= 4.5) {
    sustainabilityMessage = "Excellent sustainability choice!";
  } else if (metrics.sustainabilityScore >= 3.5) {
    sustainabilityMessage = "Very good sustainability impact";
  } else if (metrics.sustainabilityScore >= 2.5) {
    sustainabilityMessage = "Good sustainability choice";
  } else {
    sustainabilityMessage = "Moderate sustainability impact";
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <h3 className="card-title text-lg flex items-center justify-between">
          <span>Sustainability Impact</span>
          <div className="badge badge-accent">
            {metrics.sustainabilityScore}/5
          </div>
        </h3>

        <p className="text-sm mb-4">{sustainabilityMessage}</p>

        {/* Main sustainability metrics */}
        <div className="stats bg-primary text-primary-content shadow mb-4">
          <div className="stat">
            <div className="stat-title">Carbon Savings</div>
            <div className="stat-value text-lg">
              {metrics.totalCarbonSavings} kg
            </div>
            <div className="stat-desc">CO₂ equivalent per {quantity} kg</div>
          </div>

          <div className="stat">
            <div className="stat-title">Water Savings</div>
            <div className="stat-value text-lg">{metrics.waterSaved} L</div>
            <div className="stat-desc">Compared to store-bought</div>
          </div>
        </div>

        {/* Show SDG impacts */}
        {metrics.sdgs.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-1">
              Supports UN Sustainable Development Goals:
            </h4>
            <div className="flex flex-wrap gap-1">
              {metrics.sdgs.map((sdgId) => (
                <div
                  key={sdgId}
                  className="tooltip"
                  data-tip={`${sdgGoals[sdgId].name}: ${sdgGoals[sdgId].description}`}
                >
                  <div
                    className="badge badge-outline gap-1"
                    style={{ borderColor: sdgGoals[sdgId].color }}
                  >
                    <span>{sdgGoals[sdgId].icon}</span>
                    <span>Goal {sdgGoals[sdgId].number}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle detailed breakdown */}
        <button
          className="btn btn-sm btn-outline btn-accent"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Detailed Breakdown"}
        </button>

        {/* Detailed breakdown */}
        {showDetails && (
          <div className="mt-4 text-sm">
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <tbody>
                  <tr>
                    <td className="font-medium">Emissions Saved:</td>
                    <td>{metrics.emissionsSaved} kg CO₂e</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Transport Savings:</td>
                    <td>{metrics.transportSavings} kg CO₂e</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Packaging Savings:</td>
                    <td>{metrics.packagingSavings} kg CO₂e</td>
                  </tr>
                  {metrics.organicBonus > 0 && (
                    <tr>
                      <td className="font-medium">Organic Bonus:</td>
                      <td>{metrics.organicBonus} kg CO₂e</td>
                    </tr>
                  )}
                  {metrics.carbonSequestered > 0 && (
                    <tr>
                      <td className="font-medium">Carbon Sequestered:</td>
                      <td>{metrics.carbonSequestered} kg CO₂e/year</td>
                    </tr>
                  )}
                  <tr className="font-bold">
                    <td>Total Carbon Savings:</td>
                    <td>{metrics.totalCarbonSavings} kg CO₂e</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="alert alert-info mt-4 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs">
                <p>This is equivalent to:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>
                    {(metrics.totalCarbonSavings * 4).toFixed(2)} car miles
                  </li>
                  <li>
                    {(metrics.totalCarbonSavings / 25).toFixed(2)} tree-months
                    of carbon sequestration
                  </li>
                </ul>
              </div>
            </div>

            {/* Additional sustainability benefits */}
            {(metrics.biodiversityBonus || metrics.pollinatorSupport) && (
              <div className="alert alert-success mt-2 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-xs">
                  <p>Additional benefits:</p>
                  <ul className="list-disc list-inside mt-1">
                    {metrics.biodiversityBonus && (
                      <li>Supports biodiversity</li>
                    )}
                    {metrics.pollinatorSupport && <li>Supports pollinators</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SustainabilityScore;
