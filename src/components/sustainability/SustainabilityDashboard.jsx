import React, { useState, useEffect } from "react";
import {
  getAllUserProgress,
  calculateSDGImpact,
} from "../../utils/sustainability-store";

const SustainabilityDashboard = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0); // Add counter to force refreshes

  const loadUserData = () => {
    try {
      // Get latest user progress data from storage
      const progress = getAllUserProgress();
      setUserProgress(progress);
      console.log("Dashboard loaded user progress:", progress);

      // Make this function available globally so other components can trigger a refresh
      if (typeof window !== "undefined") {
        window.updateSustainabilityDashboard = () => {
          console.log("Dashboard refresh triggered");
          setRefreshCounter((prev) => prev + 1); // Increment counter to force refresh
        };
      }
    } catch (e) {
      console.error("Error loading sustainability data:", e);
    } finally {
      // Always mark as loaded even if there was an error
      setIsLoaded(true);
    }
  };

  // Load data initially and whenever the refresh counter changes
  useEffect(() => {
    loadUserData();

    // Cleanup function to remove the global reference when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        delete window.updateSustainabilityDashboard;
      }
    };
  }, [refreshCounter]); // Add refreshCounter dependency

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

  // For a rough estimate, assume there are around 20 total practices
  // (this should be updated to use actual count from sustainability-metrics.js if needed)
  const totalPracticeCount = 20;
  const practiceProgress = Math.min(
    100,
    Math.round((activePracticeCount / totalPracticeCount) * 100)
  );

  // Get SDG impact percentage
  const sdgImpact = calculateSDGImpact();

  const sustainabilityLevel = getSustainabilityLevel(userProgress.score);

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Your Sustainability Dashboard
      </h2>
      <p className="text-center text-sm mb-6 max-w-2xl mx-auto">
        Track your garden's impact on UN Sustainable Development Goals
      </p>

      <div className="grid gap-6 md:grid-cols-3">
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
              Keep adding sustainable practices to increase your score!
            </p>
          </div>
        </div>

        {/* SDG Impact Card */}
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <h3 className="card-title justify-center mb-4">UN SDG Impact</h3>
            <div className="flex justify-center">
              <div
                className="radial-progress text-success text-3xl font-bold"
                style={{
                  "--value": sdgImpact,
                  "--size": "8rem",
                  "--thickness": "0.8rem",
                }}
              >
                {sdgImpact}%
              </div>
            </div>
            <p className="mt-4">
              {sdgImpact > 0
                ? "Contributing to UN Sustainable Development Goals"
                : "Add sustainable practices to track your SDG impact"}
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

      <div className="mt-8 text-center">
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
