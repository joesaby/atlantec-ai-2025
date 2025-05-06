import { db } from "astro:db";
import { WeatherData } from "../database/schema";
import { eq, desc } from "astro:db";

const WEATHER_API_BASE = "https://weather.apis.ie/graphql";

export async function getCurrentWeather(county) {
  // Check cache first
  const cachedData = await db
    .select()
    .from(WeatherData)
    .where(eq(WeatherData.columns.location, county))
    .orderBy(desc(WeatherData.columns.created_at))
    .limit(1);

  // If data exists and is less than 1 hour old, use it
  if (
    cachedData.length > 0 &&
    new Date().getTime() - new Date(cachedData[0].created_at).getTime() <
      3600000
  ) {
    return cachedData[0];
  }

  // Otherwise fetch new data via GraphQL API
  const query = `
    {
      forecast(county: "${county}") {
        today {
          temperature
          rainfall
          windSpeed
          windDirection
          humidity
          description
        }
        fiveDay {
          date
          temperature {
            min
            max
          }
          rainfall
          description
        }
      }
    }
  `;

  const response = await fetch(WEATHER_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  // Store in database for caching
  await db.insert(WeatherData).values({
    location: county,
    date: new Date(),
    temperature: data.data.forecast.today.temperature,
    rainfall: data.data.forecast.today.rainfall,
    windSpeed: data.data.forecast.today.windSpeed,
    windDirection: data.data.forecast.today.windDirection,
    humidity: data.data.forecast.today.humidity,
    weatherDescription: data.data.forecast.today.description,
    forecast: JSON.stringify(data.data.forecast.fiveDay),
    source: "Met.ie GraphQL API",
  });

  return data.data.forecast;
}
