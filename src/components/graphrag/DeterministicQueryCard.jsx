import React, { useState } from "react";

const DeterministicQueryCard = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    countyName: "",
    plantType: "Vegetable",
    soilType: "",
    season: "",
    growingProperty: "",
    question: "",
  });

  const [errors, setErrors] = useState({});

  // Add debugging
  console.log("DeterministicQueryCard rendering");

  // Data from knowledge graph - updated to match actual Neo4j data
  const counties = [
    "Carlow",
    "Cavan",
    "Clare",
    "Cork",
    "Donegal",
    "Dublin",
    "Galway",
    "Kerry",
    "Kildare",
    "Kilkenny",
    "Laois",
    "Leitrim",
    "Limerick",
    "Longford",
    "Louth",
    "Mayo",
    "Meath",
    "Monaghan",
    "Offaly",
    "Roscommon",
    "Sligo",
    "Tipperary",
    "Waterford",
    "Westmeath",
    "Wexford",
    "Wicklow",
  ];

  // Plant types based on actual plants in the database
  const plantTypes = [
    "Vegetable", // Leek, Kale, Potato, Cabbage, Onion
    "Wildflower", // Irish Wildflower Mix, Irish Primrose
    "Tree", // Hawthorn
  ];

  // Soil types as they appear in the database
  const soilTypes = ["Clay", "Sandy", "Loam", "Peat", "Chalky"];

  // Seasons based on planting/harvesting months in the database
  const seasons = ["Spring", "Summer", "Autumn", "Winter"];

  // Growing properties based on actual relationships in the database
  const growingProperties = [
    { value: "soilPreference", label: "Soil Preference" },
    { value: "plantingSeason", label: "Planting Season" },
    { value: "harvestSeason", label: "Harvest Season" },
    { value: "growingCondition", label: "Growing Conditions" },
    { value: "pollinators", label: "Pollinators Attracted" },
    { value: "companionPlants", label: "Companion Plants" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for this field when user makes a change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.countyName) {
      newErrors.countyName = "County is required";
    }

    if (!formData.plantType) {
      newErrors.plantType = "Plant type is required";
    }

    // Optional fields - no validation required

    setErrors(newErrors);

    // Return true if no errors (form is valid)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    if (validateForm()) {
      console.log("Form validated, submitting to parent");
      onSubmit(formData);
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  return (
    <div className="query-card bg-emerald-50 p-5 rounded-lg shadow-sm border border-emerald-100">
      <h3 className="text-xl font-semibold text-emerald-700 mb-3">
        Structured Plant Query
      </h3>
      <p className="text-sm text-emerald-600 mb-4">
        Complete the required fields below to get precise answers about plants
        and growing conditions for specific Irish counties.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label
              htmlFor="countyName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              County <span className="text-red-500">*</span>
            </label>
            <select
              name="countyName"
              id="countyName"
              value={formData.countyName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.countyName ? "border-red-500" : "border-gray-300"
              } focus:ring-emerald-500 focus:border-emerald-500`}
            >
              <option value="">Select a county</option>
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            {errors.countyName && (
              <span className="text-red-500 text-xs mt-1">
                {errors.countyName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="plantType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Plant Type <span className="text-red-500">*</span>
            </label>
            <select
              name="plantType"
              id="plantType"
              value={formData.plantType}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.plantType ? "border-red-500" : "border-gray-300"
              } focus:ring-emerald-500 focus:border-emerald-500`}
            >
              {plantTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.plantType && (
              <span className="text-red-500 text-xs mt-1">
                {errors.plantType}
              </span>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="soilType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Soil Type (Optional)
            </label>
            <select
              name="soilType"
              id="soilType"
              value={formData.soilType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select soil type</option>
              {soilTypes.map((soil) => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="season"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Season (Optional)
            </label>
            <select
              name="season"
              id="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="growingProperty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Growing Property (Optional)
            </label>
            <select
              name="growingProperty"
              id="growingProperty"
              value={formData.growingProperty}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select growing property</option>
              {growingProperties.map((property) => (
                <option key={property.value} value={property.value}>
                  {property.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-4">
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Specific Question (Optional)
          </label>
          <input
            type="text"
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="e.g., When is the best time to plant potatoes in County Cork?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ask a specific question to enhance your results with the structured
            data above
          </p>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
          >
            Get Garden Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeterministicQueryCard;
