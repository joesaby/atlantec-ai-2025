import React, { useEffect, useRef, useState } from "react";
import { getSDGScores } from "../../utils/sustainability-store";
import { sdgGoals } from "../../data/sustainability-metrics";
import {
  getTopSDGs,
  getSDGImpactLevel,
  formatSDGRadarData,
  categorizeSDGScores,
} from "../../utils/sdg-utils";
import Chart from "chart.js/auto";

/**
 * Component for visualizing SDG impacts with detailed insights
 */
const SDGImpactVisualization = () => {
  const radarChartRef = useRef(null);
  const radarChartInstance = useRef(null);
  const barChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const [sdgScores, setSdgScores] = useState({});
  const [activeTab, setActiveTab] = useState("radar");
  const [selectedSDG, setSelectedSDG] = useState(null);
  const [sdgInfo, setSDGInfo] = useState(null);

  useEffect(() => {
    // Get SDG scores from sustainability store
    const scores = getSDGScores();
    setSdgScores(scores);

    // Create charts when component mounts
    renderRadarChart(scores);
    renderBarChart(scores);

    // Cleanup function to destroy charts when unmounting
    return () => {
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy();
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, []);

  // Handle SDG selection for detailed view
  const handleSDGSelect = (sdgKey) => {
    // If clicking the already selected SDG, close the detail view
    if (selectedSDG === sdgKey) {
      setSelectedSDG(null);
      setSDGInfo(null);
      return;
    }

    // Otherwise, show details for the selected SDG
    setSelectedSDG(sdgKey);
    setSDGInfo(sdgGoals[sdgKey]);

    // Scroll to the details section
    setTimeout(() => {
      document.getElementById("sdg-details")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Get formatted SDG data for radar chart using our utility function

  // Render radar chart for SDG visualization
  const renderRadarChart = (scores) => {
    if (!radarChartRef.current) return;

    const { labels, data: dataPoints, sdgKeys } = formatSDGRadarData(scores);

    // Destroy previous chart instance if it exists
    if (radarChartInstance.current) {
      radarChartInstance.current.destroy();
    }

    // Get colors from SDG definitions for chart segments
    const colors = sdgKeys.map((key) => sdgGoals[key]?.color || "#cccccc");
    const backgroundColors = colors.map((color) => `${color}40`); // Add transparency
    const borderColors = colors.map((color) => `${color}cc`);

    // Create new radar chart
    const ctx = radarChartRef.current.getContext("2d");
    radarChartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "SDG Impact Score",
            data: dataPoints,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
            pointBackgroundColor: colors,
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: colors,
          },
        ],
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: function (context) {
                const index = context[0].dataIndex;
                return labels[index];
              },
              label: function (context) {
                const value = context.raw;
                const sdgKey = sdgKeys[context.dataIndex];
                return [
                  `Score: ${value}`,
                  `${sdgGoals[sdgKey]?.description || ""}`,
                ];
              },
            },
          },
        },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            handleSDGSelect(sdgKeys[index]);
          }
        },
      },
    });
  };

  // Render bar chart for comparing SDG scores
  const renderBarChart = (scores) => {
    if (!barChartRef.current) return;

    // Get non-zero SDG scores and sort by value (highest first)
    const sortedSDGs = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA);

    const sdgKeys = sortedSDGs.map(([key]) => key);
    const values = sortedSDGs.map(([_, value]) => value);
    const labels = sdgKeys.map((key) => {
      const sdg = sdgGoals[key];
      return sdg ? `${sdg.icon} SDG ${sdg.number}` : key;
    });

    // Get colors from SDG definitions
    const colors = sdgKeys.map((key) => sdgGoals[key]?.color || "#cccccc");

    // Destroy previous chart if it exists
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    // Create bar chart
    const ctx = barChartRef.current.getContext("2d");
    barChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "SDG Score",
            data: values,
            backgroundColor: colors.map((color) => `${color}cc`),
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            handleSDGSelect(sdgKeys[index]);
          }
        },
      },
    });
  };

  // Get statistics about SDG impact
  const getSDGStats = () => {
    const activeSDGs = getTopSDGs(sdgScores);
    const totalActiveSDGs = activeSDGs.length;

    // If we have any active SDGs, get the highest scoring one
    const highestSDGKey = activeSDGs[0];
    const highestSDG = highestSDGKey
      ? {
          key: highestSDGKey,
          score: sdgScores[highestSDGKey] || 0,
          name: sdgGoals[highestSDGKey]?.name || highestSDGKey,
          icon: sdgGoals[highestSDGKey]?.icon || "🌱",
          impactLevel: getSDGImpactLevel(sdgScores[highestSDGKey] || 0),
        }
      : null;

    return {
      totalActiveSDGs,
      highestSDG,
      categorizedSDGs: categorizeSDGScores(sdgScores),
    };
  };

  const stats = getSDGStats();

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">
        UN Sustainable Development Goals Impact
      </h2>
      <p className="mb-6 text-sm">
        The United Nations Sustainable Development Goals (SDGs) are a collection
        of 17 interlinked global goals designed to be a "blueprint to achieve a
        better and more sustainable future for all." See how your gardening
        activities are contributing to these important global initiatives.
      </p>

      {/* SDG Impact Stats */}
      <div className="stats shadow w-full mb-6">
        <div className="stat">
          <div className="stat-figure text-primary text-4xl">🌱</div>
          <div className="stat-title">Active SDGs</div>
          <div className="stat-value">{stats.totalActiveSDGs}</div>
          <div className="stat-desc">Out of 12 tracked goals</div>
        </div>

        {stats.highestSDG && (
          <div className="stat">
            <div className="stat-figure text-secondary text-4xl">
              {stats.highestSDG.icon}
            </div>
            <div className="stat-title">Highest Impact</div>
            <div className={`stat-value ${stats.highestSDG.impactLevel.class}`}>
              {Math.round(stats.highestSDG.score)}
            </div>
            <div className="stat-desc">
              {stats.highestSDG.name} - {stats.highestSDG.impactLevel.level}
            </div>
          </div>
        )}

        <div className="stat">
          <div className="stat-figure text-4xl">🌍</div>
          <div className="stat-title">SDG Categories</div>
          <div className="stat-value">3</div>
          <div className="stat-desc">Environment, Wellbeing, Economy</div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <a
          className={`tab ${activeTab === "radar" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("radar")}
        >
          Radar View
        </a>
        <a
          className={`tab ${activeTab === "bar" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("bar")}
        >
          Bar Chart
        </a>
        <a
          className={`tab ${activeTab === "table" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("table")}
        >
          Details
        </a>
      </div>

      {/* Chart Containers */}
      <div
        className={`chart-container ${
          activeTab === "radar" ? "block" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-lg p-4 mb-4">
          <div style={{ height: "350px" }}>
            <canvas ref={radarChartRef}></canvas>
          </div>
          <div className="text-center text-xs mt-2 opacity-70">
            Click on any point to see detailed information about that SDG
          </div>
        </div>
      </div>

      <div
        className={`chart-container ${
          activeTab === "bar" ? "block" : "hidden"
        }`}
      >
        <div className="bg-base-200 rounded-lg p-4 mb-4">
          <div style={{ height: "350px" }}>
            <canvas ref={barChartRef}></canvas>
          </div>
          <div className="text-center text-xs mt-2 opacity-70">
            Click on any bar to see detailed information about that SDG
          </div>
        </div>
      </div>

      <div
        className={`details-container ${
          activeTab === "table" ? "block" : "hidden"
        }`}
      >
        <div className="tabs tabs-boxed mb-4 justify-center">
          <a className="tab tab-active">All Goals</a>
          <a className="tab">By Category</a>
        </div>

        <div className="overflow-x-auto">
          {/* Category tables */}
          {["environment", "wellbeing", "economy"].map((category) => {
            const categoryName =
              category.charAt(0).toUpperCase() + category.slice(1);
            const sdgsInCategory = stats.categorizedSDGs?.[category] || [];

            return (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  {category === "environment" && (
                    <span className="text-xl">🌍</span>
                  )}
                  {category === "wellbeing" && (
                    <span className="text-xl">❤️</span>
                  )}
                  {category === "economy" && (
                    <span className="text-xl">💼</span>
                  )}
                  {categoryName}
                </h3>

                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Goal</th>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Impact Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sdgsInCategory.length > 0 ? (
                        sdgsInCategory.map((sdg) => {
                          const impactLevel = getSDGImpactLevel(sdg.score);
                          return (
                            <tr
                              key={sdg.key}
                              className="cursor-pointer hover:bg-base-200"
                              onClick={() => handleSDGSelect(sdg.key)}
                            >
                              <td>
                                <div
                                  className="tooltip"
                                  data-tip={`SDG ${sdg.number}`}
                                >
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
                                    style={{ backgroundColor: sdg.color }}
                                  >
                                    {sdg.icon}
                                  </div>
                                </div>
                              </td>
                              <td>{sdg.name}</td>
                              <td>
                                <div
                                  className="badge"
                                  style={{
                                    backgroundColor: `${sdg.color}40`,
                                    color: sdg.color,
                                  }}
                                >
                                  {Math.round(sdg.score)}
                                </div>
                              </td>
                              <td className={impactLevel.class}>
                                {impactLevel.level}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-base-content/50"
                          >
                            No active goals in this category yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* All SDGs */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">
              All Sustainable Development Goals
            </h3>
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sdgScores)
                  .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
                  .map(([key, score]) => {
                    const sdg = sdgGoals[key];
                    if (!sdg) return null;

                    const impactLevel = getSDGImpactLevel(score);

                    return (
                      <tr
                        key={key}
                        className={`${
                          score > 0 ? "" : "opacity-50"
                        } cursor-pointer hover:bg-base-200`}
                        onClick={() => handleSDGSelect(key)}
                      >
                        <td>
                          <div
                            className="tooltip"
                            data-tip={`SDG ${sdg.number}`}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
                              style={{ backgroundColor: sdg.color }}
                            >
                              {sdg.icon}
                            </div>
                          </div>
                        </td>
                        <td>{sdg.name}</td>
                        <td>
                          <div
                            className={`badge ${
                              score > 0 ? impactLevel.class : ""
                            }`}
                            style={{
                              backgroundColor: `${sdg.color}40`,
                              color: sdg.color,
                            }}
                          >
                            {Math.round(score)}
                          </div>
                        </td>
                        <td className="text-sm">{sdg.description}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Selected SDG Details */}
      {selectedSDG && sdgInfo && (
        <div id="sdg-details" className="mt-6 bg-base-200 p-4 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0"
              style={{ backgroundColor: sdgInfo.color }}
            >
              {sdgInfo.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                SDG {sdgInfo.number}: {sdgInfo.name}
              </h3>
              <p className="text-sm opacity-80">{sdgInfo.description}</p>
            </div>
            <button
              className="btn btn-ghost btn-circle btn-sm ml-auto"
              onClick={() => setSelectedSDG(null)}
            >
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-title">Your Impact</div>
              <div className="stat-value">
                {Math.round(sdgScores[selectedSDG])}
              </div>
              <div className="stat-desc">out of 100 possible points</div>
            </div>

            <div className="stat">
              <div className="stat-title">Global Rank</div>
              <div className="stat-value">
                {Object.entries(sdgScores)
                  .filter(([_, score]) => score > 0)
                  .sort(([_, a], [__, b]) => b - a)
                  .findIndex(([key]) => key === selectedSDG) + 1}
              </div>
              <div className="stat-desc">among your active SDGs</div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-bold mb-2">How You're Contributing</h4>
            <p className="text-sm">
              Your gardening practices are making a positive impact on SDG{" "}
              {sdgInfo.number}. This goal focuses on{" "}
              {sdgInfo.description.toLowerCase()}.
            </p>

            <h4 className="font-bold mt-4 mb-2">Increase Your Impact</h4>
            <ul className="text-sm list-disc pl-5">
              <li>Add more sustainable practices related to this goal</li>
              <li>
                Track your resource usage to get more accurate impact
                measurements
              </li>
              <li>
                Log your harvests to quantify your food production contribution
              </li>
            </ul>

            <div className="flex justify-center mt-6">
              <a
                href="#practices"
                className="link link-primary"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('.tab[data-tab="practices"]')?.click();
                }}
              >
                Explore related practices →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Learn More Section */}
      <div className="alert alert-info mt-6">
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
          <h3 className="font-bold">Learn More About SDGs</h3>
          <div className="text-sm">
            Visit the{" "}
            <a
              href="https://sdgs.un.org/goals"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              United Nations SDG website
            </a>{" "}
            to learn more about the global goals.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDGImpactVisualization;
