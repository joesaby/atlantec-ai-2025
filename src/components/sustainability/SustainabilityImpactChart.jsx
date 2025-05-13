import React, { useEffect, useRef } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import Chart from "chart.js/auto";

const SustainabilityImpactChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const userProgress = getAllUserProgress();
    const labels = [
      "Water Savings",
      "Carbon Reduction",
      "Biodiversity",
      "Food Production",
      "Waste Reduction",
    ];

    // Calculate metrics based on user's activities
    const waterSavings = calculateWaterSavings(userProgress);
    const carbonReduction = calculateCarbonReduction(userProgress);
    const biodiversityScore = calculateBiodiversityScore(userProgress);
    const foodProduction = calculateFoodProduction(userProgress);
    const wasteReduction = calculateWasteReduction(userProgress);

    const data = [
      waterSavings,
      carbonReduction,
      biodiversityScore,
      foodProduction,
      wasteReduction,
    ];

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Your Garden Impact",
            data: data,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgb(75, 192, 192)",
            pointBackgroundColor: "rgb(75, 192, 192)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(75, 192, 192)",
          },
        ],
      },
      options: {
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  // Calculate metrics based on user data
  const calculateWaterSavings = (userProgress) => {
    // Calculate water savings based on rainwater harvesting and efficient practices
    let waterSavingsScore = 0;

    // Check for relevant practices
    if (userProgress.activePractices.some((p) => p.id === "water-1"))
      waterSavingsScore += 25; // Rainwater harvesting
    if (userProgress.activePractices.some((p) => p.id === "water-2"))
      waterSavingsScore += 15; // Mulching
    if (userProgress.activePractices.some((p) => p.id === "water-3"))
      waterSavingsScore += 20; // Drought-tolerant plants
    if (userProgress.activePractices.some((p) => p.id === "water-4"))
      waterSavingsScore += 20; // Irrigation efficiency

    // Factor in resource usage logs if available
    const waterUsageLogs = userProgress.resourceUsage.water || [];
    if (waterUsageLogs.length > 0) {
      // Adjust score based on efficiency trends
      // Implementation would check historical data patterns
    }

    return Math.min(100, waterSavingsScore);
  };

  const calculateCarbonReduction = (userProgress) => {
    // Calculate carbon reduction based on food production, composting, etc.
    let carbonReductionScore = 0;

    // Check for relevant practices
    if (
      userProgress.activePractices.some(
        (p) => p.id && p.id.startsWith("compost")
      )
    )
      carbonReductionScore += 20; // Composting practices

    // Check for food production which reduces food miles
    const harvestLogs = userProgress.resourceUsage.harvest || [];
    carbonReductionScore += Math.min(40, harvestLogs.length * 5); // 5 points per harvest logged

    // Check for carbon-sequestering practices
    if (userProgress.activePractices.some((p) => p.id === "biodiversity-3"))
      carbonReductionScore += 15; // Tree planting or similar

    return Math.min(100, carbonReductionScore);
  };

  const calculateBiodiversityScore = (userProgress) => {
    // Calculate biodiversity score based on practices
    let biodiversityScore = 0;

    // Check for biodiversity-enhancing practices
    if (
      userProgress.activePractices.some(
        (p) => p.id && p.id.startsWith("biodiversity")
      )
    )
      biodiversityScore += 25; // General biodiversity practices

    if (
      userProgress.activePractices.some((p) => p.id && p.id.includes("native"))
    )
      biodiversityScore += 25; // Native planting

    if (
      userProgress.activePractices.some(
        (p) => p.id && p.id.includes("pollinator")
      )
    )
      biodiversityScore += 25; // Pollinator-friendly

    if (
      userProgress.activePractices.some(
        (p) => p.id && p.id.includes("wildlife")
      )
    )
      biodiversityScore += 25; // Wildlife habitats

    return Math.min(100, biodiversityScore);
  };

  const calculateFoodProduction = (userProgress) => {
    // Calculate food production sustainability
    let foodScore = 0;

    // Based on logged harvests
    const harvestLogs = userProgress.resourceUsage.harvest || [];
    foodScore += Math.min(60, harvestLogs.length * 10);

    // Based on organic practices
    if (
      userProgress.activePractices.some(
        (p) => p.id && (p.id.includes("organic") || p.id.includes("natural"))
      )
    )
      foodScore += 40;

    return Math.min(100, foodScore);
  };

  const calculateWasteReduction = (userProgress) => {
    // Calculate waste reduction score
    let wasteScore = 0;

    // Check for waste-reducing practices
    if (
      userProgress.activePractices.some((p) => p.id && p.id.includes("compost"))
    )
      wasteScore += 40; // Composting

    if (
      userProgress.activePractices.some((p) => p.id && p.id.includes("recycle"))
    )
      wasteScore += 30; // Recycling garden materials

    if (
      userProgress.activePractices.some((p) => p.id && p.id.includes("reuse"))
    )
      wasteScore += 30; // Reusing materials

    return Math.min(100, wasteScore);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Your Sustainability Impact</h3>
      <div className="bg-white p-4 rounded-lg">
        <canvas ref={chartRef} />
      </div>
      <p className="text-sm text-center mt-4">
        This chart shows your garden's impact across key sustainability metrics.
        Take on more sustainable practices to improve your profile!
      </p>
    </div>
  );
};

export default SustainabilityImpactChart;
