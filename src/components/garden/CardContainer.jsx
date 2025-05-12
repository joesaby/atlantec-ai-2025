import React, { useState } from "react";
import PlantCard from "../plants/PlantCard";
import TaskCard from "./TaskCard";
import SoilInfo from "../soil/SoilInfo";
import GardeningCalendar from "./GardeningCalendar";
import PlantSustainabilityInfo from "../sustainability/PlantSustainabilityInfo";
import FoodSustainabilityInfo from "../sustainability/FoodSustainabilityInfo";
import { CARD_TYPES } from "../../utils/cards";

/**
 * CardContainer - A standardized container component for various card types
 *
 * @param {Object} props - Component props
 * @param {Object} props.message - Message containing cards or soilInfo
 * @param {number} props.index - Index of the message in the message list
 * @param {number} props.messagesLength - Total number of messages
 * @param {string} props.type - Card type: 'plant', 'task', 'sustainability', or 'soil'
 * @param {boolean} props.isExpanded - Whether the container is expanded
 * @param {Function} props.setExpanded - Function to update expanded state
 */
const CardContainer = ({
  message,
  index,
  messagesLength,
  type,
  isExpanded,
  setExpanded,
}) => {
  // State to track if user has clicked expand at least once
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);

  // Determine container display settings based on card type
  let itemsPerRow, maxCollapsedItems, initialVisibleItems;

  switch (type) {
    case "plant":
      itemsPerRow = 2; // 2 cards per row for plants
      maxCollapsedItems = 3;
      initialVisibleItems = 3; // Show 3 items initially
      break;
    case "task":
      itemsPerRow = 1; // Single column for tasks
      maxCollapsedItems = 2;
      initialVisibleItems = 0; // Don't show any task cards initially
      break;
    case "sustainability":
      itemsPerRow = 1; // Single column for sustainability
      maxCollapsedItems = 1;
      initialVisibleItems = 0; // Changed to 0 - Don't show sustainability cards initially
      break;
    case "soil":
      itemsPerRow = 1; // Single column for soil
      maxCollapsedItems = 0; // Special case - controlled differently
      initialVisibleItems = 0;
      break;
    default:
      itemsPerRow = 1;
      maxCollapsedItems = 2;
      initialVisibleItems = 2;
  }

  // Format the alert title based on card type
  let alertTitle;
  switch (type) {
    case "plant":
      alertTitle = isExpanded
        ? `${message.cards?.length} Plant recommendations for your garden`
        : `Plant recommendations for your garden`;
      break;
    case "task":
      alertTitle = `${message.cards?.length} Gardening tasks available`;
      break;
    case "sustainability":
      alertTitle = `${message.cards?.length} Sustainability impact ${
        isExpanded ? "details" : "information available"
      }`;
      break;
    case "soil":
      alertTitle = `Soil details for ${message.soilInfo.county}`;
      break;
    default:
      alertTitle = "Information";
  }

  // Always show the expand button for all card types
  const showButton = type === "soil" || message.cards?.length > 0;

  // Calculate how many items to show based on expansion state
  const itemsToShow = isExpanded
    ? message.cards?.length || 0
    : Math.min(initialVisibleItems, message.cards?.length || 0);

  // Render different card types
  const renderCard = (card) => {
    switch (card.type) {
      case CARD_TYPES.PLANT:
        return <PlantCard plant={card.data} key={card.data.id} />;
      case CARD_TYPES.TASK:
        return <TaskCard task={card.data} key={card.data.id} />;
      case CARD_TYPES.SUSTAINABILITY:
        // Check if this is a food sustainability card with crop data
        if (card.data.isFoodSustainability) {
          return (
            <FoodSustainabilityInfo
              crop={card.data.crop}
              quantity={card.data.quantity}
              gardenArea={card.data.gardenArea}
              key={card.data.id}
            />
          );
        } else {
          // Regular plant sustainability
          return (
            <PlantSustainabilityInfo
              plantName={card.data.plantName}
              quantity={card.data.quantity}
              isOrganic={card.data.isOrganic}
              showDetailedBreakdown={card.data.showDetailedBreakdown}
              key={card.data.id}
            />
          );
        }
      default:
        return null;
    }
  };

  const handleToggleExpand = () => {
    if (index === messagesLength - 1) {
      // Toggle expanded state
      const newExpandedState = !isExpanded;
      setExpanded(newExpandedState);

      // Track that expand has been clicked at least once
      if (newExpandedState) {
        setHasExpandedOnce(true);
      }

      // First ensure the document has normal scroll
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";

      // When expanding/collapsing, scroll to a good position
      setTimeout(() => {
        const messageEl = document.querySelector(
          `[data-message-index="${index}"]`
        );
        if (messageEl) {
          const messageRect = messageEl.getBoundingClientRect();
          const targetY = window.scrollY + messageRect.top - 100;

          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="mt-2 max-w-3xl">
      <div className="alert alert-success mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
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
          <span>{alertTitle}</span>
        </div>
        {showButton && (
          <button className="btn btn-sm" onClick={handleToggleExpand}>
            {index === messagesLength - 1 && isExpanded
              ? "Collapse"
              : type === "task"
              ? "View Calendar"
              : type === "sustainability"
              ? "View Impact"
              : "Expand"}
          </button>
        )}
      </div>

      {/* Special case for soil info */}
      {type === "soil" && index === messagesLength - 1 && isExpanded && (
        <SoilInfo county={message.soilInfo.county} />
      )}

      {/* Special case for tasks calendar */}
      {type === "task" && index === messagesLength - 1 && isExpanded && (
        <div
          className="mt-4 calendar-wrapper"
          style={{
            position: "relative",
            zIndex: 100,
            overflow: "visible",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <GardeningCalendar months={3} queryTasks={message.cards} />
        </div>
      )}

      {/* Regular cards display - do NOT display task cards or sustainability cards when not expanded */}
      {type !== "soil" &&
        type !== "task" &&
        !(type === "sustainability" && !isExpanded) &&
        message.cards && (
          <div
            className={`grid grid-cols-1 ${
              itemsPerRow > 1 ? "md:grid-cols-2" : ""
            } gap-4 mt-2 mb-4`}
          >
            {message.cards
              .slice(0, itemsToShow)
              .map((card) => renderCard(card))}
          </div>
        )}

      {/* "Show more" button - ONLY show after user has clicked Expand once */}
      {index === messagesLength - 1 &&
        isExpanded &&
        hasExpandedOnce &&
        message.cards &&
        type !== "task" &&
        type !== "sustainability" &&
        message.cards.length > initialVisibleItems && (
          <div className="mt-6 pb-2 text-center bg-base-200 rounded-lg py-3">
            <button
              onClick={() => {
                // For other types, show all items
                setExpanded(true);
              }}
              className="btn btn-primary btn-sm"
            >
              {`Show All ${type === "plant" ? "Plants" : "Items"}`}
            </button>
          </div>
        )}
    </div>
  );
};

export default CardContainer;
