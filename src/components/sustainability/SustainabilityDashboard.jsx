import React, { useState, useEffect } from "react";
import {
  getAllUserProgress,
  calculateSDGImpact,
} from "../../utils/sustainability-store";
import { sdgGoals } from "../../data/sustainability-metrics";

const SustainabilityDashboard = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sdgImpact, setSdgImpact] = useState(0);

  // Load user data
  useEffect(() => {
    try {
      const progress = getAllUserProgress();
      setUserProgress(progress);

      // Calculate SDG impact
      const impact = calculateSDGImpact();
      setSdgImpact(impact);

      // Make the refresh function available globally
      if (typeof window !== "undefined") {
        window.updateSustainabilityDashboard = () => {
          const updatedProgress = getAllUserProgress();
          const updatedImpact = calculateSDGImpact();

          setUserProgress(updatedProgress);
          setSdgImpact(updatedImpact);
        };
      }
    } catch (e) {
      console.error("Error loading sustainability data:", e);
    } finally {
      setIsLoaded(true);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        delete window.updateSustainabilityDashboard;
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

  // Get active SDGs (those with scores > 0)
  const activeSDGs = Object.entries(userProgress.sdgScores || {})
    .filter(([_, score]) => score > 0)
    .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA);

  // SDG badge colors by progress level
  const getSDGProgressColor = (score) => {
    if (score >= 30) return "opacity-100";
    if (score >= 15) return "opacity-80";
    return "opacity-60";
  };

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
            {activeSDGs.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2">Contributing to these UN SDGs:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {activeSDGs.map(([sdgKey, score]) => {
                    const sdg = sdgGoals[sdgKey];
                    if (!sdg) return null;
                    return (
                      <div
                        key={sdgKey}
                        className={`badge badge-lg gap-1 tooltip ${getSDGProgressColor(
                          score
                        )}`}
                        data-tip={`${sdg.name} (Score: ${score})`}
                        style={{
                          backgroundColor: sdg.color,
                          color: "#fff",
                          textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
                          border: "none",
                        }}
                      >
                        <span className="text-lg">{sdg.icon}</span>
                        <span className="font-bold">{sdg.number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-4">
                Add sustainable practices to track your SDG impact
              </p>
            )}
            <div className="mt-4 text-xs text-opacity-70 text-center">
              <p>
                UN Sustainable Development Goals measure your garden's wider
                impact
              </p>
            </div>
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
