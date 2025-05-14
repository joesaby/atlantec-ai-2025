import { getCurrentWeather } from "./utils/weather-client.js";
import logger from "./utils/unified-logger.js";

async function testWeatherRetrieval() {
  logger.info("Fetching weather data for Dublin...", {
    component: "TestWeatherClient",
  });
  try {
    const dublinData = await getCurrentWeather("Dublin");
    console.log("Weather Data Retrieved for Dublin:");
    console.log(JSON.stringify(dublinData, null, 2));
  } catch (error) {
    logger.error("Error fetching Dublin weather", {
      component: "TestWeatherClient",
      error: error.message,
    });
  }

  logger.info("Fetching weather data for Galway...", {
    component: "TestWeatherClient",
  });
  try {
    const galwayData = await getCurrentWeather("Galway");
    console.log("Weather Data Retrieved for Galway:");
    console.log(JSON.stringify(galwayData, null, 2));
  } catch (error) {
    logger.error("Error fetching Galway weather", {
      component: "TestWeatherClient",
      error: error.message,
    });
  }
}

testWeatherRetrieval();
