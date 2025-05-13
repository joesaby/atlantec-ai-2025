import React, { useState, useEffect } from "react";
import { foodCarbonFootprint } from "../../data/sustainability-metrics";
import { getAllUserProgress } from "../../utils/sustainability-store";

const CarbonFootprintCalculator = () => {
  const [totalSavings, setTotalSavings] = useState(0);
  const [foodMilesSavings, setFoodMilesSavings] = useState(0);
  const [compostSavings, setCompostSavings] = useState(0);
  const [waterSavings, setWaterSavings] = useState(0);
  const [plasticSavings, setPlasticSavings] = useState(0);
  const [detailedView, setDetailedView] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    const progress = getAllUserProgress();
    setUserProgress(progress);
    calculateCarbonSavings(progress);
  }, []);

  // Calculate carbon savings based on user's gardening activities
  const calculateCarbonSavings = (progress) => {
    if (!progress) return;

    // Carbon savings from growing food instead of buying from stores
    let foodEmissionSavings = 0;
    const harvestLogs = progress.resourceUsage.harvest || [];

    harvestLogs.forEach((log) => {
      // Use average savings if specific crop is not tracked
      // Average emissions saved per kg of home-grown vs store-bought: 1.2 kg CO2e
      const amountHarvested = log.amount || 0;
      foodEmissionSavings += amountHarvested * 1.2;
    });

    // Carbon savings from composting (average 0.5 kg CO2e per kg of organic matter composted)
    let compostingEmissionSavings = 0;
    const compostLogs = progress.resourceUsage.compost || [];

    compostLogs.forEach((log) => {
      const amountComposted = log.amount || 0;
      compostingEmissionSavings += amountComposted * 0.5;
    });

    // Food miles savings (transportation emissions)
    const foodMiles = harvestLogs.length * 2; // Rough estimate: each harvest saves 2 kg CO2e in transport

    // Water harvesting savings (carbon emissions from water treatment)
    // Each liter of tap water has a carbon footprint of about 0.0003 kg CO2e
    const waterPractices = progress.activePractices.filter(
      (p) => p.id && p.id.startsWith("water-")
    );
    const waterSavingsEstimate = waterPractices.length * 1000 * 0.0003; // Assumes each practice saves ~1000L water

    // Plastic packaging savings
    // Assume each kg of produce would use 25g of plastic, and each kg of plastic produces 6 kg CO2e
    const plasticSavingsEstimate =
      harvestLogs.reduce((total, log) => total + (log.amount || 0), 0) *
      0.025 *
      6;

    // Set individual savings for detailed view
    setFoodMilesSavings(Math.round(foodMiles * 10) / 10);
    setCompostSavings(Math.round(compostingEmissionSavings * 10) / 10);
    setWaterSavings(Math.round(waterSavingsEstimate * 10) / 10);
    setPlasticSavings(Math.round(plasticSavingsEstimate * 10) / 10);

    // Set total savings
    const total =
      foodEmissionSavings +
      compostingEmissionSavings +
      foodMiles +
      waterSavingsEstimate +
      plasticSavingsEstimate;
    setTotalSavings(Math.round(total * 10) / 10);
  };

  const getEquivalentSaving = () => {
    // Equivalent in terms people can understand
    // Average car produces ~200g CO2 per km
    if (totalSavings > 0) {
      const carKm = Math.round(totalSavings / 0.2);
      return `That's equivalent to removing a car from the road for ${carKm} kilometers!`;
    }
    return "";
  };

  // Get tree equivalent (each tree absorbs about 25kg CO2 per year)
  const getTreeEquivalent = () => {
    if (totalSavings > 0) {
      const treeMonths = Math.round((totalSavings / 25) * 12);
      return `Your garden's carbon savings equal the work of a tree for ${treeMonths} months!`;
    }
    return "";
  };

  const toggleDetailedView = () => {
    setDetailedView(!detailedView);
  };

  if (!userProgress) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Carbon Footprint Calculator</h3>

      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-success">
              {totalSavings}
            </span>
            <span className="ml-2">
              kg CO<sub>2</sub>e saved
            </span>
          </div>

          <button
            onClick={toggleDetailedView}
            className="btn btn-sm btn-outline"
          >
            {detailedView ? "Hide Details" : "Show Details"}
          </button>
        </div>

        <p className="text-sm mt-3">{getEquivalentSaving()}</p>
        <p className="text-sm mt-1">{getTreeEquivalent()}</p>
      </div>

      {detailedView && (
        <div className="space-y-4">
          <h4 className="font-semibold">Breakdown of Your Carbon Savings</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-base-100 p-4 border border-base-300 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥕</span>
                <div>
                  <h5 className="font-medium">Food Production</h5>
                  <p className="text-sm">
                    Growing food locally eliminates transportation emissions
                  </p>
                </div>
              </div>
              <p className="text-right font-bold mt-2 text-success">
                {foodMilesSavings} kg CO<sub>2</sub>e
              </p>
            </div>

            <div className="bg-base-100 p-4 border border-base-300 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">♻️</span>
                <div>
                  <h5 className="font-medium">Composting Benefits</h5>
                  <p className="text-sm">
                    Composting reduces methane from landfills
                  </p>
                </div>
              </div>
              <p className="text-right font-bold mt-2 text-success">
                {compostSavings} kg CO<sub>2</sub>e
              </p>
            </div>

            <div className="bg-base-100 p-4 border border-base-300 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <div>
                  <h5 className="font-medium">Water Conservation</h5>
                  <p className="text-sm">
                    Rainwater harvesting saves energy from water treatment
                  </p>
                </div>
              </div>
              <p className="text-right font-bold mt-2 text-success">
                {waterSavings} kg CO<sub>2</sub>e
              </p>
            </div>

            <div className="bg-base-100 p-4 border border-base-300 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <div>
                  <h5 className="font-medium">Packaging Reduction</h5>
                  <p className="text-sm">
                    Home-grown food doesn't need plastic packaging
                  </p>
                </div>
              </div>
              <p className="text-right font-bold mt-2 text-success">
                {plasticSavings} kg CO<sub>2</sub>e
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-200 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Improve Your Carbon Footprint</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>
                Grow more of your own food - each kg saves about 1.2 kg of CO
                <sub>2</sub>e
              </li>
              <li>
                Compost garden and kitchen waste to keep it out of landfills
              </li>
              <li>
                Install rainwater harvesting to reduce treated water usage
              </li>
              <li>
                Use organic growing methods to avoid emissions from synthetic
                fertilizers
              </li>
              <li>
                Choose native plants that require less water and resources
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonFootprintCalculator;
