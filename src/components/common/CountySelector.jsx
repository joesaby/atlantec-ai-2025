// src/components/common/CountySelector.jsx
// A dropdown component for selecting Irish counties

import React, { useState, useEffect } from "react";

// Default list of Irish counties
const IRISH_COUNTIES = [
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

/**
 * CountySelector component provides a dropdown to select Irish counties
 *
 * @param {Object} props
 * @param {Array} props.counties - List of Irish counties
 * @param {string} props.defaultCounty - Default selected county
 * @param {Function} props.onChange - Function to call when county selection changes
 * @param {string} props.className - Additional CSS classes to apply
 */
const CountySelector = ({
  counties = IRISH_COUNTIES,
  defaultCounty = "Dublin",
  onChange = () => {},
  className = "",
}) => {
  const [selectedCounty, setSelectedCounty] = useState(defaultCounty);

  // Get county from URL parameter on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const countyParam = urlParams.get("county");
    if (countyParam && counties.includes(countyParam)) {
      setSelectedCounty(countyParam);
      dispatchCountyChangeEvent(countyParam);
    } else if (defaultCounty) {
      setSelectedCounty(defaultCounty);
      dispatchCountyChangeEvent(defaultCounty);
    }
  }, []);

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);

    // Call the onChange prop if provided
    onChange(county);

    // Dispatch a custom event for county change
    dispatchCountyChangeEvent(county);

    // Update URL without redirecting
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("county", county);
    window.history.pushState({}, "", currentUrl);
  };

  // Helper function to dispatch the county change event
  const dispatchCountyChangeEvent = (county) => {
    const event = new CustomEvent("countyChange", {
      detail: county,
      bubbles: true,
    });
    document.dispatchEvent(event);

    // Also try to call the refresh function if it exists
    if (window.refreshSoilData) {
      window.refreshSoilData(county);
    }
  };

  return (
    <div className={`form-control w-full max-w-xs ${className}`}>
      <label className="label" htmlFor="county-selector">
        <span className="label-text">Select County:</span>
      </label>
      <select
        id="county-selector"
        className="select select-bordered w-full"
        value={selectedCounty}
        onChange={handleCountyChange}
        aria-label="Select a county"
      >
        {counties.map((county) => (
          <option key={county} value={county}>
            {county}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountySelector;
