/**
 * Weather data service for Irish garden applications
 * This module provides weather data and smart recommendations for water usage
 */

// API key would normally be in environment variables, for demo purposes we're hardcoding
// In production, use process.env.WEATHER_API_KEY
const API_KEY = "demo_weather_api_key";

/**
 * Get current weather for a location in Ireland
 * @param {string} location - Location name or postal code
 * @returns {Promise<Object>} Weather data
 */
export const getWeatherData = async (location = "Dublin") => {
  try {
    // For demo purposes, we're simulating an API response
    // In production, this would be a real API call
    // const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7`);
    // const data = await response.json();

    // Simulate response for demo
    const data = simulateWeatherResponse(location);
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

/**
 * Get smart water usage recommendation based on weather forecast
 * @param {string} location - Location name or postal code
 * @returns {Promise<Object>} Water usage recommendation
 */
export const getWaterUsageRecommendation = async (location = "Dublin") => {
  const weatherData = await getWeatherData(location);

  if (!weatherData) {
    return {
      recommendation:
        "Use moderate water amounts as no weather data is available.",
      wateringNeeded: true,
      rainProbability: 0,
      nextRainDate: null,
    };
  }

  // Check if rain is expected in the next 48 hours
  const rainForecast = predictRain(weatherData);

  // Calculate soil moisture estimate based on recent conditions
  const soilMoisture = estimateSoilMoisture(weatherData);

  let recommendation = "";
  let wateringNeeded = false;

  if (rainForecast.willRainSoon) {
    recommendation = `Rain expected within ${rainForecast.hoursUntilRain} hours. Consider skipping watering to conserve resources.`;
    wateringNeeded = false;
  } else if (soilMoisture.dry) {
    recommendation = `Soil likely to be dry due to ${soilMoisture.dryDays} days without significant rain. Water needed for most plants.`;
    wateringNeeded = true;
  } else {
    recommendation =
      "Moderate watering recommended based on current conditions.";
    wateringNeeded = true;
  }

  return {
    recommendation,
    wateringNeeded,
    rainProbability: rainForecast.probability,
    nextRainDate: rainForecast.nextRainDate,
    recentRainfall: soilMoisture.recentRainfall,
    estimatedSoilMoisture: soilMoisture.value,
    // Irish context tips
    irishContextTip: getIrishWaterContextTip(rainForecast, soilMoisture),
  };
};

/**
 * Calculate water savings by integrating weather forecasts
 * @param {number} waterUsage - Water usage in liters
 * @param {boolean} rainAware - Whether rain-aware watering is used
 * @returns {Promise<Object>} Calculated water and carbon savings
 */
export const calculateWeatherAwareWaterSavings = async (
  waterUsage,
  rainAware = true
) => {
  if (!rainAware) {
    return {
      waterSaved: 0,
      carbonSaved: 0,
      reductionPercentage: 0,
    };
  }

  // Get current weather conditions (Dublin as default Irish location)
  const weather = await getWeatherData("Dublin");

  // Calculate savings based on weather forecast
  let savingsPercentage = 0;

  if (weather) {
    const rainForecast = predictRain(weather);

    if (rainForecast.willRainSoon && rainForecast.hoursUntilRain < 24) {
      // High savings if rain is coming within 24 hours
      savingsPercentage = 0.9; // 90% savings by skipping watering
    } else if (rainForecast.willRainSoon && rainForecast.hoursUntilRain < 48) {
      // Moderate savings if rain is coming within 48 hours
      savingsPercentage = 0.5; // 50% savings by reducing watering
    } else {
      // Some savings just from being weather-aware
      savingsPercentage = 0.2; // 20% by optimizing watering schedule
    }
  } else {
    // Default savings from smart watering without weather data
    savingsPercentage = 0.15;
  }

  const waterSaved = waterUsage * savingsPercentage;

  // Carbon savings from water conservation (0.2 kg CO2e per 1000L water)
  const carbonSaved = (waterSaved / 1000) * 0.2;

  return {
    waterSaved,
    carbonSaved,
    reductionPercentage: savingsPercentage * 100,
  };
};

/**
 * Get Irish-specific water conservation tip based on weather
 */
const getIrishWaterContextTip = (rainForecast, soilMoisture) => {
  const tips = [
    "In Ireland's climate, a water butt can collect over 600 liters of rainwater per month during wet seasons.",
    "Irish gardens typically need 40% less watering than equivalent UK mainland gardens due to higher humidity and rainfall.",
    "Morning watering is best in Irish gardens as evening humidity can promote fungal diseases in our climate.",
    "Mulching can reduce water needs by up to 70% in Irish gardens by preventing evaporation in our frequent windy conditions.",
  ];

  if (rainForecast.willRainSoon) {
    return "With Ireland's frequent rain showers, checking the forecast before watering can save thousands of liters annually.";
  } else if (soilMoisture.dry) {
    return "Even in dry periods, Irish soil often retains moisture below the surface. Water deeply but less frequently.";
  } else {
    return tips[Math.floor(Math.random() * tips.length)];
  }
};

// Helper functions for weather analysis

/**
 * Predict rainfall from weather data
 */
const predictRain = (weatherData) => {
  // Simulated rain prediction
  const willRainSoon = weatherData.forecast.some((day) => day.rainChance > 60);

  // Find the first day with high rain probability
  const rainDay = weatherData.forecast.find((day) => day.rainChance > 60);

  return {
    willRainSoon,
    hoursUntilRain: rainDay
      ? Math.round((new Date(rainDay.date) - new Date()) / (1000 * 60 * 60))
      : 72,
    probability: rainDay ? rainDay.rainChance : 0,
    nextRainDate: rainDay ? new Date(rainDay.date) : null,
  };
};

/**
 * Estimate soil moisture based on weather history
 */
const estimateSoilMoisture = (weatherData) => {
  // Count days without significant rain
  const significantRainThreshold = 2; // mm
  let dryDays = 0;
  let recentRainfall = 0;

  for (const day of weatherData.history) {
    if (day.rainfall < significantRainThreshold) {
      dryDays++;
    } else {
      break; // Stop counting if we find a rainy day
    }

    recentRainfall += day.rainfall;
  }

  // Calculate soil moisture value (0-100)
  // Starting from full saturation (100), we lose about 10 points per dry day
  const moistureValue = Math.max(0, 100 - dryDays * 10);

  return {
    value: moistureValue,
    dry: moistureValue < 40,
    dryDays,
    recentRainfall,
  };
};

/**
 * Simulate weather data response for demo purposes
 */
const simulateWeatherResponse = (location) => {
  const today = new Date();

  // Generate a 7-day forecast
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date();
    forecastDate.setDate(today.getDate() + i);

    // Random rain chance but weighted to be realistic for Ireland
    const rainChance = Math.min(
      90,
      Math.max(20, Math.floor(Math.random() * 100))
    );

    forecast.push({
      date: forecastDate.toISOString(),
      temperature: 12 + Math.floor(Math.random() * 10), // 12-22°C
      rainChance: rainChance,
      rainfall:
        rainChance > 70
          ? 2 + Math.random() * 8
          : rainChance > 40
          ? 0.5 + Math.random() * 2
          : 0,
    });
  }

  // Generate past 5 days of weather history
  const history = [];
  for (let i = 5; i >= 1; i--) {
    const historyDate = new Date();
    historyDate.setDate(today.getDate() - i);

    const rainChance = Math.min(
      90,
      Math.max(20, Math.floor(Math.random() * 100))
    );

    history.push({
      date: historyDate.toISOString(),
      temperature: 10 + Math.floor(Math.random() * 10), // 10-20°C
      rainfall:
        rainChance > 70
          ? 3 + Math.random() * 10
          : rainChance > 40
          ? 0.5 + Math.random() * 3
          : 0,
    });
  }

  return {
    location: location,
    current: {
      temperature: 15 + Math.floor(Math.random() * 5), // 15-20°C
      humidity: 60 + Math.floor(Math.random() * 30), // 60-90%
      condition:
        Math.random() > 0.6
          ? "Partly Cloudy"
          : Math.random() > 0.3
          ? "Overcast"
          : "Rain",
    },
    forecast,
    history,
  };
};
