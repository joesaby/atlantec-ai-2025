import React from "react";

/**
 * ChatAvatar - A reusable component for chat avatar images
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Avatar type: 'user' or 'assistant'
 */
const ChatAvatar = ({ type }) => {
  if (type === "user") {
    return (
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 p-1 bg-secondary text-secondary-content rounded-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>
    );
  } else {
    return (
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {/* Bloom garden assistant logo */}
          <img 
            src="/images/bloom-logo.svg" 
            alt="Bloom Assistant" 
            className="h-10 w-10 p-0.5" 
          />
        </div>
      </div>
    );
  }
};

export default ChatAvatar;
