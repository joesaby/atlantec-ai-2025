/**
 * Database of gardening tasks specific to Irish growing conditions
 * Tasks are organized by month and category
 */
export const gardeningTasks = [
  // January
  {
    month: 1,
    tasks: [
      {
        id: 'jan-1',
        title: 'Plan your vegetable garden',
        description: 'January is the perfect time to plan your vegetable garden for the year. Look at seed catalogues and decide what to grow.',
        category: 'planning',
        priority: 'high'
      },
      {
        id: 'jan-2',
        title: 'Order seeds early',
        description: 'Order your seeds now to ensure you get the varieties you want. Focus on varieties suited to Irish conditions.',
        category: 'planning',
        priority: 'high'
      },
      {
        id: 'jan-3',
        title: 'Clean and sharpen tools',
        description: 'Use this quieter gardening time to clean, oil, and sharpen your gardening tools.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'jan-4',
        title: 'Protect vulnerable plants from frost',
        description: 'Check protective coverings on tender plants. January often brings the coldest temperatures in Ireland.',
        category: 'protection',
        priority: 'high'
      },
      {
        id: 'jan-5',
        title: 'Prune apple trees',
        description: 'Winter is the best time to prune apple trees while they are dormant.',
        category: 'pruning',
        priority: 'medium'
      }
    ]
  },
  // February
  {
    month: 2,
    tasks: [
      {
        id: 'feb-1',
        title: 'Prepare vegetable beds',
        description: 'Start preparing your vegetable beds by removing weeds and adding compost or well-rotted manure.',
        category: 'preparation',
        priority: 'high'
      },
      {
        id: 'feb-2',
        title: 'Chit seed potatoes',
        description: 'Place seed potatoes in a cool, bright place to sprout before planting. Traditional potato planting starts around St. Patrick\'s Day in Ireland.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'feb-3',
        title: 'Sow broad beans',
        description: 'Broad beans can be sown directly in the ground in mild areas of Ireland or in pots in colder regions.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'feb-4',
        title: 'Install water butts',
        description: 'February is often wet in Ireland - perfect time to install water butts to collect rainwater for summer use.',
        category: 'sustainability',
        priority: 'medium'
      },
      {
        id: 'feb-5',
        title: 'Prune winter-flowering shrubs',
        description: 'Once they\'ve finished flowering, prune winter-flowering shrubs to encourage new growth.',
        category: 'pruning',
        priority: 'medium'
      }
    ]
  },
  // March
  {
    month: 3,
    tasks: [
      {
        id: 'mar-1',
        title: 'Plant early potatoes',
        description: 'St. Patrick\'s Day (March 17th) is the traditional potato planting day in Ireland.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'mar-2',
        title: 'Start sowing hardy vegetables',
        description: 'Sow peas, carrots, parsnips, and spinach outdoors in areas where soil is workable.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'mar-3',
        title: 'Prepare soil for spring planting',
        description: 'Dig in green manures and add compost to prepare soil for spring planting.',
        category: 'preparation',
        priority: 'high'
      },
      {
        id: 'mar-4',
        title: 'Mulch fruit trees and bushes',
        description: 'Apply a layer of mulch around fruit trees and bushes, being careful not to pile it against stems.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'mar-5',
        title: 'Control slugs and snails',
        description: 'As weather warms, begin organic slug control methods to protect new growth.',
        category: 'pest control',
        priority: 'medium'
      }
    ]
  }
  // Additional months can be added here following the same structure
];

/**
 * Get tasks for a specific month
 * @param {number} month - Month number (1-12)
 * @returns {Array} Array of tasks for the month
 */
export function getTasksForMonth(month) {
  const monthData = gardeningTasks.find(m => m.month === month);
  return monthData ? monthData.tasks : [];
}

/**
 * Get tasks for the current month
 * @returns {Array} Array of tasks for the current month
 */
export function getTasksForCurrentMonth() {
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
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
    const monthName = new Date(2000, month - 1, 1).toLocaleString('en-IE', { month: 'long' });
    
    tasks.push({
      month,
      monthName,
      tasks: getTasksForMonth(month)
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
  
  gardeningTasks.forEach(month => {
    const tasks = month.tasks.filter(task => task.category === category);
    if (tasks.length > 0) {
      allTasks.push({
        month: month.month,
        monthName: new Date(2000, month.month - 1, 1).toLocaleString('en-IE', { month: 'long' }),
        tasks
      });
    }
  });
  
  return allTasks;
}