/**
 * Database of gardening tasks specific to Irish growing conditions
 * Tasks are organized by month and category
 */
import { getCurrentMonth, getMonthName } from "../utils/date-utils";

export const gardeningTasks = [
  // January
  {
    month: 1,
    tasks: [
      {
        id: "jan-1",
        title: "Plan your vegetable garden",
        description:
          "January is the perfect time to plan your vegetable garden for the year. Look at seed catalogues and decide what to grow.",
        category: "planning",
        priority: "high",
      },
      {
        id: "jan-2",
        title: "Order seeds early",
        description:
          "Order your seeds now to ensure you get the varieties you want. Focus on varieties suited to Irish conditions.",
        category: "planning",
        priority: "high",
      },
      {
        id: "jan-3",
        title: "Clean and sharpen tools",
        description:
          "Use this quieter gardening time to clean, oil, and sharpen your gardening tools.",
        category: "maintenance",
        priority: "medium",
      },
      {
        id: "jan-4",
        title: "Protect vulnerable plants from frost",
        description:
          "Check protective coverings on tender plants. January often brings the coldest temperatures in Ireland.",
        category: "protection",
        priority: "high",
      },
      {
        id: "jan-5",
        title: "Prune apple trees",
        description:
          "Winter is the best time to prune apple trees while they are dormant.",
        category: "pruning",
        priority: "medium",
      },
    ],
  },
  // February
  {
    month: 2,
    tasks: [
      {
        id: "feb-1",
        title: "Prepare vegetable beds",
        description:
          "Start preparing your vegetable beds by removing weeds and adding compost or well-rotted manure.",
        category: "preparation",
        priority: "high",
      },
      {
        id: "feb-2",
        title: "Chit seed potatoes",
        description:
          "Place seed potatoes in a cool, bright place to sprout before planting. Traditional potato planting starts around St. Patrick's Day in Ireland.",
        category: "planting",
        priority: "high",
      },
      {
        id: "feb-3",
        title: "Sow broad beans",
        description:
          "Broad beans can be sown directly in the ground in mild areas of Ireland or in pots in colder regions.",
        category: "planting",
        priority: "medium",
      },
      {
        id: "feb-4",
        title: "Install water butts",
        description:
          "February is often wet in Ireland - perfect time to install water butts to collect rainwater for summer use.",
        category: "sustainability",
        priority: "medium",
      },
      {
        id: "feb-5",
        title: "Prune winter-flowering shrubs",
        description:
          "Once they've finished flowering, prune winter-flowering shrubs to encourage new growth.",
        category: "pruning",
        priority: "medium",
      },
    ],
  },
  // March
  {
    month: 3,
    tasks: [
      {
        id: "mar-1",
        title: "Plant early potatoes",
        description:
          "St. Patrick's Day (March 17th) is the traditional potato planting day in Ireland.",
        category: "planting",
        priority: "high",
      },
      {
        id: "mar-2",
        title: "Start sowing hardy vegetables",
        description:
          "Sow peas, carrots, parsnips, and spinach outdoors in areas where soil is workable.",
        category: "planting",
        priority: "high",
      },
      {
        id: "mar-3",
        title: "Prepare soil for spring planting",
        description:
          "Dig in green manures and add compost to prepare soil for spring planting.",
        category: "preparation",
        priority: "high",
      },
      {
        id: "mar-4",
        title: "Mulch fruit trees and bushes",
        description:
          "Apply a layer of mulch around fruit trees and bushes, being careful not to pile it against stems.",
        category: "maintenance",
        priority: "medium",
      },
      {
        id: "mar-5",
        title: "Control slugs and snails",
        description:
          "As weather warms, begin organic slug control methods to protect new growth.",
        category: "pest control",
        priority: "medium",
      },
    ],
  },
  // April
  {
    month: 4,
    tasks: [
      {
        id: "apr-1",
        title: "Sow tender vegetables",
        description:
          "Begin sowing tender vegetables like courgettes and pumpkins indoors or in a greenhouse.",
        category: "planting",
        priority: "high",
      },
      {
        id: "apr-2",
        title: "Plant maincrop potatoes",
        description:
          "Plant maincrop potatoes when soil conditions are suitable.",
        category: "planting",
        priority: "high",
      },
      {
        id: "apr-3",
        title: "Feed fruit trees and bushes",
        description:
          "Apply a balanced fertilizer around fruit trees and bushes to support spring growth.",
        category: "feeding",
        priority: "medium",
      },
      {
        id: "apr-4",
        title: "Start regular weeding",
        description:
          "Begin regular weeding as growth accelerates with spring temperatures.",
        category: "maintenance",
        priority: "medium",
      },
      {
        id: "apr-5",
        title: "Install supports for peas and beans",
        description:
          "Install supports for climbing peas and beans before they need them.",
        category: "preparation",
        priority: "medium",
      },
    ],
  },
  // May
  {
    month: 5,
    tasks: [
      {
        id: "may-1",
        title: "Plant out tender vegetables",
        description:
          "Plant out tender vegetables like courgettes after risk of frost has passed.",
        category: "planting",
        priority: "high",
      },
      {
        id: "may-2",
        title: "Thin out seedlings",
        description:
          "Thin out seedlings of vegetables sown directly to give proper spacing.",
        category: "maintenance",
        priority: "high",
      },
      {
        id: "may-3",
        title: "Begin regular watering routine",
        description:
          "Begin a regular watering routine, especially for container plants and newly planted areas.",
        category: "maintenance",
        priority: "high",
      },
      {
        id: "may-4",
        title: "Watch for pests",
        description:
          "Keep an eye on young plants for pests such as aphids and caterpillars.",
        category: "pest control",
        priority: "medium",
      },
      {
        id: "may-5",
        title: "Plant herbs",
        description:
          "Plant herbs in containers or the garden for summer harvesting.",
        category: "planting",
        priority: "medium",
      },
    ],
  },
  // June
  {
    month: 6,
    tasks: [
      {
        id: "jun-1",
        title: "Begin harvesting early crops",
        description:
          "Harvest early crops such as lettuce, radishes, and early potatoes.",
        category: "harvesting",
        priority: "medium",
      },
      {
        id: "jun-2",
        title: "Water regularly",
        description:
          "Maintain regular watering, especially in dry periods. Water in the evening to reduce evaporation.",
        category: "maintenance",
        priority: "high",
      },
      {
        id: "jun-3",
        title: "Plant out winter brassicas",
        description:
          "Plant out winter brassicas like Brussels sprouts, cabbage, and kale.",
        category: "planting",
        priority: "medium",
      },
      {
        id: "jun-4",
        title: "Earth up potatoes",
        description:
          "Earth up potatoes to ensure tubers stay covered and don't turn green.",
        category: "maintenance",
        priority: "high",
      },
      {
        id: "jun-5",
        title: "Pinch out tomato side shoots",
        description:
          "Pinch out side shoots on cordon tomatoes to focus growth on main stem.",
        category: "pruning",
        priority: "medium",
      },
    ],
  },
  // July
  {
    month: 7,
    tasks: [
      {
        id: "jul-1",
        title: "Summer prune fruit trees",
        description:
          "Summer prune trained fruit trees to maintain shape and encourage fruiting.",
        category: "pruning",
        priority: "medium",
      },
      {
        id: "jul-2",
        title: "Harvest early potatoes",
        description: "Harvest early potatoes when plants begin to flower.",
        category: "harvesting",
        priority: "medium",
      },
      {
        id: "jul-3",
        title: "Continue consistent watering",
        description:
          "Maintain watering during dry periods, targeting roots rather than leaves.",
        category: "maintenance",
        priority: "high",
      },
      {
        id: "jul-4",
        title: "Sow autumn vegetables",
        description:
          "Sow vegetables for autumn harvests, such as carrots, spinach, and lettuce.",
        category: "planting",
        priority: "medium",
      },
      {
        id: "jul-5",
        title: "Feed tomatoes and other fruiting vegetables",
        description:
          "Feed tomatoes, peppers, and cucumbers with a high potash fertilizer.",
        category: "feeding",
        priority: "high",
      },
    ],
  },
  // August
  {
    month: 8,
    tasks: [
      {
        id: "aug-1",
        title: "Harvest main season crops",
        description:
          "Harvest onions, garlic, and shallots when tops begin to die back.",
        category: "harvesting",
        priority: "high",
      },
      {
        id: "aug-2",
        title: "Collect seeds",
        description:
          "Collect seeds from flowers and vegetables for next year's planting.",
        category: "sustainability",
        priority: "medium",
      },
      {
        id: "aug-3",
        title: "Prune summer fruiting raspberries",
        description:
          "Cut back canes that have fruited to ground level after harvest.",
        category: "pruning",
        priority: "medium",
      },
      {
        id: "aug-4",
        title: "Prepare for autumn planting",
        description: "Clear spent crops and prepare soil for autumn planting.",
        category: "preparation",
        priority: "medium",
      },
      {
        id: "aug-5",
        title: "Plant autumn onion sets",
        description: "Plant autumn onion sets for overwintering.",
        category: "planting",
        priority: "medium",
      },
    ],
  },
  // September
  {
    month: 9,
    tasks: [
      {
        id: "sep-1",
        title: "Harvest maincrop potatoes",
        description:
          "Harvest maincrop potatoes before soil becomes too wet or cold.",
        category: "harvesting",
        priority: "high",
      },
      {
        id: "sep-2",
        title: "Plant spring bulbs",
        description: "Begin planting spring flowering bulbs such as daffodils.",
        category: "planting",
        priority: "medium",
      },
      {
        id: "sep-3",
        title: "Divide overgrown perennials",
        description:
          "Divide overgrown perennials to rejuvenate plants and increase stock.",
        category: "propagation",
        priority: "medium",
      },
      {
        id: "sep-4",
        title: "Sow green manures",
        description:
          "Sow green manures on empty beds to protect soil over winter.",
        category: "sustainability",
        priority: "medium",
      },
      {
        id: "sep-5",
        title: "Begin autumn cleanup",
        description:
          "Clear away spent summer crops and compost disease-free material.",
        category: "maintenance",
        priority: "medium",
      },
    ],
  },
  // October
  {
    month: 10,
    tasks: [
      {
        id: "oct-1",
        title: "Plant garlic",
        description: "Plant garlic cloves for a crop next summer.",
        category: "planting",
        priority: "high",
      },
      {
        id: "oct-2",
        title: "Harvest apples and pears",
        description: "Harvest and store late-season apples and pears.",
        category: "harvesting",
        priority: "high",
      },
      {
        id: "oct-3",
        title: "Prepare soil for winter",
        description:
          "Dig heavy soils and leave rough for frost to break down over winter.",
        category: "preparation",
        priority: "medium",
      },
      {
        id: "oct-4",
        title: "Protect tender plants",
        description:
          "Move tender plants to protected locations before first frosts.",
        category: "protection",
        priority: "high",
      },
      {
        id: "oct-5",
        title: "Collect autumn leaves for leaf mold",
        description:
          "Collect fallen leaves to make valuable leaf mold for soil conditioning.",
        category: "sustainability",
        priority: "medium",
      },
    ],
  },
  // November
  {
    month: 11,
    tasks: [
      {
        id: "nov-1",
        title: "Plant bare-root trees and shrubs",
        description:
          "Plant bare-root trees, shrubs, and hedging while dormant.",
        category: "planting",
        priority: "high",
      },
      {
        id: "nov-2",
        title: "Prune roses",
        description:
          "Prune roses to prevent wind damage and disease over winter.",
        category: "pruning",
        priority: "medium",
      },
      {
        id: "nov-3",
        title: "Protect vulnerable plants",
        description:
          "Protect vulnerable plants from frost with horticultural fleece or straw.",
        category: "protection",
        priority: "high",
      },
      {
        id: "nov-4",
        title: "Clear fallen leaves",
        description:
          "Clear fallen leaves from lawns and ponds to prevent damage.",
        category: "maintenance",
        priority: "medium",
      },
      {
        id: "nov-5",
        title: "Check stored produce",
        description:
          "Check stored fruits and vegetables, removing any showing signs of rot.",
        category: "maintenance",
        priority: "medium",
      },
    ],
  },
  // December
  {
    month: 12,
    tasks: [
      {
        id: "dec-1",
        title: "Winter prune apple and pear trees",
        description:
          "Winter prune established apple and pear trees while dormant.",
        category: "pruning",
        priority: "medium",
      },
      {
        id: "dec-2",
        title: "Harvest winter vegetables",
        description:
          "Harvest winter vegetables like Brussels sprouts, parsnips, and leeks.",
        category: "harvesting",
        priority: "medium",
      },
      {
        id: "dec-3",
        title: "Plan crop rotation",
        description:
          "Plan crop rotation for the coming growing season to minimize pest and disease issues.",
        category: "planning",
        priority: "high",
      },
      {
        id: "dec-4",
        title: "Protect vulnerable plants",
        description:
          "Protect vulnerable plants from frost, snow, and winter winds.",
        category: "protection",
        priority: "high",
      },
      {
        id: "dec-5",
        title: "Clean greenhouse",
        description:
          "Clean greenhouse glass to maximize light during short winter days.",
        category: "maintenance",
        priority: "medium",
      },
    ],
  },
];

/**
 * Get tasks for a specific month
 * @param {number} month - Month number (1-12)
 * @returns {Array} Array of tasks for the month
 */
export function getTasksForMonth(month) {
  const monthData = gardeningTasks.find((m) => m.month === month);
  return monthData ? monthData.tasks : [];
}

/**
 * Get tasks for the current month
 * @returns {Array} Array of tasks for the current month
 */
export function getTasksForCurrentMonth() {
  const currentMonth = getCurrentMonth();
  return getTasksForMonth(currentMonth);
}

/**
 * Get all tasks for the next N months
 * @param {number} startMonth - Starting month (1-12)
 * @param {number} months - Number of months to include
 * @returns {Array} Array of tasks grouped by month
 */
export function getTasksForUpcomingMonths(startMonth, months = 3) {
  const tasks = [];

  for (let i = 0; i < months; i++) {
    const month = ((startMonth - 1 + i) % 12) + 1; // Loop around to January after December
    const monthName = getMonthName(month);

    tasks.push({
      month,
      name: monthName, // Changed monthName to name to match expected property in GardeningCalendar
      tasks: getTasksForMonth(month),
    });
  }

  return tasks;
}

/**
 * Get a list of tasks filtered by category
 * @param {string} category - Category to filter by
 * @returns {Array} Array of tasks in the specified category
 */
export function getTasksByCategory(category) {
  const allTasks = [];

  gardeningTasks.forEach((month) => {
    const tasks = month.tasks.filter((task) => task.category === category);
    if (tasks.length > 0) {
      allTasks.push({
        month: month.month,
        monthName: getMonthName(month.month),
        tasks,
      });
    }
  });

  return allTasks;
}

export const sampleTasks = gardeningTasks;
