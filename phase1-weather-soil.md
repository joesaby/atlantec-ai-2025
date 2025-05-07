# Phase 1: Weather & Soil Data Integration

This phase implements the weather and soil data components for the Irish gardening assistant. We'll create reusable daisyUI components that display current weather conditions and soil information for Irish counties.

## Implementation Steps

### 1. Weather Data Client

First, create a utility to fetch weather data:

```javascript
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
  
  if (cachedData && (now - cachedData.timestamp < 3600000)) {
    return cachedData.data;
  }
  
  try {
    // For MVP, we'll use Open-Meteo API
    // You can replace with Met.ie API when you get access
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=53.35&longitude=-6.26&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FLondon`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
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
          max: rawData.daily.temperature_2m_max[index]
        },
        rainfall: rawData.daily.precipitation_sum[index],
        description: getRainfallDescription(rawData.daily.precipitation_sum[index])
      })),
      source: "Open-Meteo API"
    };
    
    // Cache the result
    weatherCache.set(cacheKey, {
      timestamp: now,
      data: weatherData
    });
    
    return weatherData;
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data if API fails (for development)
    return getMockWeatherData(county);
  }
}

// Helper function to get wind direction string
function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Helper function to describe weather
function getWeatherDescription(current) {
  if (current.rain > 1) return 'Heavy Rain';
  if (current.rain > 0.1) return 'Light Rain';
  if (current.humidity > 80) return 'Cloudy';
  return 'Clear';
}

// Helper function for rainfall description
function getRainfallDescription(rainfall) {
  if (rainfall > 5) return 'Heavy Rain';
  if (rainfall > 1) return 'Moderate Rain';
  if (rainfall > 0.1) return 'Light Rain';
  return 'Dry';
}

// Mock data for development
function getMockWeatherData(county) {
  return {
    location: county,
    date: new Date(),
    temperature: 12,
    rainfall: 0.2,
    windSpeed: 15,
    windDirection: 'SW',
    humidity: 65,
    weatherDescription: 'Light Rain',
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        temperature: { min: 8, max: 13 },
        rainfall: 0.5,
        description: 'Light Rain'
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        temperature: { min: 7, max: 14 },
        rainfall: 0,
        description: 'Dry'
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        temperature: { min: 9, max: 16 },
        rainfall: 0,
        description: 'Dry'
      }
    ],
    source: "Mock Data (Development Only)"
  };
}
```

### 2. Soil Data Client

Create a utility to provide soil information:

```javascript
// src/utils/soil-client.js

// Cache for soil data
const soilCache = new Map();

// Mock Irish soil types for development
const IRISH_SOIL_TYPES = {
  'brown-earth': {
    name: 'Brown Earth',
    description: 'Fertile soils common in the Midlands region',
    ph: { min: 5.5, max: 7.0 },
    texture: 'Loamy',
    nutrients: 'High',
    drainage: 'Good'
  },
  'grey-brown-podzolic': {
    name: 'Grey-Brown Podzolic',
    description: 'Good agricultural soils in east and south',
    ph: { min: 5.0, max: 6.5 },
    texture: 'Clay Loam',
    nutrients: 'Medium',
    drainage: 'Moderate'
  },
  'gley': {
    name: 'Gley',
    description: 'Poorly drained soils found in low-lying areas',
    ph: { min: 4.5, max: 6.0 },
    texture: 'Clay',
    nutrients: 'Variable',
    drainage: 'Poor'
  },
  'peat': {
    name: 'Peat',
    description: 'Acidic, organic-rich soils common in boglands',
    ph: { min: 3.5, max: 5.5 },
    texture: 'Organic',
    nutrients: 'Low',
    drainage: 'Poor to Very Poor'
  },
  'acid-brown-earth': {
    name: 'Acid Brown Earth',
    description: 'Forestry and some agricultural soils',
    ph: { min: 4.5, max: 5.5 },
    texture: 'Sandy Loam',
    nutrients: 'Low',
    drainage: 'Good'
  }
};

// County to dominant soil type mapping (simplified)
const COUNTY_SOIL_MAPPING = {
  'dublin': 'grey-brown-podzolic',
  'kildare': 'grey-brown-podzolic',
  'wicklow': 'acid-brown-earth',
  'wexford': 'brown-earth',
  'cork': 'brown-earth',
  'galway': 'peat',
  'mayo': 'gley',
  'donegal': 'peat',
  // Add more counties as needed
  'default': 'brown-earth'
};

/**
 * Get soil data by Irish location
 * @param {string} county - County name
 * @returns {Promise<Object>} Soil data
 */
export async function getSoilDataByLocation(county) {
  // Lowercase and remove spaces for consistent keys
  const normalizedCounty = county.toLowerCase().replace(/\s+/g, '');
  
  // Check cache first
  const cacheKey = `soil_${normalizedCounty}`;
  if (soilCache.has(cacheKey)) {
    return soilCache.get(cacheKey);
  }
  
  try {
    // In a real implementation, this would call Teagasc API
    // For MVP, we'll use our mock data
    
    // Get the dominant soil type for this county
    const soilType = COUNTY_SOIL_MAPPING[normalizedCounty] || COUNTY_SOIL_MAPPING.default;
    
    // Get detailed soil information
    const soilInfo = IRISH_SOIL_TYPES[soilType];
    
    const soilData = {
      county: county,
      soilType: soilType,
      soilName: soilInfo.name,
      description: soilInfo.description,
      properties: {
        ph: soilInfo.ph,
        texture: soilInfo.texture,
        nutrients: soilInfo.nutrients,
        drainage: soilInfo.drainage
      },
      recommendations: getSoilRecommendations(soilType),
      source: "Irish Soil Database (Mock for MVP)"
    };
    
    // Cache the result (permanent for MVP since this is mock data)
    soilCache.set(cacheKey, soilData);
    
    return soilData;
  } catch (error) {
    console.error('Soil data error:', error);
    // Return a default soil type
    return {
      county: county,
      soilType: 'unknown',
      soilName: 'Unknown Soil Type',
      description: 'Soil data could not be determined',
      properties: {
        ph: { min: 5.0, max: 7.0 },
        texture: 'Variable',
        nutrients: 'Unknown',
        drainage: 'Unknown'
      },
      recommendations: [],
      source: "Default Data (Error Recovery)"
    };
  }
}

/**
 * Get soil amendment recommendations based on soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of recommendations
 */
function getSoilRecommendations(soilType) {
  const recommendations = {
    'brown-earth': [
      'Generally good for most crops',
      'Add organic matter annually to maintain fertility',
      'Monitor pH and maintain between 6.0-7.0 for most crops'
    ],
    'grey-brown-podzolic': [
      'Good for most vegetables and fruits',
      'May need lime to raise pH for certain crops',
      'Add organic matter to improve structure'
    ],
    'gley': [
      'Improve drainage with raised beds',
      'Add organic matter to improve structure',
      'Select moisture-tolerant crops',
      'Consider adding lime if pH is below 5.5'
    ],
    'peat': [
      'Excellent for acid-loving plants like blueberries',
      'May need lime for most vegetables',
      'Add rock dust or seaweed to provide minerals',
      'No need to add additional organic matter'
    ],
    'acid-brown-earth': [
      'Add lime for most vegetables',
      'Good for acid-loving plants if left untreated',
      'Add organic matter to improve nutrient content',
      'Consider adding composted manure for fertility'
    ],
    'default': [
      'Add organic matter annually',
      'Test soil pH and amend accordingly',
      'Consider raised beds if drainage is poor'
    ]
  };
  
  return recommendations[soilType] || recommendations.default;
}
```

### 3. Weather Widget Component

Create a daisyUI card-based weather component:

```jsx
// src/components/weather/WeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import { getCurrentWeather } from '../../utils/weather-client';

const WeatherWidget = ({ county = 'Dublin' }) => {
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
        console.error('Failed to fetch weather:', err);
        setError('Could not load weather data');
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
      case 'heavy rain': return 'cloud-rain';
      case 'light rain': return 'cloud-drizzle';
      case 'cloudy': return 'cloud';
      default: return 'sun';
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">
            Weather for {weather.location}
          </h2>
          <div className="badge badge-ghost">{new Date(weather.date).toLocaleDateString()}</div>
        </div>
        
        <div className="flex items-center justify-between my-4">
          <div className="text-4xl font-bold">{Math.round(weather.temperature)}°C</div>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              {weather.rainfall > 5 
                ? "Avoid watering today as rainfall is sufficient. Good day for indoor seedling preparation."
                : weather.temperature > 20
                  ? "Water plants in the early morning or evening to minimize evaporation."
                  : "Moderate conditions today - ideal for general garden maintenance."
              }
            </span>
          </div>
        </div>
        
        <div className="divider">Forecast</div>
        
        <div className="flex flex-wrap justify-between gap-2">
          {weather.forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="card bg-base-200 shadow-sm p-2 flex-1 min-w-[120px]">
              <div className="text-center">
                <div className="font-medium">{new Date(day.date).toLocaleDateString('en-IE', { weekday: 'short' })}</div>
                <div className="text-sm">{day.description}</div>
                <div className="font-bold mt-1">{Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°</div>
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
```

### 4. Soil Information Component

Create a daisyUI card-based soil information component:

```jsx
// src/components/garden/SoilInfo.jsx
import React, { useState, useEffect } from 'react';
import { getSoilDataByLocation } from '../../utils/soil-client';

const SoilInfo = ({ county = 'Dublin' }) => {
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSoilData() {
      try {
        setLoading(true);
        const data = await getSoilDataByLocation(county);
        setSoilData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch soil data:', err);
        setError('Could not load soil information');
      } finally {
        setLoading(false);
      }
    }

    fetchSoilData();
  }, [county]);

  if (loading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading soil data...</h2>
          <span className="loading loading-spinner loading-lg text-accent"></span>
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
        <h2 className="card-title">Soil Information for {county}</h2>
        
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg">{soilData.soilName}</h3>
          <div className="badge badge-accent mb-2">{soilData.soilType}</div>
          <p className="text-sm">{soilData.description}</p>
        </div>
        
        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">pH Range</div>
            <div className="stat-value text-lg">{soilData.properties.ph.min} - {soilData.properties.ph.max}</div>
            <div className="stat-desc">Optimal for most plants: 6.0-7.0</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Texture</div>
            <div className="stat-value text-lg">{soilData.properties.texture}</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Nutrients</div>
            <div className="stat-value text-lg">{soilData.properties.nutrients}</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Drainage</div>
            <div className="stat-value text-lg">{soilData.properties.drainage}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2">
            {soilData.recommendations.map((tip, index) => (
              <li key={index} className="text-sm">{tip}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-2">Suited Crops</h3>
          <div className="flex flex-wrap gap-2">
            {getSuitedCrops(soilData.soilType).map((crop, index) => (
              <div key={index} className="badge badge-outline">{crop}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get crops suited to soil type
function getSuitedCrops(soilType) {
  const cropMap = {
    'brown-earth': ['Potatoes', 'Carrots', 'Onions', 'Cabbage', 'Beetroot', 'Most vegetables'],
    'grey-brown-podzolic': ['Potatoes', 'Cabbage', 'Kale', 'Peas', 'Beans', 'Most vegetables'],
    'gley': ['Cabbage', 'Kale', 'Onions', 'Celery', 'Berries (with drainage)'],
    'peat': ['Potatoes', 'Blueberries', 'Raspberries', 'Rhubarb', 'Acid-loving plants'],
    'acid-brown-earth': ['Potatoes', 'Berries', 'Rhubarb', 'Acid-loving plants'],
    'default': ['Potatoes', 'Cabbage', 'Onions', 'Root vegetables']
  };
  
  return cropMap[soilType] || cropMap.default;
}

export default SoilInfo;
```

### 5. County Selector Component

Create a reusable county selector:

```jsx
// src/components/common/CountySelector.jsx
import React from 'react';

const CountySelector = ({ selectedCounty, onChange }) => {
  // List of Irish counties
  const irishCounties = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
    'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
    'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo',
    'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Select County</span>
      </label>
      <select 
        className="select select-bordered"
        value={selectedCounty}
        onChange={(e) => onChange(e.target.value)}
      >
        {irishCounties.map(county => (
          <option key={county} value={county}>{county}</option>
        ))}
      </select>
      <label className="label">
        <span className="label-text-alt">Soil and weather data will update based on county</span>
      </label>
    </div>
  );
};

export default CountySelector;
```

### 6. Create a Test Page

Create a test page to display and test both components:

```astro
---
// src/pages/weather-soil.astro
import Layout from '../layouts/Layout.astro';
import WeatherWidget from '../components/weather/WeatherWidget';
import SoilInfo from '../components/garden/SoilInfo';
import CountySelector from '../components/common/CountySelector';
---

<Layout title="Weather & Soil Information">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Irish Garden Conditions</h1>
    
    <div class="mb-6" id="county-selector-container"></div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div id="weather-container">
        <WeatherWidget client:load county="Dublin" />
      </div>
      
      <div id="soil-container">
        <SoilInfo client:load county="Dublin" />
      </div>
    </div>
  </main>
</Layout>

<script>
  // Client-side JavaScript to handle county selection
  import React from 'react';
  import ReactDOM from 'react-dom';
  import CountySelector from '../components/common/CountySelector';
  import WeatherWidget from '../components/weather/WeatherWidget';
  import SoilInfo from '../components/garden/SoilInfo';
  
  document.addEventListener('DOMContentLoaded', () => {
    const countySelectorContainer = document.getElementById('county-selector-container');
    const weatherContainer = document.getElementById('weather-container');
    const soilContainer = document.getElementById('soil-container');
    
    let selectedCounty = 'Dublin';
    
    function handleCountyChange(county) {
      selectedCounty = county;
      renderComponents();
    }
    
    function renderComponents() {
      // Render the county selector
      ReactDOM.render(
        React.createElement(CountySelector, {
          selectedCounty,
          onChange: handleCountyChange
        }),
        countySelectorContainer
      );
      
      // Render the weather widget
      ReactDOM.render(
        React.createElement(WeatherWidget, { county: selectedCounty }),
        weatherContainer
      );
      
      // Render the soil info
      ReactDOM.render(
        React.createElement(SoilInfo, { county: selectedCounty }),
        soilContainer
      );
    }
    
    // Initial render
    renderComponents();
  });
</script>
```

## Testing

To validate that this phase is working correctly:

1. Verify the page loads with Dublin as the default county
2. Check that the Weather Widget displays:
   - Current temperature and conditions
   - Humidity, wind, and rainfall data
   - A 3-day forecast
   - Gardening advice based on weather conditions
3. Check that the Soil Information displays:
   - Soil type and description
   - pH, texture, nutrients, and drainage information
   - Soil-specific gardening recommendations
   - Suitable crops for the soil type
4. Test the County Selector:
   - Select different counties
   - Verify that both weather and soil information update accordingly
5. Test error states by temporarily disabling your network connection

## Next Steps

After successfully implementing this phase, you'll have the foundation for displaying location-specific gardening data. Next phases will build on this to:

1. Implement plant recommendations based on soil and weather
2. Create a garden planner with seasonal task management
3. Add sustainable gardening tracking features
