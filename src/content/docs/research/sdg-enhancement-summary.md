---
title: "UN Sustainable Development Goals Enhancement"
description: "UN Sustainable Development Goals Enhancement documentation"
category: "research"
---

This document summarizes the implementation of additional UN Sustainable Development Goals (SDGs) to the Irish Garden Assistant application's sustainability tracking system.

## Added SDGs

We've extended the sustainability metrics to include the following additional SDGs:

- **SDG 3: Good Health and Well-being**

  - Icon: ❤️
  - Focus: Gardening promotes physical and mental well-being

- **SDG 4: Quality Education**

  - Icon: 📚
  - Focus: Gardens provide learning opportunities and skill development

- **SDG 7: Affordable and Clean Energy**

  - Icon: ⚡
  - Focus: Sustainable gardening reduces energy consumption

- **SDG 8: Decent Work and Economic Growth**

  - Icon: 💼
  - Focus: Local food production creates economic opportunities

- **SDG 9: Industry, Innovation and Infrastructure**

  - Icon: 🔧
  - Focus: Sustainable gardening promotes innovative techniques

- **SDG 14: Life Below Water**
  - Icon: 🌊
  - Focus: Gardening practices that protect water ecosystems

These join the existing SDGs (2, 6, 11, 12, 13, 15) to form a comprehensive sustainability tracking system.

## Implementation Details

### Data Model Updates

1. Added new SDG definitions in `sustainability-metrics.js`
2. Updated the default user progress store in `sustainability-store.js` to track the new SDGs
3. Enhanced the `calculateSDGContributions` function in `carbon-footprint.js` to calculate metrics for new SDGs
4. Modified `calculateFoodGrowingImpact` and `calculateAnnualGardenImpact` to include contributions to new SDGs
5. Ensured the `sdgs` array is properly generated from non-zero SDG contributions

### New Practice Categories

Added seven new practice categories to the sustainable practices database:

1. **Health and Well-being** - Practices focused on physical and mental health benefits of gardening (SDG 3)
2. **Garden Education** - Practices focused on learning and skill development through gardening (SDG 4)
3. **Clean Energy** - Practices focused on energy efficiency and renewable energy (SDG 7)
4. **Garden Economy** - Practices focused on economic benefits of gardening (SDG 8)
5. **Garden Innovation** - Practices focused on innovative techniques (SDG 9)
6. **Water Protection** - Practices focused on protecting water ecosystems (SDG 14)

Each category includes 4 practices with various impact levels.

### UI Component Updates

1. Enhanced `FoodSustainabilityInfo.jsx` to display SDG contributions from specific crops
2. Updated `PlantSustainabilityInfo.jsx` to show top SDG contributions with visual indicators
3. Improved `SustainabilityDashboard.jsx` to group SDGs by category (Planet & Environment, People & Wellbeing, Economy & Innovation)
4. Enhanced `SustainabilityScore.jsx` to show SDG contributions with impact values

## Testing

The implementation was tested to ensure:

1. All 12 SDGs are properly calculated and displayed
2. SDG contributions reflect the appropriate categories and values
3. The UI components properly display the SDGs in an organized, user-friendly way
4. The sustainability tracking system properly handles the expanded set of goals

## Next Steps

1. Consider adding visualization charts to show progress over time for specific SDGs
2. Implement SDG-specific challenges and achievements
3. Create educational content explaining each SDG and how gardening contributes to it
4. Add filtering features to allow users to focus on specific SDGs they want to prioritize
