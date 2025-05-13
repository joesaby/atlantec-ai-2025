import React, { useState, useEffect } from "react";
import {
  getAllUserProgress,
  completeChallenge,
} from "../../utils/sustainability-store";

const SeasonalSustainabilityTips = () => {
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentSeason, setCurrentSeason] = useState("");
  const [tips, setTips] = useState([]);
  const [challenge, setChallenge] = useState({});

  useEffect(() => {
    // Get current month and season
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    setCurrentMonth(month);

    // Determine Irish season (using meteorological seasons)
    const monthNum = now.getMonth();
    let season;
    if (monthNum >= 2 && monthNum <= 4) season = "Spring";
    else if (monthNum >= 5 && monthNum <= 7) season = "Summer";
    else if (monthNum >= 8 && monthNum <= 10) season = "Autumn";
    else season = "Winter";
    setCurrentSeason(season);

    // Set seasonal tips
    setTips(getSeasonalTips(season, month));
    setChallenge(getMonthlyChallenge(month));
  }, []);

  // Get seasonally appropriate sustainability tips for Irish gardening
  const getSeasonalTips = (season, month) => {
    switch (season) {
      case "Spring":
        return [
          "Start a compost heap with spring garden waste to reduce landfill use",
          "Plant native wildflowers to support early pollinators",
          "Collect rainwater with water butts for the growing season ahead",
          "Use natural slug deterrents rather than chemical pellets",
          "Plant early potatoes for a sustainable food source with low food miles",
        ];
      case "Summer":
        return [
          "Water plants in the evening to reduce evaporation",
          "Use mulch around vegetables to conserve soil moisture",
          "Harvest rainwater during summer showers to use during dry periods",
          "Plant companion flowers to attract beneficial insects for natural pest control",
          "Harvest herbs and dry them for winter use to reduce food waste",
        ];
      case "Autumn":
        return [
          "Collect fallen leaves for leaf mould - nature's free soil conditioner",
          "Harvest and store produce properly to minimize food waste",
          "Save seeds from open-pollinated plants for next year",
          "Add autumn compost to soil to improve structure naturally",
          "Plant cover crops to prevent soil erosion in winter",
        ];
      case "Winter":
        return [
          "Use recycled Christmas trees as mulch or wildlife shelter",
          "Plan your spring garden to incorporate more native plants",
          "Insulate outdoor taps and water butts to prevent frost damage",
          "Maintain garden tools to extend their lifespan",
          "Create winter habitats for beneficial wildlife",
        ];
      default:
        return [];
    }
  };

  // Get monthly sustainability challenge
  const getMonthlyChallenge = (month) => {
    const challenges = {
      January: {
        title: "Garden Planning Challenge",
        description:
          "Create a sustainable garden plan that includes at least 5 native Irish plants and minimizes water usage",
        difficulty: "Easy",
        impact: "Planning now leads to more sustainable practices all year",
        sdgs: ["sdg15", "sdg13"],
      },
      February: {
        title: "Seed Starting Challenge",
        description:
          "Start vegetables from seed using recycled containers instead of buying plastic pots",
        difficulty: "Easy",
        impact: "Reduces plastic waste and transportation emissions",
        sdgs: ["sdg12", "sdg13"],
      },
      March: {
        title: "Composting Kickstart",
        description:
          "Begin or improve a composting system using garden and kitchen waste",
        difficulty: "Medium",
        impact: "Reduces landfill waste and creates natural fertilizer",
        sdgs: ["sdg12", "sdg15"],
      },
      April: {
        title: "Rainwater Collection",
        description:
          "Set up a rainwater harvesting system to collect April showers",
        difficulty: "Medium",
        impact:
          "Each water butt can save thousands of liters of water annually",
        sdgs: ["sdg6", "sdg12"],
      },
      May: {
        title: "Pollinator Paradise",
        description:
          "Plant a dedicated area with native Irish flowers for pollinators",
        difficulty: "Easy",
        impact: "Supports threatened bee populations and biodiversity",
        sdgs: ["sdg15"],
      },
      June: {
        title: "Zero-Waste Garden Week",
        description:
          "Go one full week without generating any garden waste that cannot be composted or reused",
        difficulty: "Medium",
        impact: "Promotes circular garden economy and reduces waste",
        sdgs: ["sdg12"],
      },
      July: {
        title: "Water Conservation",
        description:
          "Reduce garden water usage by 30% through mulching and efficient watering",
        difficulty: "Medium",
        impact: "Conserves water during peak summer demand",
        sdgs: ["sdg6"],
      },
      August: {
        title: "Food Miles Challenge",
        description: "Eat at least one item from your garden daily for a week",
        difficulty: "Easy",
        impact: "Drastically reduces carbon footprint of your diet",
        sdgs: ["sdg2", "sdg13"],
      },
      September: {
        title: "Seed Saving",
        description:
          "Collect and properly store seeds from at least 5 different plants",
        difficulty: "Medium",
        impact: "Promotes biodiversity and reduces need for commercial seeds",
        sdgs: ["sdg2", "sdg15"],
      },
      October: {
        title: "Garden Sharing",
        description: "Share excess produce with neighbors or local food banks",
        difficulty: "Easy",
        impact: "Reduces food waste and builds community resilience",
        sdgs: ["sdg2", "sdg11"],
      },
      November: {
        title: "Wildlife Habitat Creation",
        description:
          "Create at least one new wildlife habitat feature in your garden",
        difficulty: "Easy",
        impact: "Supports biodiversity through winter months",
        sdgs: ["sdg15"],
      },
      December: {
        title: "Sustainable Holiday Garden",
        description:
          "Create holiday decorations using only natural materials from your garden",
        difficulty: "Easy",
        impact: "Reduces consumption of plastic decorations",
        sdgs: ["sdg12"],
      },
    };

    return challenges[month] || challenges["January"];
  };

  // Get SDG goal display info
  const getSDGInfo = (sdgId) => {
    const sdgInfo = {
      sdg2: { name: "Zero Hunger", color: "#d3a029" },
      sdg3: { name: "Good Health and Well-being", color: "#4c9f38" },
      sdg6: { name: "Clean Water", color: "#26bde2" },
      sdg11: { name: "Sustainable Cities", color: "#fd9d24" },
      sdg12: { name: "Responsible Consumption", color: "#bf8b2e" },
      sdg13: { name: "Climate Action", color: "#3f7e44" },
      sdg15: { name: "Life on Land", color: "#56c02b" },
    };

    return sdgInfo[sdgId];
  };

  // Track challenge acceptance and completion
  const [isChallengeAccepted, setIsChallengeAccepted] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if challenge is already accepted or completed
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const savedStatus = localStorage.getItem(
        "accepted-challenge-" + currentMonth
      );
      if (savedStatus === "true") {
        setIsChallengeAccepted(true);
      }

      const completedStatus = localStorage.getItem(
        "completed-challenge-" + currentMonth
      );
      if (completedStatus === "true") {
        setIsChallengeCompleted(true);
      }
    }
  }, [currentMonth]);

  // Accept challenge handler
  const handleAcceptChallenge = () => {
    setIsChallengeAccepted(true);
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    // Save to local storage
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("accepted-challenge-" + currentMonth, "true");

      // Also update any user progress metrics
      try {
        getAllUserProgress();
      } catch (e) {
        console.log("Error updating user progress:", e);
      }
    }
  };

  // Complete challenge handler
  const handleCompleteChallenge = () => {
    setIsChallengeCompleted(true);
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    try {
      // Call the completeChallenge function with the current month and SDG IDs
      completeChallenge(currentMonth, challenge.sdgs || []);
    } catch (e) {
      console.log("Error updating user progress:", e);

      // Fallback to direct localStorage if the function fails
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("completed-challenge-" + currentMonth, "true");
      }
    }
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: `${5 + Math.random() * 10}px`,
                  height: `${5 + Math.random() * 10}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 text-center">
        Seasonal Sustainability Guide
      </h3>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="md:w-1/2 pr-0 md:pr-4">
          <h4 className="text-lg font-bold mb-4">
            <span className="text-primary">{currentSeason}</span> Tips for Irish
            Gardens
          </h4>

          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
            <ul className="pl-5 space-y-4 mt-4">
              {tips.map((tip, index) => (
                <li key={index} className="mb-3 relative">
                  <div className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-primary"></div>
                  <p>{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 bg-base-200 p-3 rounded-lg">
            <h5 className="font-semibold text-sm">Seasonal Impact</h5>
            <p className="text-xs mt-1">
              {currentSeason === "Spring" &&
                "Spring gardening sets the foundation for a sustainable year. Focus on soil preparation and planting for biodiversity."}
              {currentSeason === "Summer" &&
                "Summer is critical for water conservation and managing your garden's resources efficiently during peak growth."}
              {currentSeason === "Autumn" &&
                "Autumn practices help return nutrients to the soil and prepare your garden for winter while reducing waste."}
              {currentSeason === "Winter" &&
                "Winter planning and protection measures ensure your garden remains a safe habitat and is ready for spring."}
            </p>
          </div>
        </div>

        <div className="md:w-1/2 mt-6 md:mt-0 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-base-300 pt-6 md:pt-0 md:pl-6">
          <h4 className="text-lg font-bold mb-4">
            {currentMonth} Sustainability Challenge
          </h4>
          <div
            className={`bg-base-200 p-4 rounded-lg relative ${
              isChallengeAccepted && !isChallengeCompleted
                ? "border-2 border-success"
                : ""
            } ${
              isChallengeCompleted
                ? "border-2 border-warning bg-success bg-opacity-10"
                : ""
            }`}
          >
            {isChallengeAccepted && !isChallengeCompleted && (
              <div className="absolute -top-3 -right-3 bg-success text-white rounded-full p-2">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {isChallengeCompleted && (
              <div className="absolute -top-3 -right-3 bg-warning text-white rounded-full p-2">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            )}

            <h4 className="font-bold text-lg">{challenge.title}</h4>
            <p className="my-2">{challenge.description}</p>

            <div className="flex flex-wrap gap-2 items-center mt-4">
              <div className="badge badge-outline">
                Difficulty: {challenge.difficulty}
              </div>
              <div className="badge badge-outline badge-success">
                Impact: High
              </div>
              <div className="badge badge-outline badge-info">
                Time: ~1 week
              </div>
            </div>

            <p className="text-sm mt-3 bg-base-100 p-2 rounded">
              {challenge.impact}
            </p>

            <div className="mt-3">
              <span className="text-sm font-semibold">Supports UN SDGs:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {challenge.sdgs &&
                  challenge.sdgs.map((sdg) => {
                    const sdgInfo = getSDGInfo(sdg);
                    return (
                      <span
                        key={sdg}
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: sdgInfo?.color || "#777" }}
                      >
                        {sdgInfo?.name || sdg}
                      </span>
                    );
                  })}
              </div>
            </div>

            <div className="mt-4">
              {!isChallengeAccepted && !isChallengeCompleted ? (
                <button
                  onClick={handleAcceptChallenge}
                  className="btn btn-sm btn-primary w-full"
                >
                  Accept Challenge
                </button>
              ) : isChallengeAccepted && !isChallengeCompleted ? (
                <div className="space-y-2">
                  <div className="text-center text-success font-medium">
                    Challenge Accepted! ✓
                  </div>
                  <button
                    onClick={handleCompleteChallenge}
                    className="btn btn-sm btn-success w-full"
                  >
                    Mark as Complete
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-center text-success font-medium">
                    Challenge Completed! 🏆
                  </div>
                  <div className="text-xs text-center opacity-70">
                    +15 sustainability points earned
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {challenge.sdgs &&
                      challenge.sdgs.map((sdg) => (
                        <div
                          key={sdg}
                          className="badge badge-sm badge-outline badge-success"
                        >
                          +10 {sdg}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <h5 className="font-semibold">Previous Participants Said:</h5>
            <div className="bg-base-100 p-3 rounded-lg mt-2 italic">
              "This challenge helped me reduce my water usage by 40% during
              summer months!"
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          animation: confetti-fall linear forwards;
          z-index: 10;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(300px) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(600px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SeasonalSustainabilityTips;
