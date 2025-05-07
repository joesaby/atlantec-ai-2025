import React, { useState } from "react";

const PlantRecommendationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    county: "Dublin",
    sunExposure: "Full Sun",
    plantType: [],
    nativeOnly: false,
  });

  const irishCounties = [
    "Antrim",
    "Armagh",
    "Carlow",
    "Cavan",
    "Clare",
    "Cork",
    "Derry",
    "Donegal",
    "Down",
    "Dublin",
    "Fermanagh",
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
    "Tyrone",
    "Waterford",
    "Westmeath",
    "Wexford",
    "Wicklow",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "nativeOnly") {
        setFormData({
          ...formData,
          nativeOnly: checked,
        });
      } else {
        const plantTypesCopy = [...formData.plantType];
        if (checked) {
          plantTypesCopy.push(value);
        } else {
          const index = plantTypesCopy.indexOf(value);
          if (index > -1) {
            plantTypesCopy.splice(index, 1);
          }
        }
        setFormData({
          ...formData,
          plantType: plantTypesCopy,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">Find Plants for Your Garden</h2>
        <p className="text-sm mb-4">
          Tell us about your garden conditions and we'll recommend plants that
          will thrive.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">County</span>
            </label>
            <select
              name="county"
              value={formData.county}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              {irishCounties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <label className="label">
              <span className="label-text-alt">
                We'll use this to determine your soil type and climate
              </span>
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Sunlight Exposure</span>
            </label>
            <div className="flex flex-col gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Full Sun"
                  checked={formData.sunExposure === "Full Sun"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">Full Sun (6+ hours)</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Partial Shade"
                  checked={formData.sunExposure === "Partial Shade"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">Partial Shade (3-6 hours)</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="radio"
                  name="sunExposure"
                  value="Full Shade"
                  checked={formData.sunExposure === "Full Shade"}
                  onChange={handleInputChange}
                  className="radio radio-primary"
                />
                <span className="label-text">
                  Full Shade (less than 3 hours)
                </span>
              </label>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">What would you like to grow?</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="vegetable"
                  checked={formData.plantType.includes("vegetable")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Vegetables</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="fruit"
                  checked={formData.plantType.includes("fruit")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Fruits</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="flower"
                  checked={formData.plantType.includes("flower")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Flowers</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="plantType"
                  value="tree"
                  checked={formData.plantType.includes("tree")}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Trees/Shrubs</span>
              </label>
            </div>
          </div>

          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="nativeOnly"
                checked={formData.nativeOnly}
                onChange={handleInputChange}
                className="checkbox checkbox-success"
              />
              <span className="label-text">Show only native Irish plants</span>
            </label>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Finding Plants...
                </>
              ) : (
                "Get Recommendations"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantRecommendationForm;