import React from "react";
import TaskCard from "./TaskCard";

/**
 * MonthlyTasks Component
 * Displays tasks for a specific month with expand/collapse functionality.
 */
const MonthlyTasks = ({ monthData, expanded = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body p-4">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="card-title text-lg">{monthData.monthName}</h2>
          <div className="badge badge-primary">
            {monthData.tasks.length} tasks
          </div>
          <button className="btn btn-sm btn-circle btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {monthData.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTasks;
