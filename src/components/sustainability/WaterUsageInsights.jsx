import React, { useState, useEffect, useRef } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import Chart from "chart.js/auto";

const WaterUsageInsights = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [waterData, setWaterData] = useState([]);
  const [waterSavingsTips, setWaterSavingsTips] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);

    // Extract water usage data
    const waterUsage = progress.resourceUsage.water || [];
    setWaterData(waterUsage);

    // Generate water saving tips based on user practices
    const tips = generateWaterSavingsTips(progress);
    setWaterSavingsTips(tips);

    // Clean up chart when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // Create chart when water data is available
  useEffect(() => {
    if (waterData.length > 0 && chartRef.current) {
      renderWaterUsageChart();
    }
  }, [waterData]);

  const renderWaterUsageChart = () => {
    if (!chartRef.current) return;

    // Sort data by date
    const sortedData = [...waterData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Group data by month for clearer visualization
    const monthlyData = groupByMonth(sortedData);

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: "Water Usage (Liters)",
            data: Object.values(monthlyData).map((month) => month.total),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            borderColor: "rgb(53, 162, 235)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Water Usage (Liters)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      },
    });
  };

  const groupByMonth = (data) => {
    const months = {};

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;

      if (!months[monthYear]) {
        months[monthYear] = {
          entries: [],
          total: 0,
        };
      }

      months[monthYear].entries.push(entry);
      months[monthYear].total += parseFloat(entry.amount) || 0;
    });

    return months;
  };

  const generateWaterSavingsTips = (progress) => {
    // Base tips everyone should see
    const baseTips = [
      "Install water butts to collect rainwater - a 100L water butt filled 10 times per year saves 1000L of mains water",
      "Water plants at the base rather than overhead to reduce water waste by up to 90%",
      "Group plants with similar water needs together to optimize irrigation",
    ];

    // Additional tips based on user's gardening practices
    const additionalTips = [];

    // Check if user has implemented water conservation practices
    const hasRainwaterHarvesting = progress.activePractices.some(
      (p) => p.id === "water-1"
    );
    const hasMulching = progress.activePractices.some(
      (p) => p.id === "water-2"
    );
    const hasDroughtTolerantPlants = progress.activePractices.some(
      (p) => p.id === "water-3"
    );

    if (!hasRainwaterHarvesting) {
      additionalTips.push(
        "Consider adding a rainwater harvesting system - with Ireland's annual rainfall, you could collect over 24,000L per year from an average roof"
      );
    }

    if (!hasMulching) {
      additionalTips.push(
        "Apply a 5cm layer of mulch around plants to reduce water evaporation by up to 70%"
      );
    }

    if (!hasDroughtTolerantPlants) {
      additionalTips.push(
        "Include native Irish drought-tolerant plants like Sea Holly and Red Valerian to reduce watering needs"
      );
    }

    // Analyze water usage patterns
    const waterUsage = progress.resourceUsage.water || [];
    if (waterUsage.length > 5) {
      additionalTips.push(
        "You're consistently tracking your water usage - consider setting a goal to reduce consumption by 10% this season"
      );
    }

    // Combine and return tips
    return [...baseTips, ...additionalTips];
  };

  const calculateWaterEfficiency = () => {
    // Calculate water efficiency score based on user practices and data
    let score = 50; // Base score

    // Increase score for water conservation practices
    if (userProgress.activePractices.some((p) => p.id === "water-1"))
      score += 15; // Rainwater harvesting
    if (userProgress.activePractices.some((p) => p.id === "water-2"))
      score += 10; // Mulching
    if (userProgress.activePractices.some((p) => p.id === "water-3"))
      score += 10; // Drought-tolerant plants
    if (userProgress.activePractices.some((p) => p.id === "water-4"))
      score += 15; // Efficient irrigation

    // Ensure score is within 0-100 range
    return Math.min(100, Math.max(0, score));
  };

  const getWaterEfficiencyClass = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  if (!userProgress) {
    return <div className="loading loading-spinner loading-md"></div>;
  }

  const waterEfficiency = calculateWaterEfficiency();
  const efficiencyClass = getWaterEfficiencyClass(waterEfficiency);

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Water Usage Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="font-semibold mb-2">Your Water Usage Over Time</h4>
          <div className="bg-white p-4 rounded-lg h-64">
            {waterData.length > 0 ? (
              <canvas ref={chartRef} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  No water usage data recorded yet. Start tracking to see
                  insights!
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Water Efficiency Score</h4>
          <div
            className={`bg-base-200 p-4 rounded-lg text-center ${efficiencyClass}`}
          >
            <div
              className="radial-progress"
              style={{ "--value": waterEfficiency }}
              role="progressbar"
            >
              {waterEfficiency}%
            </div>
            <p className="mt-2 font-medium">
              {waterEfficiency >= 80
                ? "Excellent!"
                : waterEfficiency >= 60
                ? "Good"
                : waterEfficiency >= 40
                ? "Fair"
                : "Needs Improvement"}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm mb-2">
              <span className="font-semibold">Irish Context:</span> Despite high
              rainfall, water management is increasingly important in Ireland
              due to seasonal dry spells and projected climate changes.
            </p>
          </div>
        </div>
      </div>

      <h4 className="font-semibold mt-6 mb-2">
        Water Savings Tips for Irish Gardens
      </h4>
      <div className="bg-base-200 p-4 rounded-lg">
        <ul className="list-disc pl-5 space-y-2">
          {waterSavingsTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WaterUsageInsights;
