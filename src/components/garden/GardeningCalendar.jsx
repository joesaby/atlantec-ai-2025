import React, { useState, useEffect } from "react";
import MonthlyTasks from "./MonthlyTasks";
import { getTasksForUpcomingMonths } from "../../data/gardening-tasks";
import { getCurrentMonth, getMonthName } from "../../utils/date-utils";

const GardeningCalendar = ({
  months = 3,
  queryTasks: initialQueryTasks = [],
}) => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [queryTasks, setQueryTasks] = useState(initialQueryTasks);
  const [showQueryTasks, setShowQueryTasks] = useState(
    initialQueryTasks.length > 0
  );
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [displayMonths, setDisplayMonths] = useState(months);
  const [currentDisplayMode, setCurrentDisplayMode] = useState("default");

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
    // Setup the global update function to receive task cards
    window.updateGardeningCalendar = (taskData) => {
      if (Array.isArray(taskData) && taskData.length > 0) {
        console.log("Received calendar data with", taskData.length, "months");

        // Make sure task data is properly formatted with month names
        const formattedTaskData = taskData.map(monthData => {
          // If the month data already has a name, use it
          if (monthData.name) {
            return monthData;
          }

          // If it doesn't have a name but has a month number, generate the name
          if (monthData.month) {
            return {
              ...monthData,
              name: getMonthName(monthData.month)
            };
          }

          // If it doesn't have either, use the current month
          const currentMonth = new Date().getMonth() + 1;
          return {
            ...monthData,
            month: currentMonth,
            name: getMonthName(currentMonth)
          };
        });

        // Set the query tasks with the formatted data
        setQueryTasks(formattedTaskData);
        setShowQueryTasks(true);

        // Update the display mode based on the data
        if (formattedTaskData.length === 1) {
          setSelectedMonth(formattedTaskData[0].month);
          setDisplayMonths(1);
          setCurrentDisplayMode("single-month");
        } else if (formattedTaskData.length > 1) {
          // If we have multiple months, use the first one as the start month
          setSelectedMonth(formattedTaskData[0].month);
          setDisplayMonths(formattedTaskData.length);
          setCurrentDisplayMode("multiple-months");
        }

        console.log(
          "Calendar updated with",
          formattedTaskData.length,
          "month(s) of tasks",
          "starting with",
          formattedTaskData[0].name
        );
      }
    };

    return () => {
      // Clean up when component unmounts
      delete window.updateGardeningCalendar;
    };
  }, []);

  useEffect(() => {
    // Load tasks based on selected month or current date
    setIsLoading(true);

    setTimeout(() => {
      // Only load default tasks if we're not showing query tasks
      if (!showQueryTasks || currentDisplayMode === "default") {
        const currentMonth = selectedMonth || getCurrentMonth();
        const tasks = getTasksForUpcomingMonths(currentMonth, displayMonths);
        setUpcomingTasks(tasks);
      }
      setIsLoading(false);
    }, 500);
  }, [displayMonths, selectedMonth, showQueryTasks, currentDisplayMode]);

  useEffect(() => {
    // Update state when props change
    if (queryTasks?.length > 0) {
      setShowQueryTasks(true);
    }
  }, [queryTasks]);

  // Pre-process queryTasks if needed
  useEffect(() => {
    // If we receive task cards with type/data format, transform them
    if (queryTasks?.length > 0 && queryTasks[0]?.type === "task") {
      console.log("Pre-processing task cards for calendar:", queryTasks.length);

      // Group tasks by month
      const currentMonth = new Date().getMonth() + 1; // 1-indexed month
      const transformedTasks = [{
        month: currentMonth,
        name: getMonthName(currentMonth),
        tasks: queryTasks.map(card => card.data)
      }];

      console.log("Transformed task data:", transformedTasks);
      setQueryTasks(transformedTasks);
      setShowQueryTasks(true);
    }
  }, [queryTasks]);

  // Filter tasks by category and structure month data properly
  const filteredTasks = React.useMemo(() => {
    console.log("Filtering calendar tasks:", {
      showQueryTasks,
      queryTasksLength: queryTasks?.length || 0,
      upcomingTasksLength: upcomingTasks?.length || 0
    });

    // Start with raw data from either source
    let tasksToFilter = showQueryTasks ? queryTasks : upcomingTasks;

    // Now apply category filtering
    if (categoryFilter === "all") {
      return tasksToFilter;
    }

    return tasksToFilter
      .map((monthData) => ({
        ...monthData,
        tasks:
          monthData.tasks && Array.isArray(monthData.tasks)
            ? monthData.tasks.filter((task) => task.category === categoryFilter)
            : [],
      }))
      .filter((monthData) => monthData.tasks && monthData.tasks.length > 0);
  }, [upcomingTasks, queryTasks, categoryFilter, showQueryTasks]);

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
          <span className="badge badge-accent">
            {showQueryTasks && queryTasks.length > 0
              ? queryTasks.length
              : displayMonths}{" "}
            months
          </span>
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

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`btn btn-sm ${
              showQueryTasks ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setShowQueryTasks(!showQueryTasks)}
          >
            {showQueryTasks ? "Show Upcoming Tasks" : "Show Query Tasks"}
          </button>
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
