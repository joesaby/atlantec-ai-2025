import React, { useState, useEffect, useRef } from "react";
import {
  getAllUserProgress,
  calculateNetCarbonImpact,
} from "../../utils/sustainability-store";
import { onSustainabilityEvent } from "../../utils/sustainability-events";
import Chart from "chart.js/auto";

const CarbonFootprintInsights = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [carbonData, setCarbonData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("monthly");
  const [selectedView, setSelectedView] = useState("emissions");
  const [carbonMetrics, setCarbonMetrics] = useState({
    totalEmissions: 0,
    totalReductions: 0,
    netImpact: 0,
    trend: "stable",
    highestSource: null,
  });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Extract carbon data
    const carbonUsage = progress.resourceUsage.carbon || [];
    setCarbonData(carbonUsage);

    // Calculate carbon metrics
    calculateCarbonMetrics(carbonUsage);

    // Set up event listeners for carbon data updates
    const removeUsageListener = onSustainabilityEvent(
      "resource-usage-updated",
      (event) => {
        if (event.detail.resourceType === "carbon") {
          refreshData();
        }
      }
    );

    const removeOffsetListener = onSustainabilityEvent(
      "carbon-offset-recorded",
      () => {
        refreshData();
      }
    );

    // Clean up
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      if (removeUsageListener) removeUsageListener();
      if (removeOffsetListener) removeOffsetListener();
    };
  }, []);

  // Function to refresh data
  const refreshData = () => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    const carbonUsage = progress.resourceUsage.carbon || [];
    setCarbonData(carbonUsage);

    calculateCarbonMetrics(carbonUsage);
  };

  // Create chart when carbon data is available or timeframe/view changes
  useEffect(() => {
    if (carbonData.length > 0 && chartRef.current) {
      renderCarbonChart();
    }
  }, [carbonData, selectedTimeframe, selectedView]);

  const calculateCarbonMetrics = (carbonData) => {
    if (!carbonData || carbonData.length === 0) {
      setCarbonMetrics({
        totalEmissions: 0,
        totalReductions: 0,
        netImpact: 0,
        trend: "stable",
        highestSource: null,
      });
      return;
    }

    // Use the centralized utility function to calculate emissions and reductions
    const { emissions, reductions, netImpact } = calculateNetCarbonImpact();

    // Calculate sources for tracking the highest emission source
    const sourceEmissions = {};

    carbonData.forEach((entry) => {
      const amount = parseFloat(entry.amount || 0);
      // Only track positive amounts (emissions) by source
      if (amount > 0 && entry.metadata && entry.metadata.activity) {
        const activity = entry.metadata.activity;
        sourceEmissions[activity] = (sourceEmissions[activity] || 0) + amount;
      }
    });

    // Find highest emission source
    let highestSource = null;
    let highestAmount = 0;

    Object.entries(sourceEmissions).forEach(([source, amount]) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestSource = source;
      }
    });

    // Determine trend (last 3 entries vs previous 3)
    const sortedData = [...carbonData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const recent = sortedData.slice(0, 3);
    const previous = sortedData.slice(3, 6);

    let trend = "stable";
    if (recent.length && previous.length) {
      const recentNet = recent.reduce(
        (sum, entry) => sum + parseFloat(entry.amount || 0),
        0
      );
      const previousNet = previous.reduce(
        (sum, entry) => sum + parseFloat(entry.amount || 0),
        0
      );

      if (recentNet < previousNet)
        trend = "improving"; // Lower emissions/higher reductions
      else if (recentNet > previousNet) trend = "worsening"; // Higher emissions/lower reductions
    }

    // Update metrics
    setCarbonMetrics({
      totalEmissions: Math.round(emissions * 10) / 10,
      totalReductions: Math.round(reductions * 10) / 10,
      netImpact: Math.round(netImpact * 10) / 10,
      trend,
      highestSource: highestSource ? getActivityName(highestSource) : null,
    });
  };

  const getActivityName = (activityId) => {
    const activities = {
      transport: "Garden-related Transport",
      equipment: "Equipment Usage",
      materials: "Purchased Materials",
      custom: "Custom Entry",
    };

    return activities[activityId] || activityId;
  };

  const renderCarbonChart = () => {
    if (!chartRef.current) return;

    // Sort data by date
    const sortedData = [...carbonData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Group data based on selected timeframe
    let groupedData;
    switch (selectedTimeframe) {
      case "weekly":
        groupedData = groupByWeek(sortedData);
        break;
      case "yearly":
        groupedData = groupByYear(sortedData);
        break;
      case "monthly":
      default:
        groupedData = groupByMonth(sortedData);
        break;
    }

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // Prepare data based on selected view
    let datasets = [];

    if (selectedView === "emissions") {
      // Split into emissions and reductions
      const emissionsData = {};
      const reductionsData = {};

      Object.keys(groupedData).forEach((key) => {
        emissionsData[key] = 0;
        reductionsData[key] = 0;

        groupedData[key].entries.forEach((entry) => {
          const amount = parseFloat(entry.amount || 0);
          if (amount >= 0) {
            emissionsData[key] += amount;
          } else {
            reductionsData[key] += Math.abs(amount);
          }
        });
      });

      datasets = [
        {
          label: "Emissions (kg CO₂e)",
          data: Object.keys(groupedData).map((key) => emissionsData[key]),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
        {
          label: "Reductions (kg CO₂e)",
          data: Object.keys(groupedData).map((key) => reductionsData[key]),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
        },
      ];
    } else if (selectedView === "activities") {
      // Group by activity type
      const activityData = {};

      carbonData.forEach((entry) => {
        if (entry.metadata && entry.metadata.activity) {
          const activity = getActivityName(entry.metadata.activity);
          if (!activityData[activity]) {
            activityData[activity] = 0;
          }
          activityData[activity] += parseFloat(entry.amount || 0);
        }
      });

      // Create pie chart data
      datasets = [
        {
          data: Object.values(activityData),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 206, 86)",
            "rgb(75, 192, 192)",
            "rgb(153, 102, 255)",
          ],
          borderWidth: 1,
        },
      ];
    } else {
      // Net impact (emissions - reductions)
      datasets = [
        {
          label: "Net Carbon Impact (kg CO₂e)",
          data: Object.keys(groupedData).map((key) => {
            let netImpact = 0;
            groupedData[key].entries.forEach((entry) => {
              netImpact += parseFloat(entry.amount || 0);
            });
            return netImpact;
          }),
          backgroundColor: (context) => {
            const value = context.raw;
            return value < 0
              ? "rgba(75, 192, 192, 0.5)" // Green for negative (good)
              : "rgba(255, 99, 132, 0.5)"; // Red for positive (bad)
          },
          borderColor: (context) => {
            const value = context.raw;
            return value < 0
              ? "rgb(75, 192, 192)" // Green for negative (good)
              : "rgb(255, 99, 132)"; // Red for positive (bad)
          },
          borderWidth: 1,
        },
      ];
    }

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: selectedView === "activities" ? "pie" : "bar",
      data: {
        labels:
          selectedView === "activities"
            ? Object.keys(activityData || {})
            : Object.keys(groupedData),
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales:
          selectedView === "activities"
            ? {}
            : {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Carbon (kg CO₂e)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text:
                      selectedTimeframe === "monthly"
                        ? "Month"
                        : selectedTimeframe === "weekly"
                        ? "Week"
                        : "Year",
                  },
                },
              },
      },
    });
  };

  const groupByMonth = (data) => {
    const months = {};

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;

      if (!months[monthYear]) {
        months[monthYear] = {
          entries: [],
          total: 0,
        };
      }

      months[monthYear].entries.push(entry);
      months[monthYear].total += parseFloat(entry.amount || 0);
    });

    return months;
  };

  const groupByWeek = (data) => {
    const weeks = {};

    data.forEach((entry) => {
      const date = new Date(entry.date);
      // Create a date for the Monday of this week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      const mondayDate = new Date(date);
      mondayDate.setDate(diff);

      const weekKey = `Week of ${mondayDate.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      })}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          entries: [],
          total: 0,
        };
      }

      weeks[weekKey].entries.push(entry);
      weeks[weekKey].total += parseFloat(entry.amount || 0);
    });

    return weeks;
  };

  const groupByYear = (data) => {
    const years = {};

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear().toString();

      if (!years[year]) {
        years[year] = {
          entries: [],
          total: 0,
        };
      }

      years[year].entries.push(entry);
      years[year].total += parseFloat(entry.amount || 0);
    });

    return years;
  };

  const getCarbonReductionTips = () => {
    // Base tips everyone can benefit from
    const baseTips = [
      "Use manual garden tools where possible to eliminate emissions from power tools",
      "Purchase garden supplies in bulk to reduce transportation emissions",
      "Choose locally produced compost and soil to minimize supply chain emissions",
    ];

    // Add specific tips based on highest emission source
    const specificTips = [];

    if (carbonMetrics.highestSource) {
      switch (carbonMetrics.highestSource) {
        case "Garden-related Transport":
          specificTips.push(
            "Plan combined trips for garden supplies to reduce transport emissions"
          );
          specificTips.push(
            "Consider joining a local seed and plant exchange to reduce travel"
          );
          break;
        case "Equipment Usage":
          specificTips.push(
            "Maintain your equipment properly to ensure optimal efficiency"
          );
          specificTips.push(
            "Consider switching to electric tools charged with renewable energy"
          );
          break;
        case "Purchased Materials":
          specificTips.push(
            "Make your own compost to reduce emissions from purchased soil amendments"
          );
          specificTips.push(
            "Reuse containers and pots rather than buying new plastic ones"
          );
          break;
      }
    }

    return [...baseTips, ...specificTips];
  };

  const getIrishContextTip = () => {
    // Return a relevant tip for carbon reduction in Irish context
    const tips = [
      "In Ireland's mild climate, cold frames and cloches can extend the growing season without energy-intensive heated greenhouses.",
      "Ireland's abundant rainfall means you can rely largely on rainwater harvesting rather than treated water, saving both carbon and money.",
      "Irish peatlands are vital carbon sinks - using peat-free compost helps preserve these important ecosystems.",
    ];

    // Randomly select one tip
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const getEmissionEquivalent = () => {
    // Provide everyday equivalents for the carbon metrics
    if (carbonMetrics.netImpact === 0) return null;

    // If net impact is positive, show equivalents for emissions
    // If net impact is negative, show equivalents for carbon saved
    const absValue = Math.abs(carbonMetrics.netImpact);

    // Roughly 2.3 kg CO2e for driving 10km in avg car
    const carKm = (absValue / 0.23).toFixed(1);

    // Roughly 0.5 kg CO2e for 1kWh of electricity
    const kWh = (absValue / 0.5).toFixed(1);

    // Tree absorbs roughly 25kg CO2e per year
    const treeDays = (absValue / (25 / 365)).toFixed(0);

    return {
      carKm,
      kWh,
      treeDays,
    };
  };

  if (!userProgress) {
    return <div className="loading loading-spinner loading-md"></div>;
  }

  const equivalents = getEmissionEquivalent();

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Carbon Footprint Insights</h3>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Emissions Tracked</div>
          <div className="stat-value text-error">
            {carbonMetrics.totalEmissions} kg
          </div>
          <div className="stat-desc">CO₂ equivalent</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Reductions Tracked</div>
          <div className="stat-value text-success">
            {carbonMetrics.totalReductions} kg
          </div>
          <div className="stat-desc">CO₂ equivalent</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Net Carbon Impact</div>
          <div
            className={`stat-value ${
              carbonMetrics.netImpact < 0 ? "text-success" : "text-error"
            }`}
          >
            {carbonMetrics.netImpact} kg
          </div>
          <div className="stat-desc">
            {carbonMetrics.netImpact < 0
              ? "Net positive impact"
              : "Net emissions"}
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Carbon Trend</div>
          <div
            className={`stat-value ${
              carbonMetrics.trend === "improving"
                ? "text-success"
                : carbonMetrics.trend === "worsening"
                ? "text-error"
                : ""
            }`}
          >
            {carbonMetrics.trend === "improving"
              ? "↓"
              : carbonMetrics.trend === "worsening"
              ? "↑"
              : "→"}
          </div>
          <div className="stat-desc capitalize">{carbonMetrics.trend}</div>
        </div>
      </div>

      {/* View and timeframe selectors */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="btn-group">
          <button
            onClick={() => setSelectedView("emissions")}
            className={`btn btn-sm ${
              selectedView === "emissions" ? "btn-active" : ""
            }`}
          >
            Emissions vs Reductions
          </button>
          <button
            onClick={() => setSelectedView("net")}
            className={`btn btn-sm ${
              selectedView === "net" ? "btn-active" : ""
            }`}
          >
            Net Impact
          </button>
          <button
            onClick={() => setSelectedView("activities")}
            className={`btn btn-sm ${
              selectedView === "activities" ? "btn-active" : ""
            }`}
          >
            By Activity
          </button>
        </div>

        {selectedView !== "activities" && (
          <div className="btn-group">
            <button
              onClick={() => setSelectedTimeframe("weekly")}
              className={`btn btn-sm ${
                selectedTimeframe === "weekly" ? "btn-active" : ""
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedTimeframe("monthly")}
              className={`btn btn-sm ${
                selectedTimeframe === "monthly" ? "btn-active" : ""
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedTimeframe("yearly")}
              className={`btn btn-sm ${
                selectedTimeframe === "yearly" ? "btn-active" : ""
              }`}
            >
              Yearly
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="font-semibold mb-2">Your Carbon Footprint Analysis</h4>
          <div className="bg-white p-4 rounded-lg h-64">
            {carbonData.length > 0 ? (
              <canvas ref={chartRef} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  No carbon data recorded yet. Start tracking to see insights!
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Carbon Impact Summary</h4>
          <div className="bg-base-200 p-4 rounded-lg">
            {carbonData.length > 0 ? (
              <>
                <p className="mb-2">
                  {carbonMetrics.highestSource
                    ? `Your highest emission source is from ${carbonMetrics.highestSource.toLowerCase()}.`
                    : "Start tracking different activities to see your emission sources."}
                </p>

                {equivalents && (
                  <div className="mt-4 p-3 bg-base-300 rounded-lg text-sm">
                    <p className="font-semibold">This is equivalent to:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Driving a car for {equivalents.carKm} km</li>
                      <li>Using {equivalents.kWh} kWh of electricity</li>
                      <li>
                        What a tree absorbs in {equivalents.treeDays} days
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p>
                Record your gardening activities' carbon footprint to see a
                summary here.
              </p>
            )}

            <div className="mt-4 text-sm">
              <p className="font-semibold">Irish Context:</p>
              <p className="mt-1">{getIrishContextTip()}</p>
            </div>
          </div>
        </div>
      </div>

      <h4 className="font-semibold mt-6 mb-2">
        Carbon Reduction Tips for Irish Gardeners
      </h4>
      <div className="bg-base-200 p-4 rounded-lg">
        <ul className="list-disc pl-5 space-y-2">
          {getCarbonReductionTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CarbonFootprintInsights;
