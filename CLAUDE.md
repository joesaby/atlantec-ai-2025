# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally

## Code Style Guidelines
- **Framework**: Astro with React components
- **UI Framework**: TailwindCSS with daisyUI for components
- **File Structure**: 
  - React components in src/components/{module}/
  - Astro pages in src/pages/
  - Utility functions in src/utils/
  - Content in src/content/
- **Formatting**: 
  - 2 space indentation
  - Use JSX for React components
  - Use named exports for components
- **Component Style**:
  - Follow daisyUI design patterns and class conventions
  - Use Tailwind utility classes for styling
  - Prefer semantic color names (primary, secondary, etc.)
- **Error Handling**:
  - Use try/catch for API/data fetching
  - Provide user-friendly error states in UI
  - Implement loading states for async operations
- **State Management**:
  - Use React hooks for component state
  - Implement proper data fetching and caching