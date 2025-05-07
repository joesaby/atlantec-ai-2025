import React from "react";

const SeasonalOverview = () => {
  // Determine current season based on month
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-indexed (1 = January, 12 = December)

    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  };

  // Season-specific data
  const seasonData = {
    spring: {
      title: "Spring Gardening",
      description:
        "Spring is the busy planting season in Ireland as soil warms up and day length increases. Focus on preparing beds, sowing hardy crops, and protecting tender plants from late frosts.",
      keyTasks: [
        "Prepare soil by incorporating compost",
        "Plant early potatoes around St. Patrick's Day",
        "Sow hardy vegetables like peas, carrots, and spinach",
        "Start tender crops indoors",
        "Begin slug and snail control",
      ],
      tips: [
        "Watch out for late frosts - keep fleece handy",
        "Use cloches to warm soil before sowing",
        "Start a compost bin if you don't have one",
        "Plant native wildflowers to support pollinators",
      ],
      seasonColor: "success",
    },
    summer: {
      title: "Summer Gardening",
      description:
        "Summer is the main growing season with long days and warmer temperatures. Focus on watering, harvesting, and succession planting to keep your garden productive.",
      keyTasks: [
        "Harvest early crops regularly",
        "Water consistently, especially during dry spells",
        "Continue succession sowing of salad crops",
        "Feed fruiting vegetables with high-potash fertilizer",
        "Watch for pests and diseases in warm weather",
      ],
      tips: [
        "Conserve water by mulching and using water butts",
        "Harvest in early morning for best flavor",
        "Support heavy crops like tomatoes and cucumbers",
        "Monitor for potato blight in warm, humid conditions",
      ],
      seasonColor: "warning",
    },
    autumn: {
      title: "Autumn Gardening",
      description:
        "Autumn is harvest time and preparation for winter. Focus on collecting and storing crops, planting for spring, and improving soil for next year.",
      keyTasks: [
        "Harvest and store main crops",
        "Plant garlic and autumn onion sets",
        "Sow green manures on empty beds",
        "Plant spring bulbs and bare-root fruit trees",
        "Collect fallen leaves for leaf mould",
      ],
      tips: [
        "Clean and store garden tools properly",
        "Protect winter crops from pests and weather",
        "Plant native hedging for wildlife",
        "Save seeds from open-pollinated varieties",
      ],
      seasonColor: "error",
    },
    winter: {
      title: "Winter Gardening",
      description:
        "Winter is the planning season with minimal growth. Focus on planning next year's garden, maintaining structures, and protecting vulnerable plants from harsh conditions.",
      keyTasks: [
        "Plan crop rotation for next year",
        "Prune dormant fruit trees and bushes",
        "Protect tender plants from frost",
        "Check stored produce regularly",
        "Maintain garden structures and tools",
      ],
      tips: [
        "Order seeds early for best selection",
        "Use winter to clean and sharpen tools",
        "Add organic matter to heavy soils",
        "Keep off soil in wet conditions to prevent compaction",
      ],
      seasonColor: "info",
    },
  };

  const season = getCurrentSeason();
  const data = seasonData[season];

  return (
    <div className={`card bg-${data.seasonColor}/5 shadow-xl`}>
      <div className="card-body">
        <h2 className={`card-title text-${data.seasonColor}`}>{data.title}</h2>
        <p className="text-sm mb-4">{data.description}</p>

        <div className="divider">Key Tasks</div>
        <ul className="list-disc list-inside space-y-1 mb-4">
          {data.keyTasks.map((task, index) => (
            <li key={index} className="text-sm">
              {task}
            </li>
          ))}
        </ul>

        <div className="divider">Seasonal Tips</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.tips.map((tip, index) => (
            <div key={index} className={`alert alert-${data.seasonColor} p-2`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalOverview;
