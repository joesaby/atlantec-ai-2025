// src/utils/weather-client.js

// Simple cache for weather data
const weatherCache = new Map();

/**
 * Get current weather for a specific Irish county
 * @param {string} county - The Irish county name
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(county) {
  // Check cache first (cache for 1 hour)
  const cacheKey = `weather_${county}`;
  const cachedData = weatherCache.get(cacheKey);
  const now = new Date().getTime();

  if (cachedData && now - cachedData.timestamp < 3600000) {
    return cachedData.data;
  }

  try {
    // For MVP, we'll use a free weather API
    // Later this can be replaced with Met.ie API when you get access
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=53.35&longitude=-6.26&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FLondon`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const rawData = await response.json();

    // Transform the data into our expected format
    const weatherData = {
      location: county,
      date: new Date(),
      temperature: rawData.current.temperature_2m,
      rainfall: rawData.current.rain,
      windSpeed: rawData.current.wind_speed_10m,
      windDirection: getWindDirection(rawData.current.wind_direction_10m),
      humidity: rawData.current.relative_humidity_2m,
      weatherDescription: getWeatherDescription(rawData.current),
      forecast: rawData.daily.time.map((date, index) => ({
        date,
        temperature: {
          min: rawData.daily.temperature_2m_min[index],
          max: rawData.daily.temperature_2m_max[index],
        },
        rainfall: rawData.daily.precipitation_sum[index],
        description: getRainfallDescription(
          rawData.daily.precipitation_sum[index]
        ),
      })),
      source: "Open-Meteo API (temporarily until Met.ie integration)",
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      timestamp: now,
      data: weatherData,
    });

    return weatherData;
  } catch (error) {
    console.error("Weather API error:", error);

    // Return mock data if API fails (for development)
    return getMockWeatherData(county);
  }
}

// Helper function to get wind direction string
function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Helper function to describe weather
function getWeatherDescription(current) {
  if (current.rain > 1) return "Heavy Rain";
  if (current.rain > 0.1) return "Light Rain";
  if (current.humidity > 80) return "Cloudy";
  return "Clear";
}

// Helper function for rainfall description
function getRainfallDescription(rainfall) {
  if (rainfall > 5) return "Heavy Rain";
  if (rainfall > 1) return "Moderate Rain";
  if (rainfall > 0.1) return "Light Rain";
  return "Dry";
}

// Mock data for development
function getMockWeatherData(county) {
  return {
    location: county,
    date: new Date(),
    temperature: 12,
    rainfall: 0.2,
    windSpeed: 15,
    windDirection: "SW",
    humidity: 65,
    weatherDescription: "Light Rain",
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        temperature: { min: 8, max: 13 },
        rainfall: 0.5,
        description: "Light Rain",
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        temperature: { min: 7, max: 14 },
        rainfall: 0,
        description: "Dry",
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        temperature: { min: 9, max: 16 },
        rainfall: 0,
        description: "Dry",
      },
    ],
    source: "Mock Data (Development Only)",
  };
}
