# Phase 1: Project Setup & Data Integration

## Objective

Set up the foundation for the Irish gardening assistant by integrating with Irish-specific data sources like Teagasc soil data and Met.ie weather information.

## Steps

### 1. Astro setup

```bash
npm create astro@latest ./
mv astro-temp/* .
rm -rf astro-temp/
npm install react
npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest
npm fund
```

### 2. Project Structure Setup

Since you already have Astro with daisyUI and Tailwind set up, let's create the folder structure:

```bash
mkdir -p src/components/{common,plants,weather,tools,sustainability}
mkdir -p src/content/{plants,tasks,regions}
mkdir -p src/layouts
mkdir -p src/utils
mkdir -p src/database
```

### 3. Test

```
npm run dev -- --host
```

should get you the following when you open http://localhost:4321/

![./astro-landing.png]
