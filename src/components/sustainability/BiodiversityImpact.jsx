import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityImpact = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [biodiversityScore, setBiodiversityScore] = useState(0);
  const [speciesSupported, setSpeciesSupported] = useState({});
  const [recommendations, setRecommendations] = useState([]);

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
      <h3 className="text-xl font-bold mb-4">Biodiversity Impact</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-base-200 p-4 rounded-lg text-center">
          <h4 className="font-semibold mb-3">Your Biodiversity Score</h4>
          <div
            className={`radial-progress text-2xl font-bold ${getScoreClass(
              biodiversityScore
            )}`}
            style={{ "--value": biodiversityScore }}
            role="progressbar"
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

      <div className="mt-6">
        <h4 className="font-semibold mb-3">
          Irish Biodiversity: Why It Matters
        </h4>
        <p className="text-sm mb-4">
          Ireland has experienced a 14% decline in its biodiversity since the
          1990s. Gardens cover over half a million acres across the country -
          with the right practices, your garden can become a vital sanctuary for
          native species, including threatened pollinators like Ireland's 98
          native bee species, 35% of which are at risk of extinction.
        </p>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-3">Biodiversity Recommendations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-base-200 p-4 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">{rec.icon}</span>
                <div>
                  <h5 className="font-medium">{rec.title}</h5>
                  <p className="text-sm mt-1">{rec.description}</p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiodiversityImpact;
