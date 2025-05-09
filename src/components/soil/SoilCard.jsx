// src/components/soil/SoilCard.jsx
// A reusable card component to display detailed soil information

import React from "react";

/**
 * SoilCard component to display soil information in a visually appealing card format
 *
 * @param {Object} props
 * @param {Object} props.soilData - The soil data object from getSoilDataByLocation
 * @param {boolean} props.compact - Whether to show a compact version of the card
 * @param {string} props.className - Additional CSS classes to apply
 */
const SoilCard = ({ soilData, compact = false, className = "" }) => {
  if (!soilData) {
    return (
      <div
        className={`card ${
          compact ? "p-3" : "p-5"
        } bg-base-100 shadow-md ${className}`}
      >
        <div className="card-body p-0">
          <div className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Soil data could not be loaded</span>
          </div>
        </div>
      </div>
    );
  }

  // Generate a CSS RGB color from the soil color if available
  const soilColorStyle = soilData?.teagasc?.color
    ? {
        backgroundColor: `rgba(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b}, 0.1)`,
        borderLeft: `4px solid rgb(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b})`,
      }
    : {};

  // Safely access properties with fallbacks
  const properties = soilData.properties || {};
  const phRange = properties.ph || { min: 5.0, max: 7.0 };

  return (
    <div
      className={`card ${
        compact ? "p-3" : "p-5"
      } bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}
      style={soilColorStyle}
    >
      <div className="card-body p-0">
        <div className="mb-4 pb-3 border-b border-base-200">
          <h3 className="card-title text-xl font-bold">
            {soilData.soilName || "Unknown Soil"}
          </h3>
          <div className="text-sm opacity-70">
            {soilData.county || "Location Unknown"}
          </div>
        </div>

        {!compact && (
          <div className="mb-4">
            <p className="text-sm">
              {soilData.description || "No description available."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="bg-base-200 p-2 rounded-md">
            <span className="block text-xs font-semibold opacity-70">
              pH Range
            </span>
            <span className="block font-medium">
              {phRange.min} - {phRange.max}
            </span>
          </div>
          <div className="bg-base-200 p-2 rounded-md">
            <span className="block text-xs font-semibold opacity-70">
              Texture
            </span>
            <span className="block font-medium">
              {properties.texture || "Unknown"}
            </span>
          </div>
          <div className="bg-base-200 p-2 rounded-md">
            <span className="block text-xs font-semibold opacity-70">
              Nutrients
            </span>
            <span className="block font-medium">
              {properties.nutrients || "Unknown"}
            </span>
          </div>
          <div className="bg-base-200 p-2 rounded-md">
            <span className="block text-xs font-semibold opacity-70">
              Drainage
            </span>
            <span className="block font-medium">
              {properties.drainage || "Unknown"}
            </span>
          </div>
        </div>

        {!compact &&
          soilData.recommendations &&
          soilData.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-sm mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {soilData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

        {!compact && soilData.teagasc && (
          <div className="mb-4 pt-3 border-t border-base-200">
            <details className="collapse collapse-arrow bg-base-200 rounded-md">
              <summary className="collapse-title text-sm font-medium">
                Teagasc Soil Details
              </summary>
              <div className="collapse-content text-sm">
                {soilData.teagasc.associationName && (
                  <div className="mb-2">
                    <span className="font-semibold opacity-70 block">
                      Association:
                    </span>
                    <span>{soilData.teagasc.associationName}</span>
                  </div>
                )}
                {soilData.teagasc.seriesName && (
                  <div className="mb-2">
                    <span className="font-semibold opacity-70 block">
                      Series:
                    </span>
                    <span>{soilData.teagasc.seriesName}</span>
                  </div>
                )}
                {soilData.teagasc.textureSubstrateType && (
                  <div className="mb-2">
                    <span className="font-semibold opacity-70 block">
                      Substrate Type:
                    </span>
                    <span>{soilData.teagasc.textureSubstrateType}</span>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        <div className="card-actions justify-end text-right pt-2 border-t border-base-200">
          <small className="text-xs opacity-50">
            Source: {soilData.source || "Unknown"}
          </small>
        </div>
      </div>
    </div>
  );
};

export default SoilCard;
