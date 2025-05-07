import React, { useState, useEffect } from "react";
import { getCurrentWeather } from "../../utils/weather-client";

const WeatherWidget = ({ county = "Dublin" }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <progress className="progress w-56"></progress>
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

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Weather for {weather.location}</h2>

        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl font-bold">{weather.temperature}°C</div>
          <div className="px-4 py-2 bg-base-200 rounded-lg">
            {weather.weatherDescription}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex flex-col">
            <span className="text-base-content/60">Humidity</span>
            <span className="font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Wind</span>
            <span className="font-medium">
              {weather.windSpeed} km/h {weather.windDirection}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Rainfall</span>
            <span className="font-medium">{weather.rainfall} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/60">Updated</span>
            <span className="font-medium">
              {new Date(weather.date).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Gardening Advice</h3>
          <p className="text-sm">
            {weather.rainfall > 5
              ? "Avoid watering today as rainfall is sufficient. Good day for indoor seedling preparation."
              : weather.temperature > 20
              ? "Water plants in the early morning or evening to minimize evaporation."
              : "Moderate conditions today - ideal for general garden maintenance."}
          </p>
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary btn-sm">
            View 5-Day Forecast
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
