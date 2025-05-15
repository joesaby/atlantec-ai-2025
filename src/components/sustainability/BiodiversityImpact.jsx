import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityImpact = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [biodiversityScore, setBiodiversityScore] = useState(0);
  const [speciesSupported, setSpeciesSupported] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  // Add state for tracking historical scores
  const [historicalScores, setHistoricalScores] = useState([]);
  // Add state for current season and interactive elements
  const [currentSeason, setCurrentSeason] = useState("");
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [showPracticeForm, setShowPracticeForm] = useState(false);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Calculate biodiversity impact
    const biodiversityData = calculateBiodiversityImpact(progress);
    setBiodiversityScore(biodiversityData.score);
    setSpeciesSupported(biodiversityData.speciesSupported);

    // Determine current season
    const now = new Date();
    const month = now.getMonth();
    let season;
    if (month >= 2 && month <= 4) {
      season = "spring";
    } else if (month >= 5 && month <= 7) {
      season = "summer";
    } else if (month >= 8 && month <= 10) {
      season = "autumn";
    } else {
      season = "winter";
    }
    setCurrentSeason(season);

    // Generate recommendations with seasonal priority
    const biodiversityRecommendations = generateBiodiversityRecommendations(
      progress,
      season
    );
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

  // Listen for storage events to refresh data when practices are added elsewhere
  useEffect(() => {
    // Function to check for changes and refresh data
    const handleStorageChange = (e) => {
      if (e.key === "garden-progress") {
        const progress = getAllUserProgress();
        setUserProgress(progress);

        // Recalculate biodiversity impact
        const biodiversityData = calculateBiodiversityImpact(progress);
        setBiodiversityScore(biodiversityData.score);
        setSpeciesSupported(biodiversityData.speciesSupported);

        // Generate new recommendations
        const updatedRecommendations = generateBiodiversityRecommendations(
          progress,
          currentSeason
        );
        setRecommendations(updatedRecommendations);
      }
    };

    // Add event listener for storage events (when other components update storage)
    window.addEventListener("storage", handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentSeason]); // Depend on currentSeason

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

  const generateBiodiversityRecommendations = (progress, season) => {
    const activePracticeIds = progress.activePractices.map((p) => p.id || "");
    const recommendations = [];

    // Define seasonal priorities for recommendations
    const seasonalPriorities = {
      spring: ["native", "pollinator", "biodiversity-1", "biodiversity-2"],
      summer: ["water-feature", "organic", "natural-pest", "unmowed"],
      autumn: ["hedge", "berry-bushes", "layered-planting", "compost"],
      winter: ["wildlife", "insect-hotel", "biodiversity-3", "night-friendly"],
    };

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

    // Sort recommendations based on seasonal priorities
    if (season && seasonalPriorities[season]) {
      const priorityIds = seasonalPriorities[season];
      recommendations.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        // Check if recommendation matches seasonal priority
        const aIsPriority = priorityIds.some((id) =>
          aTitle.includes(id.replace("-", " "))
        );
        const bIsPriority = priorityIds.some((id) =>
          bTitle.includes(id.replace("-", " "))
        );

        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;

        // If both or neither are priorities, sort by impact
        if (a.impact === "high" && b.impact !== "high") return -1;
        if (a.impact !== "high" && b.impact === "high") return 1;

        return 0;
      });

      // Add seasonal labels to priority recommendations (first 2)
      if (recommendations.length > 0) {
        recommendations[0].seasonal = true;
        if (recommendations.length > 1) {
          recommendations[1].seasonal = true;
        }
      }
    }

    return recommendations;
  };

  const handleRecommendationClick = (recommendation) => {
    setActiveRecommendation(recommendation);
  };

  const handleAddPractice = () => {
    setShowPracticeForm(true);
  };

  const handleImplementPractice = () => {
    try {
      if (!activeRecommendation) return;

      // Get implementation date from the form
      const implementationDateInput =
        document.querySelector('input[type="date"]');
      const implementationNotes = document.querySelector("textarea").value;
      const implementationDate =
        implementationDateInput?.value ||
        new Date().toISOString().split("T")[0];

      // Create a practice ID based on the recommendation title
      const practiceId = activeRecommendation.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      // Determine which biodiversity category this practice belongs to
      let categoryId = "biodiversity-4"; // Default to misc biodiversity practices

      if (
        activeRecommendation.title.includes("Native") ||
        activeRecommendation.title.includes("Plant")
      ) {
        categoryId = "biodiversity-1"; // Native plant growing
      } else if (
        activeRecommendation.title.includes("Pollinator") ||
        activeRecommendation.title.includes("bee")
      ) {
        categoryId = "biodiversity-2"; // Pollinator support
      } else if (
        activeRecommendation.title.includes("Wildlife") ||
        activeRecommendation.title.includes("Habitat")
      ) {
        categoryId = "biodiversity-3"; // Wildlife habitats
      }

      // Create practice object
      const newPractice = {
        id: `${categoryId}-${practiceId}`,
        name: activeRecommendation.title,
        description: activeRecommendation.description,
        implementedOn: implementationDate,
        notes: implementationNotes,
        impact: activeRecommendation.impact || "medium",
      };

      // Get current user progress
      const currentProgress = getAllUserProgress();

      // Add the new practice to active practices
      const updatedPractices = [
        ...(currentProgress.activePractices || []),
        newPractice,
      ];

      // Update user progress in localStorage
      const updatedProgress = {
        ...currentProgress,
        activePractices: updatedPractices,
      };

      localStorage.setItem("garden-progress", JSON.stringify(updatedProgress));

      // Reset UI state
      setActiveRecommendation(null);
      setShowPracticeForm(false);

      // Update local state
      setUserProgress(updatedProgress);

      // Recalculate biodiversity impact with the new practice
      const biodiversityData = calculateBiodiversityImpact(updatedProgress);
      setBiodiversityScore(biodiversityData.score);
      setSpeciesSupported(biodiversityData.speciesSupported);

      // Generate new recommendations (one less now)
      const updatedRecommendations = generateBiodiversityRecommendations(
        updatedProgress,
        currentSeason
      );
      setRecommendations(updatedRecommendations);

      // Show success message
      const practiceAddedMessage = `${activeRecommendation.title} added to your garden! Your biodiversity score is now ${biodiversityData.score}.`;
      alert(practiceAddedMessage);
    } catch (error) {
      console.error("Error implementing practice:", error);
      alert("There was a problem adding this practice. Please try again.");
    }
  };

  const getSeasonalTip = () => {
    switch (currentSeason) {
      case "spring":
        return "Spring is an ideal time to add native flowering plants to support early pollinators emerging from hibernation.";
      case "summer":
        return "Summer is perfect for adding water features and creating undisturbed areas for wildlife to shelter from heat.";
      case "autumn":
        return "Autumn is the best time to plant trees, shrubs and hedges that will provide winter shelter and spring nesting sites.";
      case "winter":
        return "Winter is crucial for wildlife - maintain feeding stations and leave seed heads on plants for food sources.";
      default:
        return "Each season offers different opportunities to enhance biodiversity in your garden.";
    }
  };

  const getSpeciesIcon = (type) => {
    switch (type) {
      case "pollinators":
        return "🐝";
      case "birds":
        return "🐦";
      case "beneficial_insects":
        return "🦋";
      case "soil_organisms":
        return "🪱";
      default:
        return "🌿";
    }
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
      {/* Seasonal Banner */}
      <div
        className={`mb-5 p-3 rounded-lg ${
          currentSeason === "spring"
            ? "bg-success bg-opacity-10 border-l-4 border-success"
            : currentSeason === "summer"
            ? "bg-warning bg-opacity-10 border-l-4 border-warning"
            : currentSeason === "autumn"
            ? "bg-accent bg-opacity-10 border-l-4 border-accent"
            : "bg-info bg-opacity-10 border-l-4 border-info"
        }`}
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3">
            {currentSeason === "spring"
              ? "🌷"
              : currentSeason === "summer"
              ? "☀️"
              : currentSeason === "autumn"
              ? "🍂"
              : "❄️"}
          </span>
          <div>
            <h3 className="font-bold text-lg capitalize">
              {currentSeason} Biodiversity Focus
            </h3>
            <p className="text-sm">{getSeasonalTip()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Section */}
        <div className="bg-base-200 p-4 rounded-lg text-center relative">
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
            {biodiversityScore}
          </div>
          <p className="mt-3 text-sm font-medium">
            {biodiversityScore >= 70
              ? "Biodiversity Champion"
              : biodiversityScore >= 40
              ? "Eco-Friendly Garden"
              : "Biodiversity Beginner"}
          </p>

          {/* Historical tracking if available */}
          {historicalScores.length > 1 && (
            <div className="mt-3 text-xs">
              <p className="font-medium">
                Your score has
                {historicalScores[historicalScores.length - 1].score >
                historicalScores[0].score ? (
                  <span className="text-success"> increased </span>
                ) : (
                  <span className="text-error"> decreased </span>
                )}
                since {historicalScores[0].month}.
              </p>
            </div>
          )}
        </div>

        {/* Species Support Section */}
        <div className="md:col-span-2 bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            Wildlife Supported by Your Garden
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(speciesSupported).map(([type, count]) => (
              <div
                key={type}
                className="bg-base-100 p-3 rounded-lg text-center shadow-sm hover:shadow-md transition-all"
              >
                <span className="block text-xl mb-1">
                  {getSpeciesIcon(type)}
                </span>
                <span className="block text-lg font-medium">{count || 0}</span>
                <span className="text-xs capitalize">
                  {type.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2 bg-base-300 bg-opacity-50 rounded text-sm">
            <p className="font-medium">
              These estimates are based on your current gardening practices and
              local Irish ecosystems.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Section - Interactive */}
      <div className="mt-6 bg-base-200 p-4 rounded-lg">
        {activeRecommendation && !showPracticeForm ? (
          <div className="bg-base-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <span className="text-2xl">{activeRecommendation.icon}</span>
                {activeRecommendation.title}
              </h4>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setActiveRecommendation(null)}
              >
                ✕
              </button>
            </div>

            <p className="mb-4">{activeRecommendation.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-base-200 p-3 rounded-lg">
                <h5 className="font-medium mb-2">Benefits</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Increases biodiversity score by ~10-20 points</li>
                  <li>Supports native Irish wildlife</li>
                  <li>Contributes to ecological resilience</li>
                  {activeRecommendation.seasonal && (
                    <li className="text-success font-medium">
                      Especially effective in {currentSeason}
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-base-200 p-3 rounded-lg">
                <h5 className="font-medium mb-2">Implementation</h5>
                <p className="text-sm mb-2">
                  Difficulty:{" "}
                  <span className="font-medium">
                    {activeRecommendation.ease}
                  </span>
                </p>
                <p className="text-sm">
                  Impact:{" "}
                  <span className="font-medium">
                    {activeRecommendation.impact}
                  </span>
                </p>
                <p className="text-sm mt-2">
                  Best season:{" "}
                  <span className="font-medium capitalize">
                    {currentSeason}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={handleAddPractice}>
                Implement This Practice
              </button>
            </div>
          </div>
        ) : showPracticeForm ? (
          <div className="bg-base-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-lg">
                Implement {activeRecommendation.title}
              </h4>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowPracticeForm(false);
                  setActiveRecommendation(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">When did you implement this?</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Notes (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Add any details about how you implemented this practice..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleImplementPractice}
              >
                Save Practice to My Garden
              </button>
            </div>
          </div>
        ) : (
          <>
            <h4 className="font-semibold mb-3">
              Next Steps to Improve Your Biodiversity Score
            </h4>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`bg-base-100 p-3 rounded-lg flex items-start gap-3 cursor-pointer
                      ${
                        rec.seasonal
                          ? "border-2 border-" +
                            (currentSeason === "spring"
                              ? "success"
                              : currentSeason === "summer"
                              ? "warning"
                              : currentSeason === "autumn"
                              ? "accent"
                              : "info")
                          : ""
                      }
                      hover:shadow-md transition-shadow duration-200`}
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <div className="text-2xl">{rec.icon}</div>
                    <div>
                      <div className="flex items-center">
                        <h5 className="font-medium">{rec.title}</h5>
                        {rec.seasonal && (
                          <span className="ml-2 badge badge-sm badge-outline badge-success">
                            {currentSeason}
                          </span>
                        )}
                      </div>
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
                  Maintain your current practices to continue supporting Irish
                  biodiversity.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add historical score visualization */}
      {historicalScores.length > 0 && (
        <div className="mt-6 bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Your Biodiversity Journey</h4>
          <div className="flex justify-between items-end h-32 px-4">
            {historicalScores.map((score, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-6 rounded-t bg-primary"
                  style={{ height: `${score.score}%` }}
                ></div>
                <span className="text-xs mt-1">{score.month}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-center mt-3">
            <p>Score progression over time</p>
          </div>
        </div>
      )}

      <div className="mt-5 p-3 bg-base-300 rounded-lg">
        <div className="flex items-start">
          <div className="mt-1 text-success text-xl mr-2">💡</div>
          <div>
            <h5 className="font-medium mb-1">Biodiversity Tip</h5>
            <p className="text-sm">
              Every 10% increase in native plants in your garden can support up
              to 40% more bird and butterfly species. Small changes make a big
              difference to Irish wildlife!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiodiversityImpact;
