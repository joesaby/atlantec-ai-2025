import React, { useState } from "react";
import SustainabilityPractices from "./SustainabilityPractices";
import EnhancedPracticeTracker from "./EnhancedPracticeTracker";
import PracticeRecommendations from "./PracticeRecommendations";

const EnhancedSustainabilityTracker = () => {
  const [activeTab, setActiveTab] = useState("current");
  
  return (
    <div className="space-y-4">
      {/* Feature announcement */}
      <div className="alert alert-info shadow-lg mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Enhanced Practice Tracking!</h3>
          <div className="text-sm">
            Set goals, track progress, and get personalized sustainable practice recommendations.
          </div>
        </div>
      </div>
      
      {/* Main tabs navigation */}
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${activeTab === "current" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("current")}
        >
          My Active Practices
        </button>
        <button 
          className={`tab ${activeTab === "add" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Add New Practices
        </button>
        <button 
          className={`tab ${activeTab === "recommendations" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          Recommendations
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-1">
        {activeTab === "current" && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Sustainable Gardening Journey</h2>
            <EnhancedPracticeTracker />
          </div>
        )}
        
        {activeTab === "add" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Sustainable Practices for Irish Gardens</h2>
            <p className="mb-4">
              Browse and select sustainable gardening practices suited for Irish climate and conditions.
              Each practice contributes to your sustainability score and helps you garden more responsibly.
            </p>
            <SustainabilityPractices />
          </div>
        )}
        
        {activeTab === "recommendations" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recommended for Your Garden</h2>
            <p className="mb-4">
              Based on your current practices, local Irish conditions, and the current season,
              here are sustainable practices we recommend to enhance your green gardening journey.
            </p>
            <PracticeRecommendations />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSustainabilityTracker;
