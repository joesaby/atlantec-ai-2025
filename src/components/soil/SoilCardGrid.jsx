// src/components/soil/SoilCardGrid.jsx
// A component to display multiple soil cards in a grid layout

import React from "react";
import SoilCard from "./SoilCard";

/**
 * SoilCardGrid component displays multiple soil cards in a responsive grid
 *
 * @param {Object} props
 * @param {Array} props.soilDataArray - Array of soil data objects
 * @param {boolean} props.compact - Whether to show compact soil cards
 * @param {string} props.className - Additional CSS classes to apply
 */
const SoilCardGrid = ({
  soilDataArray = [],
  compact = false,
  className = "",
}) => {
  if (!soilDataArray.length) return null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {soilDataArray.map((soilData, index) => (
        <SoilCard
          key={`${soilData.county}-${soilData.soilType}-${index}`}
          soilData={soilData}
          compact={compact}
        />
      ))}
    </div>
  );
};

export default SoilCardGrid;
