import React, { useState } from "react";
import { foodCarbonFootprint } from "../../data/sustainability-metrics";

const FoodSustainabilityComparison = () => {
  const [selectedFood, setSelectedFood] = useState("potatoes");
  const [quantity, setQuantity] = useState(5); // Default 5kg

  // Common foods people grow in Irish gardens
  const foodOptions = [
    { id: "potatoes", name: "Potatoes" },
    { id: "carrots", name: "Carrots" },
    { id: "onions", name: "Onions" },
    { id: "kale", name: "Kale" },
    { id: "cabbage", name: "Cabbage" },
    { id: "apples", name: "Apples" },
    { id: "strawberries", name: "Strawberries" },
    { id: "tomatoes", name: "Tomatoes" },
    { id: "herbs", name: "Herbs (mixed)" },
  ];

  // Calculate carbon footprint
  const storeBoughtFootprint =
    foodCarbonFootprint.storeBought[selectedFood] * quantity;
  const homeGrownFootprint =
    foodCarbonFootprint.homeGrown[selectedFood] * quantity;
  const savings = storeBoughtFootprint - homeGrownFootprint;
  const percentageSaved = ((savings / storeBoughtFootprint) * 100).toFixed(0);

  // Calculate additional environmental impacts
  const waterSaved = quantity * 100; // Rough estimate: 100L water saved per kg
  const plasticSaved =
    (quantity * foodCarbonFootprint.packagingSaved.averageVegetable) / 1000; // Convert g to kg
  const foodMilesSaved = foodCarbonFootprint.averageFoodMiles.domesticProduce;

  // Calculate equivalent impacts for context
  const carMilesSaved = (savings / 0.2).toFixed(1); // 200g CO2e per km driven
  const lightBulbHours = (savings / 0.1).toFixed(0); // 100g CO2e per hour of incandescent bulb

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">
        Home Grown vs. Store Bought Impact
      </h3>
      <p className="mb-6">
        Compare the environmental impact of growing your own food versus buying
        it from stores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Select Food</span>
            </div>
            <select
              className="select select-bordered"
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
            >
              {foodOptions.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Quantity (kg)</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="label">
              <span className="label-text-alt">1 kg</span>
              <span className="label-text-alt font-bold">{quantity} kg</span>
              <span className="label-text-alt">50 kg</span>
            </div>
          </label>
        </div>
      </div>

      <div className="divider"></div>

      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="bg-base-200 p-4 rounded-lg flex-1 border-l-4 border-warning">
          <h4 className="font-bold">Store Bought</h4>
          <p className="text-3xl font-bold mt-2 text-warning">
            {storeBoughtFootprint.toFixed(2)} kg CO<sub>2</sub>e
          </p>
          <p className="text-sm mt-2">
            Includes emissions from farming, transportation, refrigeration, and
            packaging
          </p>
          <div className="mt-4 text-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>Food miles: ~{foodMilesSaved} km</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
              <span>
                Plastic packaging: ~{(plasticSaved * 1000).toFixed(0)} g
              </span>
            </div>
          </div>
        </div>

        <div className="bg-base-200 p-4 rounded-lg flex-1 border-l-4 border-success">
          <h4 className="font-bold">Home Grown</h4>
          <p className="text-3xl font-bold mt-2 text-success">
            {homeGrownFootprint.toFixed(2)} kg CO<sub>2</sub>e
          </p>
          <p className="text-sm mt-2">
            Minimal emissions from seeds, compost, and garden tools
          </p>
          <div className="mt-4 text-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Food miles: 0 km</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Plastic packaging: 0 g</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-success/10 p-4 rounded-lg">
        <h4 className="font-bold text-lg text-center mb-3">
          Environmental Savings
        </h4>

        <div className="stats w-full">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="stat-title">Carbon Reduction</div>
            <div className="stat-value text-success">{percentageSaved}%</div>
            <div className="stat-desc">{savings.toFixed(2)} kg CO₂e saved</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="stat-title">Water Saved</div>
            <div className="stat-value text-info">{waterSaved}L</div>
            <div className="stat-desc">From irrigation & processing</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="stat-title">Plastic Reduced</div>
            <div className="stat-value text-warning">
              {plasticSaved.toFixed(2)} kg
            </div>
            <div className="stat-desc">Packaging eliminated</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-bold">This is equivalent to:</h4>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Driving a car for {carMilesSaved} kilometers</li>
          <li>Running an incandescent light bulb for {lightBulbHours} hours</li>
        </ul>
      </div>

      <div className="mt-6 bg-neutral-content/10 p-4 rounded-lg text-sm">
        <h5 className="font-semibold">About These Calculations</h5>
        <p className="mt-2">
          These comparisons are based on average data for Irish conditions and
          typical food production methods. Home growing calculations assume
          reasonable garden practices with minimal inputs and no heated
          greenhouses. Carbon footprints include emissions from production,
          transportation, refrigeration, and packaging.
        </p>
      </div>
    </div>
  );
};

export default FoodSustainabilityComparison;
