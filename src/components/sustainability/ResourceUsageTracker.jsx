import React, { useState, useEffect, useRef } from "react";
import {
  recordResourceUsage,
  getAllUserProgress,
  recordCarbonOffset,
  calculateNetCarbonImpact,
} from "../../utils/sustainability-store";
import { onSustainabilityEvent } from "../../utils/sustainability-events";
import { calculateCarbonSavings } from "../../utils/carbon-footprint";
import {
  getWaterUsageRecommendation,
  calculateWeatherAwareWaterSavings,
} from "../../utils/weather-service";
import Chart from "chart.js/auto";
import EnhancedCharts from "./EnhancedCharts";

const ResourceUsageTracker = () => {
  const [resourceType, setResourceType] = useState("water");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userProgress, setUserProgress] = useState(getAllUserProgress());
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activityType, setActivityType] = useState("transport");
  const [plantType, setPlantType] = useState("tomato");
  const [summaryStats, setSummaryStats] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [weatherRec, setWeatherRec] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [useWeatherData, setUseWeatherData] = useState(true);
  const [showEnhancedCharts, setShowEnhancedCharts] = useState(false);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Effect to calculate summary statistics
  useEffect(() => {
    calculateSummaryStats();

    // Clean up chart when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [userProgress]);

  // Effect to render chart when resource type changes
  useEffect(() => {
    if (chartRef.current) {
      renderResourceChart();
    }
  }, [resourceType, userProgress]);

  // Effect to listen for carbon offset events from other components
  useEffect(() => {
    // Listen for carbon offset events
    const removeOffsetListener = onSustainabilityEvent(
      "carbon-offset-recorded",
      (event) => {
        // Refresh our data
        setUserProgress(getAllUserProgress());
      }
    );

    // Listen for other resource usage updates
    const removeUsageListener = onSustainabilityEvent(
      "resource-usage-updated",
      (event) => {
        // Refresh our data if it's from another component
        setUserProgress(getAllUserProgress());
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      if (removeOffsetListener) removeOffsetListener();
      if (removeUsageListener) removeUsageListener();
    };
  }, []);

  // Effect to fetch weather recommendations when water is selected
  useEffect(() => {
    if (resourceType === "water") {
      fetchWeatherRecommendation();
    } else {
      setWeatherRec(null);
    }
  }, [resourceType]);

  // Function to fetch weather recommendations
  const fetchWeatherRecommendation = async () => {
    if (resourceType !== "water") return;

    setIsLoadingWeather(true);
    try {
      const weatherData = await getWaterUsageRecommendation();
      setWeatherRec(weatherData);
    } catch (error) {
      console.error("Error fetching weather recommendation:", error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const resourceTypes = [
    { id: "water", name: "Water Usage (liters)", icon: "droplet" },
    { id: "compost", name: "Compost Added (kg)", icon: "layers" },
    { id: "harvest", name: "Food Harvested (kg)", icon: "leaf" },
    { id: "carbon", name: "Carbon Emissions (kg CO₂e)", icon: "cloud" },
    { id: "energy", name: "Energy Usage (kWh)", icon: "zap" },
    { id: "waste", name: "Waste Reduced (kg)", icon: "trash" },
  ];

  // Get recent logs for selected resource type
  const getRecentLogs = (type) => {
    if (!userProgress.resourceUsage[type]) return [];

    return userProgress.resourceUsage[type]
      .slice() // Create a copy to avoid mutating original
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
      .slice(0, 5); // Get only the 5 most recent
  };

  // Get icon for resource type
  const getIconForResourceType = (type) => {
    switch (type) {
      case "water":
        return (
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
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      case "compost":
        return (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case "harvest":
        return (
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "carbon":
        return (
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
              d="M19 14a2 2 0 00-2-2H8.8M5 12l-2-2m0 0l2-2m-2 2h3.8M3 16h8a2 2 0 002 2 2 2 0 002-2"
            />
          </svg>
        );
      case "energy":
        return (
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "waste":
        return (
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return; // Don't submit if invalid amount
    }

    // Prepare metadata based on resource type
    let metadata = {};
    const parsedAmount = parseFloat(amount);

    if (resourceType === "carbon") {
      metadata.activity = activityType;
    } else if (resourceType === "harvest") {
      metadata.plantType = plantType;

      // Generate carbon offset for harvested food
      try {
        // Calculate carbon savings from growing this food vs buying it
        const carbonSavings = calculateCarbonSavings(
          plantType, // plant type
          1, // quantity of plants (using 1 as multiplier since we're tracking by weight)
          true // assume organic methods
        );

        // Record carbon offset based on harvest amount
        // The formula accounts for the amount of harvest and the carbon savings per kg
        if (carbonSavings.totalCarbonSavings > 0) {
          const offsetAmount = parsedAmount * carbonSavings.carbonSavingsPerKg;

          // Only record significant offsets
          if (offsetAmount >= 0.1) {
            recordCarbonOffset(
              offsetAmount,
              "harvest-" + plantType,
              new Date(date)
            );
          }

          // Add carbon savings info to metadata
          metadata.carbonSavings = offsetAmount;
          metadata.carbonDetails = {
            savingsPerKg: carbonSavings.carbonSavingsPerKg,
            sdgContributions: carbonSavings.sdgContributions,
          };
        }
      } catch (err) {
        console.error("Error calculating carbon offset for harvest:", err);
        // Continue with recording the harvest without the offset
      }
    } else if (resourceType === "waste") {
      // For waste reduction, calculate a small carbon offset
      // Typical emissions saved from waste diversion is around 0.5 kg CO2e per kg waste
      const wasteOffset = parsedAmount * 0.5;

      if (wasteOffset >= 0.1) {
        recordCarbonOffset(wasteOffset, "waste-reduction", new Date(date));
      }

      metadata.carbonSavings = wasteOffset;
    } else if (resourceType === "compost") {
      // For compost, calculate a small carbon offset from avoiding synthetic fertilizers
      // and preventing organic matter from going to landfill
      // Conservative estimate: 0.1 kg CO2e per kg compost
      const compostOffset = parsedAmount * 0.1;

      if (compostOffset >= 0.05) {
        recordCarbonOffset(compostOffset, "compost-added", new Date(date));
      }

      metadata.carbonSavings = compostOffset;
    } else if (resourceType === "water" && useWeatherData) {
      // For water usage, check if weather-based optimization is enabled
      try {
        const waterSavings = await calculateWeatherAwareWaterSavings(
          parsedAmount,
          true
        );

        // If significant savings are possible
        if (waterSavings.reductionPercentage > 10) {
          // Add water and carbon savings to metadata
          metadata.weatherOptimized = true;
          metadata.potentialWaterSavings = waterSavings.waterSaved;
          metadata.potentialCarbonSavings = waterSavings.carbonSaved;
          metadata.savingsPercentage = waterSavings.reductionPercentage;

          // Record a small carbon offset for water optimization if significant
          if (waterSavings.carbonSaved >= 0.01) {
            recordCarbonOffset(
              waterSavings.carbonSaved,
              "water-conservation",
              new Date(date)
            );
          }
        }
      } catch (err) {
        console.error("Error calculating water usage savings:", err);
      }
    }

    // Record the resource usage
    const updatedProgress = recordResourceUsage(
      resourceType,
      parsedAmount,
      new Date(date),
      metadata
    );

    // Update state
    setUserProgress(updatedProgress);
    setAmount("");
    setIsSuccess(true);
    setSuccessMessage(
      generateSuccessMessage(resourceType, parsedAmount, metadata)
    );

    // Hide success message after 5 seconds (longer for complex messages)
    setTimeout(() => {
      setIsSuccess(false);
      setSuccessMessage("");
    }, 5000);

    // Refresh weather recommendation after recording water usage
    if (resourceType === "water") {
      fetchWeatherRecommendation();
    }
  };

  // Generate appropriate success message based on resource type and metadata
  const generateSuccessMessage = (type, amount, metadata) => {
    if (!type || !amount) return "Resource usage recorded successfully!";

    switch (type) {
      case "harvest":
        if (metadata?.carbonSavings && metadata.carbonSavings > 0) {
          return `Harvest recorded! This also saved approximately ${metadata.carbonSavings.toFixed(
            1
          )} kg CO₂e compared to store-bought produce.`;
        }
        return "Harvest recorded successfully!";

      case "compost":
        if (metadata?.carbonSavings && metadata.carbonSavings > 0) {
          return `Compost added! This contributes ${metadata.carbonSavings.toFixed(
            1
          )} kg CO₂e in carbon offset through reduced waste.`;
        }
        return "Compost usage recorded successfully!";

      case "waste":
        if (metadata?.carbonSavings && metadata.carbonSavings > 0) {
          return `Waste reduction recorded! By diverting ${amount.toFixed(
            1
          )} kg from landfill, you've saved ${metadata.carbonSavings.toFixed(
            1
          )} kg CO₂e.`;
        }
        return "Waste reduction recorded successfully!";

      case "carbon":
        if (parseFloat(amount) < 0) {
          return `Carbon reduction of ${Math.abs(parseFloat(amount)).toFixed(
            1
          )} kg CO₂e recorded!`;
        } else {
          return `Carbon emission tracking helps you identify reduction opportunities.`;
        }

      case "water":
        if (metadata?.weatherOptimized && metadata.potentialWaterSavings > 0) {
          return `Water usage recorded! Weather-aware watering could save you up to ${metadata.potentialWaterSavings.toFixed(
            1
          )}L (${metadata.savingsPercentage.toFixed(
            0
          )}%) based on current weather forecast.`;
        } else if (weatherRec && weatherRec.rainProbability > 70) {
          return `Water usage recorded! Note: There's a high probability of rain in the next 48 hours.`;
        } else if (weatherRec && !weatherRec.wateringNeeded) {
          return `Water usage recorded! Recent rainfall might mean your garden doesn't need additional watering.`;
        }
        return "Water usage recorded successfully!";

      default:
        return `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } usage recorded successfully!`;
    }
  };

  // Calculate summary statistics for all resource types
  const calculateSummaryStats = () => {
    if (!userProgress || !userProgress.resourceUsage) return;

    const stats = {};

    // Process each resource type
    Object.keys(userProgress.resourceUsage).forEach((type) => {
      if (!userProgress.resourceUsage[type]) return;

      const entries = userProgress.resourceUsage[type];

      // Skip if no entries
      if (entries.length === 0) {
        stats[type] = { total: 0, average: 0, trend: "neutral" };
        return;
      }

      // Calculate total
      const total = entries.reduce(
        (sum, entry) => sum + parseFloat(entry.amount || 0),
        0
      );

      // Calculate average
      const average = total / entries.length;

      // Determine trend (comparing most recent entries)
      let trend = "neutral";
      if (entries.length >= 2) {
        // Sort by date, newest first
        const sortedEntries = [...entries].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // Compare recent vs previous
        const recent = sortedEntries.slice(
          0,
          Math.min(3, Math.ceil(entries.length / 2))
        );
        const previous = sortedEntries.slice(
          Math.min(3, Math.ceil(entries.length / 2)),
          Math.min(6, entries.length)
        );

        if (recent.length && previous.length) {
          const recentAvg =
            recent.reduce(
              (sum, entry) => sum + parseFloat(entry.amount || 0),
              0
            ) / recent.length;
          const previousAvg =
            previous.reduce(
              (sum, entry) => sum + parseFloat(entry.amount || 0),
              0
            ) / previous.length;

          // Determine if increasing or decreasing is good based on resource type
          if (["water", "carbon", "energy"].includes(type)) {
            // For these, decreasing is good
            trend = recentAvg < previousAvg ? "improving" : "worsening";
          } else {
            // For compost, harvest, waste reduction, increasing is good
            trend = recentAvg > previousAvg ? "improving" : "worsening";
          }
        }
      }

      stats[type] = {
        total: Math.round(total * 10) / 10,
        average: Math.round(average * 10) / 10,
        trend,
      };
    });

    setSummaryStats(stats);
  };

  // Render chart for selected resource
  const renderResourceChart = () => {
    if (!chartRef.current || !userProgress.resourceUsage[resourceType]) return;

    // Sort data by date
    const data = [...(userProgress.resourceUsage[resourceType] || [])];
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group data by month
    const monthlyData = {};
    data.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }

      monthlyData[monthYear] += parseFloat(entry.amount || 0);
    });

    // Prepare chart data
    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);

    // Determine color based on resource type
    let color;
    switch (resourceType) {
      case "water":
        color = "rgba(54, 162, 235, 0.7)";
        break;
      case "compost":
        color = "rgba(153, 102, 255, 0.7)";
        break;
      case "harvest":
        color = "rgba(75, 192, 192, 0.7)";
        break;
      case "carbon":
        color = "rgba(255, 99, 132, 0.7)";
        break;
      case "energy":
        color = "rgba(255, 159, 64, 0.7)";
        break;
      case "waste":
        color = "rgba(255, 205, 86, 0.7)";
        break;
      default:
        color = "rgba(201, 203, 207, 0.7)";
        break;
    }

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: `${
              resourceTypes.find((r) => r.id === resourceType)?.name ||
              "Resource"
            } Over Time`,
            data: values,
            backgroundColor: color,
            borderColor: color.replace("0.7", "1"),
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
              text:
                resourceType === "water"
                  ? "Liters"
                  : resourceType === "energy"
                  ? "kWh"
                  : "Kilograms",
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

  // Get activity options based on resource type
  const getActivityOptions = () => {
    switch (resourceType) {
      case "carbon":
        return [
          { id: "transport", name: "Garden-related Transport" },
          { id: "equipment", name: "Equipment Usage" },
          { id: "materials", name: "Purchased Materials" },
          { id: "custom", name: "Custom Entry" },
        ];
      case "harvest":
        return [
          { id: "tomato", name: "Tomatoes" },
          { id: "potato", name: "Potatoes" },
          { id: "carrot", name: "Carrots" },
          { id: "lettuce", name: "Lettuce" },
          { id: "cabbage", name: "Cabbage" },
          { id: "apple", name: "Apples" },
          { id: "strawberry", name: "Strawberries" },
          { id: "herbs", name: "Herbs" },
          { id: "other", name: "Other Produce" },
        ];
      default:
        return [];
    }
  };

  // Check if we need to show additional options
  const showOptions = resourceType === "carbon" || resourceType === "harvest";

  // Get the appropriate unit based on resource type
  const getResourceUnit = (type) => {
    switch (type) {
      case "water":
        return "L";
      case "energy":
        return "kWh";
      default:
        return "kg";
    }
  };

  // Get environmental impact
  const getEnvironmentalImpact = () => {
    if (!summaryStats || !summaryStats[resourceType]) {
      return {
        text: "Start tracking to see your impact!",
        sentiment: "neutral",
      };
    }

    const stats = summaryStats[resourceType];
    let text = "";
    let sentiment = "neutral";

    switch (resourceType) {
      case "water":
        text = `You've tracked ${stats.total}L of water usage. `;
        text +=
          stats.trend === "improving"
            ? "Your water conservation efforts are paying off!"
            : "Consider implementing water saving techniques like rainwater harvesting.";
        sentiment = stats.trend === "improving" ? "positive" : "warning";
        break;
      case "compost":
        text = `You've added ${stats.total}kg of compost to your garden. `;
        text +=
          stats.trend === "improving"
            ? "Great job enriching your soil naturally!"
            : "Regular composting helps reduce waste and improves soil health.";
        sentiment = stats.trend === "improving" ? "positive" : "neutral";
        break;
      case "harvest":
        text = `You've harvested ${stats.total}kg of produce. `;
        text +=
          stats.trend === "improving"
            ? "Your garden's productivity is increasing!"
            : "Consider succession planting to increase yields.";
        sentiment = stats.trend === "improving" ? "positive" : "neutral";
        break;
      case "carbon":
        text = `You've tracked ${stats.total}kg of carbon emissions. `;
        text +=
          stats.trend === "improving"
            ? "Your carbon footprint is decreasing!"
            : "Consider ways to reduce emissions in your gardening practices.";
        sentiment = stats.trend === "improving" ? "positive" : "warning";
        break;
      case "energy":
        text = `You've used ${stats.total}kWh of energy. `;
        text +=
          stats.trend === "improving"
            ? "Your energy conservation is improving!"
            : "Consider solar-powered alternatives for garden equipment.";
        sentiment = stats.trend === "improving" ? "positive" : "warning";
        break;
      case "waste":
        text = `You've diverted ${stats.total}kg of waste from landfill. `;
        text +=
          stats.trend === "improving"
            ? "Great job reducing waste!"
            : "Consider composting more kitchen scraps to improve this metric.";
        sentiment = stats.trend === "improving" ? "positive" : "neutral";
        break;
      default:
        text = "Track your resource usage to see environmental impact.";
    }

    return { text, sentiment };
  };

  // Get Irish-specific tips based on resource type
  const getIrishContextTip = () => {
    switch (resourceType) {
      case "water":
        // Use dynamic weather-based tip if available
        if (weatherRec && useWeatherData) {
          return (
            weatherRec.irishContextTip ||
            "In Ireland, where annual rainfall is 1000+ mm, a water butt can save approximately 640 liters per month during growing season!"
          );
        }

        const waterTips = [
          "In Ireland, where annual rainfall is 1000+ mm, a water butt can save approximately 640 liters per month during growing season!",
          "Irish gardens can benefit from mulching which reduces water needs by up to 70% by preventing evaporation in our frequent windy conditions.",
          "Morning watering is best in Irish gardens as evening humidity can promote fungal diseases common in our climate.",
          "With Ireland's mild Atlantic climate, most garden plants need 30% less water than in continental European gardens.",
        ];
        return waterTips[Math.floor(Math.random() * waterTips.length)];

      case "compost":
        return "For Irish gardens, aim to add 5-7cm of compost to your beds annually to improve soil structure and reduce the need for peat-based products.";
      case "harvest":
        return "A typical 3x3 meter raised bed in Ireland can produce around 20kg of vegetables per year with proper planning and succession planting.";
      case "carbon":
        return "Irish peatlands are vital carbon sinks - using peat-free compost helps preserve these important ecosystems.";
      case "energy":
        return "In Ireland's temperate climate, passive solar techniques like cold frames can extend growing seasons without additional energy inputs.";
      case "waste":
        return "Home composting diverts up to 30% of household waste in Ireland and produces valuable soil amendments for your garden.";
      default:
        return "Ireland's climate is ideal for sustainable gardening with its mild temperatures and regular rainfall.";
    }
  };

  // Get carbon impact metrics with enhanced details from carbon calculator
  const getCarbonImpactMetrics = () => {
    // Calculate net carbon impact from explicit tracking
    const carbonImpact = calculateNetCarbonImpact();

    // Calculate additional carbon savings that may not be explicitly tracked
    const harvestLogs = userProgress.resourceUsage.harvest || [];

    // Food miles savings (transportation emissions)
    const foodMilesSavings = harvestLogs.length * 2; // Rough estimate: each harvest saves 2 kg CO2e in transport

    // Plastic packaging savings
    // Assume each kg of produce would use 25g of plastic, and each kg of plastic produces 6 kg CO2e
    const plasticSavingsEstimate =
      harvestLogs.reduce((total, log) => total + (log.amount || 0), 0) *
      0.025 *
      6;

    // Enhanced calculations including implicit savings
    const totalSavings =
      carbonImpact.offsets + foodMilesSavings + plasticSavingsEstimate;

    return {
      emissions: carbonImpact.emissions.toFixed(1),
      reductions: totalSavings.toFixed(1),
      netImpact: (carbonImpact.emissions - totalSavings).toFixed(1),
      percentReduced:
        carbonImpact.emissions > 0
          ? Math.round((totalSavings / carbonImpact.emissions) * 100)
          : 0,
      foodMilesSavings: foodMilesSavings.toFixed(1),
      plasticSavings: plasticSavingsEstimate.toFixed(1),
    };
  };

  // Calculate water efficiency score based on user practices and data
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

  // Generate water saving tips based on user practices
  const generateWaterSavingsTips = () => {
    // Base tips everyone should see
    const baseTips = [
      "Install water butts to collect rainwater - a 100L water butt filled 10 times per year saves 1000L of mains water",
      "Water plants at the base rather than overhead to reduce water waste by up to 90%",
      "Group plants with similar water needs together to optimize irrigation",
    ];

    // Additional tips based on user's gardening practices
    const additionalTips = [];

    // Check if user has implemented water conservation practices
    const hasRainwaterHarvesting = userProgress.activePractices.some(
      (p) => p.id === "water-1"
    );
    const hasMulching = userProgress.activePractices.some(
      (p) => p.id === "water-2"
    );
    const hasDroughtTolerantPlants = userProgress.activePractices.some(
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
    const waterUsage = userProgress.resourceUsage.water || [];
    if (waterUsage.length > 5) {
      additionalTips.push(
        "You're consistently tracking your water usage - consider setting a goal to reduce consumption by 10% this season"
      );
    }

    // Combine and return tips
    return [...baseTips, ...additionalTips];
  };

  const impact = getEnvironmentalImpact();

  // Get recent logs for current resource type
  const recentLogs = getRecentLogs(resourceType);

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Track Resource Usage</h2>
      
      {/* New feature highlight */}
      <div className="alert alert-success mb-6 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Enhanced Data Visualization Now Available!</h3>
          <div className="text-sm">
            Unlock powerful insights with our new advanced charts: yearly comparisons, seasonal patterns, and intensity maps.
            Click "Show Advanced Charts" below the basic usage chart to explore your data in new ways.
          </div>
        </div>
      </div>

      {/* Resource Usage Stats */}
      {summaryStats && Object.keys(summaryStats).length > 0 && (
        <div className="stats shadow mb-6 w-full">
          {Object.entries(summaryStats).map(([type, data]) => (
            <div className="stat" key={type}>
              <div className="stat-title capitalize">{type}</div>
              <div className="stat-value text-primary">
                {data.total} {getResourceUnit(type)}
              </div>
              <div className="stat-desc">
                <span
                  className={`badge badge-sm ${
                    data.trend === "improving"
                      ? "badge-success"
                      : data.trend === "worsening"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {data.trend === "improving"
                    ? "↓"
                    : data.trend === "worsening"
                    ? "↑"
                    : "–"}{" "}
                  {data.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Carbon Impact Summary */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-bold mb-2">Carbon Footprint Calculator</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="bg-red-100 text-red-800 rounded-full p-2 mr-2">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm opacity-70">Emissions</div>
              <div className="font-bold">
                {getCarbonImpactMetrics().emissions} kg CO₂e
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 rounded-full p-2 mr-2">
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
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm opacity-70">Reductions</div>
              <div className="font-bold">
                {getCarbonImpactMetrics().reductions} kg CO₂e
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`rounded-full p-2 mr-2 ${
                getCarbonImpactMetrics().netImpact <= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm opacity-70">Net Impact</div>
              <div
                className={`font-bold ${
                  getCarbonImpactMetrics().netImpact <= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                {getCarbonImpactMetrics().netImpact} kg CO₂e
              </div>
            </div>
          </div>
        </div>

        {/* Added section showing equivalent savings */}
        {getCarbonImpactMetrics().reductions > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-base-100 p-3 rounded-md">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-success mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>
                  Equivalent to removing a car from the road for{" "}
                  {Math.round(
                    parseFloat(getCarbonImpactMetrics().reductions) / 0.2
                  )}{" "}
                  kilometers!
                </span>
              </div>
            </div>
            <div className="bg-base-100 p-3 rounded-md">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-success mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span>
                  Your garden's carbon savings equal the work of a tree for{" "}
                  {Math.round(
                    (parseFloat(getCarbonImpactMetrics().reductions) / 25) * 12
                  )}{" "}
                  months!
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="divider text-xs opacity-70">Detailed Breakdown</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Food Miles Saved:</span>
            <span className="font-semibold">
              {getCarbonImpactMetrics().foodMilesSavings} kg CO₂e
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Plastic Packaging Avoided:</span>
            <span className="font-semibold">
              {getCarbonImpactMetrics().plasticSavings} kg CO₂e
            </span>
          </div>
        </div>

        <div className="text-xs mt-3 opacity-70">
          {getCarbonImpactMetrics().netImpact <= 0
            ? "Your gardening activities are providing a net positive impact on carbon emissions! Keep up the great work."
            : "Try implementing more carbon-reducing activities such as composting, harvesting more food, and reducing garden waste to improve your net carbon impact."}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Input Form */}
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Resource Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {showOptions && (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">
                    {resourceType === "carbon" ? "Activity Type" : "Plant Type"}
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={resourceType === "carbon" ? activityType : plantType}
                  onChange={(e) =>
                    resourceType === "carbon"
                      ? setActivityType(e.target.value)
                      : setPlantType(e.target.value)
                  }
                >
                  {getActivityOptions().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-bordered flex-1"
                  placeholder={`Enter amount in ${
                    resourceType === "water"
                      ? "liters"
                      : resourceType === "energy"
                      ? "kWh"
                      : "kilograms"
                  }`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span className="bg-base-300 px-3 flex items-center">
                  {resourceType === "water"
                    ? "L"
                    : resourceType === "energy"
                    ? "kWh"
                    : "kg"}
                </span>
              </div>
            </div>

            {resourceType === "water" && (
              <div className="mb-4">
                <div className="form-control">
                  <label className="cursor-pointer label justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={useWeatherData}
                      onChange={(e) => setUseWeatherData(e.target.checked)}
                    />
                    <span className="label-text">
                      Use weather data for smart water recommendations
                    </span>
                  </label>
                </div>

                {weatherRec && useWeatherData && (
                  <div
                    className={`alert mt-2 ${
                      !weatherRec.wateringNeeded
                        ? "alert-info"
                        : "alert-success"
                    }`}
                  >
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6 mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="ml-2">
                        <p className="text-sm font-semibold">
                          Weather Recommendation:
                        </p>
                        <p className="text-sm">{weatherRec.recommendation}</p>
                        {weatherRec.rainProbability > 50 && (
                          <p className="text-sm mt-1">
                            {weatherRec.rainProbability}% chance of rain{" "}
                            {weatherRec.nextRainDate
                              ? `on ${new Date(
                                  weatherRec.nextRainDate
                                ).toLocaleDateString()}`
                              : "soon"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Record Usage
            </button>
          </form>

          {isSuccess && (
            <div className="alert alert-success mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
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
              <span>{successMessage}</span>
            </div>
          )}

          <div
            className={`alert mt-4 ${
              impact.sentiment === "positive"
                ? "alert-success"
                : impact.sentiment === "warning"
                ? "alert-warning"
                : "alert-info"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{impact.text}</span>
          </div>
        </div>

        {/* Right column - Chart and Recent Logs */}
        <div>
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">Basic Usage Chart</h4>
              <button 
                className="btn btn-sm btn-outline btn-primary"
                onClick={() => setShowEnhancedCharts(!showEnhancedCharts)}
              >
                {showEnhancedCharts ? 'Hide Advanced Charts' : 'Show Advanced Charts'}
              </button>
            </div>
            <div style={{ height: "250px" }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {/* Enhanced Data Visualization */}
          {showEnhancedCharts && userProgress.resourceUsage[resourceType] && 
           userProgress.resourceUsage[resourceType].length > 0 ? (
            <EnhancedCharts resourceType={resourceType} />
           ) : showEnhancedCharts && (
            <div className="alert alert-info mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Enhanced Charts</h3>
                <div className="text-sm">
                  Start tracking your {resourceType} usage to unlock advanced visualizations! 
                  These charts will help you identify yearly trends, seasonal patterns, and usage intensity.
                </div>
              </div>
            </div>
           )}

          {/* Water Efficiency Score - only show when water is selected */}
          {resourceType === "water" && (
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Water Efficiency Score</h4>
              <div className="flex items-center gap-4">
                <div
                  className={`${getWaterEfficiencyClass(
                    calculateWaterEfficiency()
                  )}`}
                >
                  <div
                    className="radial-progress"
                    style={{ "--value": calculateWaterEfficiency() }}
                    role="progressbar"
                  >
                    {calculateWaterEfficiency()}%
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">
                    {calculateWaterEfficiency() >= 80
                      ? "Excellent!"
                      : calculateWaterEfficiency() >= 60
                      ? "Good"
                      : calculateWaterEfficiency() >= 40
                      ? "Fair"
                      : "Needs Improvement"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Irish Context:</span>{" "}
                    Despite high rainfall, water management is increasingly
                    important in Ireland due to seasonal dry spells and
                    projected climate changes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold mb-4">
            Recent{" "}
            {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Logs
          </h3>

          {recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    {showOptions && <th>Type</th>}
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getIconForResourceType(resourceType)}
                          <span>
                            {log.amount.toFixed(1)}{" "}
                            {resourceType === "water"
                              ? "L"
                              : resourceType === "energy"
                              ? "kWh"
                              : "kg"}
                          </span>
                        </div>
                      </td>
                      {showOptions && log.metadata && (
                        <td className="capitalize">
                          {resourceType === "carbon"
                            ? log.metadata.activity
                                ?.replace(/([A-Z])/g, " $1")
                                .trim() || "N/A"
                            : log.metadata.plantType
                                ?.replace(/([A-Z])/g, " $1")
                                .trim() || "N/A"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                No {resourceType} logs recorded yet. Start tracking your usage!
              </span>
            </div>
          )}

          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            {resourceType === "water" ? (
              <>
                <h4 className="font-bold mb-2">
                  Water Savings Tips for Irish Gardens
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {generateWaterSavingsTips().map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-bold">Irish Context Tip</h4>
                <p className="text-sm mt-2">{getIrishContextTip()}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceUsageTracker;
