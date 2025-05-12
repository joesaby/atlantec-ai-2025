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
          {/* Smiley Flower Icon for "Bloom" garden assistant */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 400"
            className="h-10 w-10 p-0.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          >
            {/* Background circle */}
            <circle cx="200" cy="200" r="180" fill="#ACE7F5" stroke="none" />

            {/* Petals (6 circles) */}
            <g fill="#FDBA2C" stroke="#1B1F23">
              <circle cx="200" cy="115" r="55" /> {/* top */}
              <circle cx="275" cy="145" r="55" /> {/* top-right */}
              <circle cx="275" cy="215" r="55" /> {/* bottom-right */}
              <circle cx="200" cy="245" r="55" /> {/* bottom */}
              <circle cx="125" cy="215" r="55" /> {/* bottom-left */}
              <circle cx="125" cy="145" r="55" /> {/* top-left */}
            </g>

            {/* Flower face / centre */}
            <circle cx="200" cy="180" r="65" fill="#FFC73A" stroke="#1B1F23" />
            {/* eyes */}
            <circle cx="182" cy="172" r="7" fill="#1B1F23" stroke="none" />
            <circle cx="218" cy="172" r="7" fill="#1B1F23" stroke="none" />
            {/* smile */}
            <path d="M180 198 Q200 215 220 198" stroke="#1B1F23" fill="none" />

            {/* Stem */}
            <line x1="200" y1="245" x2="200" y2="330" stroke="#1B1F23" />

            {/* Leaves */}
            <g fill="#52B788" stroke="#1B1F23">
              {/* left leaf */}
              <path
                d="M200 300
                      Q160 280 130 315
                      Q160 327 200 315 Z"
              />
              {/* right leaf */}
              <path
                d="M200 300
                      Q240 280 270 315
                      Q240 327 200 315 Z"
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }
};

export default ChatAvatar;
