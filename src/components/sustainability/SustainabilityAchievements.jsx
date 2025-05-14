import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const SustainabilityAchievements = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Determine which badges have been earned
    const badges = calculateEarnedBadges(progress);
    setEarnedBadges(badges);
  }, []);

  const calculateEarnedBadges = (progress) => {
    const badges = [];

    // Water Warrior badges
    if (progress.activePractices.some((p) => p.id === "water-1")) {
      badges.push({
        id: "water-warrior-1",
        name: "Rain Harvester",
        description: "Started collecting rainwater for garden use",
        icon: "💧",
        category: "water",
        tier: "bronze",
      });
    }

    if (
      progress.activePractices.filter((p) => p.id.startsWith("water-"))
        .length >= 3
    ) {
      badges.push({
        id: "water-warrior-2",
        name: "Water Guardian",
        description: "Implemented 3+ water conservation practices",
        icon: "💧💧",
        category: "water",
        tier: "silver",
      });
    }

    // Soil Steward badges
    if (progress.activePractices.some((p) => p.id.startsWith("soil-"))) {
      badges.push({
        id: "soil-steward-1",
        name: "Soil Nurturer",
        description: "Started caring for soil health",
        icon: "🌱",
        category: "soil",
        tier: "bronze",
      });
    }

    if (progress.activePractices.some((p) => p.id.includes("compost"))) {
      badges.push({
        id: "soil-steward-2",
        name: "Compost Creator",
        description: "Started composting garden and kitchen waste",
        icon: "♻️",
        category: "soil",
        tier: "silver",
      });
    }

    // Biodiversity Champion badges
    if (
      progress.activePractices.some((p) => p.id.startsWith("biodiversity-"))
    ) {
      badges.push({
        id: "biodiversity-1",
        name: "Habitat Helper",
        description: "Created wildlife-friendly garden spaces",
        icon: "🦋",
        category: "biodiversity",
        tier: "bronze",
      });
    }

    if (
      progress.activePractices.filter((p) => p.id.startsWith("biodiversity-"))
        .length >= 2
    ) {
      badges.push({
        id: "biodiversity-2",
        name: "Pollinator Protector",
        description: "Implemented multiple biodiversity practices",
        icon: "🐝",
        category: "biodiversity",
        tier: "silver",
      });
    }

    // Food Growing badges
    const harvestLogs = progress.resourceUsage.harvest || [];
    if (harvestLogs.length >= 1) {
      badges.push({
        id: "food-grower-1",
        name: "Urban Farmer",
        description: "Started growing your own food",
        icon: "🥕",
        category: "food",
        tier: "bronze",
      });
    }

    if (harvestLogs.length >= 5) {
      badges.push({
        id: "food-grower-2",
        name: "Harvest Master",
        description: "Logged 5+ harvests from your garden",
        icon: "🥕🥕",
        category: "food",
        tier: "silver",
      });
    }

    // Resource Master badges
    if (
      progress.activePractices.filter(
        (p) => p.id.includes("reuse") || p.id.includes("recycle")
      ).length >= 1
    ) {
      badges.push({
        id: "resource-master-1",
        name: "Resourceful Gardener",
        description: "Started reusing or recycling in your garden",
        icon: "♻️",
        category: "resources",
        tier: "bronze",
      });
    }

    // Overall sustainability badges
    if (progress.score >= 20) {
      badges.push({
        id: "sustainability-1",
        name: "Green Starter",
        description: "Began your sustainability journey",
        icon: "🌱",
        category: "overall",
        tier: "bronze",
      });
    }

    if (progress.score >= 50) {
      badges.push({
        id: "sustainability-2",
        name: "Eco Enthusiast",
        description: "Making significant sustainability progress",
        icon: "🌿",
        category: "overall",
        tier: "silver",
      });
    }

    if (progress.score >= 80) {
      badges.push({
        id: "sustainability-3",
        name: "Sustainability Champion",
        description: "Leading the way in sustainable gardening",
        icon: "🌳",
        category: "overall",
        tier: "gold",
      });
    }

    return badges;
  };

  // Get tier styling
  const getTierStyle = (tier) => {
    switch (tier) {
      case "bronze":
        return "bg-amber-700 text-white";
      case "silver":
        return "bg-slate-400 text-white";
      case "gold":
        return "bg-amber-400 text-black";
      default:
        return "bg-gray-200";
    }
  };

  if (!userProgress) {
    return <div className="loading loading-spinner loading-md"></div>;
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">
        Your Sustainability Achievements
      </h3>

      {earnedBadges.length === 0 ? (
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <p>You haven't earned any sustainability badges yet.</p>
          <p className="mt-2">
            Start implementing sustainable practices to earn your first badge!
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4">
            You've earned {earnedBadges.length} sustainability badges:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-base-200 rounded-lg overflow-hidden"
              >
                <div className={`${getTierStyle(badge.tier)} p-2 text-center`}>
                  <span className="text-2xl">{badge.icon}</span>
                  <h4 className="font-bold mt-1">{badge.name}</h4>
                </div>
                <div className="p-3">
                  <p className="text-sm">{badge.description}</p>
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getTierStyle(
                        badge.tier
                      )}`}
                    >
                      {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <h4 className="font-semibold mb-2">Next Achievements to Unlock:</h4>
            <ul className="text-sm">
              {userProgress.score < 50 && (
                <li className="mb-1">
                  • Reach 50 sustainability points to earn "Eco Enthusiast"
                  badge
                </li>
              )}
              {!earnedBadges.some((b) => b.id === "water-warrior-2") && (
                <li className="mb-1">
                  • Implement 3 water conservation practices for "Water
                  Guardian" badge
                </li>
              )}
              {!earnedBadges.some((b) => b.id === "food-grower-2") && (
                <li className="mb-1">
                  • Log 5 harvests to earn "Harvest Master" badge
                </li>
              )}
              {!earnedBadges.some((b) => b.id === "biodiversity-2") && (
                <li className="mb-1">
                  • Add another biodiversity practice for "Pollinator Protector"
                  badge
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SustainabilityAchievements;
