import React, { useState } from "react";

const SustainabilityDashboard = ({ metrics, garden }) => {
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'

  // Filter metrics based on time range
  const getFilteredMetrics = () => {
    const now = new Date();
    let cutoffDate;

    if (timeRange === "week") {
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeRange === "month") {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    return metrics
      .filter((metric) => new Date(metric.recordDate) >= cutoffDate)
      .sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));
  };

  const filteredMetrics = getFilteredMetrics();

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (filteredMetrics.length === 0)
      return {
        waterUsage: 0,
        rainwaterHarvested: 0,
        compostAmount: 0,
        foodProduced: 0,
      };

    return filteredMetrics.reduce(
      (summary, metric) => ({
        waterUsage: summary.waterUsage + (metric.waterUsage || 0),
        rainwaterHarvested:
          summary.rainwaterHarvested + (metric.rainwaterHarvested || 0),
        compostAmount: summary.compostAmount + (metric.compostAmount || 0),
        foodProduced: summary.foodProduced + (metric.foodProduced || 0),
      }),
      {
        waterUsage: 0,
        rainwaterHarvested: 0,
        compostAmount: 0,
        foodProduced: 0,
      }
    );
  };

  const summaryMetrics = calculateSummaryMetrics();

  // Calculate water efficiency percentage
  const waterEfficiency =
    summaryMetrics.waterUsage === 0
      ? 100
      : Math.min(
          100,
          Math.round(
            (summaryMetrics.rainwaterHarvested / summaryMetrics.waterUsage) *
              100
          )
        );

  // Calculate trends (compare with previous period)
  const calculateTrends = () => {
    if (filteredMetrics.length < 2)
      return { waterUsage: 0, compostAmount: 0, foodProduced: 0 };

    const halfwayPoint = Math.floor(filteredMetrics.length / 2);
    const recentMetrics = filteredMetrics.slice(halfwayPoint);
    const previousMetrics = filteredMetrics.slice(0, halfwayPoint);

    const recentSum = recentMetrics.reduce(
      (sum, metric) => ({
        waterUsage: sum.waterUsage + (metric.waterUsage || 0),
        compostAmount: sum.compostAmount + (metric.compostAmount || 0),
        foodProduced: sum.foodProduced + (metric.foodProduced || 0),
      }),
      { waterUsage: 0, compostAmount: 0, foodProduced: 0 }
    );

    const previousSum = previousMetrics.reduce(
      (sum, metric) => ({
        waterUsage: sum.waterUsage + (metric.waterUsage || 0),
        compostAmount: sum.compostAmount + (metric.compostAmount || 0),
        foodProduced: sum.foodProduced + (metric.foodProduced || 0),
      }),
      { waterUsage: 0, compostAmount: 0, foodProduced: 0 }
    );

    return {
      waterUsage:
        previousSum.waterUsage === 0
          ? 0
          : ((recentSum.waterUsage - previousSum.waterUsage) /
              previousSum.waterUsage) *
            100,
      compostAmount:
        previousSum.compostAmount === 0
          ? 0
          : ((recentSum.compostAmount - previousSum.compostAmount) /
              previousSum.compostAmount) *
            100,
      foodProduced:
        previousSum.foodProduced === 0
          ? 0
          : ((recentSum.foodProduced - previousSum.foodProduced) /
              previousSum.foodProduced) *
            100,
    };
  };

  const trends = calculateTrends();

  // Simple chart rendering using divs for bar chart
  const renderBarChart = (data, property, label, color) => {
    if (data.length === 0)
      return <div className="text-center py-8">No data available</div>;

    const values = data.map((item) => item[property] || 0);
    const maxValue = Math.max(...values) || 1; // Avoid division by zero

    return (
      <div className="flex items-end h-40 mt-4 space-x-1">
        {data.map((item, index) => {
          const value = item[property] || 0;
          const height = Math.max(5, (value / maxValue) * 100); // Min 5% height for visibility

          return (
            <div key={index} className="flex flex-col items-center flex-grow">
              <div
                className={`${color} rounded-t-sm w-full`}
                style={{ height: `${height}%` }}
                title={`${new Date(
                  item.recordDate
                ).toLocaleDateString()}: ${value} ${label}`}
              ></div>
              {index % Math.ceil(data.length / 8) === 0 && (
                <div className="text-xs text-gray-500 mt-1 -rotate-45 origin-top-left">
                  {new Date(item.recordDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate overall sustainability score (1-100)
  const calculateSustainabilityScore = () => {
    if (filteredMetrics.length === 0) return 50; // Default score

    // Count organic practices
    const organicPracticeCount = filteredMetrics.filter(
      (m) => m.organicPractices
    ).length;
    const organicPracticeRatio = organicPracticeCount / filteredMetrics.length;

    // Count pesticide usage (negative factor)
    const pesticideCount = filteredMetrics.filter(
      (m) => m.pesticidesUsed
    ).length;
    const pesticideRatio = pesticideCount / filteredMetrics.length;

    // Calculate water efficiency ratio
    const waterEfficiencyRatio =
      summaryMetrics.waterUsage === 0
        ? 1
        : Math.min(
            1,
            summaryMetrics.rainwaterHarvested / summaryMetrics.waterUsage
          );

    // Final score calculation (weighted factors)
    let score = 50; // Base score
    score += organicPracticeRatio * 25; // Up to 25 points for organic practices
    score -= pesticideRatio * 25; // Lose up to 25 points for pesticide use
    score += waterEfficiencyRatio * 25; // Up to 25 points for water efficiency

    // Add points for compost and food production
    if (summaryMetrics.compostAmount > 0) score += 10;
    if (summaryMetrics.foodProduced > 0) score += 10;

    // Cap at 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const sustainabilityScore = calculateSustainabilityScore();

  // Helper function for score color
  const getScoreColorClass = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Dashboard Header */}
      <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sustainability Dashboard</h2>

        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "week"
                ? "bg-white text-green-600"
                : "bg-green-700 hover:bg-green-800"
            }`}
            onClick={() => setTimeRange("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "month"
                ? "bg-white text-green-600"
                : "bg-green-700 hover:bg-green-800"
            }`}
            onClick={() => setTimeRange("month")}
          >
            Month
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === "year"
                ? "bg-white text-green-600"
                : "bg-green-700 hover:bg-green-800"
            }`}
            onClick={() => setTimeRange("year")}
          >
            Year
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Overall Score */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <h3 className="text-sm uppercase text-gray-500 mb-1">
              Sustainability Score
            </h3>
            <div
              className={`text-3xl font-bold ${getScoreColorClass(
                sustainabilityScore
              )}`}
            >
              {sustainabilityScore}
            </div>
            <div className="text-xs mt-2">
              {sustainabilityScore >= 80
                ? "Excellent"
                : sustainabilityScore >= 60
                ? "Good"
                : sustainabilityScore >= 40
                ? "Average"
                : sustainabilityScore >= 20
                ? "Needs Improvement"
                : "Poor"}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  sustainabilityScore >= 80
                    ? "bg-green-600"
                    : sustainabilityScore >= 60
                    ? "bg-green-500"
                    : sustainabilityScore >= 40
                    ? "bg-yellow-500"
                    : sustainabilityScore >= 20
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${sustainabilityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Water Usage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm uppercase text-gray-500 mb-1">
              Water Usage
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {summaryMetrics.waterUsage.toFixed(1)}{" "}
              <span className="text-sm font-normal">L</span>
            </div>
            <div className="flex items-center mt-1 text-xs">
              {trends.waterUsage > 0 ? (
                <span className="text-red-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.waterUsage).toFixed(1)}% vs. previous period
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l3.293-3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L15.586 13H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.waterUsage).toFixed(1)}% vs. previous period
                </span>
              )}
            </div>
          </div>

          {/* Compost Used */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm uppercase text-gray-500 mb-1">
              Compost Used
            </h3>
            <div className="text-2xl font-bold text-amber-600">
              {summaryMetrics.compostAmount.toFixed(1)}{" "}
              <span className="text-sm font-normal">kg</span>
            </div>
            <div className="flex items-center mt-1 text-xs">
              {trends.compostAmount < 0 ? (
                <span className="text-red-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l3.293-3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L15.586 13H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.compostAmount).toFixed(1)}% vs. previous
                  period
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.compostAmount).toFixed(1)}% vs. previous
                  period
                </span>
              )}
            </div>
          </div>

          {/* Food Produced */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm uppercase text-gray-500 mb-1">
              Food Produced
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {summaryMetrics.foodProduced.toFixed(1)}{" "}
              <span className="text-sm font-normal">kg</span>
            </div>
            <div className="flex items-center mt-1 text-xs">
              {trends.foodProduced < 0 ? (
                <span className="text-red-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l3.293-3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L15.586 13H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.foodProduced).toFixed(1)}% vs. previous
                  period
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {Math.abs(trends.foodProduced).toFixed(1)}% vs. previous
                  period
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Water Usage Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Water Management
          </h3>

          {/* Water Efficiency Meter */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm text-gray-600">
                Rainwater Harvesting Efficiency
              </h4>
              <span
                className={`text-sm font-medium ${
                  waterEfficiency >= 80
                    ? "text-green-600"
                    : waterEfficiency >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {waterEfficiency}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  waterEfficiency >= 80
                    ? "bg-green-600"
                    : waterEfficiency >= 50
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${waterEfficiency}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summaryMetrics.rainwaterHarvested.toFixed(1)} L harvested /{" "}
              {summaryMetrics.waterUsage.toFixed(1)} L used
            </div>
          </div>

          {/* Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600 mb-2">
                Water Usage Over Time
              </h4>
              {renderBarChart(
                filteredMetrics,
                "waterUsage",
                "L",
                "bg-blue-400"
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600 mb-2">
                Rainwater Harvested Over Time
              </h4>
              {renderBarChart(
                filteredMetrics,
                "rainwaterHarvested",
                "L",
                "bg-sky-400"
              )}
            </div>
          </div>
        </div>

        {/* Garden Production */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Garden Production
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600 mb-2">
                Food Produced Over Time
              </h4>
              {renderBarChart(
                filteredMetrics,
                "foodProduced",
                "kg",
                "bg-green-400"
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm text-gray-600 mb-2">
                Compost Added Over Time
              </h4>
              {renderBarChart(
                filteredMetrics,
                "compostAmount",
                "kg",
                "bg-amber-400"
              )}
            </div>
          </div>
        </div>

        {/* Sustainability Practices */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Sustainable Practices
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-600 mb-2">
                  Organic Practices
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    {filteredMetrics.length > 0 && (
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (filteredMetrics.filter((m) => m.organicPractices)
                              .length /
                              filteredMetrics.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {filteredMetrics.length > 0
                      ? Math.round(
                          (filteredMetrics.filter((m) => m.organicPractices)
                            .length /
                            filteredMetrics.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-600 mb-2">
                  Chemical Pesticide Usage
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    {filteredMetrics.length > 0 && (
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (filteredMetrics.filter((m) => m.pesticidesUsed)
                              .length /
                              filteredMetrics.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {filteredMetrics.length > 0
                      ? Math.round(
                          (filteredMetrics.filter((m) => m.pesticidesUsed)
                            .length /
                            filteredMetrics.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips based on metrics */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-md font-medium text-green-800 mb-2">
            Sustainability Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {waterEfficiency < 50 && (
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Consider expanding your rainwater harvesting system. Even a
                small rain barrel can collect thousands of liters annually in
                Ireland's climate.
              </li>
            )}

            {filteredMetrics.some((m) => m.pesticidesUsed) && (
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Try natural pest control methods like companion planting or
                introducing beneficial insects before resorting to chemical
                pesticides.
              </li>
            )}

            {summaryMetrics.compostAmount === 0 && (
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Start composting kitchen waste to create nutrient-rich soil for
                your garden while reducing landfill waste.
              </li>
            )}

            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-600 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Consider adding native Irish plants to your garden. They're
              adapted to local conditions and support local wildlife.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;
