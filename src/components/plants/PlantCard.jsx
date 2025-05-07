import React from "react";

const PlantCard = ({ plant }) => {
  return (
    <div className="card bg-base-100 shadow-xl h-full">
      <figure className="px-4 pt-4">
        <img
          src={
            plant.imageUrl ||
            "https://picsum.photos/300/200?grayscale&blur=2"
          }
          alt={plant.commonName}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg">
          {plant.commonName}
          {plant.matchPercentage >= 90 && (
            <div className="badge badge-success">Best Match</div>
          )}
        </h2>
        <p className="text-xs italic text-base-content/60">{plant.latinName}</p>

        <div className="flex items-center my-2">
          <div
            className="radial-progress text-primary"
            style={{
              "--value": plant.matchPercentage,
              "--size": "3rem",
              "--thickness": "3px",
            }}
            role="progressbar"
            aria-valuenow={plant.matchPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span className="text-xs">{plant.matchPercentage}%</span>
          </div>
          <span className="text-sm ml-2">Match for your garden</span>
        </div>

        <p className="text-sm">{plant.description}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {plant.nativeToIreland && (
            <div className="badge badge-outline badge-success">Native</div>
          )}
          {plant.isPerennial && (
            <div className="badge badge-outline">Perennial</div>
          )}
          {plant.sunNeeds && (
            <div className="badge badge-outline">{plant.sunNeeds}</div>
          )}
          {plant.waterNeeds && (
            <div className="badge badge-outline">Water: {plant.waterNeeds}</div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center mb-1">
            <span className="text-xs w-32">Sustainability:</span>
            <progress
              className="progress progress-success h-2 flex-1"
              value={plant.sustainabilityRating * 20}
              max="100"
            ></progress>
          </div>
          <div className="flex items-center mb-1">
            <span className="text-xs w-32">Water Conservation:</span>
            <progress
              className="progress progress-info h-2 flex-1"
              value={plant.waterConservationRating * 20}
              max="100"
            ></progress>
          </div>
          <div className="flex items-center">
            <span className="text-xs w-32">Biodiversity:</span>
            <progress
              className="progress progress-accent h-2 flex-1"
              value={plant.biodiversityValue * 20}
              max="100"
            ></progress>
          </div>
        </div>

        <div className="card-actions justify-end mt-3">
          <button className="btn btn-sm btn-outline btn-primary">
            Growing Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;