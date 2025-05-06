// In a production app, we would use an actual OpenAI client
// For this project, we'll use a simplified approach that extracts key parameters

export async function naturalLanguageToGraphQuery(question) {
  // Simple keyword-based extraction for demo purposes
  // In a real app, this would use OpenAI or another NLP service
  const questionLower = question.toLowerCase();

  // Extract parameters from the natural language question
  const result = {
    queryType: "unknown",
    parameters: {},
  };

  // Determine the query type
  if (
    questionLower.includes("grow") ||
    questionLower.includes("plant") ||
    questionLower.includes("suitable")
  ) {
    result.queryType = "plantSuitability";

    // Extract soil type
    if (
      questionLower.includes("brown earth") ||
      questionLower.includes("brown-earth")
    ) {
      result.parameters.soilType = "brown-earth";
    } else if (questionLower.includes("peat")) {
      result.parameters.soilType = "peat";
    } else if (
      questionLower.includes("grey-brown") ||
      questionLower.includes("grey brown")
    ) {
      result.parameters.soilType = "grey-brown-podzolic";
    } else if (questionLower.includes("loam")) {
      result.parameters.soilType = "loam";
    }

    // Extract sun exposure
    if (questionLower.includes("full sun")) {
      result.parameters.sunExposure = "full-sun";
    } else if (questionLower.includes("partial shade")) {
      result.parameters.sunExposure = "partial-shade";
    } else if (questionLower.includes("full shade")) {
      result.parameters.sunExposure = "full-shade";
    }

    // Extract season
    if (questionLower.includes("spring")) {
      result.parameters.season = "spring";
    } else if (questionLower.includes("summer")) {
      result.parameters.season = "summer";
    } else if (
      questionLower.includes("autumn") ||
      questionLower.includes("fall")
    ) {
      result.parameters.season = "autumn";
    } else if (questionLower.includes("winter")) {
      result.parameters.season = "winter";
    }
  } else if (
    questionLower.includes("companion") ||
    questionLower.includes("grow together")
  ) {
    result.queryType = "companionPlants";

    // Try to extract plant name
    const plants = ["cabbage", "potato", "hawthorn", "kale"];
    for (const plant of plants) {
      if (questionLower.includes(plant)) {
        result.parameters.plantId = plant;
        break;
      }
    }
  }

  return result;
}
