import React from "react";
import PlantCard from "./PlantCard";

const PlantRecommendations = ({ recommendations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Finding Perfect Plants</h2>
          <p className="mb-4">Analyzing your garden conditions...</p>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">No Matching Plants Found</h2>
          <p>Try adjusting your garden criteria to see more plants.</p>
          <div className="mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 opacity-20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 12V19H10V12H3V10H10V3H12V10H19V12H12Z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary">
          Recommended Plants for Your Garden
          <div className="badge badge-accent">
            {recommendations.length} matches
          </div>
        </h2>
        <p className="text-sm mb-4">
          Based on your garden conditions, these plants should thrive in your
          garden.
        </p>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantRecommendations;