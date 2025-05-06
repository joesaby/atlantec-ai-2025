import React from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeatherForecast = ({ weatherData }) => {
  // Parse forecast data if it's a string
  const forecast =
    typeof weatherData.forecast === "string"
      ? JSON.parse(weatherData.forecast)
      : weatherData.forecast;

  const chartData = {
    labels: forecast
      ? forecast.map((day) =>
          new Date(day.date).toLocaleDateString("en-IE", { weekday: "short" })
        )
      : [],
    datasets: [
      {
        label: "Rainfall (mm)",
        data: forecast ? forecast.map((day) => day.rainfall) : [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Temperature (°C)",
        data: forecast ? forecast.map((day) => day.temperature.max) : [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `5-Day Forecast for ${weatherData.location}`,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Current Weather in {weatherData.location}
      </h2>
      <div className="flex items-center justify-between mb-6">
        <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
        <div className="px-4 py-2 bg-blue-100 rounded-lg">
          {weatherData.weatherDescription}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500">Humidity</span>
          <span className="font-medium">{weatherData.humidity}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Wind</span>
          <span className="font-medium">
            {weatherData.windSpeed} km/h {weatherData.windDirection}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Rainfall</span>
          <span className="font-medium">{weatherData.rainfall} mm</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500">Updated</span>
          <span className="font-medium">
            {new Date(weatherData.created_at).toLocaleTimeString("en-IE")}
          </span>
        </div>
      </div>

      {forecast && (
        <div className="mt-8">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-medium mb-2">Gardening Advice</h3>
        <p className="text-sm">
          {weatherData.rainfall > 5
            ? "Avoid watering today as rainfall is sufficient. Good day for indoor seedling preparation."
            : weatherData.temperature > 20
            ? "Water plants in the early morning or evening to minimize evaporation."
            : "Moderate conditions today - ideal for general garden maintenance."}
        </p>
      </div>
    </div>
  );
};

export default WeatherForecast;
