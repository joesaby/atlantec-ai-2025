import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";
import { sustainablePractices } from "../../data/sustainability-metrics";

const PracticeRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePracticeIds, setActivePracticeIds] = useState([]);
  const [seasonalFilter, setSeasonalFilter] = useState("all");
  
  const currentMonth = new Date().getMonth();
  // Define seasons for Ireland (rough approximations)
  const isSpring = currentMonth >= 2 && currentMonth <= 4; // March to May
  const isSummer = currentMonth >= 5 && currentMonth <= 7; // June to August
  const isAutumn = currentMonth >= 8 && currentMonth <= 10; // September to November
  const isWinter = currentMonth === 11 || currentMonth <= 1; // December to February
  
  const getCurrentSeason = () => {
    if (isSpring) return "spring";
    if (isSummer) return "summer";
    if (isAutumn) return "autumn";
    if (isWinter) return "winter";
    return "all";
  };

  useEffect(() => {
    // Set the season filter to current season by default
    setSeasonalFilter(getCurrentSeason());
    
    try {
      // Get user's active practices
      const userProgress = getAllUserProgress();
      const activeIds = userProgress.activePractices.map((p) => p.id);
      setActivePracticeIds(activeIds);

      // Generate recommendations
      generateRecommendations(activeIds);
    } catch (err) {
      console.error("Error loading practice recommendations:", err);
      setError("Failed to load recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate tailored practice recommendations based on:
   * 1. Current season in Ireland
   * 2. User's existing practices
   * 3. Complementary practices that work well together
   * 4. Practices that help fill gaps in the user's sustainability approach
   */
  const generateRecommendations = (activeIds) => {
    // Flatten all practices into a single array
    const allPractices = Object.values(sustainablePractices).flatMap(
      (category) => category.practices.map(practice => ({
        ...practice,
        category: category.name,
        categoryIcon: category.icon
      }))
    );
    
    // Filter out practices the user already has
    const availablePractices = allPractices.filter(
      (practice) => !activeIds.includes(practice.id)
    );
    
    // Identify gaps in the user's sustainability approach
    const activeCategories = new Set();
    activeIds.forEach(id => {
      const practice = allPractices.find(p => p.id === id);
      if (practice) {
        activeCategories.add(practice.category);
      }
    });
    
    // All possible categories
    const allCategories = new Set(
      Object.values(sustainablePractices).map(category => category.name)
    );
    
    // Find categories the user hasn't explored yet
    const missingCategories = [...allCategories].filter(
      category => !activeCategories.has(category)
    );
    
    // Create recommendations
    const newRecommendations = [];
    
    // 1. Recommend practices from missing categories (high priority)
    if (missingCategories.length > 0) {
      missingCategories.forEach(categoryName => {
        // Find easy high-impact practices from this category
        const categoryPractices = availablePractices.filter(
          p => p.category === categoryName && 
               p.impact === "high" && 
               p.difficulty === "easy"
        );
        
        if (categoryPractices.length > 0) {
          // Add the best practice from this category
          newRecommendations.push({
            practice: categoryPractices[0],
            reason: `Explore a new sustainability area: ${categoryName}`,
            priority: "high"
          });
        }
      });
    }
    
    // 2. Add seasonal recommendations
    const currentSeason = getCurrentSeason();
    
    // Define seasonal keywords to look for in practice descriptions or tips
    const seasonalKeywords = {
      spring: ["spring", "sow", "plant", "prepare", "early", "march", "april", "may"],
      summer: ["summer", "water", "harvest", "maintain", "june", "july", "august"],
      autumn: ["autumn", "fall", "harvest", "collect", "prepare", "september", "october", "november"],
      winter: ["winter", "protect", "plan", "december", "january", "february"]
    };
    
    const currentSeasonKeywords = seasonalKeywords[currentSeason] || [];
    
    // Find practices with seasonal relevance
    const seasonalPractices = availablePractices.filter(practice => {
      const text = (practice.description + " " + (practice.tips || "")).toLowerCase();
      return currentSeasonKeywords.some(keyword => text.includes(keyword));
    });
    
    if (seasonalPractices.length > 0) {
      // Add up to 2 seasonal recommendations
      seasonalPractices.slice(0, 2).forEach(practice => {
        newRecommendations.push({
          practice,
          reason: `Perfect for the current ${currentSeason} season in Ireland`,
          priority: "medium"
        });
      });
    }
    
    // 3. Fill with high-impact practices that the user doesn't have yet
    const highImpactPractices = availablePractices.filter(
      p => p.impact === "high" && 
           !newRecommendations.some(r => r.practice.id === p.id)
    );
    
    if (highImpactPractices.length > 0) {
      // Add up to 2 high-impact recommendations
      highImpactPractices.slice(0, 2).forEach(practice => {
        newRecommendations.push({
          practice,
          reason: "High environmental impact practice",
          priority: "medium" 
        });
      });
    }
    
    // 4. Add some easy wins for beginners
    const easyPractices = availablePractices.filter(
      p => p.difficulty === "easy" && 
           !newRecommendations.some(r => r.practice.id === p.id)
    );
    
    if (easyPractices.length > 0) {
      // Add up to 2 easy recommendations
      easyPractices.slice(0, 2).forEach(practice => {
        newRecommendations.push({
          practice,
          reason: "Easy to implement sustainable practice",
          priority: "low"
        });
      });
    }
    
    // Set recommendations (limit to 6 total)
    setRecommendations(newRecommendations.slice(0, 6));
  };

  // Filter recommendations based on the selected season
  const filteredRecommendations = seasonalFilter === "all" 
    ? recommendations
    : recommendations.filter(rec => {
        const text = (rec.practice.description + " " + (rec.practice.tips || "")).toLowerCase();
        const seasonKeywords = {
          spring: ["spring", "sow", "plant", "prepare", "early", "march", "april", "may"],
          summer: ["summer", "water", "harvest", "maintain", "june", "july", "august"],
          autumn: ["autumn", "fall", "harvest", "collect", "prepare", "september", "october", "november"],
          winter: ["winter", "protect", "plan", "december", "january", "february"]
        };
        return seasonKeywords[seasonalFilter]?.some(keyword => text.includes(keyword));
      });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <span className="loading loading-spinner loading-md text-primary"></span>
        <span className="ml-2">Generating recommendations...</span>
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

  if (filteredRecommendations.length === 0) {
    return (
      <div className="alert alert-info shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">No recommendations available</h3>
          <div className="text-xs">
            {recommendations.length === 0 
              ? "Try adding some sustainable practices first, and we'll suggest complementary ones."
              : "No practices match your current seasonal filter. Try another season or 'All Seasons'."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recommended Practices for Your Garden</h3>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm m-1">
            {seasonalFilter === "all" ? "All Seasons" : seasonalFilter.charAt(0).toUpperCase() + seasonalFilter.slice(1)}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a onClick={() => setSeasonalFilter("all")}>All Seasons</a></li>
            <li><a onClick={() => setSeasonalFilter("spring")}>Spring</a></li>
            <li><a onClick={() => setSeasonalFilter("summer")}>Summer</a></li>
            <li><a onClick={() => setSeasonalFilter("autumn")}>Autumn</a></li>
            <li><a onClick={() => setSeasonalFilter("winter")}>Winter</a></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecommendations.map((recommendation) => (
          <div key={recommendation.practice.id} className="card bg-base-100 shadow-md hover:shadow-lg border-l-4 border-primary">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="badge badge-primary">{recommendation.practice.category}</div>
                {recommendation.priority === "high" && (
                  <div className="badge badge-success">Highly Recommended</div>
                )}
                {recommendation.priority === "medium" && (
                  <div className="badge badge-warning">Recommended</div>
                )}
              </div>
              
              <h3 className="card-title text-base">{recommendation.practice.name}</h3>
              <p className="text-sm">{recommendation.practice.description}</p>
              
              <div className="mt-3 text-xs bg-base-200 p-2 rounded">
                <span className="font-semibold">Why we recommend this: </span>
                {recommendation.reason}
              </div>
              
              <div className="card-actions justify-end mt-3">
                <a href="/sustainability-tracker?action=add-practice&id={recommendation.practice.id}" className="btn btn-sm btn-primary">
                  Add to My Practices
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeRecommendations;
