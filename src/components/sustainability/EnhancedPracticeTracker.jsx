import React, { useState, useEffect } from "react";
import { 
  getAllUserProgress, 
  addSustainablePractice, 
  removeSustainablePractice, 
  updatePracticeData 
} from "../../utils/sustainability-store";
import { 
  emitPracticeAdded,
  emitPracticeRemoved, 
  emitDataChanged 
} from "../../utils/sustainability-events";
import { sustainablePractices } from "../../data/sustainability-metrics";

const EnhancedPracticeTracker = () => {
  const [activePractices, setActivePractices] = useState([]);
  const [practiceGoals, setPracticeGoals] = useState({});
  const [practiceNotes, setPracticeNotes] = useState({});
  const [practiceProgress, setPracticeProgress] = useState({});
  const [practiceHistory, setPracticeHistory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // Load user data
  useEffect(() => {
    try {
      console.log("EnhancedPracticeTracker: Loading user progress");
      const userProgress = getAllUserProgress();
      
      // Get active practices with full details
      const activePracticeDetails = userProgress.activePractices.map(practice => {
        // Find the practice details from the sustainable practices data
        let practiceDetail = null;
        
        // Search through all categories and practices
        Object.values(sustainablePractices).forEach(category => {
          const found = category.practices.find(p => p.id === practice.id);
          if (found) {
            practiceDetail = {
              ...found,
              category: category.name,
              icon: category.icon,
              progress: practice.progress || 0,
              notes: practice.notes || "",
              goal: practice.goal || "",
              startDate: practice.startDate || new Date().toISOString(),
              history: practice.history || []
            };
          }
        });
        
        return practiceDetail;
      }).filter(practice => practice !== null);
      
      setActivePractices(activePracticeDetails);
      
      // Extract progress, notes, goals, and history into separate state objects for easier management
      const progressObj = {};
      const notesObj = {};
      const goalsObj = {};
      const historyObj = {};
      
      activePracticeDetails.forEach(practice => {
        progressObj[practice.id] = practice.progress;
        notesObj[practice.id] = practice.notes;
        goalsObj[practice.id] = practice.goal;
        historyObj[practice.id] = practice.history;
      });
      
      setPracticeProgress(progressObj);
      setPracticeNotes(notesObj);
      setPracticeGoals(goalsObj);
      setPracticeHistory(historyObj);
      setError(null);
    } catch (err) {
      console.error("Error loading enhanced practice tracker:", err);
      setError("Failed to load your practice data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update practice progress
  const handleProgressChange = (id, progress) => {
    try {
      // Update local state
      setPracticeProgress(prev => ({
        ...prev,
        [id]: progress
      }));
      
      // Update storage and record in history
      const now = new Date().toISOString();
      const historyEntry = { date: now, progress };
      
      updatePracticeData(id, { 
        progress,
        history: [...(practiceHistory[id] || []), historyEntry]
      });
      
      // Update history state
      setPracticeHistory(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), historyEntry]
      }));
      
      // Emit event
      emitDataChanged("practice-progress-update", { practiceId: id, progress });
    } catch (err) {
      console.error("Error updating practice progress:", err);
      alert("Failed to update progress. Please try again.");
    }
  };

  // Save practice notes
  const handleNotesChange = (id, notes) => {
    try {
      // Update local state
      setPracticeNotes(prev => ({
        ...prev,
        [id]: notes
      }));
      
      // Update storage
      updatePracticeData(id, { notes });
      
      // Emit event
      emitDataChanged("practice-notes-update", { practiceId: id, notes });
    } catch (err) {
      console.error("Error updating practice notes:", err);
      alert("Failed to save notes. Please try again.");
    }
  };

  // Set a goal for a practice
  const handleGoalChange = (id, goal) => {
    try {
      // Update local state
      setPracticeGoals(prev => ({
        ...prev,
        [id]: goal
      }));
      
      // Update storage
      updatePracticeData(id, { goal });
      
      // Emit event
      emitDataChanged("practice-goal-update", { practiceId: id, goal });
    } catch (err) {
      console.error("Error updating practice goal:", err);
      alert("Failed to save goal. Please try again.");
    }
  };

  // Remove a practice
  const handleRemovePractice = async (id) => {
    try {
      // Remove from database
      await removeSustainablePractice(id);
      
      // Update local state
      setActivePractices(prev => prev.filter(practice => practice.id !== id));
      
      // Emit event
      emitPracticeRemoved(id);
      emitDataChanged("practice-update", { practiceId: id, isActive: false });
    } catch (err) {
      console.error("Error removing practice:", err);
      alert("Failed to remove practice. Please try again.");
    }
  };

  // Filter practices by category and search term
  const filteredPractices = activePractices.filter(practice => {
    const matchesCategory = activeCategory === "all" || practice.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = practice.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         practice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompletion = showCompleted || practice.progress < 100;
    
    return matchesCategory && matchesSearch && matchesCompletion;
  });

  // Calculate overall sustainability score based on active practices and their progress
  const calculateSustainabilityScore = () => {
    if (activePractices.length === 0) return 0;
    
    const totalPossiblePoints = activePractices.length * 100;
    const earnedPoints = Object.values(practiceProgress).reduce((sum, progress) => sum + progress, 0);
    
    return Math.round((earnedPoints / totalPossiblePoints) * 100);
  };

  const sustainabilityScore = calculateSustainabilityScore();

  // Group practices by category for the report view
  const practicesByCategory = activePractices.reduce((acc, practice) => {
    if (!acc[practice.category]) {
      acc[practice.category] = [];
    }
    acc[practice.category].push(practice);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-4">Loading your sustainability practices...</span>
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
      {/* Overall Progress Card */}
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Your Sustainability Journey</h2>
          
          <div className="stats shadow mt-4">
            <div className="stat">
              <div className="stat-title">Active Practices</div>
              <div className="stat-value">{activePractices.length}</div>
              <div className="stat-desc">Sustainable gardening habits</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Overall Progress</div>
              <div className="stat-value">{sustainabilityScore}%</div>
              <div className="stat-desc">Toward your sustainability goals</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Impact Categories</div>
              <div className="stat-value">{Object.keys(practicesByCategory).length}</div>
              <div className="stat-desc">Areas of positive change</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          {Object.values(sustainablePractices).map(category => (
            <button 
              key={category.name}
              className={`btn btn-sm ${activeCategory === category.name.toLowerCase() ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveCategory(category.name.toLowerCase())}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search practices..."
            className="input input-bordered input-sm w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label className="cursor-pointer label gap-2">
            <span className="label-text">Show completed</span> 
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
            />
          </label>
        </div>
      </div>

      {/* No Practices Message */}
      {filteredPractices.length === 0 && (
        <div className="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">No practices found</h3>
            <div className="text-xs">
              {activePractices.length === 0 
                ? "You haven't added any sustainable practices yet. Go to the 'Add Practices' section to get started!"
                : "No practices match your current filters. Try adjusting your search or category filters."}
            </div>
          </div>
        </div>
      )}

      {/* Practice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPractices.map(practice => (
          <div key={practice.id} className="card bg-base-100 shadow-lg border-l-4 border-l-primary">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <h3 className="card-title text-base">
                  {practice.name}
                  <div className={`badge badge-${practice.impact === 'high' ? 'success' : practice.impact === 'medium' ? 'warning' : 'info'} badge-sm`}>
                    {practice.impact} impact
                  </div>
                </h3>
                <button 
                  className="btn btn-sm btn-ghost btn-circle"
                  onClick={() => handleRemovePractice(practice.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm">{practice.description}</p>
              
              {/* Progress tracking */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">Progress</span>
                  <span className="text-xs">{practiceProgress[practice.id] || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{width: `${practiceProgress[practice.id] || 0}%`}}
                  ></div>
                </div>
              </div>
              
              {/* Progress buttons */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[0, 25, 50, 75, 100].map(value => (
                  <button 
                    key={value}
                    className={`btn btn-xs ${practiceProgress[practice.id] === value ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleProgressChange(practice.id, value)}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              
              {/* Collapsible details */}
              <div className="collapse collapse-arrow mt-3">
                <input type="checkbox" className="peer" /> 
                <div className="collapse-title text-sm font-medium p-0 min-h-0">
                  Details & Notes
                </div>
                <div className="collapse-content p-0 pt-2">
                  {/* Goal setting */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1 block">Your Goal</label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="Set a goal for this practice"
                      value={practiceGoals[practice.id] || ""}
                      onChange={(e) => handleGoalChange(practice.id, e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1 block">Your Notes</label>
                    <textarea 
                      className="textarea textarea-bordered w-full text-sm" 
                      rows="2"
                      placeholder="Add your notes here..."
                      value={practiceNotes[practice.id] || ""}
                      onChange={(e) => handleNotesChange(practice.id, e.target.value)}
                    ></textarea>
                  </div>

                  {/* Irish gardening tips */}
                  {practice.tips && (
                    <div className="mt-2 bg-base-200 p-2 rounded-md">
                      <h4 className="font-medium text-xs mb-1">Irish Gardening Tips:</h4>
                      <p className="text-xs">{practice.tips}</p>
                    </div>
                  )}
                  
                  {/* SDG impact information */}
                  {practice.sdgs && practice.sdgs.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium text-xs mb-1">Supports UN Sustainable Development Goals:</h4>
                      <div className="flex flex-wrap gap-1">
                        {practice.sdgs.map((sdg) => (
                          <div key={sdg} className="badge badge-sm badge-outline">{sdg.replace("sdg", "SDG ")}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress history */}
                  {practiceHistory[practice.id] && practiceHistory[practice.id].length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-xs mb-1">Progress History:</h4>
                      <div className="overflow-x-auto">
                        <table className="table table-xs">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {practiceHistory[practice.id].slice(-5).map((entry, idx) => (
                              <tr key={idx}>
                                <td>{new Date(entry.date).toLocaleDateString()}</td>
                                <td>{entry.progress}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPracticeTracker;
