// src/utils/weather-client.js
// Weather data client for Irish counties

import logger from "./unified-logger.js";
import { XMLParser } from "fast-xml-parser"; // Added import

// Simple cache for weather data - disabled for testing county selection
// const weatherCache = new Map();
const weatherCache = {
  get: () => null,
  set: () => {},
};

// County to coordinates mapping for Ireland
const countyCoordinates = {
  antrim: { lat: 54.7, lon: -6.2 },
  armagh: { lat: 54.3, lon: -6.6 },
  carlow: { lat: 52.8, lon: -6.9 },
  cavan: { lat: 54.0, lon: -7.3 },
  clare: { lat: 52.9, lon: -9.0 },
  cork: { lat: 51.9, lon: -8.5 },
  derry: { lat: 54.9, lon: -6.9 },
  donegal: { lat: 54.9, lon: -8.0 },
  down: { lat: 54.3, lon: -5.9 },
  dublin: { lat: 53.35, lon: -6.26 },
  fermanagh: { lat: 54.3, lon: -7.6 },
  galway: { lat: 53.3, lon: -9.0 },
  kerry: { lat: 52.2, lon: -9.5 },
  kildare: { lat: 53.2, lon: -6.7 },
  kilkenny: { lat: 52.6, lon: -7.2 },
  laois: { lat: 53.0, lon: -7.3 },
  leitrim: { lat: 54.1, lon: -8.0 },
  limerick: { lat: 52.7, lon: -8.6 },
  longford: { lat: 53.7, lon: -7.8 },
  louth: { lat: 53.9, lon: -6.5 },
  mayo: { lat: 54.0, lon: -9.5 },
  meath: { lat: 53.6, lon: -6.7 },
  monaghan: { lat: 54.2, lon: -6.9 },
  offaly: { lat: 53.2, lon: -7.7 },
  roscommon: { lat: 53.6, lon: -8.2 },
  sligo: { lat: 54.3, lon: -8.5 },
  tipperary: { lat: 52.5, lon: -8.0 },
  tyrone: { lat: 54.6, lon: -7.2 },
  waterford: { lat: 52.3, lon: -7.1 },
  westmeath: { lat: 53.5, lon: -7.4 },
  wexford: { lat: 52.3, lon: -6.5 },
  wicklow: { lat: 53.0, lon: -6.4 },
};

/**
 * Get current weather for a specific Irish county
 * @param {string} county - The Irish county name
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(county) {
  // Check cache first (cache for 1 hour)
  const cacheKey = `weather_${county}`;
  const cachedData = weatherCache.get(cacheKey);
  const now = new Date().getTime(); // Used for cache timestamp

  if (cachedData && now - cachedData.timestamp < 3600000) {
    return cachedData.data;
  }

  try {
    const normalizedCounty = county.toLowerCase();
    const coordinates = countyCoordinates[normalizedCounty] || {
      lat: 53.35,
      lon: -6.26,
    }; // Default to Dublin

    logger.info(`Getting weather for county: ${county} via proxy`, {
      // MODIFIED LOG
      component: "WeatherClient",
      coordinates: coordinates,
    });

    // Use the new API proxy route
    const proxyUrl = `/api/weather-proxy?lat=${coordinates.lat}&lon=${
      coordinates.lon
    }&county=${encodeURIComponent(county)}`;

    const response = await fetch(proxyUrl); // NEW PROXY FETCH

    if (!response.ok) {
      const errorBody = await response.text(); // Get more details from proxy error
      logger.error("Proxy API error", {
        status: response.status,
        body: errorBody,
        county,
      });
      throw new Error(
        `Failed to fetch weather data via proxy: ${response.status} ${response.statusText}`
      );
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const jsonObj = parser.parse(xmlText);

    // Corrected check for XML structure
    if (
      !jsonObj ||
      !jsonObj.weatherdata ||
      !jsonObj.weatherdata.product ||
      !Array.isArray(jsonObj.weatherdata.product.time)
    ) {
      logger.error("Invalid XML structure from Met.ie API", { data: jsonObj }); // Log the problematic data
      throw new Error("Invalid XML structure from Met.ie API");
    }

    // Corrected assignment of allTimes
    const allTimes = jsonObj.weatherdata.product.time;
    const currentTime = new Date();

    // Filter and sort time entries
    // Point times are for specific moments (temperature, wind, humidity)
    const pointTimes = allTimes
      .filter(
        (t) =>
          t &&
          t["@_from"] === t["@_to"] &&
          t.location &&
          t.location.temperature &&
          t.location.windSpeed &&
          t.location.windDirection &&
          t.location.humidity
      )
      .sort(
        (a, b) =>
          new Date(a["@_from"]).getTime() - new Date(b["@_from"]).getTime()
      ); // Sort ascending to find latest past point

    logger.debug("Sorted pointTimes", {
      count: pointTimes.length,
      first: pointTimes[0],
      last: pointTimes[pointTimes.length - 1],
    });
    logger.debug("Current time for matching", { currentTime });

    // Period times are for intervals (precipitation, symbol)
    const periodTimes = allTimes
      .filter(
        (t) =>
          t &&
          t["@_from"] !== t["@_to"] &&
          t.location &&
          t.location.precipitation &&
          t.location.symbol
      )
      .sort(
        (a, b) =>
          new Date(a["@_from"]).getTime() - new Date(b["@_from"]).getTime()
      ); // Sort ascending

    logger.debug("Sorted periodTimes", {
      count: periodTimes.length,
      first: periodTimes[0],
      last: periodTimes[periodTimes.length - 1],
    });

    // Find current weather data points
    // For point data, find the latest entry that is not in the future
    let currentPoint = null;
    for (let i = pointTimes.length - 1; i >= 0; i--) {
      if (new Date(pointTimes[i]["@_from"]) <= currentTime) {
        currentPoint = pointTimes[i];
        break;
      }
    }
    // If no past point found, take the earliest point as a fallback (should be rare)
    if (!currentPoint && pointTimes.length > 0) {
      currentPoint = pointTimes[0];
    }

    // For period data, find the period that encapsulates the current time
    // or the most recent past period if current time is after all periods.
    let currentPeriod = periodTimes.find(
      (t) =>
        t &&
        new Date(t["@_from"]) <= currentTime &&
        currentTime < new Date(t["@_to"])
    );

    if (!currentPeriod) {
      // If current time is past all periods, find the most recent one
      const pastPeriods = periodTimes.filter(
        (t) => t && new Date(t["@_to"]) <= currentTime
      );
      if (pastPeriods.length > 0) {
        currentPeriod = pastPeriods[pastPeriods.length - 1]; // get the last one
      } else if (periodTimes.length > 0) {
        // Fallback to the earliest period if no other match (e.g. if API data starts in future)
        currentPeriod = periodTimes[0];
      }
    }

    if (!currentPoint || !currentPoint.location) {
      logger.error(
        "Could not find current point weather data in Met.ie response",
        { pointTimes, currentTime }
      );
      throw new Error(
        "Could not find current point weather data in Met.ie response."
      );
    }
    if (!currentPeriod || !currentPeriod.location) {
      logger.error(
        "Could not find current period weather data in Met.ie response",
        { periodTimes, currentTime }
      );
      throw new Error(
        "Could not find current period weather data in Met.ie response."
      );
    }

    const weatherData = {
      location: county,
      date: new Date(currentPoint["@_from"]),
      temperature: parseFloat(currentPoint.location.temperature["@_value"]),
      rainfall: parseFloat(currentPeriod.location.precipitation["@_value"]),
      windSpeed: parseFloat(currentPoint.location.windSpeed["@_mps"]),
      windDirection: currentPoint.location.windDirection["@_name"],
      humidity: parseFloat(currentPoint.location.humidity["@_value"]),
      weatherDescription: currentPeriod.location.symbol["@_id"],
      forecast: [],
      source: `Met Éireann API (openaccess.pf.api.met.ie) for ${county}`,
    };

    // Simplified 3-day forecast
    const forecastDays = [];
    const today = new Date(currentTime.toISOString().split("T")[0]); // Get date part of current time

    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(today);
      targetDate.setUTCDate(today.getUTCDate() + i);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      const dayPointTimes = pointTimes.filter(
        (t) => t && t["@_from"].startsWith(targetDateStr)
      );
      const dayPeriodTimes = periodTimes.filter(
        (t) => t && t["@_from"].startsWith(targetDateStr)
      );

      if (dayPointTimes.length === 0) {
        logger.warn(`No point data for forecast day: ${targetDateStr}`, {
          county,
        });
        continue;
      }
      if (dayPeriodTimes.length === 0) {
        logger.warn(`No period data for forecast day: ${targetDateStr}`, {
          county,
        });
        continue;
      }

      const temps = dayPointTimes.map((t) =>
        parseFloat(t.location.temperature["@_value"])
      );
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      const totalRainfall = dayPeriodTimes.reduce((sum, t) => {
        const precip = t.location.precipitation;
        return sum + (precip ? parseFloat(precip["@_value"]) : 0);
      }, 0);

      const middayPeriod =
        dayPeriodTimes.find(
          (t) =>
            t["@_from"].includes("T12:00:00Z") ||
            t["@_from"].includes("T13:00:00Z")
        ) || dayPeriodTimes[0];
      const dayDescription =
        middayPeriod && middayPeriod.location && middayPeriod.location.symbol
          ? middayPeriod.location.symbol["@_id"]
          : "N/A";

      if (minTemp !== Infinity && maxTemp !== -Infinity) {
        forecastDays.push({
          date: targetDateStr,
          temperature: { min: minTemp, max: maxTemp },
          rainfall: parseFloat(totalRainfall.toFixed(1)),
          description: dayDescription,
        });
      }
    }
    weatherData.forecast = forecastDays;

    weatherCache.set(cacheKey, {
      timestamp: new Date().getTime(), // Use current time for cache set
      data: weatherData,
    });

    return weatherData;
  } catch (error) {
    logger.error("Weather API error (Met.ie) or XML parsing error", {
      component: "WeatherClient",
      county: county,
      error: error.message,
      stack: error.stack, // Log stack for better debugging
    });

    logger.info(`Falling back to mock weather data for ${county}`, {
      component: "WeatherClient",
    });
    return getMockWeatherData(county);
  }
}

// Helper function to get wind direction string
function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Helper function to describe weather (not used with the new API as it provides descriptions)
function getWeatherDescription(current) {
  if (current.rain > 1) return "Heavy Rain";
  if (current.rain > 0.1) return "Light Rain";
  if (current.humidity > 80) return "Cloudy";
  return "Clear";
}

// Helper function for rainfall description (may need adjustment based on Met.ie data)
function getRainfallDescription(rainfall) {
  if (rainfall > 5) return "Heavy Rain"; // mm per hour
  if (rainfall > 1) return "Moderate Rain"; // mm per hour
  if (rainfall > 0.1) return "Light Rain"; // mm per hour
  return "Dry";
}

// County-specific mock data
function getMockWeatherDataForCounty(county) {
  // Create unique but deterministic weather for each county
  const countyName = county.toLowerCase();
  const seed = countyName.charCodeAt(0) + (countyName.charCodeAt(1) || 0);

  // Generate different values based on county name
  const tempBase = 10 + (seed % 10); // 10-19 degrees base temperature
  const rainBase = (seed % 5) / 10; // 0-0.4 rainfall base
  const windBase = 10 + (seed % 15); // 10-24 wind speed

  const mockData = {
    location: county,
    date: new Date(),
    temperature: tempBase,
    rainfall: rainBase,
    windSpeed: windBase,
    windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][seed % 8],
    humidity: 50 + (seed % 40), // 50-89% humidity
    weatherDescription: getRainfallDescription(rainBase),
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        temperature: { min: tempBase - 3, max: tempBase + 2 },
        rainfall: rainBase + 0.1,
        description: getRainfallDescription(rainBase + 0.1),
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        temperature: { min: tempBase - 4, max: tempBase + 3 },
        rainfall: rainBase,
        description: getRainfallDescription(rainBase),
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        temperature: { min: tempBase - 2, max: tempBase + 4 },
        rainfall: rainBase + 0.2,
        description: getRainfallDescription(rainBase + 0.2),
      },
    ],
    source: `Mock Data for ${county} (Development Only - Met.ie integration pending XML parsing)`,
  };

  return mockData;
}

// Fallback mock data if county-specific fails (or for general use)
function getMockWeatherData(county) {
  return getMockWeatherDataForCounty(county || "Default"); // Ensure county is provided
}
