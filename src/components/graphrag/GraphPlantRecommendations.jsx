import { useState } from "react";
import CountySelector from "../common/CountySelector";

export default function GraphPlantRecommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [county, setCounty] = useState("Dublin");
  const [sunExposure, setSunExposure] = useState("Full Sun");
  const [nativeOnly, setNativeOnly] = useState(false);
  const [plantType, setPlantType] = useState([]);

  const handleCountyChange = (newCounty) => {
    setCounty(newCounty);
  };

  const handleSunExposureChange = (e) => {
    setSunExposure(e.target.value);
  };

  const handleNativeOnlyChange = (e) => {
    setNativeOnly(e.target.checked);
  };

  const handlePlantTypeChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setPlantType((prev) => {
      if (isChecked) {
        return [...prev, value];
      } else {
        return prev.filter((type) => type !== value);
      }
    });
  };

  const getRecommendations = async (e) => {
    e?.preventDefault();

    setLoading(true);
    setRecommendations([]);

    try {
      const response = await fetch("/api/graph-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          county,
          sunExposure,
          nativeOnly,
          plantType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations || []);
      } else {
        console.error("Error fetching recommendations:", data.error);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="graph-plant-recommendations w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">
        Graph-based Plant Recommendations
      </h2>

      <form
        onSubmit={getRecommendations}
        className="mb-6 p-4 bg-emerald-50 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <CountySelector
              selectedCounty={county}
              onChange={handleCountyChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sun Exposure
            </label>
            <select
              value={sunExposure}
              onChange={handleSunExposureChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Full Sun">Full Sun</option>
              <option value="Partial Shade">Partial Shade</option>
              <option value="Full Shade">Full Shade</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Plant Type
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="vegetable"
                checked={plantType.includes("vegetable")}
                onChange={handlePlantTypeChange}
                className="rounded text-emerald-600"
              />
              <span className="ml-2">Vegetables</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="fruit"
                checked={plantType.includes("fruit")}
                onChange={handlePlantTypeChange}
                className="rounded text-emerald-600"
              />
              <span className="ml-2">Fruits</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="flower"
                checked={plantType.includes("flower")}
                onChange={handlePlantTypeChange}
                className="rounded text-emerald-600"
              />
              <span className="ml-2">Flowers</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                value="tree"
                checked={plantType.includes("tree")}
                onChange={handlePlantTypeChange}
                className="rounded text-emerald-600"
              />
              <span className="ml-2">Trees</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={nativeOnly}
              onChange={handleNativeOnlyChange}
              className="rounded text-emerald-600"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Show only native Irish plants
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </form>

      {recommendations.length > 0 && (
        <div className="recommendations-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((plant) => (
            <div
              key={plant.id}
              className="plant-card bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-emerald-700">
                    {plant.commonName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {plant.matchPercentage}% Match
                  </span>
                </div>

                <p className="text-sm text-gray-600 italic mb-2">
                  {plant.latinName}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {plant.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="font-medium">Water Needs:</span>{" "}
                    {plant.waterNeeds}
                  </div>
                  <div>
                    <span className="font-medium">Sun Needs:</span>{" "}
                    {plant.sunNeeds}
                  </div>
                  <div>
                    <span className="font-medium">Native:</span>{" "}
                    {plant.nativeToIreland ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Perennial:</span>{" "}
                    {plant.isPerennial ? "Yes" : "No"}
                  </div>
                </div>

                {plant.pollinators && plant.pollinators.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold">Attracts: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {plant.pollinators.map((pollinator) => (
                        <span
                          key={pollinator}
                          className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full"
                        >
                          {pollinator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {plant.plantRelationships &&
                  plant.plantRelationships.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold">
                        Plant Relationships:
                      </span>
                      <ul className="mt-1 text-xs">
                        {plant.plantRelationships.map((rel, idx) => (
                          <li
                            key={idx}
                            className={`${
                              rel.type === "COMPANION_TO"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {rel.type === "COMPANION_TO"
                              ? "✓ Good with"
                              : "✗ Avoid with"}{" "}
                            {rel.plantName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-1">
                      Sustainability:
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < plant.sustainabilityRating
                              ? "text-emerald-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <button
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                    onClick={() =>
                      window.open(
                        `/plant-guide?plant=${encodeURIComponent(
                          plant.commonName
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    View Guide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !loading && (
        <div className="text-center p-8">
          <p className="text-gray-500">
            Use the form above to get personalized plant recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
