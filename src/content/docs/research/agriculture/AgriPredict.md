---
title: "AgriPredict for Irish Grassland Farmers Research"
description: "AgriPredict for Irish Grassland Farmers Research documentation"
category: "research"
---

## 1. Challenges for Small Grassland Farmers (Beef, Sheep, Dairy) 

### Fertilizer Use:
- **Rising cost of fertilizer:** N prices surged ~300% during 2022–2023
- **New nitrate limits (2024):** Many farmers now capped at 170 or 220 kg N/ha, depending on region
- **Complexity of rules:** Understanding Teagasc guidelines + compliance is hard without support
- **Lack of precision:** Small farmers often guess based on habit, leading to waste

### Yield Uncertainty:
- **Climate volatility:** Droughts, wet springs, and extreme summers affect grass regrowth
- **Low soil fertility:** Over 50% of Irish soils are below optimum P & K; lime usage often neglected
- **Clover establishment:** Many farms struggle with maintaining clover/multispecies swards

### Economic Pressures:
- Beef/sheep farms earn under €10,000/year on average
- **Dependence on subsidies:** Little margin for wrong decisions or wasted inputs
- **Limited tech access:** Adoption of tools like PastureBase is mostly among dairy, not drystock farms

## 2. Where AgriPredict Can Make the Biggest Difference

| Problem | What AgriPredict Can Do |
|---------|-------------------------|
| Fertilizer waste | Recommend exact N/P/K rate per field using weather + soil data |
| Uncertain yield | Forecast grass growth (kg DM/ha) for next 7 days |
| Soil issues | Suggest lime or clover seeding based on soil type & pH |
| Timing | Alert when to delay fertilizer due to upcoming heavy rain |
| Lack of support | Be a digital assistant for small farmers: simple, visual, mobile-friendly |

## 3. Common Grassland Management Challenges

- **Timing of fertilizer:** Applying too early/late reduces response and increases losses
- **Measuring grass growth:** Only 6% of non-dairy farms use tools like PastureBase
- **Paddock rotation planning:** Suboptimal rest periods hurt regrowth
- **Poor drainage:** Leads to poaching, low growth, and runoff losses
- **Regulatory compliance:** Difficult to track fertilizer application caps manually

## 4. MVP Scope for Hackathon (Feasible in 2–3 Days)

### Inputs:
- User selects county/location (or allows GPS)
- Crop type: "Grass – Grazing" or "Grass – Silage"
- Last fertilizer date + type
- Optional: soil type (dropdown)

### Outputs:
- 7-day grass growth forecast (e.g. "62 kg DM/ha/day expected")
- Smart fertilizer advice:
    - "Spread 20 kg N/ha by Thursday"
    - "Delay application — rain >10 mm forecast"
- Soil alert (e.g. "Soil drainage poor — avoid heavy N this week")

### Stack:
- Frontend: React or simple HTML/CSS
- Backend: Flask or FastAPI
- Model: Light regression model or lookup based on soil + weather
- Map: Leaflet.js or OpenLayers for basic field map or zones

## 5. Free Public Data & APIs to Use

| Source | Data | Use |
|--------|------|-----|
| Met Éireann API | Forecast (rain, temp) | Predict grass growth & fertilizing window |
| Met Éireann Agri JSON | 7-day soil temp & rainfall | Optimize N efficiency & seasonal risk |
| Teagasc Soil Map | Drainage class, soil type | Factor into fertilizer efficiency & risk |
| SoilGrids API | pH, organic C, texture | Support fields with missing soil test data |
| DAFM GeoJSON | 170 vs 220 kg N zones | Show compliance limits for user location |
| CORINE Land Cover | Grassland identification | Contextual mapping for app (background layer) |
| Grass10 Reports (PDF) | Weekly average grass growth | MVP calibration, fallback data source |

## 6. Any Gaps or Risks to Be Aware Of

- No live PastureBase API: Use static/weekly figures from Grass10 for growth model seed
- Soil P index not in public API: Estimate from soil type, or allow user input
- No yield history per field: Assume regional average or let user enter historical info

## Where AI Is Used in AgriPredict

### Grass Growth Prediction (ML Regression or Time Series)
Use weather data, soil type, and fertilizer history to predict grass growth rate (kg DM/ha/day)

**Input features:**
- 7-day rainfall forecast
- Soil temperature
- Soil drainage/pH/class
- Time of year (DOY), pasture type
- Fertilizer type & time since application

**AI model:**
- Simple regression model (Random Forest, XGBoost, or Linear Regression)
- Output: predicted grass growth for next 7 days

### Fertilizer Recommendation Engine (Rule-Aware AI + Optimization)
Given soil fertility, current N use, and predicted growth, suggest optimal N/P/K rate under constraints.

**AI logic layer:**
- If predicted growth > 70 kg DM/day → reduce N
- If P index = 1 and soil wet → increase P, delay N
- Use rule-based logic + probabilistic modifiers
- Optional: Use reinforcement learning over time

### Adaptive Learning (Future Scope)
- Collect local inputs + outcomes as farmers use the app
- Fine-tune prediction models per region, soil, season
- Could evolve into personalized yield & fertilizer AI

### For the Hackathon MVP:
- Basic trained regression model on sample data
- Wrap it in an endpoint like /predict-grass-growth
- Return growth estimate and fertilizer action suggestion
- Highlight that AI = data-informed decisions at farm scale

## APIs & Data Sources

Building the app leverages several public APIs and open datasets:

### Met Éireann Weather Forecast API
- **Data:** Hourly to 10-day forecasts (temperature, rainfall, etc.)
- **Coverage:** National (Ireland)
- **Access:** REST API (no auth)
- **Format:** XML
- **Integration Ease:** High

### Met Éireann Agricultural Data
- **Data:** 7-day soil temp & rainfall for ~25 stations
- **Access:** Public JSON feed
- **Integration Ease:** Very High

### Irish Soil Information System
- **Data:** Detailed soil types with characteristics
- **Coverage:** All of ROI
- **Access:** Open spatial data via EPA GIS services
- **Format:** Geospatial (GIS)
- **Integration Ease:** Moderate

### ISRIC SoilGrids API
- **Data:** Global soil properties at 250m resolution
- **Access:** REST API (open)
- **Format:** JSON
- **Integration Ease:** High

### PastureBase Ireland
- **Data:** Grass growth rates from farms nationwide
- **Access:** No open API but weekly newsletters available
- **Integration Ease:** Moderate to Low

### Fertilizer Guidelines & Nitrates Limits
- **Data:** Recommendations and legal fertilizer limits
- **Access:** Open datasets and documents
- **Format:** CSV/PDF for tables, GeoJSON for maps
- **Integration Ease:** Moderate

### Land Cover & Grassland Data
- **Data:** Land classifications identifying grassland
- **Access:** Open data download / GIS services
- **Format:** Vector polygons or raster
- **Integration Ease:** Moderate

## References

- [Met Éireann Weather Forecast API](https://datacatalogue.gov.ie/dataset/met-eireann-weather-forecast-api)
- [Irish Weather API Docs](https://weather.apis.ie/docs/)
- [Irish Soil Information System](https://data.gov.ie/dataset/irish-soil-information-system-national-soils-map)
- [SoilInfo App | ISRIC](https://www.isric.org/explore/soilinfo)
- [PastureBase Ireland](https://www.teagasc.ie/crops/grassland/pasturebase-ireland/)
- [Teagasc Weekly Newsletter](https://www.teagasc.ie/crops/grassland/grass10/grass10-newsletter/)
- [DAFM Water Quality Map](https://opendata.agriculture.gov.ie/dataset/national-water-quality)
- [Corine Landcover 2018](https://data.gov.ie/dataset/corine-landcover-2018)