import React, { useState, useEffect } from "react";
import {
  addSustainablePractice,
  removeSustainablePractice,
} from "../../utils/sustainability-store";

const PracticeCard = ({ practice, isActive = false, onStatusChange }) => {
  const [active, setActive] = useState(isActive);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update active state if the prop changes (e.g. on page reload)
  useEffect(() => {
    setActive(isActive);
  }, [isActive]);

  // Helper function to get impact badge color
  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case "high":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };

  // Helper function to get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "hard":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "easy":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const handleToggleActive = async () => {
    if (!practice || !practice.id) {
      console.error("Practice or practice ID is missing", practice);
      return;
    }

    setIsProcessing(true);

    try {
      if (active) {
        // Remove the practice
        console.log("Removing practice:", practice.id);
        await removeSustainablePractice(practice.id);
      } else {
        // Add the practice
        console.log("Adding practice:", practice.id);
        await addSustainablePractice(practice.id);
      }

      // Toggle active state
      setActive((prev) => !prev);

      // Call parent callback if provided
      if (onStatusChange) {
        onStatusChange(practice.id, !active);
      }

      // Force dashboard update
      if (typeof window !== "undefined") {
        if (window.updateSustainabilityDashboard) {
          // Update with a slight delay to ensure localStorage is updated
          setTimeout(() => {
            console.log("Triggering dashboard update after practice change");
            window.updateSustainabilityDashboard();
          }, 100);
        } else {
          // If the update function isn't available, try refreshing the component
          console.warn("Dashboard update function not found - trying fallback");
          window.location.hash = Date.now();
        }
      }
    } catch (error) {
      console.error("Error toggling practice status:", error);
      alert("Failed to update practice status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleTips = (event) => {
    // Ensure event is completely stopped
    if (event) {
      event.stopPropagation();
      event.preventDefault(); // Add preventDefault to be extra safe
    }
    console.log("Toggling tips for practice:", practice.id);
    console.log("Current tips content:", practice.tips);
    setIsExpanded(!isExpanded);
  };

  // Safeguard against rendering issues
  if (!practice) {
    return null;
  }

  return (
    <div
      className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-l-4 ${
        active ? "border-success" : "border-base-300"
      }`}
      onClick={(e) => e.stopPropagation()} // Stop clicks on the card itself from bubbling
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-base flex items-center gap-2">
            {practice.name}
            {active && (
              <div className="badge badge-success badge-sm">Active</div>
            )}
          </h3>
          <div className="flex gap-1">
            {practice.impact && (
              <div
                className={`badge badge-sm ${getImpactColor(practice.impact)}`}
              >
                {practice.impact} impact
              </div>
            )}
            {practice.difficulty && (
              <div
                className={`badge badge-sm ${getDifficultyColor(
                  practice.difficulty
                )}`}
              >
                {practice.difficulty}
              </div>
            )}
          </div>
        </div>

        {practice.description && (
          <p className="text-sm my-2">{practice.description}</p>
        )}

        <div className="flex justify-between items-center mt-2">
          {/* Only show tips button if tips exist */}
          {practice.tips && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleToggleTips}
              disabled={isProcessing}
            >
              {isExpanded ? "Hide tips" : "Show tips"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          <button
            className={`btn btn-sm ${
              active ? "btn-outline btn-error" : "btn-success"
            }`}
            onClick={handleToggleActive}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : active ? (
              "Remove"
            ) : (
              "Add to my practices"
            )}
          </button>
        </div>

        {/* Display tips if expanded and tips exist */}
        {isExpanded && practice.tips && (
          <div className="mt-4 bg-base-200 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Irish Gardening Tips:</h4>
            <p className="text-xs">{practice.tips}</p>
          </div>
        )}

        {/* Display SDG impact information if available */}
        {practice.sdgs && practice.sdgs.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted">
              <strong>SDG Impact:</strong>{" "}
              {practice.sdgs.map((sdg) => sdg.replace("sdg", "")).join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCard;
