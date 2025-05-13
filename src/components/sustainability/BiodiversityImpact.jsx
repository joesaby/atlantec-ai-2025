import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityImpact = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [biodiversityScore, setBiodiversityScore] = useState(0);
  const [speciesSupported, setSpeciesSupported] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  // Add state for tracking historical scores
  const [historicalScores, setHistoricalScores] = useState([]);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Calculate biodiversity impact
    const biodiversityData = calculateBiodiversityImpact(progress);
    setBiodiversityScore(biodiversityData.score);
    setSpeciesSupported(biodiversityData.speciesSupported);

    // Generate recommendations
    const biodiversityRecommendations =
      generateBiodiversityRecommendations(progress);
    setRecommendations(biodiversityRecommendations);

    // Load or initialize historical scores
    try {
      const savedScores = localStorage.getItem(
        "biodiversity-historical-scores"
      );
      let scoreHistory = savedScores ? JSON.parse(savedScores) : [];

      // Check if we need to add a new monthly entry
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const lastEntry =
        scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1] : null;
      const needsNewEntry =
        !lastEntry ||
        new Date(lastEntry.date).getMonth() !== currentMonth ||
        new Date(lastEntry.date).getFullYear() !== currentYear;

      if (needsNewEntry) {
        scoreHistory.push({
          date: today.toISOString(),
          score: biodiversityData.score,
          month: today.toLocaleString("default", { month: "short" }),
        });

        // Keep only the last 6 entries
        if (scoreHistory.length > 6) {
          scoreHistory = scoreHistory.slice(-6);
        }

        // Save back to localStorage
        localStorage.setItem(
          "biodiversity-historical-scores",
          JSON.stringify(scoreHistory)
        );
      }

      setHistoricalScores(scoreHistory);
    } catch (error) {
      console.error("Error handling historical scores:", error);
      // Initialize with just current score if there was an error
      setHistoricalScores([
        {
          date: new Date().toISOString(),
          score: biodiversityData.score,
          month: new Date().toLocaleString("default", { month: "short" }),
        },
      ]);
    }
  }, []);

  const calculateBiodiversityImpact = (progress) => {
    // Default starting values
    let score = 10; // Base score for having a garden at all

    // Species support estimates
    const speciesSupport = {
      pollinators: 0,
      birds: 0,
      beneficial_insects: 0,
      soil_organisms: 0,
    };

    // Check for biodiversity practices
    const activePracticeIds = progress.activePractices.map((p) => p.id || "");

    // Check for native plant usage
    if (
      activePracticeIds.some(
        (id) => id.includes("native") || id.includes("biodiversity-1")
      )
    ) {
      score += 20;
      speciesSupport.pollinators += 15;
      speciesSupport.birds += 10;
      speciesSupport.beneficial_insects += 12;
    }

    // Check for pollinator-friendly practices
    if (
      activePracticeIds.some(
        (id) => id.includes("pollinator") || id.includes("biodiversity-2")
      )
    ) {
      score += 15;
      speciesSupport.pollinators += 25;
      speciesSupport.beneficial_insects += 15;
    }

    // Check for wildlife habitat creation
    if (
      activePracticeIds.some(
        (id) => id.includes("wildlife") || id.includes("biodiversity-3")
      )
    ) {
      score += 20;
      speciesSupport.birds += 20;
      speciesSupport.beneficial_insects += 10;
    }

    // Check for organic/no chemical practices
    if (
      activePracticeIds.some(
        (id) => id.includes("organic") || id.includes("natural-pest")
      )
    ) {
      score += 15;
      speciesSupport.pollinators += 10;
      speciesSupport.beneficial_insects += 15;
      speciesSupport.soil_organisms += 25;
    }

    // Check for soil health practices
    if (
      activePracticeIds.some(
        (id) => id.includes("compost") || id.includes("soil-health")
      )
    ) {
      score += 10;
      speciesSupport.soil_organisms += 30;
      speciesSupport.beneficial_insects += 8;
    }

    // Check for water features
    if (activePracticeIds.some((id) => id.includes("water-feature"))) {
      score += 10;
      speciesSupport.pollinators += 5;
      speciesSupport.birds += 15;
    }

    // Ensure score is capped at 100
    score = Math.min(100, score);

    // Round the score for better UX
    score = Math.round(score);

    return {
      score,
      speciesSupported: speciesSupport,
    };
  };

  const generateBiodiversityRecommendations = (progress) => {
    const activePracticeIds = progress.activePractices.map((p) => p.id || "");
    const recommendations = [];

    // Native planting recommendation
    if (
      !activePracticeIds.some(
        (id) => id.includes("native") || id.includes("biodiversity-1")
      )
    ) {
      recommendations.push({
        title: "Add Native Irish Plants",
        description:
          "Include plants like Foxglove, Primrose, and Hawthorn to support local biodiversity",
        impact: "high",
        ease: "easy",
        icon: "🌱",
      });
    }

    // Pollinator recommendation
    if (
      !activePracticeIds.some(
        (id) => id.includes("pollinator") || id.includes("biodiversity-2")
      )
    ) {
      recommendations.push({
        title: "Create a Pollinator Patch",
        description:
          "Plant Irish wildflowers like clover, knapweed, and bird's-foot trefoil to support bees",
        impact: "high",
        ease: "easy",
        icon: "🐝",
      });
    }

    // Wildlife habitat recommendation
    if (
      !activePracticeIds.some(
        (id) => id.includes("wildlife") || id.includes("biodiversity-3")
      )
    ) {
      recommendations.push({
        title: "Add Wildlife Habitats",
        description:
          "Create log piles, bird boxes, or hedgehog houses to provide shelter",
        impact: "medium",
        ease: "medium",
        icon: "🦔",
      });
    }

    // Organic practices recommendation
    if (
      !activePracticeIds.some(
        (id) => id.includes("organic") || id.includes("natural-pest")
      )
    ) {
      recommendations.push({
        title: "Switch to Organic Methods",
        description:
          "Avoid chemical pesticides and fertilizers to protect beneficial insects",
        impact: "high",
        ease: "medium",
        icon: "🌿",
      });
    }

    // Water feature recommendation
    if (!activePracticeIds.some((id) => id.includes("water-feature"))) {
      recommendations.push({
        title: "Add a Small Water Feature",
        description:
          "Even a small container pond can support aquatic insects and provide drinking water for birds",
        impact: "medium",
        ease: "medium",
        icon: "💧",
      });
    }

    // Hedge planting recommendation
    if (!activePracticeIds.some((id) => id.includes("hedge"))) {
      recommendations.push({
        title: "Plant a Native Hedge",
        description:
          "Plant native hedges like hawthorn or blackthorn to provide nesting sites and food sources for birds",
        impact: "high",
        ease: "medium",
        icon: "🌳",
      });
    }

    // Leaving unmowed areas recommendation
    if (!activePracticeIds.some((id) => id.includes("unmowed"))) {
      recommendations.push({
        title: "Create Unmowed Grass Areas",
        description:
          "Leave parts of your lawn unmowed to create habitats for insects and small mammals",
        impact: "medium",
        ease: "easy",
        icon: "🌿",
      });
    }

    // Night-friendly lighting recommendation
    if (!activePracticeIds.some((id) => id.includes("night-friendly"))) {
      recommendations.push({
        title: "Install Wildlife-Friendly Lighting",
        description:
          "Use low-level lighting or motion sensors to reduce light pollution that disrupts nocturnal wildlife",
        impact: "medium",
        ease: "easy",
        icon: "🌙",
      });
    }

    // Green roof recommendation
    if (!activePracticeIds.some((id) => id.includes("green-roof"))) {
      recommendations.push({
        title: "Create a Green Roof",
        description:
          "Convert shed or garage roofs into planted areas to increase biodiversity and provide additional habitats",
        impact: "high",
        ease: "medium",
        icon: "🏡",
      });
    }

    // Berry bushes for birds recommendation
    if (!activePracticeIds.some((id) => id.includes("berry-bushes"))) {
      recommendations.push({
        title: "Plant Native Berry Bushes",
        description:
          "Add rowan, elder, or holly bushes to provide winter food sources for birds",
        impact: "high",
        ease: "medium",
        icon: "🍒",
      });
    }

    // Layered planting recommendation
    if (!activePracticeIds.some((id) => id.includes("layered-planting"))) {
      recommendations.push({
        title: "Create Layered Planting",
        description:
          "Combine trees, shrubs, and ground cover to create diverse habitats for various species",
        impact: "high",
        ease: "medium",
        icon: "🌲",
      });
    }

    // Insect hotel recommendation
    if (!activePracticeIds.some((id) => id.includes("insect-hotel"))) {
      recommendations.push({
        title: "Build an Insect Hotel",
        description:
          "Create a structure with various materials to provide habitat for solitary bees and beneficial insects",
        impact: "medium",
        ease: "easy",
        icon: "🏨",
      });
    }

    // Winter resources recommendation
    if (!activePracticeIds.some((id) => id.includes("winter-resources"))) {
      recommendations.push({
        title: "Provide Winter Resources",
        description:
          "Leave seed heads on plants and install bird feeders to support wildlife through winter months",
        impact: "medium",
        ease: "easy",
        icon: "❄️",
      });
    }

    // Microclimate recommendation
    if (!activePracticeIds.some((id) => id.includes("microclimate"))) {
      recommendations.push({
        title: "Create Micro-Habitats",
        description:
          "Add stone piles, log stacks, and varied terrain to create diverse microclimates for insects and small animals",
        impact: "medium",
        ease: "easy",
        icon: "🪨",
      });
    }

    return recommendations;
  };

  const getScoreClass = (score) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-error";
  };

  const getImpactLevel = (impact) => {
    switch (impact) {
      case "high":
        return "bg-success text-success-content";
      case "medium":
        return "bg-warning text-warning-content";
      case "low":
        return "bg-info text-info-content";
      default:
        return "bg-base-300";
    }
  };

  if (!userProgress) {
    return <div className="loading loading-spinner loading-md"></div>;
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Biodiversity Score Tracker</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-200 p-4 rounded-lg text-center">
          <h4 className="font-semibold mb-3">Your Biodiversity Score</h4>
          <div
            className={`radial-progress text-2xl font-bold ${getScoreClass(
              biodiversityScore
            )}`}
            style={{ "--value": biodiversityScore }}
            role="progressbar"
            aria-valuenow={biodiversityScore}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {biodiversityScore}%
          </div>
          <p className="mt-2 text-sm">
            {biodiversityScore >= 70
              ? "Biodiversity Champion"
              : biodiversityScore >= 40
              ? "Eco-Friendly Garden"
              : "Biodiversity Beginner"}
          </p>
        </div>

        <div className="md:col-span-2 bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            Species Supported in Your Garden
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-base-100 p-3 rounded-lg text-center">
              <span className="block text-xl mb-1">🐝</span>
              <span className="block text-lg font-medium">
                {speciesSupported.pollinators || 0}
              </span>
              <span className="text-xs">Pollinators</span>
            </div>
            <div className="bg-base-100 p-3 rounded-lg text-center">
              <span className="block text-xl mb-1">🦜</span>
              <span className="block text-lg font-medium">
                {speciesSupported.birds || 0}
              </span>
              <span className="text-xs">Bird Species</span>
            </div>
            <div className="bg-base-100 p-3 rounded-lg text-center">
              <span className="block text-xl mb-1">🐞</span>
              <span className="block text-lg font-medium">
                {speciesSupported.beneficial_insects || 0}
              </span>
              <span className="text-xs">Beneficial Insects</span>
            </div>
            <div className="bg-base-100 p-3 rounded-lg text-center">
              <span className="block text-xl mb-1">🪱</span>
              <span className="block text-lg font-medium">
                {speciesSupported.soil_organisms || 0}
              </span>
              <span className="text-xs">Soil Organisms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">
          Next Steps to Improve Your Biodiversity Score
        </h4>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-base-100 p-3 rounded-lg flex items-start gap-3 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-2xl">{rec.icon}</div>
                <div>
                  <h5 className="font-medium">{rec.title}</h5>
                  <p className="text-sm opacity-80">{rec.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getImpactLevel(
                        rec.impact
                      )}`}
                    >
                      {rec.impact} impact
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-base-300">
                      {rec.ease} to do
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="font-medium text-success">
              Great job! You've implemented many biodiversity practices.
            </p>
            <p className="text-sm mt-2">
              Continue maintaining these practices to support local wildlife.
            </p>
          </div>
        )}
      </div>

      {/* Biodiversity Progress Chart */}
      {historicalScores.length > 1 && (
        <div className="mt-6 bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Your Biodiversity Progress</h4>
          <div className="h-32 flex items-end justify-around">
            {historicalScores.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-12 bg-opacity-80 rounded-t-sm flex justify-center items-end transition-all duration-1000"
                  style={{
                    height: `${Math.max(5, (entry.score / 100) * 100)}%`,
                    backgroundColor:
                      entry.score >= 70
                        ? "#10B981"
                        : entry.score >= 40
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                >
                  <span className="text-xs text-white font-medium mb-1">
                    {Math.round(entry.score)}%
                  </span>
                </div>
                <span className="text-xs mt-1">{entry.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-4 text-base-content opacity-70">
            {historicalScores[historicalScores.length - 1].score >
            historicalScores[0].score
              ? "Great progress! Your biodiversity score is improving."
              : historicalScores[historicalScores.length - 1].score <
                historicalScores[0].score
              ? "Your biodiversity score has decreased. Check the recommendations to improve."
              : "Your biodiversity score has remained stable."}
          </p>
        </div>
      )}

      {/* Seasonal Biodiversity Tip */}
      <div className="mt-6 bg-info bg-opacity-10 p-4 rounded-lg border border-info">
        <h4 className="font-semibold mb-2 flex items-center">
          <span className="text-xl mr-2">🍃</span>
          Seasonal Biodiversity Tip
        </h4>
        <p className="text-sm">
          {new Date().getMonth() >= 2 && new Date().getMonth() <= 4
            ? "Spring: Leave dandelions and early blooming 'weeds' for early season pollinators emerging from hibernation."
            : new Date().getMonth() >= 5 && new Date().getMonth() <= 7
            ? "Summer: Consider setting up a bird bath to help birds during hot weather - keep it clean and filled with fresh water."
            : new Date().getMonth() >= 8 && new Date().getMonth() <= 10
            ? "Autumn: Leave some fallen leaves in corners of your garden to provide winter shelter for insects and hedgehogs."
            : "Winter: Provide food and water for birds, and leave some areas of your garden undisturbed for hibernating wildlife."}
        </p>
      </div>

      {/* Biodiversity Resources */}
      <div className="mt-6 bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center">
          <span className="text-xl mr-2">📚</span>
          Useful Biodiversity Resources
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://pollinators.ie/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-base-100 p-3 rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <h5 className="font-medium">All-Ireland Pollinator Plan</h5>
            <p className="text-sm opacity-80">
              Guidelines and resources for helping pollinators in Irish gardens
            </p>
          </a>
          <a
            href="https://www.biodiversityireland.ie/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-base-100 p-3 rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <h5 className="font-medium">National Biodiversity Data Centre</h5>
            <p className="text-sm opacity-80">
              Record your garden wildlife sightings and contribute to citizen
              science
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BiodiversityImpact;
