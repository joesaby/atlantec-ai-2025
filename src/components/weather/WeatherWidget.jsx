import React, { useState, useEffect } from "react";
import { getCurrentWeather } from "../../utils/weather-client";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [county, setCounty] = useState("Dublin");

  useEffect(() => {
    // Listen for county changes
    const handleCountyChange = (event) => {
      setCounty(event.detail);
    };

    window.addEventListener("countyChange", handleCountyChange);
    return () => window.removeEventListener("countyChange", handleCountyChange);
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const data = await getCurrentWeather(county);
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError("Could not load weather data");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [county]);

  if (loading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading weather data...</h2>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Error</h2>
          <p>{error}</p>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get weather icon class
  const getWeatherIcon = (description) => {
    switch (description.toLowerCase()) {
      case "heavy rain":
        return "cloud-rain";
      case "light rain":
        return "cloud-drizzle";
      case "cloudy":
        return "cloud";
      default:
        return "sun";
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Weather for {weather.location}</h2>
          <div className="badge badge-ghost">
            {new Date(weather.date).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between my-4">
          <div className="text-4xl font-bold">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="px-4 py-2 badge badge-lg badge-primary">
            {weather.weatherDescription}
          </div>
        </div>

        <div className="stats shadow w-full">
          <div className="stat">
            <div className="stat-title">Humidity</div>
            <div className="stat-value text-lg">{weather.humidity}%</div>
          </div>

          <div className="stat">
            <div className="stat-title">Wind</div>
            <div className="stat-value text-lg">{weather.windSpeed} km/h</div>
            <div className="stat-desc">{weather.windDirection}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Rainfall</div>
            <div className="stat-value text-lg">{weather.rainfall} mm</div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Gardening Advice</h3>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              {weather.rainfall > 5
                ? "Avoid watering today as rainfall is sufficient. Good day for indoor seedling preparation."
                : weather.temperature > 20
                ? "Water plants in the early morning or evening to minimize evaporation."
                : "Moderate conditions today - ideal for general garden maintenance."}
            </span>
          </div>
        </div>

        <div className="divider">Forecast</div>

        <div className="flex flex-wrap justify-between gap-2">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-sm p-2 flex-1 min-w-[120px]"
            >
              <div className="text-center">
                <div className="font-medium">
                  {new Date(day.date).toLocaleDateString("en-IE", {
                    weekday: "short",
                  })}
                </div>
                <div className="text-sm">{day.description}</div>
                <div className="font-bold mt-1">
                  {Math.round(day.temperature.max)}° /{" "}
                  {Math.round(day.temperature.min)}°
                </div>
                <div className="text-xs mt-1">Rain: {day.rainfall}mm</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
