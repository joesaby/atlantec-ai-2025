# Phase 3: Seasonal Gardening Planner

This phase implements a seasonal gardening planner that helps Irish gardeners track gardening tasks throughout the year. It will display appropriate tasks based on the current season and provide a calendar view of upcoming activities.

## Implementation Steps

### 1. Create a Gardening Tasks Database

First, create a database of seasonal gardening tasks for Ireland:

```javascript
// src/data/gardening-tasks.js

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
        description: 'Once they've finished flowering, prune winter-flowering shrubs to encourage new growth.',
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
  },
  // April
  {
    month: 4,
    tasks: [
      {
        id: 'apr-1',
        title: 'Sow more vegetables outdoors',
        description: 'Continue sowing vegetables including beetroot, lettuce, radish, and spring onions.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'apr-2',
        title: 'Plant maincrop potatoes',
        description: 'April is ideal for planting main crop potatoes in Ireland.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'apr-3',
        title: 'Start tender vegetables indoors',
        description: 'Sow courgettes, cucumbers, pumpkins, and tomatoes indoors or in a greenhouse.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'apr-4',
        title: 'Earth up potatoes',
        description: 'Begin earthing up potatoes as shoots emerge to protect from frost and encourage more tubers.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'apr-5',
        title: 'Plant native pollinator-friendly flowers',
        description: 'Plant native wildflowers to attract beneficial insects and pollinators.',
        category: 'sustainability',
        priority: 'medium'
      }
    ]
  },
  // May
  {
    month: 5,
    tasks: [
      {
        id: 'may-1',
        title: 'Harden off tender plants',
        description: 'Begin hardening off tender plants by placing them outside during the day and bringing them in at night.',
        category: 'preparation',
        priority: 'high'
      },
      {
        id: 'may-2',
        title: 'Plant out tender vegetables',
        description: 'After risk of frost has passed (mid to late May in most of Ireland), plant out tender vegetables.',
        category: 'planting',
        priority: 'high'
      },
      {
        id: 'may-3',
        title: 'Continue succession sowing',
        description: 'Sow salad crops every two weeks for continuous harvest.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'may-4',
        title: 'Thin out seedlings',
        description: 'Thin out seedlings of earlier sowings to give plants room to grow.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'may-5',
        title: 'Monitor for pests and diseases',
        description: 'Regularly check plants for pests and diseases as activity increases in warmer weather.',
        category: 'pest control',
        priority: 'high'
      }
    ]
  },
  // June
  {
    month: 6,
    tasks: [
      {
        id: 'jun-1',
        title: 'Harvest early crops',
        description: 'Begin harvesting early potatoes, peas, and leafy greens.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'jun-2',
        title: 'Regular watering',
        description: 'Establish regular watering routine, using collected rainwater when possible.',
        category: 'maintenance',
        priority: 'high'
      },
      {
        id: 'jun-3',
        title: 'Plant out winter brassicas',
        description: 'Plant out winter cabbage, kale, and Brussels sprouts.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'jun-4',
        title: 'Support climbing plants',
        description: 'Install supports for climbing plants like beans and peas.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'jun-5',
        title: 'Feed tomatoes and peppers',
        description: 'Begin feeding tomatoes and peppers with a high-potash fertilizer.',
        category: 'feeding',
        priority: 'medium'
      }
    ]
  },
  // July
  {
    month: 7,
    tasks: [
      {
        id: 'jul-1',
        title: 'Harvest regularly',
        description: 'Harvest vegetables regularly to encourage continued production.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'jul-2',
        title: 'Water during dry spells',
        description: 'Water thoroughly during dry spells, focusing on the base of plants in the evening.',
        category: 'maintenance',
        priority: 'high'
      },
      {
        id: 'jul-3',
        title: 'Pinch out tomato side shoots',
        description: 'Pinch out side shoots of cordon tomatoes and feed weekly.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'jul-4',
        title: 'Sow for autumn and winter',
        description: 'Sow vegetables for autumn and winter harvests, including carrots, turnips, and spring cabbage.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'jul-5',
        title: 'Monitor and control potato blight',
        description: 'July often brings blight conditions to Ireland - monitor potatoes and tomatoes closely.',
        category: 'pest control',
        priority: 'high'
      }
    ]
  },
  // August
  {
    month: 8,
    tasks: [
      {
        id: 'aug-1',
        title: 'Continue harvesting',
        description: 'Harvest maincrop vegetables and preserve excess produce by freezing, drying, or pickling.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'aug-2',
        title: 'Collect seeds',
        description: 'Collect seeds from flowers and vegetables for next year\'s growing.',
        category: 'sustainability',
        priority: 'medium'
      },
      {
        id: 'aug-3',
        title: 'Prune summer-fruiting raspberries',
        description: 'After fruiting, cut down canes that have fruited and tie in new canes.',
        category: 'pruning',
        priority: 'medium'
      },
      {
        id: 'aug-4',
        title: 'Start harvesting maincrop potatoes',
        description: 'Begin harvesting maincrop potatoes as foliage dies back.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'aug-5',
        title: 'Sow winter salads',
        description: 'Sow winter lettuce, spring onions, and winter spinach.',
        category: 'planting',
        priority: 'medium'
      }
    ]
  },
  // September
  {
    month: 9,
    tasks: [
      {
        id: 'sep-1',
        title: 'Harvest and store crops',
        description: 'Harvest and store apples, onions, and root vegetables for winter use.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'sep-2',
        title: 'Prepare growing areas for winter',
        description: 'Clear spent crops and compost plant material that is free of disease.',
        category: 'maintenance',
        priority: 'high'
      },
      {
        id: 'sep-3',
        title: 'Plant spring bulbs',
        description: 'Plant spring-flowering bulbs like daffodils and crocuses.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'sep-4',
        title: 'Divide perennial herbs',
        description: 'Divide perennial herbs such as chives and mint.',
        category: 'propagation',
        priority: 'low'
      },
      {
        id: 'sep-5',
        title: 'Sow green manures',
        description: 'Sow green manures like clover or winter rye on empty vegetable beds.',
        category: 'sustainability',
        priority: 'medium'
      }
    ]
  },
  // October
  {
    month: 10,
    tasks: [
      {
        id: 'oct-1',
        title: 'Final harvesting',
        description: 'Complete the harvesting of remaining tender crops before first frosts.',
        category: 'harvesting',
        priority: 'high'
      },
      {
        id: 'oct-2',
        title: 'Plant garlic',
        description: 'Plant garlic cloves for next year\'s harvest.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'oct-3',
        title: 'Plant bare-root fruit trees and bushes',
        description: 'Late October is a good time to plant bare-root fruit trees and bushes.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'oct-4',
        title: 'Collect autumn leaves',
        description: 'Collect fallen leaves for making leaf mould - an excellent soil conditioner.',
        category: 'sustainability',
        priority: 'medium'
      },
      {
        id: 'oct-5',
        title: 'Protect winter crops',
        description: 'Cover winter brassicas with netting to protect from pigeons.',
        category: 'protection',
        priority: 'medium'
      }
    ]
  },
  // November
  {
    month: 11,
    tasks: [
      {
        id: 'nov-1',
        title: 'Prepare soil for next season',
        description: 'Dig over vacant plots and add organic matter to improve soil structure.',
        category: 'preparation',
        priority: 'high'
      },
      {
        id: 'nov-2',
        title: 'Plant bare-root hedging',
        description: 'Plant native bare-root hedging like hawthorn and blackthorn.',
        category: 'planting',
        priority: 'medium'
      },
      {
        id: 'nov-3',
        title: 'Protect tender plants',
        description: 'Move tender plants into greenhouses or provide frost protection.',
        category: 'protection',
        priority: 'high'
      },
      {
        id: 'nov-4',
        title: 'Prune apple and pear trees',
        description: 'Prune established apple and pear trees once leaves have fallen.',
        category: 'pruning',
        priority: 'medium'
      },
      {
        id: 'nov-5',
        title: 'Check stored produce',
        description: 'Check stored fruit and vegetables regularly and remove any showing signs of rot.',
        category: 'maintenance',
        priority: 'medium'
      }
    ]
  },
  // December
  {
    month: 12,
    tasks: [
      {
        id: 'dec-1',
        title: 'Winter pruning',
        description: 'Prune deciduous trees and shrubs during dormancy.',
        category: 'pruning',
        priority: 'medium'
      },
      {
        id: 'dec-2',
        title: 'Maintenance of raised beds',
        description: 'Repair and maintain raised beds and garden structures.',
        category: 'maintenance',
        priority: 'medium'
      },
      {
        id: 'dec-3',
        title: 'Plan crop rotation',
        description: 'Plan crop rotation for the coming growing season to minimize pest and disease issues.',
        category: 'planning',
        priority: 'high'
      },
      {
        id: 'dec-4',
        title: 'Protect vulnerable plants',
        description: 'Protect vulnerable plants from frost, snow, and winter winds.',
        category: 'protection',
        priority: 'high'
      },
      {
        id: 'dec-5',
        title: 'Clean greenhouse',
        description: 'Clean greenhouse glass to maximize light during short winter days.',
        category: 'maintenance',
        priority: 'medium'
      }
    ]
  }
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
```

### 2. Create Task Card Component

Create a component to display individual gardening tasks:

```jsx
// src/components/garden/TaskCard.jsx
import React from 'react';

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

export default TaskCard;
```

### 3. Create Monthly Tasks Component

Create a component to display tasks for a specific month:

```jsx
// src/components/garden/MonthlyTasks.jsx
import React from 'react';
import TaskCard from './TaskCard';

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
          <div className="badge badge-primary">{monthData.tasks.length} tasks</div>
          <button className="btn btn-sm btn-circle btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
```

### 4. Create Gardening Calendar Component

Create a calendar view for upcoming gardening tasks:

```jsx
// src/components/garden/GardeningCalendar.jsx
import React, { useState, useEffect } from 'react';
import MonthlyTasks from './MonthlyTasks';
import { getTasksForUpcomingMonths } from '../../data/gardening-tasks';

const GardeningCalendar = ({ months = 3 }) => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Available categories for filtering
  const categories = [
    'all',
    'planting',
    'harvesting',
    'maintenance',
    'pruning',
    'protection',
    'pest control',
    'sustainability',
    'planning',
    'preparation',
    'feeding',
    'propagation'
  ];
  
  useEffect(() => {
    // Simulate loading from a database
    setIsLoading(true);
    
    setTimeout(() => {
      const currentMonth = new Date().getMonth() + 1;
      const tasks = getTasksForUpcomingMonths(currentMonth, months);
      setUpcomingTasks(tasks);
      setIsLoading(false);
    }, 500);
  }, [months]);
  
  // Filter tasks by category
  const filteredTasks = React.useMemo(() => {
    if (categoryFilter === 'all') {
      return upcomingTasks;
    }
    
    return upcomingTasks.map(monthData => ({
      ...monthData,
      tasks: monthData.tasks.filter(task => task.category === categoryFilter)
    })).filter(monthData => monthData.tasks.length > 0);
  }, [upcomingTasks, categoryFilter]);
  
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Loading Gardening Calendar</h2>
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-primary mb-4">
          Gardening Calendar
          <span className="badge badge-accent">{months} months</span>
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium my-auto mr-2">Filter:</span>
          {categories.map(category => (
            <button
              key={category}
              className={`badge badge-outline ${categoryFilter === category ? 'badge-primary' : ''}`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No tasks found for the selected category.</span>
          </div>
        ) : (
          filteredTasks.map((monthData, index) => (
            <MonthlyTasks 
              key={monthData.month}
              monthData={monthData}
              expanded={index === 0} // Expand the current month by default
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GardeningCalendar;
```

### 5. Create Seasonal Overview Component

Create a component that shows an overview of the current gardening season:

```jsx
// src/components/garden/SeasonalOverview.jsx
import React from 'react';

const SeasonalOverview = () => {
  // Determine current season based on month
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-indexed (1 = January, 12 = December)
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };
  
  // Season-specific data
  const seasonData = {
    spring: {
      title: 'Spring Gardening',
      description: 'Spring is the busy planting season in Ireland as soil warms up and day length increases. Focus on preparing beds, sowing hardy crops, and protecting tender plants from late frosts.',
      keyTasks: [
        'Prepare soil by incorporating compost',
        'Plant early potatoes around St. Patrick\'s Day',
        'Sow hardy vegetables like peas, carrots, and spinach',
        'Start tender crops indoors',
        'Begin slug and snail control'
      ],
      tips: [
        'Watch out for late frosts - keep fleece handy',
        'Use cloches to warm soil before sowing',
        'Start a compost bin if you don\'t have one',
        'Plant native wildflowers to support pollinators'
      ],
      seasonColor: 'success'
    },
    summer: {
      title: 'Summer Gardening',
      description: 'Summer is the main growing season with long days and warmer temperatures. Focus on watering, harvesting, and succession planting to keep your garden productive.',
      keyTasks: [
        'Harvest early crops regularly',
        'Water consistently, especially during dry spells',
        'Continue succession sowing of salad crops',
        'Feed fruiting vegetables with high-potash fertilizer',
        'Watch for pests and diseases in warm weather'
      ],
      tips: [
        'Conserve water by mulching and using water butts',
        'Harvest in early morning for best flavor',
        'Support heavy crops like tomatoes and cucumbers',
        'Monitor for potato blight in warm, humid conditions'
      ],
      seasonColor: 'warning'
    },
    autumn: {
      title: 'Autumn Gardening',
      description: 'Autumn is harvest time and preparation for winter. Focus on collecting and storing crops, planting for spring, and improving soil for next year.',
      keyTasks: [
        'Harvest and store main crops',
        'Plant garlic and autumn onion sets',
        'Sow green manures on empty beds',
        'Plant spring bulbs and bare-root fruit trees',
        'Collect fallen leaves for leaf mould'
      ],
      tips: [
        'Clean and store garden tools properly',
        'Protect winter crops from pests and weather',
        'Plant native hedging for wildlife',
        'Save seeds from open-pollinated varieties'
      ],
      seasonColor: 'error'
    },
    winter: {
      title: 'Winter Gardening',
      description: 'Winter is the planning season with minimal growth. Focus on planning next year\'s garden, maintaining structures, and protecting vulnerable plants from harsh conditions.',
      keyTasks: [
        'Plan crop rotation for next year',
        'Prune dormant fruit trees and bushes',
        'Protect tender plants from frost',
        'Check stored produce regularly',
        'Maintain garden structures and tools'
      ],
      tips: [
        'Order seeds early for best selection',
        'Use winter to clean and sharpen tools',
        'Add organic matter to heavy soils',
        'Keep off soil in wet conditions to prevent compaction'
      ],
      seasonColor: 'info'
    }
  };
  
  const season = getCurrentSeason();
  const data = seasonData[season];
  
  return (
    <div className={`card bg-${data.seasonColor}/5 shadow-xl`}>
      <div className="card-body">
        <h2 className={`card-title text-${data.seasonColor}`}>{data.title}</h2>
        <p className="text-sm mb-4">{data.description}</p>
        
        <div className="divider">Key Tasks</div>
        <ul className="list-disc list-inside space-y-1 mb-4">
          {data.keyTasks.map((task, index) => (
            <li key={index} className="text-sm">{task}</li>
          ))}
        </ul>
        
        <div className="divider">Seasonal Tips</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.tips.map((tip, index) => (
            <div key={index} className={`alert alert-${data.seasonColor} p-2`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalOverview;
```

### 6. Create a Garden Planner Page

Create an Astro page that integrates the seasonal gardening components:

```astro
---
// src/pages/garden-planner.astro
import Layout from '../layouts/Layout.astro';
import GardeningCalendar from '../components/garden/GardeningCalendar';
import SeasonalOverview from '../components/garden/SeasonalOverview';
---

<Layout title="Seasonal Garden Planner">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2 text-center">Irish Seasonal Garden Planner</h1>
    <p class="text-center text-base-content/70 mb-8 max-w-2xl mx-auto">
      Plan your gardening activities throughout the year with our seasonal planner tailored to Irish growing conditions.
    </p>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <SeasonalOverview client:load />
        
        <div class="card bg-base-100 shadow-xl mt-6">
          <div class="card-body">
            <h3 class="font-bold text-lg">Irish Gardening Resources</h3>
            <div class="py-2">
              <ul class="menu bg-base-200 rounded-box">
                <li>
                  <a href="https://www.giy.ie/" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Grow It Yourself (GIY)
                  </a>
                </li>
                <li>
                  <a href="https://www.teagasc.ie/crops/horticulture/gardening/" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Teagasc Gardening Advice
                  </a>
                </li>
                <li>
                  <a href="https://www.rhs.org.uk/" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Royal Horticultural Society
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lg:col-span-2" id="calendar-container">
        <GardeningCalendar client:load months={4} />
      </div>
    </div>
  </main>
</Layout>
```

## Testing

To validate that this phase is working correctly:

1. Verify the Garden Planner page loads correctly
2. Check that the Seasonal Overview displays:
   - The current season based on the current date
   - Season-specific gardening tasks and tips
   - Appropriate color scheme for the current season
3. Check that the Gardening Calendar displays:
   - Upcoming months starting with the current month
   - Tasks grouped by month with the current month expanded
   - Proper task categories and priorities with color coding
4. Test the Calendar's filtering functionality:
   - Click different category filters
   - Verify that tasks are filtered correctly
   - Test the "all" category to show all tasks
5. Test the Monthly Tasks component:
   - Click to expand/collapse months
   - Verify that all tasks display correctly
   - Check that task cards show proper information and styling

## Next Steps

After successfully implementing this phase, you'll have a comprehensive seasonal planner for Irish gardeners. The next phase will focus on:

1. Creating a sustainability tracking system to help gardeners measure their environmental impact
2. Implementing user accounts to save garden plans and preferences
3. Adding educational resources about sustainable gardening practices
