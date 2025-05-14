import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import { onSustainabilityEvent } from "../../utils/sustainability-events";

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

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Your Sustainability Dashboard
      </h2>
      <p className="text-center text-sm mb-6 max-w-2xl mx-auto">
        Track your garden's sustainability impact and eco-friendly practices
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Card */}
        <div className="card bg-base-200">
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
          </div>
        </div>

        {/* Progress Card */}
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <h3 className="card-title justify-center mb-4">Your Progress</h3>
            <div className="flex justify-center">
              <div
                className="radial-progress text-info text-3xl font-bold"
                style={{
                  "--value": practiceProgress,
                  "--size": "8rem",
                  "--thickness": "0.8rem",
                }}
              >
                {activePracticeCount}
              </div>
            </div>
            <p className="mt-4">
              {activePracticeCount > 0
                ? `You've adopted ${activePracticeCount} sustainable practices!`
                : "Start by adding sustainable practices from the categories below!"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
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
          Add or Manage Your Practices
        </a>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("irish-garden-sustainability");
              window.location.reload();
            }
          }}
          className="btn btn-outline btn-sm"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;
