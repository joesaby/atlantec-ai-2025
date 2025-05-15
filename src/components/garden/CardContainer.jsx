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
  calendarData = null,
}) => {
  // State to track if user has clicked expand at least once
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);
  // State to track if all plant cards are shown
  const [showAllPlants, setShowAllPlants] = useState(false);

  // Determine container display settings based on card type
  let itemsPerRow, maxCollapsedItems, initialVisibleItems;

  switch (type) {
    case CARD_TYPES.PLANT:
      itemsPerRow = 2; // 2 cards per row for plants
      maxCollapsedItems = 2; // Show 2 plant cards initially when expanded
      initialVisibleItems = 0; // Don't show any plant cards initially (collapsed state)
      break;
    case CARD_TYPES.TASK:
      itemsPerRow = 1; // Single column for tasks
      maxCollapsedItems = 2;
      initialVisibleItems = 0; // Don't show any task cards initially
      break;
    case CARD_TYPES.SUSTAINABILITY:
      itemsPerRow = 1; // Single column for sustainability
      maxCollapsedItems = 1;
      initialVisibleItems = 0; // Don't show sustainability cards initially
      break;
    case CARD_TYPES.SOIL:
      itemsPerRow = 1; // Single column for soil
      maxCollapsedItems = 0; // Special case - controlled differently
      initialVisibleItems = 0;
      break;
    default:
      itemsPerRow = 1;
      maxCollapsedItems = 2;
      initialVisibleItems = 0; // Default to not showing cards initially
  }

  // Format the alert title based on card type
  let alertTitle;
  switch (type) {
    case CARD_TYPES.PLANT:
      alertTitle = `${message.cards?.length} Plants suitable for your garden`;
      break;
    case CARD_TYPES.TASK:
      alertTitle = `${message.cards?.length} Gardening tasks available`;
      break;
    case CARD_TYPES.SUSTAINABILITY:
      alertTitle = `${message.cards?.length} Sustainability impact ${
        isExpanded ? "details" : "information available"
      }`;
      break;
    case CARD_TYPES.SOIL:
      alertTitle = `Soil information for ${message.soilInfo.county}`;
      break;
    default:
      alertTitle = "Information";
  }

  // Always show the expand button for all card types
  const showButton = type === CARD_TYPES.SOIL || message.cards?.length > 0;

  // Calculate how many items to show based on expansion state and type
  const itemsToShow = () => {
    if (!isExpanded) {
      return 0;
    }

    if (type === CARD_TYPES.PLANT) {
      if (showAllPlants) {
        return message.cards?.length || 0;
      }
      return Math.min(maxCollapsedItems, message.cards?.length || 0);
    }

    // For other types, show all when expanded
    return message.cards?.length || 0;
  };

  // Render different card types
  const renderCard = (card) => {
    // Skip rendering if card type is null or undefined
    if (!card.type) {
      return null;
    }

    switch (card.type) {
      case CARD_TYPES.PLANT:
        return <PlantCard plant={card.data} key={card.data.id} />;
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

      // Reset showAllPlants when collapsing
      if (!newExpandedState) {
        setShowAllPlants(false);
      }

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
          <button
            className="btn btn-sm"
            onClick={() => {
              if (type === CARD_TYPES.TASK && message.cards?.length > 0) {
                try {
                  // First, convert card data to the expected format for the calendar
                  const currentMonth = new Date().getMonth() + 1; // 1-indexed month
                  const formattedData = [
                    {
                      month: currentMonth,
                      name: new Date(2025, currentMonth - 1, 1).toLocaleString(
                        "default",
                        { month: "long" }
                      ),
                      tasks: message.cards.map((card) => card.data),
                    },
                  ];

                  console.log(
                    "Task cards formatted for calendar:",
                    formattedData
                  );

                  // If we have calendar data from props, use it to show the calendar overlay
                  if (calendarData) {
                    calendarData.setCurrentCalendarTasks(message.cards);
                    calendarData.setCalendarOverlayOpen(true);
                    console.log(
                      "Opening calendar overlay with tasks:",
                      message.cards.length
                    );
                    return; // Don't toggle the normal expansion
                  }
                  // Otherwise fall back to using the global update function if available
                  else if (window.updateGardeningCalendar) {
                    console.log(
                      "Calling updateGardeningCalendar with task cards"
                    );
                    window.updateGardeningCalendar(formattedData);
                  }
                } catch (error) {
                  console.error("Error handling calendar task data:", error);
                }
              }
              handleToggleExpand();
            }}
          >
            {index === messagesLength - 1 && isExpanded
              ? "Hide"
              : type === CARD_TYPES.TASK
              ? "View Calendar"
              : type === CARD_TYPES.SUSTAINABILITY
              ? "View Impact"
              : type === CARD_TYPES.SOIL
              ? "View Soil Details"
              : type === CARD_TYPES.PLANT
              ? "View Plants"
              : "Expand"}
          </button>
        )}
      </div>

      {/* Special case for soil info */}
      {type === CARD_TYPES.SOIL &&
        index === messagesLength - 1 &&
        isExpanded && <SoilInfo county={message.soilInfo.county} />}

      {/* Special case for tasks calendar */}
      {type === CARD_TYPES.TASK &&
        index === messagesLength - 1 &&
        isExpanded && (
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
            <GardeningCalendar
              months={3}
              queryTasks={message.cards?.length > 0 ? message.cards : []}
            />
          </div>
        )}

      {/* Only show cards when expanded - this applies to all card types */}
      {isExpanded && message.cards && message.cards.length > 0 && (
        <div
          className={`grid grid-cols-1 ${
            itemsPerRow > 1 ? "md:grid-cols-2" : ""
          } gap-4 mt-2 mb-4`}
        >
          {message.cards
            .slice(0, itemsToShow())
            .map((card) => renderCard(card))}
        </div>
      )}

      {/* "Show All Plants" button - Only show for plant cards when there are more than maxCollapsedItems */}
      {index === messagesLength - 1 &&
        isExpanded &&
        type === CARD_TYPES.PLANT &&
        message.cards &&
        message.cards.length > maxCollapsedItems &&
        !showAllPlants && (
          <div className="mt-6 pb-2 text-center bg-base-200 rounded-lg py-3">
            <button
              onClick={() => {
                setShowAllPlants(true);
              }}
              className="btn btn-primary btn-sm"
            >
              Show All Plants ({message.cards.length - maxCollapsedItems} more)
            </button>
          </div>
        )}
    </div>
  );
};

export default CardContainer;
