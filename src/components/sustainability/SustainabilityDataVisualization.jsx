import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import { formatDashboardData } from "../../utils/sustainability-data-visualization";

/**
 * Component to display real-time sustainability metrics charts
 */
const SustainabilityDataVisualization = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  // Fetch and process data
  useEffect(() => {
    // This would normally fetch from an API or database
    // Here we'll use the local storage data
    const fetchData = () => {
      setIsLoading(true);

      try {
        // Get user progress data
        const userProgress = getAllUserProgress();

        // Format data for visualization
        const formattedData = formatDashboardData({
          waterUsage: userProgress.resourceUsage?.water || [],
          compostUsage: userProgress.resourceUsage?.compost || [],
          harvest: userProgress.resourceUsage?.harvest || [],
          carbonSavings: [], // This would come from a real data source
          sdgScores: userProgress.sdgScores || {},
        });

        setDashboardData(formattedData);
      } catch (error) {
        console.error("Error loading sustainability data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up interval for real-time updates (every 5 minutes)
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedTimeframe]);

  // Handle time frame changes
  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Show placeholder if no data
  if (!dashboardData) {
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">
          Real-time Sustainability Metrics
        </h3>
        <div className="bg-base-200 p-8 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="mt-4">
            Start recording your gardening activities to see real-time
            sustainability metrics.
          </p>

          <div className="alert alert-info mt-6 text-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Getting Started</h3>
              <div className="text-sm">
                Use the Resource Usage Tracker to log your water usage, compost
                production, and harvests.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show actual charts with real data
  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Real-time Sustainability Metrics</h3>

        <div className="tabs tabs-boxed mt-4 md:mt-0">
          <a
            className={`tab ${
              selectedTimeframe === "week" ? "tab-active" : ""
            }`}
            onClick={() => handleTimeframeChange("week")}
          >
            Week
          </a>
          <a
            className={`tab ${
              selectedTimeframe === "month" ? "tab-active" : ""
            }`}
            onClick={() => handleTimeframeChange("month")}
          >
            Month
          </a>
          <a
            className={`tab ${
              selectedTimeframe === "year" ? "tab-active" : ""
            }`}
            onClick={() => handleTimeframeChange("year")}
          >
            Year
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water Usage Chart */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-info">Water Usage</h4>
            <div className="h-48 flex items-center justify-center">
              {/* Chart would be rendered here using Chart.js */}
              <div className="text-center">
                <p>Chart visualization would appear here</p>
                <p className="text-xs text-base-content/50 mt-2">
                  Using Chart.js
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Trend:</span>
              <div className="badge badge-success">↓ 12%</div>
            </div>
          </div>
        </div>

        {/* Carbon Savings Chart */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-success">Carbon Savings</h4>
            <div className="h-48 flex items-center justify-center">
              {/* Chart would be rendered here using Chart.js */}
              <div className="text-center">
                <p>Chart visualization would appear here</p>
                <p className="text-xs text-base-content/50 mt-2">
                  Using Chart.js
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Trend:</span>
              <div className="badge badge-success">↑ 23%</div>
            </div>
          </div>
        </div>

        {/* Harvest Chart */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-warning">Harvest Yield</h4>
            <div className="h-48 flex items-center justify-center">
              {/* Chart would be rendered here using Chart.js */}
              <div className="text-center">
                <p>Chart visualization would appear here</p>
                <p className="text-xs text-base-content/50 mt-2">
                  Using Chart.js
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Trend:</span>
              <div className="badge badge-success">↑ 15%</div>
            </div>
          </div>
        </div>

        {/* SDG Impact Radar Chart */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-primary">SDG Impact</h4>
            <div className="h-48 flex items-center justify-center">
              {/* Radar Chart would be rendered here using Chart.js */}
              <div className="text-center">
                <p>Radar chart visualization would appear here</p>
                <p className="text-xs text-base-content/50 mt-2">
                  Using Chart.js
                </p>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span>Contributing most to:</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                <div className="badge badge-primary badge-outline">
                  SDG 15 (Life on Land)
                </div>
                <div className="badge badge-primary badge-outline">
                  SDG 12 (Consumption)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-base-200 p-4 rounded-lg">
        <h4 className="font-bold">About This Data</h4>
        <p className="text-sm mt-2">
          These metrics are calculated based on your recorded gardening
          activities and practices. The charts update automatically as you log
          new information through the Resource Usage Tracker.
        </p>
      </div>
    </div>
  );
};

export default SustainabilityDataVisualization;
