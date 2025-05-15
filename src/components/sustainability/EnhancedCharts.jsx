import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import "chart.js/auto";
import { CategoryScale } from "chart.js";
import { getAllUserProgress } from "../../utils/sustainability-store";

// Register scales that might be needed
Chart.register(CategoryScale);

// Component for enhanced data visualization in ResourceUsageTracker
const EnhancedCharts = ({ resourceType }) => {
  const yearlyComparisonRef = useRef(null);
  const seasonalPatternRef = useRef(null);
  const heatmapRef = useRef(null);

  const [userProgress, setUserProgress] = useState(getAllUserProgress());

  const yearlyChartInstance = useRef(null);
  const seasonalChartInstance = useRef(null);
  const heatmapInstance = useRef(null);

  const [chartView, setChartView] = useState("yearly"); // yearly, seasonal, heatmap

  useEffect(() => {
    if (yearlyChartInstance.current) {
      yearlyChartInstance.current.destroy();
    }
    if (seasonalChartInstance.current) {
      seasonalChartInstance.current.destroy();
    }
    if (heatmapInstance.current) {
      heatmapInstance.current.destroy();
    }

    if (chartView === "yearly") {
      renderYearlyComparisonChart();
    } else if (chartView === "seasonal") {
      renderSeasonalPatternChart();
    } else if (chartView === "heatmap") {
      renderHeatmapChart();
    }

    return () => {
      if (yearlyChartInstance.current) {
        yearlyChartInstance.current.destroy();
      }
      if (seasonalChartInstance.current) {
        seasonalChartInstance.current.destroy();
      }
      if (heatmapInstance.current) {
        heatmapInstance.current.destroy();
      }
    };
  }, [resourceType, chartView, userProgress]);

  // Create a yearly comparison chart to show usage across years
  const renderYearlyComparisonChart = () => {
    if (
      !yearlyComparisonRef.current ||
      !userProgress.resourceUsage[resourceType]
    )
      return;

    // Group data by year and month for comparison
    const data = [...(userProgress.resourceUsage[resourceType] || [])];

    // Map to sort data by year and month
    const yearMonthData = {};

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11

      if (!yearMonthData[year]) {
        yearMonthData[year] = Array(12).fill(0);
      }

      yearMonthData[year][month] += parseFloat(entry.amount || 0);
    });

    // Get years for which we have data
    const years = Object.keys(yearMonthData).sort();
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Create datasets for each year
    const datasets = years.map((year, index) => {
      // Generate a color based on index
      const hue = (index * 50) % 360;
      return {
        label: `${year}`,
        data: yearMonthData[year],
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.7)`,
        borderColor: `hsla(${hue}, 70%, 60%, 1)`,
        borderWidth: 1,
      };
    });

    const ctx = yearlyComparisonRef.current.getContext("2d");

    yearlyChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Yearly Comparison",
            font: { size: 16 },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toFixed(
                  1
                )} ${getResourceUnit(resourceType)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: getResourceUnitName(resourceType),
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

  // Create a chart showing seasonal patterns
  const renderSeasonalPatternChart = () => {
    if (
      !seasonalPatternRef.current ||
      !userProgress.resourceUsage[resourceType]
    )
      return;

    const data = [...(userProgress.resourceUsage[resourceType] || [])];

    // Group data by season
    const seasonData = {
      "Spring (Mar-May)": 0,
      "Summer (Jun-Aug)": 0,
      "Autumn (Sep-Nov)": 0,
      "Winter (Dec-Feb)": 0,
    };

    const seasonCounts = {
      "Spring (Mar-May)": 0,
      "Summer (Jun-Aug)": 0,
      "Autumn (Sep-Nov)": 0,
      "Winter (Dec-Feb)": 0,
    };

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const month = date.getMonth(); // 0-11

      let season;
      if (month >= 2 && month <= 4) {
        season = "Spring (Mar-May)";
      } else if (month >= 5 && month <= 7) {
        season = "Summer (Jun-Aug)";
      } else if (month >= 8 && month <= 10) {
        season = "Autumn (Sep-Nov)";
      } else {
        season = "Winter (Dec-Feb)";
      }

      seasonData[season] += parseFloat(entry.amount || 0);
      seasonCounts[season]++;
    });

    // Calculate averages
    const seasons = Object.keys(seasonData);
    const averages = seasons.map((season) =>
      seasonCounts[season] > 0 ? seasonData[season] / seasonCounts[season] : 0
    );

    // Get colors based on resource type
    const color = getResourceColor(resourceType);

    const ctx = seasonalPatternRef.current.getContext("2d");

    seasonalChartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: seasons,
        datasets: [
          {
            label: `Average ${getResourceName(resourceType)} by Season`,
            data: averages,
            backgroundColor: color.replace("0.7", "0.2"),
            borderColor: color,
            borderWidth: 2,
            pointBackgroundColor: color,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Seasonal Usage Patterns",
            font: { size: 16 },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.r;
                return `Average: ${value.toFixed(1)} ${getResourceUnit(
                  resourceType
                )} per entry`;
              },
            },
          },
        },
      },
    });
  };

  // Create a heatmap view showing intensity by month and year
  const renderHeatmapChart = () => {
    if (!heatmapRef.current || !userProgress.resourceUsage[resourceType])
      return;

    const data = [...(userProgress.resourceUsage[resourceType] || [])];

    // Group data by year and month
    const yearMonthData = {};
    let maxValue = 0;

    data.forEach((entry) => {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11

      if (!yearMonthData[year]) {
        yearMonthData[year] = Array(12).fill(null);
      }

      if (yearMonthData[year][month] === null) {
        yearMonthData[year][month] = 0;
      }

      yearMonthData[year][month] += parseFloat(entry.amount || 0);
      maxValue = Math.max(maxValue, yearMonthData[year][month]);
    });

    // Prepare data for heatmap
    const years = Object.keys(yearMonthData).sort();
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Format data for heatmap (using bubble chart as substitute)
    const bubbleData = [];

    years.forEach((year, yIndex) => {
      monthLabels.forEach((month, mIndex) => {
        if (yearMonthData[year][mIndex] !== null) {
          bubbleData.push({
            x: mIndex,
            y: yIndex,
            r: Math.max(5, (yearMonthData[year][mIndex] / maxValue) * 25),
            value: yearMonthData[year][mIndex],
          });
        }
      });
    });

    const ctx = heatmapRef.current.getContext("2d");

    heatmapInstance.current = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: `${getResourceName(resourceType)} Intensity`,
            data: bubbleData,
            backgroundColor: (context) => {
              const value = context.raw.value;
              const maxIntensity = maxValue;
              const intensity = value / maxIntensity;

              // Color scales based on resource type and intensity
              if (resourceType === "water") {
                return `rgba(54, 162, 235, ${0.3 + intensity * 0.7})`;
              } else if (resourceType === "carbon") {
                return `rgba(255, 99, 132, ${0.3 + intensity * 0.7})`;
              } else if (resourceType === "harvest") {
                return `rgba(75, 192, 92, ${0.3 + intensity * 0.7})`;
              } else if (resourceType === "compost") {
                return `rgba(153, 102, 255, ${0.3 + intensity * 0.7})`;
              } else if (resourceType === "energy") {
                return `rgba(255, 159, 64, ${0.3 + intensity * 0.7})`;
              } else if (resourceType === "waste") {
                return `rgba(255, 205, 86, ${0.3 + intensity * 0.7})`;
              } else {
                return `rgba(201, 203, 207, ${0.3 + intensity * 0.7})`;
              }
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "category",
            labels: monthLabels,
            title: {
              display: true,
              text: "Month",
            },
          },
          y: {
            type: "category",
            labels: years,
            title: {
              display: true,
              text: "Year",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: `${getResourceName(resourceType)} Intensity Heatmap`,
            font: { size: 16 },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw.value;
                return `${value.toFixed(1)} ${getResourceUnit(resourceType)}`;
              },
              title: function (context) {
                const mIndex = context[0].raw.x;
                const yIndex = context[0].raw.y;
                return `${monthLabels[mIndex]} ${years[yIndex]}`;
              },
            },
          },
        },
      },
    });
  };

  // Helper function to get resource name
  const getResourceName = (type) => {
    switch (type) {
      case "water":
        return "Water Usage";
      case "compost":
        return "Compost Added";
      case "harvest":
        return "Food Harvested";
      case "carbon":
        return "Carbon Emissions";
      case "energy":
        return "Energy Usage";
      case "waste":
        return "Waste Reduced";
      default:
        return "Resource";
    }
  };

  // Helper function to get resource unit
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

  // Helper function to get full unit name
  const getResourceUnitName = (type) => {
    switch (type) {
      case "water":
        return "Liters";
      case "energy":
        return "kWh";
      default:
        return "Kilograms";
    }
  };

  // Get color based on resource type
  const getResourceColor = (type) => {
    switch (type) {
      case "water":
        return "rgba(54, 162, 235, 0.7)";
      case "compost":
        return "rgba(153, 102, 255, 0.7)";
      case "harvest":
        return "rgba(75, 192, 192, 0.7)";
      case "carbon":
        return "rgba(255, 99, 132, 0.7)";
      case "energy":
        return "rgba(255, 159, 64, 0.7)";
      case "waste":
        return "rgba(255, 205, 86, 0.7)";
      default:
        return "rgba(201, 203, 207, 0.7)";
    }
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-3">Enhanced Data Visualization</h3>

      <div className="tabs tabs-boxed mb-4">
        <a
          className={`tab ${chartView === "yearly" ? "tab-active" : ""}`}
          onClick={() => setChartView("yearly")}
        >
          Yearly
        </a>
        <a
          className={`tab ${chartView === "seasonal" ? "tab-active" : ""}`}
          onClick={() => setChartView("seasonal")}
        >
          Seasonal
        </a>
        <a
          className={`tab ${chartView === "heatmap" ? "tab-active" : ""}`}
          onClick={() => setChartView("heatmap")}
        >
          Intensity Map
        </a>
      </div>

      <div className="bg-base-100 p-3 rounded-lg">
        <div className="text-xs text-center mb-2 text-base-content/60">
          {chartView === "yearly"
            ? "Compare your resource usage patterns across different years"
            : chartView === "seasonal"
            ? "View how your usage changes with the seasons in Ireland"
            : "Visualize intensity of usage across months and years"}
        </div>

        <div style={{ height: "300px" }}>
          {chartView === "yearly" && (
            <canvas ref={yearlyComparisonRef}></canvas>
          )}
          {chartView === "seasonal" && (
            <canvas ref={seasonalPatternRef}></canvas>
          )}
          {chartView === "heatmap" && <canvas ref={heatmapRef}></canvas>}
        </div>

        <div className="text-xs mt-3 opacity-70 italic">
          {chartView === "yearly"
            ? "This visualization helps you compare your usage patterns across different years to identify trends and improvements."
            : chartView === "seasonal"
            ? "Understanding seasonal patterns can help you optimize your gardening practices for different times of year in Ireland."
            : "The intensity map shows the concentration of your resource usage across different months and years."}
        </div>
      </div>

      <div className="text-xs mt-2 text-center text-base-content/60">
        <p>
          Click on different tabs to explore various ways of visualizing your
          data
        </p>
      </div>
    </div>
  );
};

export default EnhancedCharts;
