/**
 * Utility functions for visualizing sustainability data in real-time
 */

/**
 * Formats data for sustainability trend chart visualization
 * @param {Array} data - Array of data points with date and value properties
 * @param {number} days - Number of days to include in the visualization
 * @returns {Object} Formatted data for charts
 */
export const formatTrendData = (data, days = 30) => {
  // If no data, return empty datasets
  if (!data || !data.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Get the latest entries up to the specified number of days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const filteredData = sortedData.filter(
    (item) => new Date(item.date) >= cutoffDate
  );

  // Format dates for display
  const labels = filteredData.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  // Format values
  const values = filteredData.map((item) => item.amount);

  // Calculate moving average for trendline (7-day)
  const movingAvgs = [];
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      sum += values[j];
      count++;
    }
    movingAvgs.push(sum / count);
  }

  return {
    labels,
    datasets: [
      {
        label: "Daily Value",
        data: values,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "7-day Average",
        data: movingAvgs,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0)",
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };
};

/**
 * Calculates percentage changes in sustainability metrics
 * @param {Array} data - Array of data points with date and value properties
 * @param {number} days - Number of days to compare (e.g. 30 for month-over-month)
 * @returns {Object} Percentage changes
 */
export const calculatePercentageChange = (data, days = 30) => {
  if (!data || data.length < 2) {
    return { percentage: 0, isPositive: false };
  }

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Calculate average for previous period
  const now = new Date();
  const previousPeriodStart = new Date();
  const currentPeriodStart = new Date();

  previousPeriodStart.setDate(now.getDate() - days * 2);
  currentPeriodStart.setDate(now.getDate() - days);

  const previousPeriodData = sortedData.filter(
    (item) =>
      new Date(item.date) >= previousPeriodStart &&
      new Date(item.date) < currentPeriodStart
  );

  const currentPeriodData = sortedData.filter(
    (item) => new Date(item.date) >= currentPeriodStart
  );

  if (!previousPeriodData.length || !currentPeriodData.length) {
    return { percentage: 0, isPositive: false };
  }

  const previousAvg =
    previousPeriodData.reduce((sum, item) => sum + item.amount, 0) /
    previousPeriodData.length;
  const currentAvg =
    currentPeriodData.reduce((sum, item) => sum + item.amount, 0) /
    currentPeriodData.length;

  if (previousAvg === 0) {
    return { percentage: 100, isPositive: currentAvg > 0 };
  }

  const percentage = ((currentAvg - previousAvg) / previousAvg) * 100;

  return {
    percentage: Math.round(percentage),
    isPositive: percentage > 0,
  };
};

/**
 * Formats SDG impact data for radar chart visualization
 * @param {Object} sdgScores - Object with SDG scores
 * @returns {Object} Formatted data for radar chart
 */
export const formatSDGRadarData = (sdgScores) => {
  if (!sdgScores) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Filter to just the SDGs that are most relevant to gardening
  const relevantSDGs = ["sdg2", "sdg3", "sdg6", "sdg12", "sdg13", "sdg15"];

  const sdgLabels = {
    sdg2: "Zero Hunger",
    sdg3: "Good Health",
    sdg6: "Clean Water",
    sdg12: "Responsible Consumption",
    sdg13: "Climate Action",
    sdg15: "Life on Land",
  };

  // Get labels and data points
  const labels = relevantSDGs.map((sdg) => sdgLabels[sdg] || sdg);
  const dataPoints = relevantSDGs.map((sdg) => sdgScores[sdg] || 0);

  // Calculate % of max potential score (100 points per SDG)
  const normalizedData = dataPoints.map(
    (value) => (Math.min(100, value) / 100) * 5
  );

  return {
    labels,
    datasets: [
      {
        label: "SDG Impact",
        data: normalizedData,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
};

/**
 * Combines multiple sustainability metrics into a comprehensive dashboard dataset
 * @param {Object} data - Object containing different sustainability metrics
 * @returns {Object} Comprehensive dataset for dashboard
 */
export const formatDashboardData = (data) => {
  const {
    waterUsage = [],
    compostUsage = [],
    harvest = [],
    carbonSavings = [],
    sdgScores = {},
  } = data;

  return {
    waterTrend: formatTrendData(waterUsage, 30),
    compostTrend: formatTrendData(compostUsage, 30),
    harvestTrend: formatTrendData(harvest, 30),
    carbonTrend: formatTrendData(carbonSavings, 30),
    sdgImpact: formatSDGRadarData(sdgScores),
    waterChange: calculatePercentageChange(waterUsage),
    compostChange: calculatePercentageChange(compostUsage),
    harvestChange: calculatePercentageChange(harvest),
    carbonChange: calculatePercentageChange(carbonSavings),
  };
};
