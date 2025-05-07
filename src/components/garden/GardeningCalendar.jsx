import React, { useState, useEffect } from "react";
import MonthlyTasks from "./MonthlyTasks";
import { getTasksForUpcomingMonths } from "../../data/gardening-tasks";

const GardeningCalendar = ({ months = 3 }) => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Available categories for filtering
  const categories = [
    "all",
    "planting",
    "harvesting",
    "maintenance",
    "pruning",
    "protection",
    "pest control",
    "sustainability",
    "planning",
    "preparation",
    "feeding",
    "propagation",
  ];

  useEffect(() => {
    // Simulate loading from a database
    setIsLoading(true);

    setTimeout(() => {
      const currentMonth = new Date().getMonth() + 1;
      const tasks = getTasksForUpcomingMonths(currentMonth, months);
      setUpcomingTasks(tasks);
      setIsLoading(false);
    }, 500);
  }, [months]);

  // Filter tasks by category
  const filteredTasks = React.useMemo(() => {
    if (categoryFilter === "all") {
      return upcomingTasks;
    }

    return upcomingTasks
      .map((monthData) => ({
        ...monthData,
        tasks: monthData.tasks.filter(
          (task) => task.category === categoryFilter
        ),
      }))
      .filter((monthData) => monthData.tasks.length > 0);
  }, [upcomingTasks, categoryFilter]);

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading Gardening Calendar</h2>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary mb-4">
          Gardening Calendar
          <span className="badge badge-accent">{months} months</span>
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium my-auto mr-2">Filter:</span>
          {categories.map((category) => (
            <button
              key={category}
              className={`badge badge-outline ${
                categoryFilter === category ? "badge-primary" : ""
              }`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>No tasks found for the selected category.</span>
          </div>
        ) : (
          filteredTasks.map((monthData, index) => (
            <MonthlyTasks
              key={monthData.month}
              monthData={monthData}
              expanded={index === 0} // Expand the current month by default
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GardeningCalendar;
