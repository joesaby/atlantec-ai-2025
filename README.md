# Irish Garden Assistant

An interactive web application built with Astro and React that helps Irish gardeners select suitable plants and implement sustainable gardening practices based on their local conditions.

## 🌱 Features

- **Weather Integration**: Real-time weather data for Irish counties
- **Soil Information**: Detailed soil data by location with recommendations
- **Plant Recommendations**: Personalized plant suggestions based on garden conditions
- **Sustainable Gardening**: Focus on native plants and environmentally friendly practices

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/            # CSS and static assets
│   ├── components/        # React components by category
│   │   ├── common/        # Shared components
│   │   ├── garden/        # Garden-specific components
│   │   ├── plants/        # Plant-related components
│   │   ├── tools/         # Garden tools components
│   │   └── weather/       # Weather-related components
│   ├── content/           # Content collections (plants, tasks, regions)
│   ├── database/          # Database schema and utilities
│   ├── layouts/           # Page layouts
│   ├── pages/             # Astro pages
│   └── utils/             # Utility functions (API clients, helpers)
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev -- --host`          | Starts local dev server at `localhost:4321`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |

## 🛠️ Tech Stack

- [Astro](https://astro.build/) - Web framework for content-focused websites
- [React](https://reactjs.org/) - UI library for interactive components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [daisyUI](https://daisyui.com/) - Component library for Tailwind CSS

## 🌍 Development Phases

The project is being developed in multiple phases:

1. **Phase 1**: Project setup and data integration (weather & soil)
2. **Phase 2**: Plant recommendation system
3. **Phase 3**: Seasonal task management & garden planner
4. **Phase 4**: Sustainable gardening tracking features

## 📝 Development Notes

- Detailed implementation notes can be found in phase markdown files
- UI components follow daisyUI design patterns
- Each feature is developed with both desktop and mobile use in mind
