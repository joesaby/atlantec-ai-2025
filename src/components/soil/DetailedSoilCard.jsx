// src/components/soil/DetailedSoilCard.jsx
// A detailed soil information card with additional Teagasc data

import React, { useState } from "react";

/**
 * DetailedSoilCard component to display comprehensive soil information
 * including detailed Teagasc data and visualizations
 *
 * @param {Object} props
 * @param {Object} props.soilData - The soil data object from getSoilDataByLocation
 * @param {string} props.className - Additional CSS classes to apply
 */
const DetailedSoilCard = ({ soilData, className = "" }) => {
  const [activeTab, setActiveTab] = useState("general");

  if (!soilData) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
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
            <span>
              Soil data could not be loaded. Please try selecting a different
              county.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Safely access properties with fallbacks
  const properties = soilData.properties || {};
  const phRange = properties.ph || { min: 5.0, max: 7.0 };
  const soilType = soilData.soilType || "unknown";

  // Generate a CSS RGB color from the soil color if available
  const soilColorStyle = soilData?.teagasc?.color
    ? {
        backgroundColor: `rgba(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b}, 0.05)`,
        borderLeft: `5px solid rgb(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b})`,
      }
    : {};

  return (
    <div
      className={`card bg-base-100 shadow-xl ${className}`}
      style={soilColorStyle}
    >
      <div className="card-body">
        <div className="mb-6">
          <h2 className="card-title text-2xl flex items-center">
            {soilData?.teagasc?.color && (
              <div
                className="w-6 h-6 rounded-full inline-block mr-2 border border-base-300"
                style={{
                  backgroundColor: `rgb(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b})`,
                }}
              />
            )}
            {soilData.soilName || "Unknown Soil Type"}
          </h2>
          <div className="flex gap-3 mt-1">
            <span className="capitalize">
              {soilData.county || "Unknown Location"}
            </span>
            <span className="badge badge-outline capitalize">
              {soilType.replace("-", " ")}
            </span>
          </div>
        </div>

        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === "general" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === "properties" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </button>
          <button
            className={`tab ${
              activeTab === "recommendations" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("recommendations")}
          >
            Recommendations
          </button>
          {soilData.teagasc && (
            <button
              className={`tab ${activeTab === "teagasc" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("teagasc")}
            >
              Teagasc Data
            </button>
          )}
        </div>

        <div className="min-h-[300px]">
          {activeTab === "general" && (
            <div>
              <p className="mb-6">
                {soilData.description ||
                  "No detailed description available for this soil type."}
              </p>
              <div>
                <h3 className="font-bold text-lg mb-3">Soil Overview</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <tbody>
                      <tr>
                        <th className="w-1/3">Name</th>
                        <td>{soilData.soilName || "Unknown"}</td>
                      </tr>
                      <tr>
                        <th>Type</th>
                        <td className="capitalize">
                          {soilType.replace("-", " ")}
                        </td>
                      </tr>
                      <tr>
                        <th>County</th>
                        <td>{soilData.county || "Unknown"}</td>
                      </tr>
                      <tr>
                        <th>Source</th>
                        <td>{soilData.source || "Unknown"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "properties" && (
            <div>
              <div className="card bg-base-200 shadow-sm mb-6">
                <div className="card-body">
                  <h3 className="card-title text-lg">pH Range</h3>
                  <div className="mt-2">
                    <div className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full relative">
                      <div
                        className="absolute w-3 h-3 bg-white border-2 border-black rounded-full -translate-x-1/2 top-0"
                        style={{
                          left: `${
                            ((phRange.min + phRange.max) / 2 / 14) * 100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="absolute h-3 bg-white bg-opacity-30 rounded-full"
                        style={{
                          left: `${(phRange.min / 14) * 100}%`,
                          width: `${((phRange.max - phRange.min) / 14) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs opacity-70">
                      <span>0</span>
                      <span>7</span>
                      <span>14</span>
                    </div>
                    <div className="text-center font-bold mt-2">
                      {phRange.min} - {phRange.max}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Texture</h3>
                    <p>{properties.texture || "Unknown"}</p>
                  </div>
                </div>
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Nutrients</h3>
                    <p>{properties.nutrients || "Unknown"}</p>
                  </div>
                </div>
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <h3 className="card-title text-lg">Drainage</h3>
                    <p>{properties.drainage || "Unknown"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div>
              <h3 className="font-bold text-lg mb-3">
                Soil Management Recommendations
              </h3>
              {soilData.recommendations &&
              soilData.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {soilData.recommendations.map((rec, index) => (
                    <div key={index} className="alert bg-base-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-info shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert bg-base-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    No specific recommendations available for this soil type.
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "teagasc" && soilData.teagasc && (
            <div>
              <h3 className="font-bold text-lg mb-3">
                Teagasc Soil Classification
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <tbody>
                    {soilData.teagasc.associationId && (
                      <tr>
                        <th className="w-1/3">Association ID</th>
                        <td>{soilData.teagasc.associationId}</td>
                      </tr>
                    )}
                    {soilData.teagasc.associationName && (
                      <tr>
                        <th>Association Name</th>
                        <td>{soilData.teagasc.associationName}</td>
                      </tr>
                    )}
                    {soilData.teagasc.seriesId && (
                      <tr>
                        <th>Series ID</th>
                        <td>{soilData.teagasc.seriesId}</td>
                      </tr>
                    )}
                    {soilData.teagasc.seriesName && (
                      <tr>
                        <th>Series Name</th>
                        <td>{soilData.teagasc.seriesName}</td>
                      </tr>
                    )}
                    {soilData.teagasc.textureSubstrateType && (
                      <tr>
                        <th>Substrate Type</th>
                        <td>{soilData.teagasc.textureSubstrateType}</td>
                      </tr>
                    )}
                    {soilData.teagasc.color && (
                      <tr>
                        <th>Soil Color</th>
                        <td className="flex items-center">
                          <div
                            className="w-5 h-5 rounded-full inline-block mr-2 border border-base-300"
                            style={{
                              backgroundColor: `rgb(${soilData.teagasc.color.r}, ${soilData.teagasc.color.g}, ${soilData.teagasc.color.b})`,
                            }}
                          />
                          RGB ({soilData.teagasc.color.r},{" "}
                          {soilData.teagasc.color.g}, {soilData.teagasc.color.b}
                          )
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="card-actions justify-center mt-6 pt-4 border-t border-base-300">
          <div className="text-xs opacity-50">
            Data provided by Teagasc Irish Soil Information System
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedSoilCard;
