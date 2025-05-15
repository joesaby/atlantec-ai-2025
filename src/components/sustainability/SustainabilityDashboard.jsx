import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import { onSustainabilityEvent } from "../../utils/sustainability-events";
import {
  sustainablePractices,
  sdgGoals,
} from "../../data/sustainability-metrics";

const SustainabilityDashboard = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    console.log("SustainabilityDashboard: Refreshing data");
    const updatedProgress = getAllUserProgress();
    setUserProgress(updatedProgress);
  };

  // Load user data
  useEffect(() => {
    try {
      const progress = getAllUserProgress();
      setUserProgress(progress);

      // Make the refresh function available globally for backward compatibility
      if (typeof window !== "undefined") {
        window.updateSustainabilityDashboard = refreshDashboard;
      }

      // Setup event listeners for sustainability practice changes
      const removeAddedListener = onSustainabilityEvent(
        "sustainability-practice-added",
        refreshDashboard
      );
      const removeRemovedListener = onSustainabilityEvent(
        "sustainability-practice-removed",
        refreshDashboard
      );
      const removeDataChangedListener = onSustainabilityEvent(
        "sustainability-data-changed",
        refreshDashboard
      );

      console.log("SustainabilityDashboard: Set up event listeners");
    } catch (e) {
      console.error("Error loading sustainability data:", e);
    } finally {
      setIsLoaded(true);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        delete window.updateSustainabilityDashboard;

        // Use the cleanup functions returned by onSustainabilityEvent
        if (removeAddedListener) removeAddedListener();
        if (removeRemovedListener) removeRemovedListener();
        if (removeDataChangedListener) removeDataChangedListener();
      }
    };
  }, []);

  if (!isLoaded || !userProgress) {
    return (
      <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Your Sustainability Dashboard
        </h2>
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <span className="ml-4">Loading your sustainability data...</span>
        </div>
      </div>
    );
  }

  // Get sustainability level based on score
  const getSustainabilityLevel = (score) => {
    if (score >= 100)
      return { level: "Master Gardener", class: "text-success" };
    if (score >= 70) return { level: "Eco Champion", class: "text-success" };
    if (score >= 40) return { level: "Green Thumb", class: "text-warning" };
    if (score >= 20)
      return { level: "Sustainability Starter", class: "text-warning" };
    return { level: "Beginner", class: "text-info" };
  };

  // Calculate how many practices are active out of total available
  const activePracticeCount = userProgress.activePractices.length;
  const totalPracticeCount = 20;
  const practiceProgress = Math.min(
    100,
    Math.round((activePracticeCount / totalPracticeCount) * 100)
  );

  const sustainabilityLevel = getSustainabilityLevel(userProgress.score);

  // No SDG-related code needed anymore

  // Calculate metrics for enhanced dashboard
  const calculateCategoryMetrics = () => {
    const categories = Object.keys(sustainablePractices);
    const metrics = {};

    categories.forEach((catKey) => {
      const category = sustainablePractices[catKey];
      const totalPractices = category.practices.length;
      const activePracticesInCategory = userProgress.activePractices.filter(
        (p) => category.practices.some((cp) => cp.id === p.id)
      ).length;

      metrics[catKey] = {
        name: category.name,
        icon: category.icon,
        description: category.description,
        totalPractices,
        activePractices: activePracticesInCategory,
        percentComplete: Math.round(
          (activePracticesInCategory / totalPractices) * 100
        ),
      };
    });

    return metrics;
  };

  // Calculate SDG impact
  const calculateSdgImpact = () => {
    // Get total possible SDG score (if all practices were implemented)
    const allSdgImpacts = {};

    Object.values(sustainablePractices).forEach((category) => {
      category.practices.forEach((practice) => {
        if (practice.sdgs) {
          practice.sdgs.forEach((sdg) => {
            if (!allSdgImpacts[sdg]) {
              allSdgImpacts[sdg] = 0;
            }
            // Weight by impact
            const impactValue =
              practice.impact === "high"
                ? 3
                : practice.impact === "medium"
                ? 2
                : 1;
            allSdgImpacts[sdg] += impactValue;
          });
        }
      });
    });

    // Get user's current SDG score
    const userSdgImpacts = {};

    // Initialize with zero values
    Object.keys(allSdgImpacts).forEach((sdg) => {
      userSdgImpacts[sdg] = 0;
    });

    // Calculate user's impacts
    userProgress.activePractices.forEach((userPractice) => {
      // Find the practice details
      let practiceDetails = null;
      Object.values(sustainablePractices).forEach((category) => {
        const found = category.practices.find((p) => p.id === userPractice.id);
        if (found) {
          practiceDetails = found;
        }
      });

      if (practiceDetails && practiceDetails.sdgs) {
        practiceDetails.sdgs.forEach((sdg) => {
          const impactValue =
            practiceDetails.impact === "high"
              ? 3
              : practiceDetails.impact === "medium"
              ? 2
              : 1;
          userSdgImpacts[sdg] += impactValue;
        });
      }
    });

    // Calculate percentages
    const sdgPercentages = {};
    Object.keys(allSdgImpacts).forEach((sdg) => {
      sdgPercentages[sdg] = {
        percentage: Math.round(
          (userSdgImpacts[sdg] / allSdgImpacts[sdg]) * 100
        ),
        name: sdgGoals[sdg]?.name || sdg,
        icon: sdgGoals[sdg]?.icon || "🌱",
        color: sdgGoals[sdg]?.color || "#4c9f38",
      };
    });

    return sdgPercentages;
  };

  // Get metrics for our dashboard
  const categoryMetrics = calculateCategoryMetrics();
  const sdgImpact = calculateSdgImpact();

  // Get top SDGs the user is contributing to
  const topSdgs = Object.entries(sdgImpact)
    .sort(([, a], [, b]) => b.percentage - a.percentage)
    .slice(0, 3);

  // Get categories with highest and lowest adoption
  const categoriesArray = Object.entries(categoryMetrics).map(
    ([key, data]) => ({ key, ...data })
  );

  const topCategory = categoriesArray.sort(
    (a, b) => b.percentComplete - a.percentComplete
  )[0];

  const improvementCategory = categoriesArray
    .filter((c) => c.percentComplete < 100)
    .sort((a, b) => a.percentComplete - b.percentComplete)[0];

  // Get current season for seasonal recommendations
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring"; // March to May
    if (month >= 5 && month <= 7) return "summer"; // June to August
    if (month >= 8 && month <= 10) return "autumn"; // September to November
    return "winter"; // December to February
  };

  const currentSeason = getCurrentSeason();

  // Parse timestamps for recent activities
  const recentActivities = userProgress.activePractices
    .slice()
    .sort((a, b) => {
      // Sort by implementation date, most recent first
      const dateA = new Date(a.implementedOn || 0);
      const dateB = new Date(b.implementedOn || 0);
      return dateB - dateA;
    })
    .slice(0, 3) // Get 3 most recent
    .map((practice) => {
      // Find practice details
      let practiceDetails = null;
      Object.values(sustainablePractices).forEach((category) => {
        const found = category.practices.find((p) => p.id === practice.id);
        if (found) {
          practiceDetails = {
            ...found,
            category: category.name,
          };
        }
      });

      return {
        id: practice.id,
        name: practiceDetails?.name || "Unknown Practice",
        category: practiceDetails?.category || "General",
        implementedOn: practice.implementedOn
          ? new Date(practice.implementedOn).toLocaleDateString()
          : "Unknown date",
        impact: practiceDetails?.impact || "medium",
      };
    });

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Your Sustainability Dashboard
      </h2>
      <p className="text-center text-sm mb-6 max-w-2xl mx-auto">
        Track your garden's sustainability impact and eco-friendly practices
      </p>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Score Card */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body text-center">
            <h3 className="card-title justify-center mb-4">Overall Score</h3>
            <div className="flex justify-center">
              <div
                className="radial-progress text-primary text-3xl font-bold"
                style={{
                  "--value": Math.min(100, userProgress.score),
                  "--size": "8rem",
                  "--thickness": "0.8rem",
                }}
              >
                {userProgress.score}
              </div>
            </div>
            <p className={`mt-4 font-semibold ${sustainabilityLevel.class}`}>
              Level: {sustainabilityLevel.level}
            </p>
            <p className="text-sm mt-2">
              Add more sustainable practices to improve your score!
            </p>

            {/* Quick actions */}
            <div className="mt-4 flex justify-center">
              <a
                href="#practices"
                className="btn btn-primary btn-sm gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  const tabId = "practices";
                  // Handle tab switching programmatically
                  const tabs = document.querySelectorAll(".tabs .tab");
                  const tabContents = document.querySelectorAll(".tab-content");

                  // Hide all tab contents
                  tabContents.forEach((content) => {
                    content.classList.remove("active");
                    content.classList.add("hidden");
                  });

                  // Show the selected tab content
                  const selectedContent = document.getElementById(
                    tabId + "-section"
                  );
                  if (selectedContent) {
                    selectedContent.classList.remove("hidden");
                    selectedContent.classList.add("active");
                  }

                  // Update active tab
                  tabs.forEach((tab) => {
                    tab.classList.remove("tab-active");
                    if (tab.getAttribute("data-tab") === tabId) {
                      tab.classList.add("tab-active");
                    }
                  });

                  // Update URL with hash for direct linking
                  window.history.replaceState(null, "", "#" + tabId);
                }}
              >
                Add Practices
              </a>
            </div>
          </div>
        </div>

        {/* Practice Summary Card */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title justify-center mb-4">Practice Summary</h3>

            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">Active Practices</div>
                <div className="stat-value">{activePracticeCount}</div>
                <div className="stat-desc">
                  {totalPracticeCount - activePracticeCount > 0
                    ? `${
                        totalPracticeCount - activePracticeCount
                      } more practices available`
                    : "All practices adopted!"}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Strongest Area</div>
                <div className="stat-value text-success text-2xl">
                  {topCategory?.name || "None"}
                </div>
                <div className="stat-desc">
                  {topCategory
                    ? `${topCategory.percentComplete}% complete`
                    : "Add practices to see statistics"}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Area for Improvement</div>
                <div className="stat-value text-warning text-2xl">
                  {improvementCategory?.name || "None"}
                </div>
                <div className="stat-desc">
                  {improvementCategory
                    ? `${improvementCategory.percentComplete}% complete`
                    : "Keep adding practices!"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Seasonal Tips */}
        <div className="card bg-base-200 shadow-md lg:row-span-2">
          <div className="card-body">
            <h3 className="card-title justify-center mb-4">
              Recent Activities & Tips
            </h3>

            {recentActivities.length > 0 ? (
              <div className="space-y-3 mb-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="badge badge-primary badge-sm">New</div>
                    <span>
                      Added <strong>{activity.name}</strong> on{" "}
                      {activity.implementedOn}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info mb-4">
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
                <span>
                  No recent activities yet. Start adding sustainable practices!
                </span>
              </div>
            )}

            {/* Seasonal tips */}
            <div className="divider">Seasonal Tips</div>

            <div className="bg-base-100 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 capitalize">
                {currentSeason === "spring" &&
                  "Spring Gardening Tips (Mar-May)"}
                {currentSeason === "summer" &&
                  "Summer Gardening Tips (Jun-Aug)"}
                {currentSeason === "autumn" &&
                  "Autumn Gardening Tips (Sep-Nov)"}
                {currentSeason === "winter" &&
                  "Winter Gardening Tips (Dec-Feb)"}
              </h4>

              <ul className="text-xs space-y-2">
                {currentSeason === "spring" && (
                  <>
                    <li>
                      • Start sowing vegetable seeds outdoors once soil
                      temperatures rise
                    </li>
                    <li>
                      • Plant pollinator-friendly flowers to boost biodiversity
                    </li>
                    <li>• Set up rainwater harvesting systems before summer</li>
                  </>
                )}
                {currentSeason === "summer" && (
                  <>
                    <li>
                      • Use mulch to retain soil moisture during dry periods
                    </li>
                    <li>
                      • Water plants in early morning or evening to reduce
                      evaporation
                    </li>
                    <li>• Monitor and manage pests using natural methods</li>
                  </>
                )}
                {currentSeason === "autumn" && (
                  <>
                    <li>• Collect fallen leaves for compost or leaf mold</li>
                    <li>
                      • Plant cover crops to protect bare soil over winter
                    </li>
                    <li>• Save seeds from heirloom vegetables for next year</li>
                  </>
                )}
                {currentSeason === "winter" && (
                  <>
                    <li>
                      • Protect vulnerable plants from frost and cold winds
                    </li>
                    <li>
                      • Plan your garden for next year, focusing on native
                      plants
                    </li>
                    <li>• Clean and repair tools and garden structures</li>
                  </>
                )}
              </ul>

              <a
                href="#practices"
                className="btn btn-xs btn-outline btn-block mt-3"
                onClick={(e) => {
                  e.preventDefault();
                  // Similar tab switching code as above
                  const tabId = "practices";
                  const tabs = document.querySelectorAll(".tabs .tab");
                  const tabContents = document.querySelectorAll(".tab-content");
                  tabContents.forEach((content) => {
                    content.classList.remove("active");
                    content.classList.add("hidden");
                  });
                  const selectedContent = document.getElementById(
                    tabId + "-section"
                  );
                  if (selectedContent) {
                    selectedContent.classList.remove("hidden");
                    selectedContent.classList.add("active");
                  }
                  tabs.forEach((tab) => {
                    tab.classList.remove("tab-active");
                    if (tab.getAttribute("data-tab") === tabId) {
                      tab.classList.add("tab-active");
                    }
                  });
                  window.history.replaceState(null, "", "#" + tabId);
                }}
              >
                Get Seasonal Recommendations
              </a>
            </div>
          </div>
        </div>

        {/* SDG Impact Card */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title justify-center mb-3">UN SDG Impact</h3>
            <p className="text-xs text-center mb-3">
              UN Sustainable Development Goals your gardening practices support
            </p>

            {topSdgs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {topSdgs.map(([sdgKey, sdg]) => (
                  <div key={sdgKey} className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full bg-base-100 flex items-center justify-center">
                        <span className="text-lg">{sdg.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span>{sdg.name}</span>
                        <span>{sdg.percentage}%</span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${sdg.percentage}%`,
                            backgroundColor: sdg.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm">
                Add practices to see your UN SDG impact
              </div>
            )}
          </div>
        </div>

        {/* Category Progress */}
        <div className="card bg-base-200 shadow-md md:col-span-2 lg:col-span-2">
          <div className="card-body">
            <h3 className="card-title justify-center mb-4">
              Practice Categories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(categoryMetrics).map(([key, category]) => (
                <div key={key} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs ml-auto">
                      {category.activePractices}/{category.totalPractices}
                    </span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        category.percentComplete >= 75
                          ? "bg-success"
                          : category.percentComplete >= 40
                          ? "bg-warning"
                          : "bg-info"
                      }`}
                      style={{ width: `${category.percentComplete}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        <a
          href="#practices"
          className="btn btn-primary btn-sm gap-2"
          onClick={(e) => {
            e.preventDefault();
            const tabId = "practices";
            // Handle tab switching programmatically
            const tabs = document.querySelectorAll(".tabs .tab");
            const tabContents = document.querySelectorAll(".tab-content");

            // Hide all tab contents
            tabContents.forEach((content) => {
              content.classList.remove("active");
              content.classList.add("hidden");
            });

            // Show the selected tab content
            const selectedContent = document.getElementById(tabId + "-section");
            if (selectedContent) {
              selectedContent.classList.remove("hidden");
              selectedContent.classList.add("active");
            }

            // Update active tab
            tabs.forEach((tab) => {
              tab.classList.remove("tab-active");
              if (tab.getAttribute("data-tab") === tabId) {
                tab.classList.add("tab-active");
              }
            });

            // Update URL with hash for direct linking
            window.history.replaceState(null, "", "#" + tabId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Manage Your Practices
        </a>

        <a
          href="#resources"
          className="btn btn-outline btn-sm gap-2"
          onClick={(e) => {
            e.preventDefault();
            const tabId = "resources";
            const tabs = document.querySelectorAll(".tabs .tab");
            const tabContents = document.querySelectorAll(".tab-content");
            tabContents.forEach((content) => {
              content.classList.remove("active");
              content.classList.add("hidden");
            });
            const selectedContent = document.getElementById(tabId + "-section");
            if (selectedContent) {
              selectedContent.classList.remove("hidden");
              selectedContent.classList.add("active");
            }
            tabs.forEach((tab) => {
              tab.classList.remove("tab-active");
              if (tab.getAttribute("data-tab") === tabId) {
                tab.classList.add("tab-active");
              }
            });
            window.history.replaceState(null, "", "#" + tabId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
          Track Resource Usage
        </a>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("irish-garden-sustainability");
              window.location.reload();
            }
          }}
          className="btn btn-outline btn-sm btn-error"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;
