import React, { useState } from "react";

const SustainabilityEducation = () => {
  const [activePrinciple, setActivePrinciple] = useState("overview");

  const sustainabilityPrinciples = {
    overview: {
      title: "Sustainable Gardening Principles",
      content: `
        Sustainable gardening is a holistic approach that works with nature to create gardens 
        that not only thrive but also contribute positively to the environment. In Ireland's 
        unique climate and ecosystem, these principles help preserve the country's rich natural 
        heritage while creating productive and beautiful gardens.
      `,
      image: "/images/sustainability/principles.jpg",
    },
    soil: {
      title: "Soil Health",
      content: `
        Healthy soil is the foundation of sustainable gardening. Irish soils vary greatly, from 
        acidic peat soils to alkaline limestone areas. Building soil health through composting, 
        mulching, and avoiding chemical fertilizers supports beneficial soil organisms and 
        improves structure. 
        
        By focusing on soil health, you'll reduce the need for artificial inputs, improve water 
        retention, and grow stronger plants that naturally resist pests and diseases.
      `,
      keyPoints: [
        "Use compost and organic matter to improve soil structure",
        "Practice no-dig gardening to protect soil organisms",
        "Test soil pH and adapt plants to your soil conditions",
        "Avoid peat-based compost to protect Ireland's threatened boglands",
      ],
      image: "/images/sustainability/soil-health.jpg",
    },
    water: {
      title: "Water Conservation",
      content: `
        While Ireland is known for its rainfall, climate change is causing more frequent dry spells. 
        Water conservation becomes increasingly important, both for environmental sustainability 
        and practical gardening.
        
        Rainwater harvesting is particularly effective in Ireland - with average rainfall of 
        1000+ mm annually, a typical Irish roof can collect enough water to meet most garden needs.
      `,
      keyPoints: [
        "Install water butts to collect rainwater from roofs and sheds",
        "Use mulch to reduce evaporation and water needs",
        "Group plants with similar water requirements together",
        "Water deeply but infrequently to encourage deep root growth",
      ],
      image: "/images/sustainability/water-conservation.jpg",
    },
    biodiversity: {
      title: "Supporting Biodiversity",
      content: `
        Ireland has experienced a troubling decline in biodiversity, with over one-third of wild 
        bee species threatened with extinction. Gardens can serve as vital sanctuaries for native 
        wildlife if managed with biodiversity in mind.
        
        By creating diverse habitats and focusing on native plants, your garden can help protect 
        Ireland's unique ecosystem while enjoying the benefits of natural pest control and pollination.
      `,
      keyPoints: [
        "Plant native Irish species that support local wildlife",
        "Create a diversity of habitats - from ponds to log piles",
        "Reduce or eliminate pesticide use to protect beneficial insects",
        "Include plants that flower throughout the seasons",
      ],
      image: "/images/sustainability/biodiversity.jpg",
    },
    resources: {
      title: "Resource Efficiency",
      content: `
        Sustainable gardens minimize waste and use resources efficiently. This involves reusing 
        and recycling materials, choosing durable tools and equipment, and planning for longevity.
        
        The concept of circular economy applies perfectly to gardening - where outputs from one 
        process become inputs for another, mimicking natural ecosystems.
      `,
      keyPoints: [
        "Compost garden and kitchen waste to create natural fertilizer",
        "Reuse plastic pots or switch to biodegradable alternatives",
        "Choose durable, well-made tools that will last for years",
        "Save seeds from year to year to reduce dependence on purchased supplies",
      ],
      image: "/images/sustainability/resource-efficiency.jpg",
    },
    food: {
      title: "Sustainable Food Production",
      content: `
        Growing food in your garden is one of the most impactful sustainability practices. 
        It reduces food miles, eliminates packaging waste, and gives you control over how 
        your food is grown.
        
        In Ireland's mild, maritime climate, it's possible to grow food year-round with 
        proper planning and selection of suitable crops.
      `,
      keyPoints: [
        "Grow crops well-suited to Irish conditions to reduce inputs needed",
        "Practice crop rotation to maintain soil health and reduce pest problems",
        "Use companion planting to naturally deter pests and improve growth",
        "Choose heritage varieties adapted to local conditions",
      ],
      image: "/images/sustainability/food-production.jpg",
    },
  };

  // Get current principle data
  const currentPrinciple =
    sustainabilityPrinciples[activePrinciple] ||
    sustainabilityPrinciples.overview;

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">
        Learn About Sustainable Gardening
      </h3>

      <div className="tabs tabs-boxed mb-6 flex-nowrap overflow-x-auto">
        <a
          className={`tab ${
            activePrinciple === "overview" ? "tab-active" : ""
          }`}
          onClick={() => setActivePrinciple("overview")}
        >
          Overview
        </a>
        <a
          className={`tab ${activePrinciple === "soil" ? "tab-active" : ""}`}
          onClick={() => setActivePrinciple("soil")}
        >
          Soil Health
        </a>
        <a
          className={`tab ${activePrinciple === "water" ? "tab-active" : ""}`}
          onClick={() => setActivePrinciple("water")}
        >
          Water
        </a>
        <a
          className={`tab ${
            activePrinciple === "biodiversity" ? "tab-active" : ""
          }`}
          onClick={() => setActivePrinciple("biodiversity")}
        >
          Biodiversity
        </a>
        <a
          className={`tab ${
            activePrinciple === "resources" ? "tab-active" : ""
          }`}
          onClick={() => setActivePrinciple("resources")}
        >
          Resources
        </a>
        <a
          className={`tab ${activePrinciple === "food" ? "tab-active" : ""}`}
          onClick={() => setActivePrinciple("food")}
        >
          Food
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-3">
            {currentPrinciple.title}
          </h4>
          <div className="space-y-3">
            {currentPrinciple.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-sm">
                {paragraph}
              </p>
            ))}
          </div>

          {currentPrinciple.keyPoints && (
            <div className="mt-4">
              <h5 className="font-semibold mb-2">Key Practices:</h5>
              <ul className="list-disc pl-5 space-y-1">
                {currentPrinciple.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activePrinciple !== "overview" && (
            <div className="mt-6">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActivePrinciple("overview")}
              >
                Back to Overview
              </button>
            </div>
          )}
        </div>

        <div className="bg-base-200 p-4 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3 text-6xl">
              {activePrinciple === "overview" && "♻️"}
              {activePrinciple === "soil" && "🌱"}
              {activePrinciple === "water" && "💧"}
              {activePrinciple === "biodiversity" && "🦋"}
              {activePrinciple === "resources" && "🔄"}
              {activePrinciple === "food" && "🥕"}
            </div>
            <p className="text-sm italic">
              {activePrinciple === "overview" &&
                "Sustainable gardening connects all aspects of your garden into a harmonious system"}
              {activePrinciple === "soil" &&
                "A teaspoon of healthy soil contains more microorganisms than there are people on Earth"}
              {activePrinciple === "water" &&
                "A 100L water butt can fill 6-7 times during an average Irish summer"}
              {activePrinciple === "biodiversity" &&
                "97% of Irish wildflower meadows have been lost since the 1970s"}
              {activePrinciple === "resources" &&
                "Garden waste makes up around 14% of household waste that could be composted"}
              {activePrinciple === "food" &&
                "Growing your own food can reduce your carbon footprint by up to 5%"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-3">Further Resources</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://www.giy.ie"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
              />
            </svg>
            GIY (Grow It Yourself) Ireland
          </a>
          <a
            href="https://pollinators.ie"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
              />
            </svg>
            All-Ireland Pollinator Plan
          </a>
          <a
            href="https://www.botanicgardens.ie"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
              />
            </svg>
            National Botanic Gardens of Ireland
          </a>
          <a
            href="https://www.epa.ie/publications/monitoring--assessment/waste/national-waste-statistics/organic-waste-and-soils/"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
              />
            </svg>
            EPA Ireland - Organic Waste Information
          </a>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityEducation;
