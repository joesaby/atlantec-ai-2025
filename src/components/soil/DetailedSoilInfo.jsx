// src/components/soil/DetailedSoilInfo.jsx
// A client-side component that dynamically loads and displays soil information based on selected county

import React, { useState, useEffect } from "react";
import { getSoilDataByLocation } from "../../utils/soil-client";
import SoilCard from "./SoilCard";
import DetailedSoilCard from "./DetailedSoilCard";

/**
 * DetailedSoilInfo is a client-side component that renders both SoilCard and DetailedSoilCard
 * and responds to county change events.
 *
 * @param {Object} props
 * @param {string} props.initialCounty - The initial county to display soil data for
 * @param {Object} props.initialSoilData - Pre-rendered soil data for the initial county
 */
const DetailedSoilInfo = ({
  initialCounty = "Dublin",
  initialSoilData = null,
}) => {
  const [county, setCounty] = useState(initialCounty);
  const [soilData, setSoilData] = useState(initialSoilData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for county changes
    const handleCountyChange = async (event) => {
      const newCounty = event.detail;
      console.log("DetailedSoilInfo received county change:", newCounty);
      setCounty(newCounty);

      try {
        setLoading(true);
        setError(null);

        // Update URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set("county", newCounty);
        window.history.pushState({ county: newCounty }, "", url);

        // Update page title
        document.title = `Irish Soil Information - ${newCounty}`;

        // Fetch soil data for the new county
        const data = await getSoilDataByLocation(newCounty);
        if (!data) {
          throw new Error("Failed to load soil data");
        }

        setSoilData(data);
      } catch (err) {
        console.error("Error loading soil data:", err);
        setError("Could not load soil information for " + newCounty);
      } finally {
        setLoading(false);
      }
    };

    // Register event listener
    document.addEventListener("countyChange", handleCountyChange);

    // Cleanup function
    return () => {
      document.removeEventListener("countyChange", handleCountyChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // If we don't have initial data and no error, trigger a load
  useEffect(() => {
    if (!initialSoilData && !soilData && !loading && !error) {
      const loadInitialData = async () => {
        try {
          setLoading(true);
          const data = await getSoilDataByLocation(county);
          setSoilData(data);
        } catch (err) {
          console.error("Error loading initial soil data:", err);
          setError("Could not load soil information");
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();
    }
  }, [initialSoilData, soilData, loading, error, county]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body flex items-center justify-center min-h-[300px]">
            <span className="loading loading-spinner loading-lg text-accent"></span>
            <p className="mt-4">Loading soil information...</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body flex items-center justify-center min-h-[300px]">
            <span className="loading loading-spinner loading-lg text-accent"></span>
            <p className="mt-4">Loading detailed profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
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
        <div>
          <h3 className="font-bold">Error</h3>
          <div className="text-sm">{error}</div>
        </div>
        <button className="btn btn-sm" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!soilData) {
    return (
      <div className="alert alert-warning shadow-lg">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3 className="font-bold">No Data</h3>
          <div className="text-sm">No soil information found for {county}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Soil Card</h2>
          <p className="mb-6 text-sm">
            Key soil characteristics for gardening in {county}
          </p>

          <SoilCard soilData={soilData} />
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Detailed Soil Profile</h2>
          <p className="mb-6 text-sm">
            Comprehensive soil information to inform your gardening choices
          </p>

          <DetailedSoilCard soilData={soilData} />
        </div>
      </div>
    </div>
  );
};

export default DetailedSoilInfo;
