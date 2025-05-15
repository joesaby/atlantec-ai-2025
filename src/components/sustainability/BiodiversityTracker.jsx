import React, { useState, useEffect } from "react";
import {
  getAllUserProgress,
  getChallengeProgress,
} from "../../utils/sustainability-store";
import BiodiversityVisualization from "./BiodiversityVisualization";
import WildlifeSpottingLog from "./WildlifeSpottingLog";
import IrishNativeSpeciesGuide from "./IrishNativeSpeciesGuide";

const BiodiversityTracker = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [biodiversityScore, setBiodiversityScore] = useState(0);
  const [speciesSupported, setSpeciesSupported] = useState({});
  const [biodiversityPractices, setBiodiversityPractices] = useState([]);
  const [challenges, setChallenges] = useState({ accepted: [], completed: [] });
  const [badgeLevel, setBadgeLevel] = useState("beginner");

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Get challenge completion data
    const challengeData = getChallengeProgress();
    setChallenges(challengeData);

    // Calculate biodiversity impact
    const biodiversityData = calculateBiodiversityImpact(progress);
    setBiodiversityScore(biodiversityData.score);
    setSpeciesSupported(biodiversityData.speciesSupported);

    // For use throughout the component
    const activePracticeIds = progress.activePractices.map((p) => p.id || "");

    // Extract biodiversity-related practices
    const bioPractices = progress.activePractices
      .filter((p) => {
        const id = p.id || "";
        return (
          id.includes("biodiversity") ||
          id.includes("native") ||
          id.includes("pollinator") ||
          id.includes("wildlife") ||
          id.includes("organic")
        );
      })
      .map((practice) => {
        try {
          let practiceDetails = null;
          const {
            sustainablePractices,
          } = require("../../data/sustainability-metrics");

          // Look for the practice in all categories
          for (const category of Object.values(sustainablePractices)) {
            const foundPractice = category.practices.find(
              (p) => p.id === practice.id
            );
            if (foundPractice) {
              practiceDetails = {
                ...foundPractice,
                implementedOn: practice.implementedOn,
              };
              break;
            }
          }
          return practiceDetails;
        } catch (error) {
          console.error("Error finding practice details:", error);
          return {
            id: practice.id,
            name: "Unknown Practice",
            implementedOn: practice.implementedOn,
          };
        }
      })
      .filter((practice) => practice !== null);

    setBiodiversityPractices(bioPractices);

    // Set badge level based on biodiversity score
    if (biodiversityData.score >= 70) {
      setBadgeLevel("champion");
    } else if (biodiversityData.score >= 40) {
      setBadgeLevel("supporter");
    } else {
      setBadgeLevel("beginner");
    }
  }, []);

  // This is the same calculation used in BiodiversityImpact.jsx
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

    // Additional points for biodiversity-related challenges completed
    const biodiversityChallenges = {
      May: "Pollinator Paradise", // May challenge about pollinators
      September: "Seed Saving", // Promotes biodiversity
      November: "Wildlife Habitat Creation",
    };

    // Check if any biodiversity-related challenges were completed
    if (typeof window !== "undefined" && window.localStorage) {
      Object.keys(biodiversityChallenges).forEach((month) => {
        const isCompleted = localStorage.getItem(
          `completed-challenge-${month}`
        );
        if (isCompleted === "true") {
          score += 5; // Add 5 points for each completed biodiversity challenge

          // Add specific species support based on the challenge
          if (month === "May") {
            // Pollinator challenge
            speciesSupport.pollinators += 10;
          } else if (month === "November") {
            // Wildlife habitat challenge
            speciesSupport.birds += 10;
            speciesSupport.beneficial_insects += 5;
          }
        }
      });
    }

    // Ensure score is capped at 100
    score = Math.min(100, score);

    return {
      score,
      speciesSupported: speciesSupport,
    };
  };

  // Helper function to get color class based on score
  const getScoreClass = (score) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-info";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get biodiversity challenges for each month
  const getBiodiversityChallenges = () => {
    return {
      May: {
        title: "Pollinator Paradise",
        description:
          "Plant a dedicated area with native Irish flowers for pollinators",
        month: "May",
      },
      September: {
        title: "Seed Saving",
        description:
          "Collect and properly store seeds from at least 5 different plants",
        month: "September",
      },
      November: {
        title: "Wildlife Habitat Creation",
        description:
          "Create at least one new wildlife habitat feature in your garden",
        month: "November",
      },
    };
  };

  const biodiversityChallenges = getBiodiversityChallenges();

  if (!userProgress) {
    return <div className="loading loading-spinner loading-md"></div>;
  }

  // Extract active practice IDs for UI rendering
  const activePracticeIds = userProgress
    ? userProgress.activePractices.map((p) => p.id || "")
    : [];

  // Add the new components
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Biodiversity Score Tracker</h3>

        {/* New announcement badge for spring wildlife activity */}
        <div className="badge badge-accent gap-2 p-3 mt-2 md:mt-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          May is peak biodiversity month in Ireland! 🦋
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-base-200 mb-6">
        <button
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "journey" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("journey")}
        >
          Your Journey
        </button>
        <button
          className={`tab ${activeTab === "wildlife" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("wildlife")}
        >
          Wildlife Log
        </button>
        <button
          className={`tab ${activeTab === "guide" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          Species Guide
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biodiversity Score Card */}
          <div className="bg-base-200 p-5 rounded-lg flex flex-col items-center">
            <div className="mb-4 text-center">
              <h4 className="font-semibold">Your Biodiversity Score</h4>
              <div
                className={`radial-progress text-4xl font-bold my-4 ${getScoreClass(
                  biodiversityScore
                )}`}
                style={{ "--value": biodiversityScore, "--size": "8rem" }}
                role="progressbar"
              >
                {biodiversityScore}%
              </div>

              {badgeLevel === "champion" && (
                <div className="badge badge-success gap-2 p-3 text-success-content font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-award"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68L9.669.864zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702 1.509.229z" />
                    <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1 4 11.794z" />
                  </svg>
                  Biodiversity Champion
                </div>
              )}

              {badgeLevel === "supporter" && (
                <div className="badge badge-warning gap-2 p-3 text-warning-content font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-flower1"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.174 1.184a2 2 0 0 1 3.652 0A2 2 0 0 1 12.99 3.01a2 2 0 0 1 1.826 3.164 2 2 0 0 1 0 3.652 2 2 0 0 1-1.826 3.164 2 2 0 0 1-3.164 1.826 2 2 0 0 1-3.652 0A2 2 0 0 1 3.01 12.99a2 2 0 0 1-1.826-3.164 2 2 0 0 1 0-3.652A2 2 0 0 1 3.01 3.01a2 2 0 0 1 3.164-1.826zM8 1a1 1 0 0 0-.998 1.03l.01.091c.012.077.029.176.054.296.049.241.122.542.213.887.182.688.428 1.513.676 2.314L8 5.762l.045-.144c.248-.8.494-1.626.676-2.314.091-.345.164-.646.213-.887a4.997 4.997 0 0 0 .064-.386L9 2a1 1 0 0 0-1-1zM2 9l.03-.002.091-.01a4.99 4.99 0 0 0 .296-.054c.241-.049.542-.122.887-.213a60.59 60.59 0 0 0 2.314-.676L5.762 8l-.144-.045a60.59 60.59 0 0 0-2.314-.676 16.705 16.705 0 0 0-.887-.213 4.99 4.99 0 0 0-.386-.064L2 7a1 1 0 1 0 0 2zm7 5-.002-.03a5.005 5.005 0 0 0-.064-.386 16.398 16.398 0 0 0-.213-.888 60.582 60.582 0 0 0-.676-2.314L8 10.238l-.045.144c-.248.8-.494 1.626-.676 2.314-.091.345-.164.646-.213.887a4.996 4.996 0 0 0-.064.386L7 14a1 1 0 1 0 2 0zm-5.696-2.134.025-.017a5.001 5.001 0 0 0 .303-.248c.184-.164.408-.377.661-.629A60.614 60.614 0 0 0 5.96 9.23l.103-.111-.147.033a60.88 60.88 0 0 0-2.343.572c-.344.093-.64.18-.874.258a5.063 5.063 0 0 0-.367.138l-.027.014a1 1 0 1 0 1 1.732zM4.5 14.062a1 1 0 0 0 1.366-.366l.014-.027c.01-.02.021-.048.036-.084a5.09 5.09 0 0 0 .102-.283c.078-.233.165-.53.258-.874a60.6 60.6 0 0 0 .572-2.343l.033-.147-.11.102a60.848 60.848 0 0 0-1.743 1.667 17.07 17.07 0 0 0-.629.66 5.06 5.06 0 0 0-.248.304l-.017.025a1 1 0 0 0 .366 1.366zm9.196-8.196a1 1 0 0 0-1-1.732l-.025.017a4.951 4.951 0 0 0-.303.248 16.69 16.69 0 0 0-.661.629A60.72 60.72 0 0 0 10.04 6.77l-.102.111.147-.033a60.6 60.6 0 0 0 2.342-.572c.345-.093.642-.18.875-.258a4.993 4.993 0 0 0 .367-.138.53.53 0 0 0 .027-.014zM11.5 1.938a1 1 0 0 0-1.366.366l-.014.027c-.01.02-.021.048-.036.084a5.09 5.09 0 0 0-.102.283c-.078.233-.165.53-.258.875a60.62 60.62 0 0 0-.572 2.342l-.033.147.11-.102a60.848 60.848 0 0 0 1.743-1.667c.252-.253.465-.477.629-.66a5.001 5.001 0 0 0 .248-.304l.017-.025a1 1 0 0 0-.366-1.366zM8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                  </svg>
                  Eco-Friendly Gardener
                </div>
              )}

              {badgeLevel === "beginner" && (
                <div className="badge badge-info gap-2 p-3 text-info-content font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-star"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                  </svg>
                  Biodiversity Beginner
                </div>
              )}
            </div>

            {/* Bio Score Progress Bars */}
            <div className="w-full space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Native Plants</span>
                  <span>
                    {activePracticeIds.some(
                      (id) =>
                        id.includes("native") || id.includes("biodiversity-1")
                    )
                      ? "✓"
                      : "×"}
                  </span>
                </div>
                <progress
                  className={`progress ${
                    activePracticeIds.some(
                      (id) =>
                        id.includes("native") || id.includes("biodiversity-1")
                    )
                      ? "progress-success"
                      : "progress-secondary"
                  }`}
                  value={
                    activePracticeIds.some(
                      (id) =>
                        id.includes("native") || id.includes("biodiversity-1")
                    )
                      ? "100"
                      : "0"
                  }
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pollinator Support</span>
                  <span>
                    {activePracticeIds.some(
                      (id) =>
                        id.includes("pollinator") ||
                        id.includes("biodiversity-2")
                    )
                      ? "✓"
                      : "×"}
                  </span>
                </div>
                <progress
                  className={`progress ${
                    activePracticeIds.some(
                      (id) =>
                        id.includes("pollinator") ||
                        id.includes("biodiversity-2")
                    )
                      ? "progress-success"
                      : "progress-secondary"
                  }`}
                  value={
                    activePracticeIds.some(
                      (id) =>
                        id.includes("pollinator") ||
                        id.includes("biodiversity-2")
                    )
                      ? "100"
                      : "0"
                  }
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Wildlife Habitats</span>
                  <span>
                    {activePracticeIds.some(
                      (id) =>
                        id.includes("wildlife") || id.includes("biodiversity-3")
                    )
                      ? "✓"
                      : "×"}
                  </span>
                </div>
                <progress
                  className={`progress ${
                    activePracticeIds.some(
                      (id) =>
                        id.includes("wildlife") || id.includes("biodiversity-3")
                    )
                      ? "progress-success"
                      : "progress-secondary"
                  }`}
                  value={
                    activePracticeIds.some(
                      (id) =>
                        id.includes("wildlife") || id.includes("biodiversity-3")
                    )
                      ? "100"
                      : "0"
                  }
                  max="100"
                ></progress>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Chemical-Free Gardening</span>
                  <span>
                    {activePracticeIds.some(
                      (id) =>
                        id.includes("organic") || id.includes("natural-pest")
                    )
                      ? "✓"
                      : "×"}
                  </span>
                </div>
                <progress
                  className={`progress ${
                    activePracticeIds.some(
                      (id) =>
                        id.includes("organic") || id.includes("natural-pest")
                    )
                      ? "progress-success"
                      : "progress-secondary"
                  }`}
                  value={
                    activePracticeIds.some(
                      (id) =>
                        id.includes("organic") || id.includes("natural-pest")
                    )
                      ? "100"
                      : "0"
                  }
                  max="100"
                ></progress>
              </div>
            </div>
          </div>

          {/* Species Support Card */}
          <div>
            <div className="bg-base-200 p-5 rounded-lg">
              <h4 className="font-semibold mb-4">
                Species Supported in Your Garden
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-100 p-3 rounded-lg flex items-center">
                  <div className="bg-info bg-opacity-20 rounded-full p-3 mr-3">
                    <span className="text-xl">🐝</span>
                  </div>
                  <div>
                    <h5 className="font-semibold">
                      {speciesSupported.pollinators || 0}
                    </h5>
                    <span className="text-xs opacity-70">Pollinators</span>
                  </div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg flex items-center">
                  <div className="bg-success bg-opacity-20 rounded-full p-3 mr-3">
                    <span className="text-xl">🦜</span>
                  </div>
                  <div>
                    <h5 className="font-semibold">
                      {speciesSupported.birds || 0}
                    </h5>
                    <span className="text-xs opacity-70">Bird Species</span>
                  </div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg flex items-center">
                  <div className="bg-warning bg-opacity-20 rounded-full p-3 mr-3">
                    <span className="text-xl">🐞</span>
                  </div>
                  <div>
                    <h5 className="font-semibold">
                      {speciesSupported.beneficial_insects || 0}
                    </h5>
                    <span className="text-xs opacity-70">
                      Beneficial Insects
                    </span>
                  </div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg flex items-center">
                  <div className="bg-error bg-opacity-20 rounded-full p-3 mr-3">
                    <span className="text-xl">🪱</span>
                  </div>
                  <div>
                    <h5 className="font-semibold">
                      {speciesSupported.soil_organisms || 0}
                    </h5>
                    <span className="text-xs opacity-70">Soil Organisms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Biodiversity Challenges */}
            <div className="bg-base-200 p-5 rounded-lg mt-4">
              <h4 className="font-semibold mb-4">Biodiversity Challenges</h4>
              <div className="space-y-3">
                {Object.keys(biodiversityChallenges).map((month) => {
                  const challenge = biodiversityChallenges[month];
                  const isAccepted = challenges.accepted.includes(month);
                  const isCompleted = challenges.completed.includes(month);

                  // Highlight the May challenge since it's May (based on the date context)
                  const isMayChallenge = month === "May";
                  const isCurrentChallenge = isMayChallenge;

                  return (
                    <div
                      key={month}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        isCompleted
                          ? "bg-success bg-opacity-10 border border-success"
                          : isAccepted
                          ? "bg-info bg-opacity-10 border border-info"
                          : isCurrentChallenge
                          ? "bg-accent bg-opacity-10 border border-accent"
                          : "bg-base-100"
                      }`}
                    >
                      <div
                        className={`badge ${
                          isCompleted
                            ? "badge-success"
                            : isAccepted
                            ? "badge-info"
                            : isCurrentChallenge
                            ? "badge-accent"
                            : "badge-outline"
                        }`}
                      >
                        {month}
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">
                          {challenge.title}
                          {isCurrentChallenge && !isCompleted && (
                            <span className="badge badge-sm badge-accent ml-2">
                              Current
                            </span>
                          )}
                        </h5>
                        <p className="text-xs opacity-80">
                          {challenge.description}
                        </p>
                        {isCompleted && (
                          <div className="text-xs text-success mt-1">
                            Completed! +5 biodiversity points
                          </div>
                        )}
                      </div>
                      {isCompleted && (
                        <div className="ml-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            className="text-success"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="md:col-span-2 bg-base-200 p-4 rounded-lg mt-4">
            <h4 className="font-semibold mb-3">
              Next Steps to Improve Your Biodiversity Score
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!activePracticeIds.some(
                (id) => id.includes("native") || id.includes("biodiversity-1")
              ) && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <h5 className="font-medium">Add Native Irish Plants</h5>
                    <p className="text-sm opacity-80">
                      Include plants like Foxglove, Primrose, and Hawthorn to
                      support local biodiversity
                    </p>
                    <p className="text-xs mt-1 text-success">
                      +20 biodiversity points
                    </p>
                  </div>
                </div>
              )}

              {!activePracticeIds.some(
                (id) =>
                  id.includes("pollinator") || id.includes("biodiversity-2")
              ) && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">🐝</div>
                  <div>
                    <h5 className="font-medium">Create Pollinator Patch</h5>
                    <p className="text-sm opacity-80">
                      Plant Irish wildflowers like clover, knapweed, and
                      bird's-foot trefoil to support bees
                    </p>
                    <p className="text-xs mt-1 text-success">
                      +15 biodiversity points
                    </p>
                  </div>
                </div>
              )}

              {!activePracticeIds.some(
                (id) => id.includes("wildlife") || id.includes("biodiversity-3")
              ) && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">🐦</div>
                  <div>
                    <h5 className="font-medium">Create Wildlife Habitats</h5>
                    <p className="text-sm opacity-80">
                      Add bird boxes, insect hotels, and log piles to provide
                      shelter for various species
                    </p>
                    <p className="text-xs mt-1 text-success">
                      +20 biodiversity points
                    </p>
                  </div>
                </div>
              )}

              {!activePracticeIds.some(
                (id) => id.includes("organic") || id.includes("natural-pest")
              ) && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">🌿</div>
                  <div>
                    <h5 className="font-medium">Go Chemical-Free</h5>
                    <p className="text-sm opacity-80">
                      Switch to natural pest control methods and avoid synthetic
                      chemicals
                    </p>
                    <p className="text-xs mt-1 text-success">
                      +15 biodiversity points
                    </p>
                  </div>
                </div>
              )}

              {!activePracticeIds.some((id) =>
                id.includes("water-feature")
              ) && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">💧</div>
                  <div>
                    <h5 className="font-medium">Add Water Features</h5>
                    <p className="text-sm opacity-80">
                      Create small ponds or water sources to support diverse
                      wildlife
                    </p>
                    <p className="text-xs mt-1 text-success">
                      +10 biodiversity points
                    </p>
                  </div>
                </div>
              )}

              {biodiversityPractices.length >= 4 && (
                <div className="bg-base-100 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <h5 className="font-medium">Record Your Impact</h5>
                    <p className="text-sm opacity-80">
                      Take photos of wildlife in your garden and log the species
                      you observe
                    </p>
                    <button
                      className="btn btn-xs btn-primary mt-2"
                      onClick={() => setActiveTab("wildlife")}
                    >
                      Log Wildlife
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Journey Tab Content */}
      {activeTab === "journey" && (
        <div>
          {/* Add the BiodiversityVisualization component */}
          <BiodiversityVisualization />

          {/* Irish Biodiversity Context */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3">
              Irish Biodiversity: Why It Matters
            </h4>
            <p className="text-sm">
              Ireland has experienced a 14% decline in its biodiversity since
              the 1990s. Gardens cover over half a million acres across the
              country - with the right practices, your garden can become a vital
              sanctuary for native species.
            </p>
            <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded-lg border border-warning">
              <p className="text-sm font-medium text-warning-content">
                <span className="font-bold">Did you know?</span> 35% of
                Ireland's 98 native bee species are at risk of extinction. Your
                garden can make a real difference in helping to protect them.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-6 flex justify-center">
            <a
              href="#practices"
              className="btn btn-primary gap-2"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Sustainable Practices
            </a>
          </div>
        </div>
      )}

      {/* Wildlife Log Tab Content */}
      {activeTab === "wildlife" && <WildlifeSpottingLog />}

      {/* Species Guide Tab Content */}
      {activeTab === "guide" && <IrishNativeSpeciesGuide />}
    </div>
  );
};

export default BiodiversityTracker;
