import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const WildlifeSpottingLog = () => {
  const [spottings, setSpottings] = useState([]);
  const [newSpotting, setNewSpotting] = useState({
    species: "",
    category: "birds", // Default category
    date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    notes: "",
    location: "garden", // Default location
  });
  const [isAddingSpotting, setIsAddingSpotting] = useState(false);

  // Load existing wildlife spottings from local storage
  useEffect(() => {
    try {
      const userProgress = getAllUserProgress();
      if (userProgress && userProgress.wildlifeSpottings) {
        setSpottings(userProgress.wildlifeSpottings);
      }
    } catch (err) {
      console.error("Error loading wildlife spottings:", err);
    }
  }, []);

  // Save new spotting to local storage
  const saveSpotting = () => {
    if (!newSpotting.species.trim()) {
      alert("Please enter a species name");
      return;
    }

    try {
      const userProgress = getAllUserProgress();

      // Create a new spotting with ID and timestamp
      const spottingToAdd = {
        ...newSpotting,
        id: `spotting-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      // Add to existing spottings or create new array
      const updatedSpottings = [
        spottingToAdd,
        ...(userProgress.wildlifeSpottings || []),
      ];

      // Save back to storage
      userProgress.wildlifeSpottings = updatedSpottings;

      // If storage is available
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "irish-garden-sustainability",
          JSON.stringify(userProgress)
        );
      }

      // Update state
      setSpottings(updatedSpottings);

      // Reset form
      setNewSpotting({
        species: "",
        category: "birds",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        location: "garden",
      });

      // Close the form
      setIsAddingSpotting(false);
    } catch (err) {
      console.error("Error saving wildlife spotting:", err);
      alert("Failed to save your wildlife spotting. Please try again.");
    }
  };

  // Delete a spotting
  const deleteSpotting = (id) => {
    try {
      const userProgress = getAllUserProgress();

      // Filter out the spotting with the given ID
      const updatedSpottings = (userProgress.wildlifeSpottings || []).filter(
        (spotting) => spotting.id !== id
      );

      // Save back to storage
      userProgress.wildlifeSpottings = updatedSpottings;

      // If storage is available
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "irish-garden-sustainability",
          JSON.stringify(userProgress)
        );
      }

      // Update state
      setSpottings(updatedSpottings);
    } catch (err) {
      console.error("Error deleting wildlife spotting:", err);
      alert("Failed to delete wildlife spotting. Please try again.");
    }
  };

  // Get appropriate icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "birds":
        return "🦜";
      case "insects":
        return "🦋";
      case "mammals":
        return "🦊";
      case "amphibians":
        return "🐸";
      case "reptiles":
        return "🦎";
      case "plants":
        return "🌿";
      case "fungi":
        return "🍄";
      default:
        return "🌱";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group spottings by month for display
  const groupByMonth = (spottingsList) => {
    const grouped = {};

    spottingsList.forEach((spotting) => {
      const date = new Date(spotting.date);
      const monthYear = date.toLocaleDateString("en-IE", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(spotting);
    });

    return grouped;
  };

  const groupedSpottings = groupByMonth(spottings);

  return (
    <div className="bg-base-200 p-5 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Your Wildlife Spotting Log</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddingSpotting(!isAddingSpotting)}
        >
          {isAddingSpotting ? "Cancel" : "Add Spotting"}
        </button>
      </div>

      {/* Add new spotting form */}
      {isAddingSpotting && (
        <div className="bg-base-100 p-4 rounded-lg mb-4 shadow-sm">
          <h5 className="font-medium text-sm mb-3">
            Record New Wildlife Spotting
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Species Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="e.g. Robin, Butterfly"
                value={newSpotting.species}
                onChange={(e) =>
                  setNewSpotting({ ...newSpotting, species: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={newSpotting.category}
                onChange={(e) =>
                  setNewSpotting({ ...newSpotting, category: e.target.value })
                }
              >
                <option value="birds">Birds</option>
                <option value="insects">Insects</option>
                <option value="mammals">Mammals</option>
                <option value="amphibians">Amphibians</option>
                <option value="reptiles">Reptiles</option>
                <option value="plants">Plants</option>
                <option value="fungi">Fungi</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date Spotted</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm w-full"
                value={newSpotting.date}
                onChange={(e) =>
                  setNewSpotting({ ...newSpotting, date: e.target.value })
                }
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={newSpotting.location}
                onChange={(e) =>
                  setNewSpotting({ ...newSpotting, location: e.target.value })
                }
              >
                <option value="garden">Main Garden</option>
                <option value="hedge">Hedgerow</option>
                <option value="pond">Pond/Water Feature</option>
                <option value="vegetable">Vegetable Patch</option>
                <option value="trees">Trees</option>
                <option value="wildflower">Wildflower Area</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered text-sm w-full"
              rows="2"
              placeholder="Any observations about behavior, appearance, etc."
              value={newSpotting.notes}
              onChange={(e) =>
                setNewSpotting({ ...newSpotting, notes: e.target.value })
              }
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary btn-sm" onClick={saveSpotting}>
              Save Spotting
            </button>
          </div>
        </div>
      )}

      {/* Display spottings */}
      {spottings.length > 0 ? (
        <div>
          <div className="stats shadow mb-4 w-full">
            <div className="stat place-items-center">
              <div className="stat-title">Total Spottings</div>
              <div className="stat-value">{spottings.length}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Species</div>
              <div className="stat-value">
                {new Set(spottings.map((s) => s.species.toLowerCase())).size}
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Latest</div>
              <div className="stat-value text-sm">
                {formatDate(spottings[0]?.date)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedSpottings).map(
              ([monthYear, monthSpottings]) => (
                <div
                  key={monthYear}
                  className="collapse collapse-arrow bg-base-100"
                >
                  <input
                    type="checkbox"
                    defaultChecked={
                      monthSpottings === Object.values(groupedSpottings)[0]
                    }
                  />
                  <div className="collapse-title font-medium text-sm">
                    {monthYear} ({monthSpottings.length} spottings)
                  </div>
                  <div className="collapse-content">
                    <div className="space-y-2">
                      {monthSpottings.map((spotting) => (
                        <div
                          key={spotting.id}
                          className="flex items-start gap-2 p-2 bg-base-200 rounded-lg"
                        >
                          <div className="text-2xl">
                            {getCategoryIcon(spotting.category)}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h6 className="font-medium">
                                {spotting.species}
                              </h6>
                              <div className="text-xs opacity-70">
                                {formatDate(spotting.date)}
                              </div>
                            </div>
                            {spotting.notes && (
                              <p className="text-xs mt-1 opacity-80">
                                {spotting.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <div className="badge badge-sm">
                                {spotting.category}
                              </div>
                              <div className="badge badge-sm badge-outline">
                                {spotting.location}
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => deleteSpotting(spotting.id)}
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="bg-base-100 p-4 rounded-lg text-center">
          <p className="text-sm mb-2">No wildlife spottings recorded yet.</p>
          <p className="text-xs opacity-80">
            Record wildlife you observe in your garden to track biodiversity
            changes over time.
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-lg border border-info">
        <p className="text-xs font-medium">
          <strong>Why track wildlife?</strong> Recording the species you spot in
          your garden helps you:
        </p>
        <ul className="text-xs mt-1 ml-4 list-disc space-y-1">
          <li>Monitor the impact of your biodiversity practices</li>
          <li>Contribute to Irish citizen science projects</li>
          <li>Notice seasonal patterns and changes over time</li>
          <li>Identify areas for habitat improvement</li>
        </ul>
      </div>
    </div>
  );
};

export default WildlifeSpottingLog;
