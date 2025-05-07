import React from "react";
import PropTypes from "prop-types";

/**
 * TaskCard Component
 * Displays an individual gardening task with priority and category badges.
 */
const TaskCard = ({ task }) => {
  // Helper function to get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      case 'low':
        return 'badge-info';
      default:
        return 'badge-ghost';
    }
  };

  // Helper function to get category badge color
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'planting':
        return 'bg-success/10 text-success';
      case 'harvesting':
        return 'bg-warning/10 text-warning';
      case 'maintenance':
        return 'bg-info/10 text-info';
      case 'pest control':
        return 'bg-error/10 text-error';
      case 'pruning':
        return 'bg-secondary/10 text-secondary';
      case 'sustainability':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-base-200 text-base-content';
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="card-title text-base">{task.title}</h3>
          <div className={`badge ${getPriorityColor(task.priority)}`}>{task.priority}</div>
        </div>
        
        <p className="text-sm mb-3">{task.description}</p>
        
        <div className="card-actions justify-end">
          <div className={`badge badge-sm ${getCategoryColor(task.category)}`}>
            {task.category}
          </div>
        </div>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired
  }).isRequired
};

export default TaskCard;
