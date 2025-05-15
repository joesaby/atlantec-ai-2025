import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityVisualization = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Generate visualization data from user progress
    try {
      const userProgress = getAllUserProgress();

      // Extract timing information for biodiversity practices
      const activePractices = userProgress.activePractices || [];

      // Filter and sort biodiversity-related practices by implementation date
      const bioPractices = activePractices
        .filter((practice) => {
          const id = practice.id || "";
          return (
            id.includes("biodiversity") ||
            id.includes("native") ||
            id.includes("pollinator") ||
            id.includes("wildlife") ||
            id.includes("organic")
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.implementedOn || 0);
          const dateB = new Date(b.implementedOn || 0);
          return dateA - dateB;
        });

      // Create timeline points based on practice implementation dates
      const timelinePoints = [];
      let cumulativeScore = 10; // Base score for having a garden

      bioPractices.forEach((practice) => {
        const date = new Date(practice.implementedOn || Date.now());
        let points = 0;

        // Assign points based on practice type
        if (
          practice.id?.includes("native") ||
          practice.id?.includes("biodiversity-1")
        ) {
          points = 20;
        } else if (
          practice.id?.includes("pollinator") ||
          practice.id?.includes("biodiversity-2")
        ) {
          points = 15;
        } else if (
          practice.id?.includes("wildlife") ||
          practice.id?.includes("biodiversity-3")
        ) {
          points = 20;
        } else if (
          practice.id?.includes("organic") ||
          practice.id?.includes("natural-pest")
        ) {
          points = 15;
        } else if (
          practice.id?.includes("compost") ||
          practice.id?.includes("soil-health")
        ) {
          points = 10;
        } else if (practice.id?.includes("water-feature")) {
          points = 10;
        } else {
          points = 5; // Default
        }

        cumulativeScore += points;
        cumulativeScore = Math.min(100, cumulativeScore); // Cap at 100

        // Find practice details to get name
        let practiceName = "Biodiversity Practice";
        try {
          const {
            sustainablePractices,
          } = require("../../data/sustainability-metrics");
          for (const category of Object.values(sustainablePractices)) {
            const found = category.practices.find((p) => p.id === practice.id);
            if (found) {
              practiceName = found.name;
              break;
            }
          }
        } catch (error) {
          console.error("Error finding practice details:", error);
        }

        timelinePoints.push({
          date: date,
          score: cumulativeScore,
          practice: practiceName,
          points: points,
          practiceId: practice.id || "",
        });
      });

      // Add wildlife spottings to the visualization if available
      const wildlifeSpottings = userProgress.wildlifeSpottings || [];
      const spottingPoints = wildlifeSpottings.map((spotting) => {
        return {
          date: new Date(spotting.date || Date.now()),
          type: "spotting",
          species: spotting.species,
          category: spotting.category,
        };
      });

      setData({
        timelinePoints,
        spottingPoints,
        currentScore: cumulativeScore,
      });
    } catch (err) {
      console.error("Error generating biodiversity visualization:", err);
    }
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
    });
  };

  // Get appropriate icon for practice type
  const getPracticeIcon = (practiceId) => {
    if (
      practiceId?.includes("native") ||
      practiceId?.includes("biodiversity-1")
    ) {
      return "🌱";
    } else if (
      practiceId?.includes("pollinator") ||
      practiceId?.includes("biodiversity-2")
    ) {
      return "🐝";
    } else if (
      practiceId?.includes("wildlife") ||
      practiceId?.includes("biodiversity-3")
    ) {
      return "🦔";
    } else if (
      practiceId?.includes("organic") ||
      practiceId?.includes("natural-pest")
    ) {
      return "🌿";
    } else if (practiceId?.includes("water-feature")) {
      return "💧";
    } else if (practiceId?.includes("hedge")) {
      return "🌳";
    } else if (practiceId?.includes("berry-bushes")) {
      return "🍒";
    } else if (
      practiceId?.includes("compost") ||
      practiceId?.includes("soil-health")
    ) {
      return "🌱";
    } else if (practiceId?.includes("green-roof")) {
      return "🏡";
    } else if (practiceId?.includes("layered-planting")) {
      return "🌲";
    } else if (practiceId?.includes("unmowed")) {
      return "🌿";
    } else if (practiceId?.includes("night-friendly")) {
      return "🌙";
    } else if (practiceId?.includes("insect-hotel")) {
      return "🏨";
    } else if (practiceId?.includes("winter-resources")) {
      return "❄️";
    } else if (practiceId?.includes("microclimate")) {
      return "🪨";
    } else {
      return "🌍"; // Default icon
    }
  };

  if (!data) {
    return <div className="loading loading-spinner loading-sm"></div>;
  }

  const calculateSeasonFromDate = (date) => {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "spring"; // March to May
    if (month >= 5 && month <= 7) return "summer"; // June to August
    if (month >= 8 && month <= 10) return "autumn"; // September to November
    return "winter"; // December to February
  };

  // Get seasonal color
  const getSeasonalColor = (date) => {
    const season = calculateSeasonFromDate(date);
    switch (season) {
      case "spring":
        return "bg-emerald-100 border-emerald-300";
      case "summer":
        return "bg-amber-100 border-amber-300";
      case "autumn":
        return "bg-orange-100 border-orange-300";
      case "winter":
        return "bg-blue-100 border-blue-300";
      default:
        return "bg-green-100 border-green-300";
    }
  };

  return (
    <div className="bg-base-200 p-5 rounded-lg">
      <h4 className="font-semibold mb-2">
        Your Biodiversity Impact Visualization
      </h4>
      <p className="text-sm text-base-content text-opacity-70 mb-4">
        Watch your garden's biodiversity evolve and flourish over time
      </p>

      {data.timelinePoints.length > 0 ? (
        <div>
          {/* Visual biodiversity score progress */}
          <div className="relative h-16 mb-8 bg-base-100 rounded-lg overflow-hidden">
            {/* Score visualization with enhanced gradient */}
            <div className="absolute inset-0 flex">
              <div
                className="h-full bg-gradient-to-r from-blue-300 via-green-300 to-emerald-500"
                style={{ width: `${data.currentScore}%` }}
              ></div>
            </div>

            {/* Score markers */}
            {[0, 25, 50, 75, 100].map((marker) => (
              <div
                key={marker}
                className="absolute top-0 bottom-0 border-r border-base-300 flex items-center justify-center"
                style={{ left: `${marker}%` }}
              >
                <span className="absolute top-1 text-xs font-medium text-base-content bg-base-100 px-1 rounded">
                  {marker}
                </span>
              </div>
            ))}

            {/* Current score indicator with animation */}
            <div
              className="absolute top-0 bottom-0 flex items-center justify-center animate-pulse"
              style={{ left: `${data.currentScore}%` }}
            >
              <div className="bg-primary h-full w-1.5"></div>
              <div className="absolute bottom-1 text-sm font-bold text-primary-content bg-primary px-2 py-0.5 rounded-full shadow-md">
                {data.currentScore}
              </div>
            </div>

            {/* Score labels with icons */}
            <div className="absolute bottom-0 left-0 text-xs text-base-content px-2 flex items-center">
              <span className="mr-1">🌱</span> Beginner
            </div>
            <div className="absolute bottom-0 right-0 text-xs text-base-content px-2 flex items-center">
              Champion <span className="ml-1">🏆</span>
            </div>
          </div>

          {/* Biodiversity tier indicator */}
          <div className="mb-6 flex justify-center">
            <div className="bg-base-100 px-4 py-2 rounded-lg shadow-sm">
              <p className="text-center">
                <span className="font-medium">Current Level: </span>
                <span
                  className={
                    data.currentScore >= 70
                      ? "text-success font-bold"
                      : data.currentScore >= 40
                      ? "text-warning font-bold"
                      : "text-info font-bold"
                  }
                >
                  {data.currentScore >= 70
                    ? "Biodiversity Champion"
                    : data.currentScore >= 40
                    ? "Wildlife Friend"
                    : "Biodiversity Beginner"}
                </span>
              </p>
              <p className="text-xs text-center mt-1 text-base-content text-opacity-70">
                {data.currentScore >= 70
                  ? "Your garden is a thriving ecosystem supporting many Irish species!"
                  : data.currentScore >= 40
                  ? "Your garden is becoming an important wildlife habitat"
                  : "You're starting to make a positive impact on local biodiversity"}
              </p>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="relative pl-8">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-base-300"></div>

            {/* Base point */}
            <div className="relative mb-6">
              <div className="absolute -left-8 mt-1.5 rounded-full h-4 w-4 border-2 border-info bg-base-100"></div>
              <div className="bg-base-100 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="font-medium">
                      Started Garden Biodiversity Tracking
                    </h6>
                    <p className="text-xs text-info mt-1">
                      +10 base biodiversity points
                    </p>
                  </div>
                  <div className="badge badge-sm">Start</div>
                </div>
              </div>
            </div>

            {/* Timeline points for practices */}
            {data.timelinePoints.map((point, index) => (
              <div key={index} className="relative mb-6">
                <div className="absolute -left-8 mt-1.5 rounded-full h-4 w-4 border-2 border-success bg-base-100 flex items-center justify-center">
                  <span className="text-xs">
                    {getPracticeIcon(data.timelinePoints[index]?.practiceId)}
                  </span>
                </div>
                <div
                  className={`bg-base-100 p-3 rounded-lg shadow-sm border-l-4 border-success`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-medium">{point.practice}</h6>
                      <p className="text-xs mt-1">{formatDate(point.date)}</p>
                      <p className="text-xs text-success mt-1">
                        +{point.points} biodiversity points
                      </p>
                    </div>
                    <div className="badge badge-sm badge-success">
                      {point.score}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Timeline points for wildlife spottings */}
            {data.spottingPoints.slice(0, 3).map((spotting, index) => (
              <div key={`spotting-${index}`} className="relative mb-6">
                <div className="absolute -left-8 mt-1.5 rounded-full h-4 w-4 border-2 border-warning bg-base-100"></div>
                <div
                  className={`bg-base-100 p-3 rounded-lg shadow-sm ${getSeasonalColor(
                    spotting.date
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h6 className="font-medium">
                        Wildlife Spotted: {spotting.species}
                      </h6>
                      <p className="text-xs mt-1">
                        {formatDate(spotting.date)}
                      </p>
                      <div className="badge badge-sm badge-ghost mt-1">
                        {spotting.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data.spottingPoints.length > 3 && (
              <div className="text-center text-xs text-base-content opacity-70">
                + {data.spottingPoints.length - 3} more wildlife spottings
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-base-100 p-4 rounded-lg text-center">
          <p className="text-sm mb-2">
            No biodiversity practices recorded yet.
          </p>
          <p className="text-xs opacity-80">
            Add biodiversity practices to see your journey visualized here.
          </p>
        </div>
      )}
    </div>
  );
};

export default BiodiversityVisualization;
