import React, { useState } from "react";
import {
  recordResourceUsage,
  getAllUserProgress,
} from "../../utils/sustainability-store";

const ResourceUsageTracker = () => {
  const [resourceType, setResourceType] = useState("water");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userProgress, setUserProgress] = useState(getAllUserProgress());

  const resourceTypes = [
    { id: "water", name: "Water Usage (liters)", icon: "droplet" },
    { id: "compost", name: "Compost Added (kg)", icon: "layers" },
    { id: "harvest", name: "Food Harvested (kg)", icon: "leaf" },
  ];

  // Get recent logs for selected resource type
  const getRecentLogs = (type) => {
    if (!userProgress.resourceUsage[type]) return [];

    return userProgress.resourceUsage[type]
      .slice() // Create a copy to avoid mutating original
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
      .slice(0, 5); // Get only the 5 most recent
  };

  // Get icon for resource type
  const getIconForResourceType = (type) => {
    switch (type) {
      case "water":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        );
      case "compost":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case "harvest":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return; // Don't submit if invalid amount
    }

    // Record the resource usage
    const updatedProgress = recordResourceUsage(
      resourceType,
      parseFloat(amount),
      new Date(date)
    );

    // Update state
    setUserProgress(updatedProgress);
    setAmount("");
    setIsSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };

  // Get recent logs for current resource type
  const recentLogs = getRecentLogs(resourceType);

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Track Resource Usage</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Resource Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input input-bordered"
                placeholder={`Enter amount in ${
                  resourceType === "water" ? "liters" : "kilograms"
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Record Usage
            </button>
          </form>

          {isSuccess && (
            <div className="alert alert-success mt-4">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Resource usage recorded successfully!</span>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div>
          <h3 className="text-xl font-bold mb-4">
            Recent{" "}
            {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Logs
          </h3>

          {recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getIconForResourceType(resourceType)}
                          <span>
                            {log.amount.toFixed(1)}{" "}
                            {resourceType === "water" ? "L" : "kg"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                No {resourceType} logs recorded yet. Start tracking your usage!
              </span>
            </div>
          )}

          {resourceType === "water" && (
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <h4 className="font-bold">Water Conservation Tip</h4>
              <p className="text-sm mt-2">
                In Ireland, where annual rainfall is 1000+ mm, a water butt can
                save approximately 640 liters per month during growing season!
              </p>
            </div>
          )}

          {resourceType === "compost" && (
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <h4 className="font-bold">Composting Tip</h4>
              <p className="text-sm mt-2">
                For Irish gardens, aim to add 5-7cm of compost to your beds
                annually to improve soil structure and reduce the need for
                peat-based products.
              </p>
            </div>
          )}

          {resourceType === "harvest" && (
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <h4 className="font-bold">Harvest Tip</h4>
              <p className="text-sm mt-2">
                A typical 3x3 meter raised bed in Ireland can produce around
                20kg of vegetables per year with proper planning and succession
                planting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceUsageTracker;
