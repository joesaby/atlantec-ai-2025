import React from "react";
import { calculateCarbonSavings } from "../../utils/carbon-footprint";
import { sdgGoals } from "../../data/sustainability-metrics";

/**
 * Component to display sustainability metrics for plants
 * Shows carbon footprint savings, water conservation, and SDG contributions
 */
const PlantSustainabilityInfo = ({
  plantName,
  quantity = 1,
  isOrganic = true,
  showDetailedBreakdown = false,
}) => {
  // Calculate sustainability metrics
  const metrics = calculateCarbonSavings(plantName, quantity, isOrganic);

  return (
    <div className="bg-base-100 shadow-lg rounded-lg overflow-hidden max-w-full">
      <div className="bg-gradient-to-r from-green-700 to-green-500 p-4 text-white">
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
          <span className="truncate">Sustainability Impact: {plantName}</span>
        </h3>
        <div className="flex items-center mt-1">
          <div className="text-3xl font-bold">
            {metrics.sustainabilityScore.toFixed(1)}
          </div>
          <div className="ml-2 text-sm opacity-90">/ 5.0</div>
          
          {/* Visual score indicator */}
          <div className="ml-auto flex items-center">
            <div className="w-24 bg-white bg-opacity-30 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-white" 
                style={{ width: `${(metrics.sustainabilityScore / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-lg mb-2">Environmental Benefits</h4>

        {/* Main metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-base-200 p-3 rounded-lg">
            <div className="text-sm opacity-70">Carbon Footprint Reduction</div>
            <div className="font-bold text-lg">
              {metrics.totalCarbonSavings.toFixed(2)} kg CO₂e
            </div>
          </div>

          <div className="bg-base-200 p-3 rounded-lg">
            <div className="text-sm opacity-70">Water Conservation</div>
            <div className="font-bold text-lg">{metrics.waterSaved} L</div>
          </div>
        </div>

        {metrics.carbonSequestered > 0 && (
          <div className="alert alert-success mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              This plant helps sequester {metrics.carbonSequestered.toFixed(2)}{" "}
              kg of CO₂ annually!
            </span>
          </div>
        )}

        {/* Biodiversity benefits */}
        {(metrics.biodiversityBonus || metrics.pollinatorSupport) && (
          <div className="alert alert-info mb-4">
            <div className="flex flex-col">
              <span className="font-bold">Additional Benefits:</span>
              <ul className="list-disc list-inside ml-2 text-sm">
                {metrics.biodiversityBonus && <li>Supports biodiversity</li>}
                {metrics.pollinatorSupport && <li>Supports pollinators</li>}
              </ul>
            </div>
          </div>
        )}

        {/* SDG Contributions */}
        <div className="mt-4">
          <h4 className="font-bold text-md mb-2">
            UN Sustainable Development Goals Impact
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {metrics.sdgs && metrics.sdgs.map((sdgKey) => {
              const sdg = sdgGoals[sdgKey];
              if (!sdg) return null;
              return (
                <div
                  key={sdgKey}
                  className="tooltip"
                  data-tip={sdg.description}
                >
                  <div
                    className="flex flex-col items-center p-2 rounded-lg"
                    style={{ backgroundColor: `${sdg.color}20` }}
                  >
                    <div className="text-xl">{sdg.icon}</div>
                    <div className="text-xs font-medium text-center">
                      SDG {sdg.number}
                    </div>
                    <div className="text-xs opacity-70 text-center line-clamp-1">
                      {sdg.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carbon equivalence information */}
        {showDetailedBreakdown && (
          <div className="mt-6">
            <h4 className="font-bold text-lg mb-2">Detailed Breakdown</h4>
            <table className="table table-xs w-full">
              <tbody>
                <tr>
                  <td className="font-medium">Plant Type:</td>
                  <td className="capitalize">{metrics.category}</td>
                </tr>
                <tr>
                  <td className="font-medium">Expected Yield:</td>
                  <td>{metrics.totalYield.toFixed(2)} kg</td>
                </tr>
                <tr>
                  <td className="font-medium">Growing Method:</td>
                  <td>{isOrganic ? "Organic" : "Conventional"}</td>
                </tr>
                {isOrganic && (
                  <tr>
                    <td className="font-medium">Organic Bonus:</td>
                    <td>{metrics.organicBonus.toFixed(2)} kg CO₂e</td>
                  </tr>
                )}
                {metrics.carbonSequestered > 0 && (
                  <tr>
                    <td className="font-medium">Carbon Sequestered:</td>
                    <td>{metrics.carbonSequestered.toFixed(2)} kg CO₂e/year</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="alert alert-info mt-4 p-3 text-sm">
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
              <div>
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
          </div>
        )}

        <div className="mt-4 text-xs opacity-70">
          <p>
            Calculations based on average Irish growing conditions and
            comparison to store-bought produce.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlantSustainabilityInfo;
