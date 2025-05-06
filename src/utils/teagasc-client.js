const SOIL_API_BASE = "http://soils.teagasc.ie/api";

export async function getSoilDataByLocation(lat, lng) {
  const response = await fetch(
    `${SOIL_API_BASE}/soildata?lat=${lat}&lng=${lng}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch soil data");
  }

  return await response.json();
}

export async function getSoilTypeInformation(soilCode) {
  // Cache soil information - rarely changes
  if (soilTypeCache[soilCode]) {
    return soilTypeCache[soilCode];
  }

  const response = await fetch(`${SOIL_API_BASE}/soiltypes/${soilCode}`);

  if (!response.ok) {
    throw new Error("Failed to fetch soil type information");
  }

  const data = await response.json();
  soilTypeCache[soilCode] = data;
  return data;
}

// Cache soil type information
const soilTypeCache = {};
