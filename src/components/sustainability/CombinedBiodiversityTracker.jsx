import React, { useState } from "react";
import BiodiversityImpact from "./BiodiversityImpact";
import WildlifeSpottingLog from "./WildlifeSpottingLog";
import IrishNativeSpeciesGuide from "./IrishNativeSpeciesGuide";
import BiodiversityVisualization from "./BiodiversityVisualization";
import BiodiversityCommunity from "./BiodiversityCommunity";
import BiodiversityTimeline from "./BiodiversityTimeline";

const CombinedBiodiversityTracker = () => {
  const [activeTab, setActiveTab] = useState("impact");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-base-200 mb-6">
        <button
          className={`tab ${activeTab === "impact" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("impact")}
        >
          Impact Dashboard
        </button>
        <button
          className={`tab ${activeTab === "journey" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("journey")}
        >
          Your Journey
        </button>
        <button
          className={`tab ${activeTab === "wildlife" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("wildlife")}
        >
          Wildlife Log
        </button>
        <button
          className={`tab ${activeTab === "guide" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          Species Guide
        </button>
        <button
          className={`tab ${activeTab === "community" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          Community
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "impact" && <BiodiversityImpact />}
      {activeTab === "journey" && (
        <div className="grid grid-cols-1 gap-8">
          <BiodiversityTimeline />
          <BiodiversityVisualization />
        </div>
      )}
      {activeTab === "wildlife" && <WildlifeSpottingLog />}
      {activeTab === "guide" && <IrishNativeSpeciesGuide />}
      {activeTab === "community" && <BiodiversityCommunity />}

      {/* Irish Biodiversity Context - show on Journey tab */}
      {activeTab === "journey" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-base-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center">
              <span className="text-xl mr-2">🍀</span>
              Irish Biodiversity: Why It Matters
            </h4>
            <p className="text-sm">
              Ireland has experienced a 14% decline in its biodiversity since
              the 1990s. Gardens cover over half a million acres across the
              country - with the right practices, your garden can become a vital
              sanctuary for native species.
            </p>
            <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded-lg border border-warning">
              <p className="text-sm font-medium text-warning-content">
                <span className="font-bold">Did you know?</span> 35% of
                Ireland's 98 native bee species are at risk of extinction. Your
                garden can make a real difference in helping to protect them.
              </p>
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center">
              <span className="text-xl mr-2">🌱</span>
              The Future of Irish Gardens
            </h4>
            <p className="text-sm mb-3">
              By tracking your biodiversity journey, you're contributing to a
              nationwide effort to restore Irish wildlife. The All-Ireland
              Pollinator Plan estimates that if just 10% of gardens implemented
              biodiversity practices, we could reverse pollinator decline across
              the country.
            </p>
            <div className="flex justify-center">
              <button className="btn btn-sm btn-outline btn-primary">
                Learn More About Irish Conservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedBiodiversityTracker;
