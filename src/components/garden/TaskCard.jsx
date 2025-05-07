import React from "react";
import PropTypes from "prop-types";
import "./TaskCard.css"; // Assuming a CSS file for styling

/**
 * TaskCard Component
 * Displays an individual gardening task with priority and category badges.
 */
const TaskCard = ({ title, description, category, priority }) => {
  return (
    <div className="task-card">
      <h3 className="task-title">{title}</h3>
      <p className="task-description">{description}</p>
      <div className="task-badges">
        <span
          className={`badge category-badge category-${category.toLowerCase()}`}
        >
          {category}
        </span>
        <span
          className={`badge priority-badge priority-${priority.toLowerCase()}`}
        >
          {priority}
        </span>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  priority: PropTypes.string.isRequired,
};

export default TaskCard;
