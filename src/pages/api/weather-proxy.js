import { XMLParser } from "fast-xml-parser";
import logger from "../../utils/unified-logger.js";

// This is a server-side API route
export async function GET({ request }) {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const county = url.searchParams.get("county") || "Unknown"; // For logging

  if (!lat || !lon) {
    return new Response(
      JSON.stringify({ error: "Latitude and longitude are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const metApiUrl = `http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast?lat=${lat}&long=${lon}`;

  try {
    logger.info(
      `[API Route /api/weather-proxy] Fetching Met.ie data for ${county} (lat: ${lat}, lon: ${lon})`,
      { component: "WeatherProxyAPI" }
    );
    const response = await fetch(metApiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(
        `[API Route /api/weather-proxy] Met.ie API error for ${county}: ${response.status} ${response.statusText}`,
        { component: "WeatherProxyAPI", error: errorText }
      );
      return new Response(
        JSON.stringify({
          error: `Met.ie API error: ${response.status} ${response.statusText}`,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const xmlText = await response.text();
    // We return the raw XML text. The client-side weather-client.js already has parsing logic.
    // Alternatively, we could parse it here and return JSON, but that might duplicate logic.
    // For now, let's keep it simple and let the client parse.
    // If we decide to parse here, we'd use XMLParser like in weather-client.js
    // const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    // const jsonObj = parser.parse(xmlText);

    logger.info(
      `[API Route /api/weather-proxy] Successfully fetched Met.ie XML for ${county}`,
      { component: "WeatherProxyAPI" }
    );
    return new Response(xmlText, {
      status: 200,
      headers: { "Content-Type": "application/xml" }, // Send as XML
    });
  } catch (error) {
    logger.error(
      `[API Route /api/weather-proxy] Server-side fetch error for ${county}: ${error.message}`,
      { component: "WeatherProxyAPI", stack: error.stack }
    );
    return new Response(
      JSON.stringify({
        error: "Failed to fetch weather data via proxy",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
