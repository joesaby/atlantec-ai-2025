import React from "react";

const PlantSustainabilityInfo = ({ plant }) => {
  // Default values if plant data is incomplete
  const defaultPlant = {
    name: "Unknown Plant",
    waterNeeds: "medium",
    sustainabilityRating: 3,
    nativeToIreland: false,
    pollinatorFriendly: false,
    companionPlants: [],
    sustainabilityNotes: "No sustainability information available.",
  };

  // Merge provided data with defaults
  const plantData = { ...defaultPlant, ...plant };

  // Calculate sustainability metrics
  const getSustainabilityColor = (rating) => {
    if (rating >= 4.5) return "success";
    if (rating >= 3.5) return "success-content";
    if (rating >= 2.5) return "warning";
    return "error";
  };

  const getWaterNeedsLabel = (needs) => {
    switch (needs.toLowerCase()) {
      case "low":
        return { label: "Low Water Needs", icon: "💧", color: "success" };
      case "medium":
        return {
          label: "Moderate Water Needs",
          icon: "💧💧",
          color: "warning",
        };
      case "high":
        return { label: "High Water Needs", icon: "💧💧💧", color: "error" };
      default:
        return { label: "Unknown Water Needs", icon: "❓", color: "info" };
    }
  };

  const waterNeeds = getWaterNeedsLabel(plantData.waterNeeds);
  const sustainabilityColor = getSustainabilityColor(
    plantData.sustainabilityRating
  );

  return (
    <div className="bg-base-100 rounded-lg shadow p-4">
      <h3 className="font-bold text-lg mb-2">Sustainability Information</h3>

      <div className="flex justify-between items-center mb-3">
        <span>Sustainability Rating:</span>
        <div className={`badge badge-${sustainabilityColor} gap-1`}>
          {plantData.sustainabilityRating}/5
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-4 h-4 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      </div>

      <div className="divider my-1"></div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Water Requirements:</span>
          <span className={`text-${waterNeeds.color}`}>
            {waterNeeds.icon} {waterNeeds.label}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Native to Ireland:</span>
          <span>
            {plantData.nativeToIreland ? (
              <span className="text-success">✓ Yes</span>
            ) : (
              <span className="text-base-content">✗ No</span>
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Pollinator Friendly:</span>
          <span>
            {plantData.pollinatorFriendly ? (
              <span className="text-success">✓ Yes 🐝</span>
            ) : (
              <span className="text-base-content">✗ No</span>
            )}
          </span>
        </div>

        <div className="text-sm">
          <div className="mb-1">Companion Plants:</div>
          {plantData.companionPlants && plantData.companionPlants.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {plantData.companionPlants.map((companion, index) => (
                <span key={index} className="badge badge-outline badge-sm">
                  {companion}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-base-content/70">
              No companion plants specified
            </span>
          )}
        </div>
      </div>

      <div className="divider my-2"></div>

      <div className="mt-2">
        <h4 className="font-semibold text-sm mb-1">Sustainability Notes:</h4>
        <p className="text-sm">{plantData.sustainabilityNotes}</p>
      </div>

      {plantData.sustainabilityRating >= 4 && (
        <div className="mt-4 bg-success/10 p-2 rounded-lg text-xs">
          <span className="font-bold">Eco-friendly Choice!</span> This plant is
          highly sustainable and great for Irish gardens.
        </div>
      )}
    </div>
  );
};

export default PlantSustainabilityInfo;
