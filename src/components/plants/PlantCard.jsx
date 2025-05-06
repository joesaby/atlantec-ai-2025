import React from "react";

const PlantCard = ({ plant, showActions = true }) => {
  // Calculate sustainability score (1-10 scale)
  const getSustainabilityScore = () => {
    let score = 5; // Default middle score

    // Add points for positive sustainability traits
    if (plant.nativeToIreland) score += 2;
    if (plant.pollinatorFriendly) score += 1;
    if (plant.waterNeeds === "Low") score += 1;
    if (plant.pestResistant) score += 1;

    // Cap the score at 10
    return Math.min(10, score);
  };

  const sustainabilityScore = getSustainabilityScore();

  // Helper function to get color class based on sustainability score
  const getScoreColorClass = (score) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-green-400";
    if (score >= 4) return "bg-yellow-400";
    return "bg-orange-400";
  };

  const scoreColorClass = getScoreColorClass(sustainabilityScore);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Plant Image or Placeholder */}
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.commonName}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <span className="text-green-700 text-3xl font-bold">
              {plant.commonName.charAt(0)}
            </span>
          </div>
        )}

        {/* Native Badge */}
        {plant.nativeToIreland && (
          <span className="absolute top-2 right-2 bg-green-700 text-white text-xs px-2 py-1 rounded-full">
            Native
          </span>
        )}

        {/* Sustainability Score Badge */}
        <div className="absolute bottom-2 right-2 flex items-center">
          <span
            className={`text-xs text-white px-2 py-1 rounded-full ${scoreColorClass}`}
          >
            {sustainabilityScore}/10
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">
          {plant.commonName}
        </h3>
        <p className="text-sm text-gray-500 italic mb-2">{plant.latinName}</p>

        {/* Plant Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {plant.pollinatorFriendly && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              Bee Friendly
            </span>
          )}

          {plant.edible && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              Edible
            </span>
          )}

          {plant.medicinal && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Medicinal
            </span>
          )}

          {plant.pestResistant && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Pest Resistant
            </span>
          )}
        </div>

        {/* Growing Conditions */}
        <div className="flex items-center mb-3 text-sm">
          {/* Sun Icon */}
          <div className="flex items-center mr-3" title="Sun Requirements">
            <svg
              className="h-4 w-4 text-amber-500 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{plant.sunNeeds || "Partial Shade"}</span>
          </div>

          {/* Water Icon */}
          <div className="flex items-center mr-3" title="Water Requirements">
            <svg
              className="h-4 w-4 text-blue-500 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <span>{plant.waterNeeds || "Medium"}</span>
          </div>

          {/* Hardiness */}
          <div className="flex items-center" title="Hardiness Zone">
            <svg
              className="h-4 w-4 text-green-500 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>{plant.hardiness || "H3"}</span>
          </div>
        </div>

        {/* Plant Description (shortened) */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {plant.description || "A wonderful plant for Irish gardens."}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="flex justify-between">
            <a
              href={`/plants/${plant.id}`}
              className="text-green-600 hover:underline text-sm font-medium"
            >
              Plant Details
            </a>
            <button className="text-gray-600 hover:text-green-600 text-sm flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add to Garden
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCard;
