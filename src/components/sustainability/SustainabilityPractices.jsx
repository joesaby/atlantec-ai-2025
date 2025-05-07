import React, { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { sustainablePractices } from "../../data/sustainability-metrics";
import {
  getAllUserProgress,
  addSustainablePractice,
  removeSustainablePractice,
} from "../../utils/sustainability-store";

const SustainabilityPractices = () => {
  // Get active practices from user progress
  const [activePracticeIds, setActivePracticeIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log("SustainabilityPractices: Loading user progress");
      // Load user's active practices from storage
      const userProgress = getAllUserProgress();
      console.log(
        "SustainabilityPractices: User progress loaded",
        userProgress
      );

      // Extract IDs from active practices
      const activeIds = userProgress.activePractices.map((p) => p.id);
      console.log("SustainabilityPractices: Active practice IDs", activeIds);

      setActivePracticeIds(activeIds);
      setError(null);
    } catch (err) {
      console.error("Error loading sustainability practices:", err);
      setError(
        "Failed to load your active practices. Please refresh the page."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handler for when practice status changes (added or removed)
  const handlePracticeStatusChange = (id, isActive) => {
    try {
      console.log(`Practice status change - ID: ${id}, Active: ${isActive}`);

      if (isActive) {
        // Add practice
        addSustainablePractice(id);
        setActivePracticeIds((prev) => [...prev, id]);
      } else {
        // Remove practice
        removeSustainablePractice(id);
        setActivePracticeIds((prev) =>
          prev.filter((activeId) => activeId !== id)
        );
      }

      // Update the parent dashboard component if needed
      if (window.updateSustainabilityDashboard) {
        window.updateSustainabilityDashboard();
      }
    } catch (err) {
      console.error("Error updating practice status:", err);
      alert("Failed to update practice. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-4">Loading sustainability practices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(sustainablePractices).map(([key, category]) => (
        <CategoryCard
          key={key}
          category={category}
          activePracticeIds={activePracticeIds}
          onPracticeStatusChange={handlePracticeStatusChange}
        />
      ))}
    </div>
  );
};

export default SustainabilityPractices;
