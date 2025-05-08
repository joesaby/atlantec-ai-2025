import React, { useState, useEffect } from "react";

const CountySelector = () => {
  const [selectedCounty, setSelectedCounty] = useState("Dublin");

  // List of Irish counties
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

  useEffect(() => {
    // Dispatch a custom event when the county changes
    const event = new CustomEvent("countyChange", { detail: selectedCounty });
    window.dispatchEvent(event);
    console.log("County changed to:", selectedCounty); // Debug output
  }, [selectedCounty]);

  const handleCountyChange = (e) => {
    const newCounty = e.target.value;
    setSelectedCounty(newCounty);
    
    // Force immediate refresh by directly calling the functions
    window.refreshWeatherData && window.refreshWeatherData(newCounty);
    window.refreshSoilData && window.refreshSoilData(newCounty);
    
    // Also dispatch the event for components that might be listening
    const event = new CustomEvent("countyChange", { detail: newCounty });
    window.dispatchEvent(event);
    
    console.log("County manually changed to:", newCounty); // Debug output
  };

  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Select County</span>
      </label>
      <select
        className="select select-bordered"
        value={selectedCounty}
        onChange={handleCountyChange}
      >
        {irishCounties.map((county) => (
          <option key={county} value={county}>
            {county}
          </option>
        ))}
      </select>
      <label className="label">
        <span className="label-text-alt">
          Soil and weather data will update based on county
        </span>
      </label>
    </div>
  );
};

export default CountySelector;
