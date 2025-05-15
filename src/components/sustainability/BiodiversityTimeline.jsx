import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityTimeline = () => {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [futureProjections, setFutureProjections] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [showDetailFor, setShowDetailFor] = useState(null);
  const [showNewPracticeForm, setShowNewPracticeForm] = useState(false);
  const [newPractice, setNewPractice] = useState({
    name: "",
    description: "",
    implementedOn: new Date().toISOString().split("T")[0],
    practiceType: "biodiversity-1", // Default to native plants
  });

  useEffect(() => {
    generateTimelineFromUserData();
    loadUserGoalsAndAchievements();
    generateFutureProjections();
  }, []);

  const generateTimelineFromUserData = () => {
    try {
      const userProgress = getAllUserProgress();
      const events = [];

      // Get biodiversity practices and sort by implementation date
      const biodiversityPractices = (userProgress.activePractices || [])
        .filter((practice) => {
          const id = practice.id || "";
          return (
            id.includes("biodiversity") ||
            id.includes("native") ||
            id.includes("pollinator") ||
            id.includes("wildlife") ||
            id.includes("organic") ||
            id.includes("hedge") ||
            id.includes("water-feature")
          );
        })
        .sort(
          (a, b) =>
            new Date(a.implementedOn || 0) - new Date(b.implementedOn || 0)
        );

      // Add practices to timeline
      biodiversityPractices.forEach((practice) => {
        if (practice.implementedOn) {
          events.push({
            date: new Date(practice.implementedOn),
            type: "practice",
            title: practice.name || "Biodiversity Practice",
            description: practice.description || "",
            icon: getIconForPractice(practice.id || ""),
            impact: estimateImpact(practice.id || ""),
          });
        }
      });

      // Get wildlife spottings and add significant ones to timeline
      const spottings = userProgress.wildlifeSpottings || [];

      // Group spottings by month to avoid overcrowding timeline
      const spottingsByMonth = {};

      spottings.forEach((spotting) => {
        const date = new Date(spotting.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        if (!spottingsByMonth[monthKey]) {
          spottingsByMonth[monthKey] = [];
        }

        spottingsByMonth[monthKey].push(spotting);
      });

      // Add significant wildlife sightings (first of a category or special species)
      Object.keys(spottingsByMonth).forEach((monthKey) => {
        const monthSpottings = spottingsByMonth[monthKey];
        const significantSpotting = monthSpottings[0]; // Take first spotting of the month

        if (significantSpotting) {
          events.push({
            date: new Date(significantSpotting.date),
            type: "wildlife",
            title: `${significantSpotting.species} Spotted`,
            description: `${
              monthSpottings.length > 1
                ? `Plus ${
                    monthSpottings.length - 1
                  } other wildlife sightings this month`
                : significantSpotting.notes || "Wildlife spotted in your garden"
            }`,
            icon: getCategoryIcon(significantSpotting.category),
            impact: "medium",
          });
        }
      });

      // Add seasonal milestones if they exist
      const seasons = [
        { month: 2, name: "Spring" },
        { month: 5, name: "Summer" },
        { month: 8, name: "Autumn" },
        { month: 11, name: "Winter" },
      ];

      const now = new Date();
      const currentYear = now.getFullYear();

      seasons.forEach((season) => {
        // Only add seasons that have passed this year
        if (now.getMonth() >= season.month) {
          const seasonDate = new Date(currentYear, season.month, 1);

          // Get score at that time if available
          const seasonalScore =
            biodiversityPractices.filter(
              (p) => new Date(p.implementedOn) <= seasonDate
            ).length * 10;

          if (seasonalScore > 0) {
            events.push({
              date: seasonDate,
              type: "season",
              title: `${season.name} ${currentYear}`,
              description: `Your garden supported an estimated biodiversity score of ${seasonalScore} this ${season.name.toLowerCase()}.`,
              icon: getSeasonIcon(season.name),
              impact: seasonalScore > 30 ? "high" : "medium",
            });
          }
        }
      });

      // Sort all events by date
      const sortedEvents = events.sort((a, b) => a.date - b.date);

      setTimelineEvents(sortedEvents);
    } catch (error) {
      console.error("Error generating biodiversity timeline:", error);
      setTimelineEvents([]);
    }
  };

  const loadUserGoalsAndAchievements = () => {
    try {
      // Load goals from localStorage
      const savedGoals = localStorage.getItem("biodiversity-goals");
      let goals = savedGoals ? JSON.parse(savedGoals) : [];

      // If no goals exist, create default ones
      if (goals.length === 0) {
        goals = [
          {
            id: "goal-1",
            title: "Pollinator Paradise",
            description:
              "Support at least 15 pollinator species in your garden",
            target: 15,
            metricType: "pollinators",
            status: "in-progress",
            progress: 0,
            icon: "🐝",
            dateCreated: new Date().toISOString(),
            reward: "Pollinator Champion Badge",
          },
          {
            id: "goal-2",
            title: "Bird Sanctuary",
            description: "Create a habitat that supports 10 bird species",
            target: 10,
            metricType: "birds",
            status: "in-progress",
            progress: 0,
            icon: "🐦",
            dateCreated: new Date().toISOString(),
            reward: "Bird Sanctuary Badge",
          },
          {
            id: "goal-3",
            title: "Native Plant Pioneer",
            description: "Establish 5 different Irish native plant species",
            target: 5,
            metricType: "native-plants",
            status: "in-progress",
            progress: 0,
            icon: "🌱",
            dateCreated: new Date().toISOString(),
            reward: "Native Plant Badge",
          },
        ];

        localStorage.setItem("biodiversity-goals", JSON.stringify(goals));
      }

      setUserGoals(goals);

      // Check for achievements based on user progress
      const userProgress = getAllUserProgress();
      const earnedAchievements = [];

      // Wildlife Spotter achievements
      const wildlifeSpottings = userProgress.wildlifeSpottings || [];
      if (wildlifeSpottings.length >= 5) {
        earnedAchievements.push({
          id: "achievement-1",
          title: "Wildlife Spotter",
          description: "Recorded 5+ wildlife sightings in your garden",
          dateEarned: new Date().toISOString(),
          icon: "🔍",
          level: "bronze",
        });
      }

      if (wildlifeSpottings.length >= 15) {
        earnedAchievements.push({
          id: "achievement-2",
          title: "Wildlife Observer",
          description: "Recorded 15+ wildlife sightings in your garden",
          dateEarned: new Date().toISOString(),
          icon: "🔍",
          level: "silver",
        });
      }

      // Calculate biodiversity practices by type
      const practices = userProgress.activePractices || [];
      const nativePlantPractices = practices.filter(
        (p) =>
          (p.id || "").includes("native") ||
          (p.id || "").includes("biodiversity-1")
      );

      if (nativePlantPractices.length >= 1) {
        earnedAchievements.push({
          id: "achievement-3",
          title: "Native Plant Steward",
          description: "Started growing native Irish plants in your garden",
          dateEarned:
            nativePlantPractices[0].implementedOn || new Date().toISOString(),
          icon: "🌱",
          level: "bronze",
        });
      }

      // Update goals based on user progress
      const updatedGoals = goals.map((goal) => {
        const progress = calculateGoalProgress(goal, userProgress);
        return {
          ...goal,
          progress,
          status: progress >= goal.target ? "completed" : "in-progress",
        };
      });

      // Add achievements for completed goals
      updatedGoals.forEach((goal) => {
        if (
          goal.status === "completed" &&
          !earnedAchievements.some((a) => a.title === goal.reward)
        ) {
          earnedAchievements.push({
            id: `achievement-goal-${goal.id}`,
            title: goal.reward,
            description: `Completed goal: ${goal.title}`,
            dateEarned: new Date().toISOString(),
            icon: goal.icon,
            level: "gold",
          });
        }
      });

      setUserGoals(updatedGoals);
      localStorage.setItem("biodiversity-goals", JSON.stringify(updatedGoals));

      // Save and update achievements
      const existingAchievements = localStorage.getItem(
        "biodiversity-achievements"
      );
      const savedAchievements = existingAchievements
        ? JSON.parse(existingAchievements)
        : [];

      // Only add new achievements not already in savedAchievements
      const finalAchievements = [
        ...savedAchievements,
        ...earnedAchievements.filter(
          (newAch) => !savedAchievements.some((saved) => saved.id === newAch.id)
        ),
      ];

      localStorage.setItem(
        "biodiversity-achievements",
        JSON.stringify(finalAchievements)
      );
      setAchievements(finalAchievements);
    } catch (error) {
      console.error("Error loading goals and achievements:", error);
      setUserGoals([]);
      setAchievements([]);
    }
  };

  const calculateGoalProgress = (goal, userProgress) => {
    switch (goal.metricType) {
      case "pollinators":
        // Calculate from species supported in biodiversity impact
        const pollinatorPractices = (userProgress.activePractices || []).filter(
          (p) =>
            (p.id || "").includes("pollinator") ||
            (p.id || "").includes("biodiversity-2") ||
            (p.id || "").includes("native")
        );
        return Math.min(
          goal.target,
          Math.floor(pollinatorPractices.length * 3)
        );

      case "birds":
        // Calculate based on wildlife spottings and bird-supporting practices
        const birdSpottings = (userProgress.wildlifeSpottings || [])
          .filter((s) => s.category === "birds")
          .map((s) => s.species)
          .filter((v, i, a) => a.indexOf(v) === i); // Unique species

        return Math.min(goal.target, birdSpottings.length);

      case "native-plants":
        // Calculate based on native plant practices
        const nativePlantPractices = (
          userProgress.activePractices || []
        ).filter(
          (p) =>
            (p.id || "").includes("native") ||
            (p.id || "").includes("biodiversity-1")
        );
        return Math.min(goal.target, nativePlantPractices.length * 2);

      default:
        return 0;
    }
  };

  const getIconForPractice = (practiceId) => {
    if (
      practiceId.includes("native") ||
      practiceId.includes("biodiversity-1")
    ) {
      return "🌱";
    } else if (
      practiceId.includes("pollinator") ||
      practiceId.includes("biodiversity-2")
    ) {
      return "🐝";
    } else if (
      practiceId.includes("wildlife") ||
      practiceId.includes("biodiversity-3")
    ) {
      return "🦔";
    } else if (
      practiceId.includes("organic") ||
      practiceId.includes("natural-pest")
    ) {
      return "🌿";
    } else if (practiceId.includes("water-feature")) {
      return "💧";
    } else if (practiceId.includes("hedge")) {
      return "🌳";
    } else {
      return "🌍";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "birds":
        return "🐦";
      case "mammals":
        return "🦊";
      case "insects":
        return "🦋";
      case "amphibians":
        return "🐸";
      case "reptiles":
        return "🦎";
      default:
        return "🐾";
    }
  };

  const getSeasonIcon = (season) => {
    switch (season) {
      case "Spring":
        return "🌷";
      case "Summer":
        return "☀️";
      case "Autumn":
        return "🍂";
      case "Winter":
        return "❄️";
      default:
        return "📆";
    }
  };

  const estimateImpact = (practiceId) => {
    const highImpactPractices = [
      "native",
      "pollinator",
      "biodiversity-1",
      "biodiversity-2",
    ];
    const mediumImpactPractices = [
      "wildlife",
      "organic",
      "biodiversity-3",
      "hedge",
    ];

    if (highImpactPractices.some((p) => practiceId.includes(p))) {
      return "high";
    } else if (mediumImpactPractices.some((p) => practiceId.includes(p))) {
      return "medium";
    } else {
      return "low";
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getImpactClass = (impact) => {
    switch (impact) {
      case "high":
        return "bg-success text-success-content";
      case "medium":
        return "bg-warning text-warning-content";
      case "low":
        return "bg-info text-info-content";
      case "projected":
        return "bg-secondary bg-opacity-70 text-secondary-content";
      default:
        return "bg-base-300";
    }
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case "gold":
        return "badge-warning";
      case "silver":
        return "badge-neutral";
      case "bronze":
        return "badge-accent";
      default:
        return "badge-primary";
    }
  };

  const generateFutureProjections = () => {
    const userProgress = getAllUserProgress();
    const biodiversityPractices = (userProgress.activePractices || []).filter(
      (practice) => {
        const id = practice.id || "";
        return (
          id.includes("biodiversity") ||
          id.includes("native") ||
          id.includes("pollinator") ||
          id.includes("wildlife") ||
          id.includes("organic") ||
          id.includes("hedge") ||
          id.includes("water-feature")
        );
      }
    );

    // If there are no current practices, we can't make projections
    if (biodiversityPractices.length === 0) {
      setFutureProjections([]);
      return;
    }

    // Current state
    const now = new Date();

    // Create projections for the next few seasons
    const projectionsData = [];

    // Project 1 year into the future
    const seasonNames = ["Spring", "Summer", "Autumn", "Winter"];
    const currentMonth = now.getMonth();
    const currentSeason = Math.floor(currentMonth / 3) % 4;
    const currentYear = now.getFullYear();

    // Generate seasonal projections
    for (let i = 1; i <= 4; i++) {
      const futureSeasonIndex = (currentSeason + i) % 4;
      const futureYear = currentYear + (currentSeason + i >= 4 ? 1 : 0);

      // Assume growth in biodiversity impact over time
      const estimatedSpeciesIncrease = Math.floor(
        biodiversityPractices.length * (i * 0.25)
      );
      const projectedMonthForSeason = futureSeasonIndex * 3 + 1; // Middle month of the season

      projectionsData.push({
        date: new Date(futureYear, projectedMonthForSeason, 15),
        title: `Projected ${seasonNames[futureSeasonIndex]} ${futureYear}`,
        description: `Your garden could support approximately ${
          biodiversityPractices.length * 5 + estimatedSpeciesIncrease
        } species by continuing your biodiversity practices.`,
        type: "projection",
        icon: getSeasonIcon(seasonNames[futureSeasonIndex]),
        impact: "projected",
      });
    }

    // Add special projections for milestones
    if (biodiversityPractices.length >= 3) {
      // Project garden health milestones
      const threeMonthsOut = new Date(now);
      threeMonthsOut.setMonth(now.getMonth() + 3);

      projectionsData.push({
        date: threeMonthsOut,
        title: "Garden Ecosystem Establishment",
        description:
          "Your garden's ecosystem will begin to self-regulate, with natural predator-prey relationships developing.",
        type: "milestone-projection",
        icon: "🌿",
        impact: "high",
      });

      // One year out for stable ecosystem
      const oneYearOut = new Date(now);
      oneYearOut.setFullYear(now.getFullYear() + 1);

      projectionsData.push({
        date: oneYearOut,
        title: "Stable Ecosystem Milestone",
        description:
          "Your garden will become a stable mini-ecosystem, supporting many types of interdependent Irish wildlife.",
        type: "milestone-projection",
        icon: "🦋",
        impact: "high",
      });
    }

    // Sort by date
    projectionsData.sort((a, b) => a.date - b.date);

    setFutureProjections(projectionsData);
  };

  const handleAddNewPractice = () => {
    setShowNewPracticeForm(true);
  };

  const handleCancelNewPractice = () => {
    setShowNewPracticeForm(false);
    setNewPractice({
      name: "",
      description: "",
      implementedOn: new Date().toISOString().split("T")[0],
      practiceType: "biodiversity-1",
    });
  };

  const handleNewPracticeChange = (e) => {
    const { name, value } = e.target;
    setNewPractice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNewPractice = () => {
    try {
      // Validate input
      if (
        !newPractice.name ||
        !newPractice.description ||
        !newPractice.implementedOn
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Create a unique ID for this practice
      const practiceId = `${newPractice.practiceType}-${newPractice.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")}-${Date.now().toString().slice(-4)}`;

      // Create the practice object
      const practiceObj = {
        id: practiceId,
        name: newPractice.name,
        description: newPractice.description,
        implementedOn: newPractice.implementedOn,
      };

      // Get current user progress
      const currentProgress = getAllUserProgress();

      // Add the new practice
      const updatedPractices = [
        ...(currentProgress.activePractices || []),
        practiceObj,
      ];

      // Update user progress in localStorage
      const updatedProgress = {
        ...currentProgress,
        activePractices: updatedPractices,
      };

      localStorage.setItem("garden-progress", JSON.stringify(updatedProgress));

      // Reset form
      handleCancelNewPractice();

      // Refresh timeline and all related data
      generateTimelineFromUserData();
      loadUserGoalsAndAchievements(); // Refresh achievements and goals with new data
      generateFutureProjections();

      // Show success message
      alert(`${newPractice.name} added to your garden biodiversity practices!`);
    } catch (error) {
      console.error("Error adding new practice:", error);
      alert("There was a problem adding this practice. Please try again.");
    }
  };

  // Filter events based on selected type
  const filteredEvents =
    filterType === "all"
      ? timelineEvents
      : timelineEvents.filter((event) => event.type === filterType);

  // Combined events timeline (past events + future projections)
  const combinedTimeline =
    filterType === "all" || filterType === "projection"
      ? [
          ...filteredEvents,
          ...(filterType === "projection" || filterType === "all"
            ? futureProjections
            : []),
        ]
      : filteredEvents;

  // Sort by date
  combinedTimeline.sort((a, b) => a.date - b.date);

  // No data state
  if (timelineEvents.length === 0 && futureProjections.length === 0) {
    return (
      <div className="p-6 bg-base-100 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Your Biodiversity Journey</h3>
        <div className="alert alert-info">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              Your biodiversity journey timeline will appear here as you add
              practices and record wildlife sightings.
            </span>
          </div>
        </div>

        {/* Goals section even when no timeline events exist */}
        {userGoals.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Your Biodiversity Goals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userGoals.map((goal) => (
                <div key={goal.id} className="bg-base-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{goal.icon}</div>
                    <h5 className="font-medium">{goal.title}</h5>
                  </div>
                  <p className="text-sm mt-1">{goal.description}</p>
                  <div className="mt-2">
                    <progress
                      className={`progress w-full ${
                        goal.status === "completed"
                          ? "progress-success"
                          : "progress-primary"
                      }`}
                      value={goal.progress}
                      max={goal.target}
                    ></progress>
                    <div className="flex justify-between text-xs mt-1">
                      <span>
                        {goal.progress} / {goal.target}
                      </span>
                      <span>
                        {goal.status === "completed"
                          ? "Completed!"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm">Start your biodiversity journey by:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>Adding native Irish plants to your garden</li>
            <li>Creating pollinator-friendly areas</li>
            <li>Recording wildlife spottings</li>
            <li>Implementing organic gardening methods</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-100 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-1">Your Biodiversity Journey</h3>
      <p className="text-sm text-base-content text-opacity-70 mb-4">
        Track your impact on Irish biodiversity over time
      </p>

      {/* Timeline filters and view options */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterType("all")}
          className={`btn btn-sm ${
            filterType === "all" ? "btn-primary" : "btn-outline"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilterType("practice")}
          className={`btn btn-sm ${
            filterType === "practice" ? "btn-primary" : "btn-outline"
          }`}
        >
          Practices
        </button>
        <button
          onClick={() => setFilterType("wildlife")}
          className={`btn btn-sm ${
            filterType === "wildlife" ? "btn-primary" : "btn-outline"
          }`}
        >
          Wildlife
        </button>
        <button
          onClick={() => setFilterType("season")}
          className={`btn btn-sm ${
            filterType === "season" ? "btn-primary" : "btn-outline"
          }`}
        >
          Seasons
        </button>
        <button
          onClick={() => setFilterType("projection")}
          className={`btn btn-sm ${
            filterType === "projection" ? "btn-primary" : "btn-outline"
          }`}
        >
          Future Impact
        </button>
      </div>

      {/* Achievements section */}
      {achievements.length > 0 && (
        <div className="mb-6 bg-base-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Your Biodiversity Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="tooltip tooltip-primary"
                data-tip={`${achievement.title}: ${achievement.description}`}
              >
                <div
                  className={`badge badge-lg p-4 ${getBadgeClass(
                    achievement.level
                  )}`}
                >
                  <span className="mr-1">{achievement.icon}</span>{" "}
                  {achievement.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals section */}
      {userGoals.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {userGoals.map((goal) => (
            <div key={goal.id} className="bg-base-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">{goal.icon}</div>
                <h5 className="font-medium">{goal.title}</h5>
              </div>
              <p className="text-sm mb-2">{goal.description}</p>
              <div>
                <progress
                  className={`progress w-full ${
                    goal.status === "completed"
                      ? "progress-success"
                      : "progress-primary"
                  }`}
                  value={goal.progress}
                  max={goal.target}
                ></progress>
                <div className="flex justify-between text-xs mt-1">
                  <span>
                    {goal.progress} / {goal.target}
                  </span>
                  <span>
                    {goal.status === "completed" ? "Completed!" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-base-300"></div>

        {/* Timeline now marker */}
        {futureProjections.length > 0 && (
          <div className="relative mb-8 mt-6">
            <div className="absolute left-0 right-0 flex items-center justify-center">
              <span className="badge badge-secondary py-2 px-4">Today</span>
              <div className="absolute h-0.5 bg-base-300 w-full z-0"></div>
            </div>
          </div>
        )}

        {/* Timeline events */}
        <ul className="space-y-6">
          {combinedTimeline.map((event, index) => (
            <li
              key={`event-${index}`}
              className="relative flex items-start gap-4"
            >
              {/* Timeline icon */}
              <div
                className={`w-10 h-10 flex-shrink-0 rounded-full ${getImpactClass(
                  event.impact
                )} flex items-center justify-center z-10 text-lg ${
                  event.type?.includes("projection")
                    ? "border-dashed border-2 border-base-content"
                    : ""
                }`}
              >
                {event.icon}
              </div>

              {/* Event content */}
              <div
                className={`flex-grow ${
                  event.type?.includes("projection")
                    ? "bg-base-200 bg-opacity-70 border border-dashed"
                    : "bg-base-200"
                } rounded-lg p-4 shadow-sm ${
                  showDetailFor === index ? "border-2 border-primary" : ""
                }`}
                onClick={() =>
                  setShowDetailFor(showDetailFor === index ? null : index)
                }
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{event.title}</h4>
                  <span className="text-sm opacity-70">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{event.description}</p>

                {/* Event type badge */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`badge badge-sm ${
                      event.type === "practice"
                        ? "badge-primary"
                        : event.type === "wildlife"
                        ? "badge-accent"
                        : event.type === "season"
                        ? "badge-secondary"
                        : event.type?.includes("projection")
                        ? "badge-outline badge-secondary"
                        : "badge-neutral"
                    }`}
                  >
                    {event.type === "practice"
                      ? "Garden Practice"
                      : event.type === "wildlife"
                      ? "Wildlife Sighting"
                      : event.type === "season"
                      ? "Seasonal Milestone"
                      : event.type === "projection"
                      ? "Future Projection"
                      : event.type === "milestone-projection"
                      ? "Future Milestone"
                      : "Event"}
                  </span>

                  {event.impact && (
                    <span
                      className={`badge badge-sm ${
                        event.impact === "high"
                          ? "badge-success"
                          : event.impact === "medium"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                    >
                      {event.impact.charAt(0).toUpperCase() +
                        event.impact.slice(1)}{" "}
                      Impact
                    </span>
                  )}
                </div>

                {/* Additional details when expanded */}
                {showDetailFor === index && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    {event.type === "practice" && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          Irish Biodiversity Impact
                        </h5>
                        <p className="text-xs">
                          This practice supports native Irish species including
                          pollinators, birds, and beneficial insects.
                        </p>

                        <button className="btn btn-xs btn-link text-primary mt-2">
                          Related Resources
                        </button>
                      </div>
                    )}

                    {event.type === "wildlife" && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          Conservation Status
                        </h5>
                        <p className="text-xs">
                          Your garden is providing a crucial habitat for local
                          wildlife.
                        </p>

                        <button className="btn btn-xs btn-link text-primary mt-2">
                          Learn More About This Species
                        </button>
                      </div>
                    )}

                    {event.type?.includes("projection") && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">
                          How to Achieve This
                        </h5>
                        <p className="text-xs">
                          Continue your biodiversity practices and consider
                          adding native plant diversity.
                        </p>

                        <button className="btn btn-xs btn-link text-primary mt-2">
                          Recommended Next Steps
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Irish biodiversity context */}
      <div className="mt-8 p-4 bg-primary bg-opacity-10 rounded-lg border-l-4 border-primary">
        <h4 className="font-semibold mb-2">
          Your Garden's Impact on Irish Biodiversity
        </h4>
        <p className="text-sm">
          Your garden helps reverse the 14% decline in Irish biodiversity since
          the 1990s. Every garden contributes to a network of urban biodiversity
          corridors vital for Irish wildlife.
        </p>
        <div className="flex items-center justify-center mt-3 bg-base-100 p-3 rounded-lg">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">🦋</div>
              <div className="stat-title">Species Supported</div>
              <div className="stat-value">
                {Math.max(5, timelineEvents.length * 3)}
              </div>
              <div className="stat-desc">Irish Native Species</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">🌍</div>
              <div className="stat-title">Carbon Captured</div>
              <div className="stat-value text-secondary">
                {Math.max(10, timelineEvents.length * 5)} kg
              </div>
              <div className="stat-desc">Through biodiversity practices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact summary */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="p-4 bg-base-300 bg-opacity-50 rounded-lg">
          <h4 className="font-semibold mb-2">Your Biodiversity Journey</h4>
          <p className="text-sm">
            Your garden's biodiversity has been growing through{" "}
            {timelineEvents.length} significant milestones, with{" "}
            {futureProjections.length} projected future impacts.
          </p>
          <div className="mt-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddNewPractice}
            >
              Add New Garden Practice
            </button>
          </div>
        </div>

        {/* New Practice Form */}
        {showNewPracticeForm && (
          <div className="p-4 bg-base-100 rounded-lg shadow-md mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Add New Biodiversity Practice</h4>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={handleCancelNewPractice}
              >
                ✕
              </button>
            </div>

            <div className="form-control w-full mb-3">
              <label className="label">
                <span className="label-text">Practice Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bird Feeder Installation"
                className="input input-bordered w-full"
                name="name"
                value={newPractice.name}
                onChange={handleNewPracticeChange}
              />
            </div>

            <div className="form-control w-full mb-3">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20"
                placeholder="Describe your biodiversity practice and its expected impact..."
                name="description"
                value={newPractice.description}
                onChange={handleNewPracticeChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Implementation Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  name="implementedOn"
                  value={newPractice.implementedOn}
                  onChange={handleNewPracticeChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Practice Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  name="practiceType"
                  value={newPractice.practiceType}
                  onChange={handleNewPracticeChange}
                >
                  <option value="biodiversity-1">Native Plants</option>
                  <option value="biodiversity-2">Pollinator Support</option>
                  <option value="biodiversity-3">Wildlife Habitats</option>
                  <option value="biodiversity-4">
                    Chemical-Free Gardening
                  </option>
                  <option value="water-feature">Water Features</option>
                  <option value="hedge">Hedges & Shrubs</option>
                  <option value="unmowed">Unmowed Areas</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="btn btn-outline btn-sm mr-2"
                onClick={handleCancelNewPractice}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveNewPractice}
              >
                Save Practice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline visualization */}
      <div className="mt-6">
        <ul className="relative mx-0 sm:mx-4">
          {/* Vertical timeline line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-base-300 transform -translate-x-1/2"></div>

          {filteredEvents.map((event, index) => (
            <li key={index} className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                {/* Timeline date - move to top on mobile, to left on desktop */}
                <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-1/2 sm:pr-8 sm:text-right order-1 sm:order-none">
                  <span className="text-sm text-base-content">
                    {formatDate(event.date)}
                  </span>
                </div>

                {/* Center dot */}
                <div
                  className={`absolute left-4 sm:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-base-100 border-2 border-primary flex items-center justify-center z-10 ${
                    event.type?.includes("projection")
                      ? "border-dashed border-2 border-base-content"
                      : ""
                  }`}
                >
                  {event.icon}
                </div>

                {/* Event content - takes full width on mobile, half on desktop */}
                <div
                  className={`flex-grow ml-12 sm:ml-0 sm:w-1/2 sm:pl-8 ${
                    event.type?.includes("projection")
                      ? "bg-base-200 bg-opacity-70 border border-dashed"
                      : "bg-base-200"
                  } rounded-lg p-3 sm:p-4 shadow-sm ${
                    showDetailFor === index ? "border-2 border-primary" : ""
                  }`}
                  onClick={() =>
                    setShowDetailFor(showDetailFor === index ? null : index)
                  }
                >
                  <div className="flex justify-between items-start flex-col sm:flex-row">
                    <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-0">
                      {event.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm">{event.description}</p>

                  {/* Event type badge */}
                  <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                    <span
                      className={`badge badge-xs sm:badge-sm ${
                        event.type === "practice"
                          ? "badge-primary"
                          : event.type === "wildlife"
                          ? "badge-accent"
                          : event.type === "season"
                          ? "badge-secondary"
                          : event.type?.includes("projection")
                          ? "badge-outline badge-secondary"
                          : "badge-neutral"
                      }`}
                    >
                      {event.type === "practice"
                        ? "Garden Practice"
                        : event.type === "wildlife"
                        ? "Wildlife Sighting"
                        : event.type === "season"
                        ? "Seasonal Milestone"
                        : event.type === "projection"
                        ? "Future Projection"
                        : event.type === "milestone-projection"
                        ? "Future Milestone"
                        : "Event"}
                    </span>

                    {event.impact && (
                      <span
                        className={`badge badge-xs sm:badge-sm ${
                          event.impact === "high"
                            ? "badge-success"
                            : event.impact === "medium"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {event.impact.charAt(0).toUpperCase() +
                          event.impact.slice(1)}{" "}
                        Impact
                      </span>
                    )}
                  </div>

                  {/* Additional details when expanded */}
                  {showDetailFor === index && (
                    <div className="mt-3 pt-3 border-t border-base-300">
                      {event.type === "practice" && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">
                            Irish Biodiversity Impact
                          </h5>
                          <p className="text-xs">
                            This practice supports native Irish species
                            including pollinators, birds, and beneficial
                            insects.
                          </p>

                          <button className="btn btn-xs btn-link text-primary mt-2">
                            Related Resources
                          </button>
                        </div>
                      )}

                      {event.type === "wildlife" && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">
                            Conservation Status
                          </h5>
                          <p className="text-xs">
                            Your garden is providing a crucial habitat for local
                            wildlife.
                          </p>

                          <button className="btn btn-xs btn-link text-primary mt-2">
                            Learn More About This Species
                          </button>
                        </div>
                      )}

                      {event.type?.includes("projection") && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">
                            How to Achieve This
                          </h5>
                          <p className="text-xs">
                            Continue your biodiversity practices and consider
                            adding native plant diversity.
                          </p>

                          <button className="btn btn-xs btn-link text-primary mt-2">
                            Recommended Next Steps
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BiodiversityTimeline;
