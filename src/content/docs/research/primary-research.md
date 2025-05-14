---
title: "Primary Research"
description: "Primary Research documentation"
category: "research"
---

## Research Findings: Problem Domains & Data Resources

Our research has identified several high-priority domains aligned with Ireland's National AI Strategy, each supported by valuable data resources:

| **Domain** | **Key Challenges** | **Primary Data Sources** |
|------------|--------------------|-----------------------|
| **Agriculture** | Crop disease management, soil health monitoring, sustainable farming | data.gov.ie, Teagasc, EPA |
| **Health** | Disease prevention, telemedicine, mental health support | HSE, CSO, World Bank Open Data |
| **Housing** | Affordable housing, energy efficiency, homelessness prevention | housingagency.ie, CSO |
| **Environment** | Climate change mitigation, pollution control, biodiversity conservation | EPA, CSO, SEAI |
| **Transport** | Traffic optimization, sustainable mobility, road safety | Transport Infrastructure Ireland, Eurostat |
| **Economy & Finance** | Economic forecasting, small business support, financial inclusion | data.worldbank.org, CSO, Tech Ireland |

### Most ML/AI-Ready Data Resources

Based on comprehensive analysis, the following data sources offer the most machine learning-ready datasets with evidence-based rationale for potential AI applications:

1. **Central Statistics Office (CSO)**
   - Accessible via: [https://www.cso.ie/](https://www.cso.ie/) and [https://data.cso.ie/](https://data.cso.ie/)
   - Features: Well-structured time-series data through PxStat API
   - **Potential AI Topics & Evidence**:
     
     - **Demographic forecasting and population trend analysis**
       - *Data Evidence*: CSO provides comprehensive Census 2022 data available through PxStat with detailed population statistics at various geographical levels (county to Small Area level).
       - *Sample Data*: Population by age group, gender, nationality, and geographic region across multiple census periods enables trend detection and prediction.
       - *Reference*: https://www.cso.ie/en/statistics/population/
     
     - **Housing market trend analysis and prediction**
       - *Data Evidence*: The CSO Housing and Households section contains time-series data on housing completions, planning permissions, and prices.
       - *Sample Data*: New dwelling completions by quarter, house price indices, rental prices, and planning permissions.
       - *Reference*: https://www.cso.ie/en/statistics/housingandhouseholds/
     
     - **Labor market dynamics modeling**
       - *Data Evidence*: The Labour Force Survey (LFS) provides quarterly data on employment, unemployment, and labor force participation.
       - *Sample Data*: Employment status by sector, occupation, age, gender, and region with seasonality patterns.
       - *Reference*: https://www.cso.ie/en/statistics/labourmarket/
     
     - **Public health trend analysis**
       - *Data Evidence*: Health statistics section provides data on health status, healthcare utilization, and health behaviors.
       - *Sample Data*: Irish Health Survey data on chronic conditions, healthcare access, and health behaviors by demographic group.
       - *Reference*: https://www.cso.ie/en/statistics/health/
     
     - **Crime pattern analysis and prediction**
       - *Data Evidence*: Recorded Crime statistics with quarterly updates on different types of offenses.
       - *Sample Data*: Crime incidents by type, region, and time period, enabling spatial-temporal pattern analysis.
       - *Reference*: https://www.cso.ie/en/statistics/crimeandjustice/

2. **Environmental Protection Agency (EPA)**
   - Accessible via: [https://www.epa.ie/our-services/monitoring--assessment/](https://www.epa.ie/our-services/monitoring--assessment/)
   - Features: Environmental monitoring data with temporal and geospatial dimensions
   - **Potential AI Topics & Evidence**:
     
     - **Air quality prediction models**
       - *Data Evidence*: The EPA maintains the National Ambient Air Quality Monitoring Network with real-time air quality data.
       - *Sample Data*: Measurements of particulate matter (PM2.5, PM10), nitrogen dioxide (NO2), ozone (O3), and other pollutants at monitoring stations across Ireland with hourly updates.
       - *Reference*: https://www.epa.ie/environment-and-you/air/
     
     - **Water quality monitoring and forecasting**
       - *Data Evidence*: The EPA conducts regular water quality assessments for rivers, lakes, and groundwater.
       - *Sample Data*: Chemical and biological parameters for water bodies, including nutrient levels, pH, dissolved oxygen, and biological indices.
       - *Reference*: https://www.epa.ie/our-services/monitoring--assessment/freshwater--marine/
     
     - **Waste management optimization**
       - *Data Evidence*: The EPA collects data on waste generation, recovery, and disposal across different sectors.
       - *Sample Data*: Municipal waste generation rates, recovery percentages, and landfill statistics by region and waste type.
       - *Reference*: https://www.epa.ie/our-services/monitoring--assessment/waste/
     
     - **Climate change impact modeling**
       - *Data Evidence*: The EPA maintains greenhouse gas emissions inventories and projections.
       - *Sample Data*: Historical and projected emissions by sector (energy, agriculture, transport, etc.) with annual time series.
       - *Reference*: https://www.epa.ie/our-services/monitoring--assessment/climate-change/

3. **data.gov.ie (Irish Open Data Portal)**
   - Accessible via: [https://data.gov.ie/](https://data.gov.ie/)
   - Features: 10,000+ datasets with standardized metadata and DCAT compliance
   - **Potential AI Topics & Evidence**:
     
     - **Cross-domain data integration**
       - *Data Evidence*: The portal organizes datasets across 15 themes including Agriculture, Health, Transport, and Environment.
       - *Sample Data*: Datasets with common geographic identifiers (county codes, Eircode) enable cross-domain analysis.
       - *Reference*: https://data.gov.ie/dataset
     
     - **Agricultural resource management**
       - *Data Evidence*: Agricultural datasets available under the Agriculture theme include land use, crop production, and livestock.
       - *Sample Data*: Land parcel identification system data, organic farm registrations, and livestock disease monitoring.
       - *Reference*: https://data.gov.ie/dataset?theme=Agriculture
     
     - **Public health intervention targeting**
       - *Data Evidence*: Health datasets include health service locations, disease prevalence, and healthcare utilization.
       - *Sample Data*: COVID-19 statistics, hospital waiting lists, and health service directories with geographic coordinates.
       - *Reference*: https://data.gov.ie/dataset?theme=Health
     
     - **Transport planning optimization**
       - *Data Evidence*: Transport datasets include traffic counts, public transport schedules, and road network information.
       - *Sample Data*: Real-time passenger information, traffic volume data, and cycling infrastructure mapping.
       - *Reference*: https://data.gov.ie/dataset?theme=Transport

4. **Sustainable Energy Authority of Ireland (SEAI)**
   - Accessible via: [https://www.seai.ie/data-and-insights/](https://www.seai.ie/data-and-insights/)
   - Features: Energy consumption data ideal for forecasting models
   - **Potential AI Topics & Evidence**:
     
     - **Renewable energy output prediction**
       - *Data Evidence*: SEAI publishes detailed renewable energy statistics in the "Renewable Energy in Ireland" report.
       - *Sample Data*: Wind energy generation capacity and output, solar PV installation data, and bioenergy production statistics.
       - *Reference*: https://www.seai.ie/data-and-insights/national-energy-publications/
     
     - **Building energy rating prediction**
       - *Data Evidence*: SEAI maintains the national Building Energy Rating (BER) database with over 1 million assessments.
       - *Sample Data*: Building characteristics (age, size, construction type) paired with energy performance ratings (A-G scale).
       - *Reference*: https://www.seai.ie/data-and-insights/seai-statistics/ber-statistics/
     
     - **Energy consumption forecasting**
       - *Data Evidence*: "Energy in Ireland" report provides detailed energy consumption by sector and fuel type.
       - *Sample Data*: Time series of energy consumption by sector (residential, commercial, industrial, transport) with seasonal patterns.
       - *Reference*: https://www.seai.ie/data-and-insights/energy-data-portal/
     
     - **Carbon footprint reduction modeling**
       - *Data Evidence*: SEAI's CO₂ emissions reports detail emissions factors for different energy sources.
       - *Sample Data*: Carbon intensity of different fuels, emissions by sector, and energy-related CO₂ emissions time series.
       - *Reference*: https://www.seai.ie/data-and-insights/national-energy-publications/

5. **Transport Infrastructure Ireland (TII)**
   - Accessible via: [https://data.tii.ie/](https://data.tii.ie/)
   - Features: Real-time traffic data through API access
   - **Potential AI Topics & Evidence**:
     
     - **Traffic flow prediction**
       - *Data Evidence*: TII provides traffic count data from a network of traffic monitoring units across national roads.
       - *Sample Data*: Vehicle counts by type (car, LGV, HGV), speed data, and temporal patterns (hourly, daily, seasonal).
       - *Reference*: https://data.tii.ie/Datasets/TrafficCount/
     
     - **Accident hotspot prediction**
       - *Data Evidence*: TII collects data on road incidents and safety through the PULSE system.
       - *Sample Data*: Collision locations, severity, weather conditions, and contributing factors enable spatial-temporal analysis.
       - *Reference*: https://data.tii.ie/Datasets/RoadSafety/
     
     - **Infrastructure maintenance scheduling**
       - *Data Evidence*: TII maintains pavement condition surveys and road asset inventory data.
       - *Sample Data*: Road surface condition metrics, asset age, usage intensity, and maintenance history enable predictive modeling.
       - *Reference*: https://data.tii.ie/Datasets/RoadNetwork/

## SDG-Focused Dataset Recommendations

For teams focused on specific Sustainable Development Goals, we provide evidence-based recommendations:

- **Climate Action (SDG 13)**: 
  - **EPA's air quality monitoring data**
    - *Data Evidence*: Real-time measurements from the National Ambient Air Quality Monitoring Network
    - *Sample Data*: Particulate matter (PM2.5, PM10), NO2, and O3 levels with hourly readings from stations nationwide
    - *Reference*: https://www.epa.ie/environment-and-you/air/
  
  - **SEAI's energy consumption time series**
    - *Data Evidence*: National energy balance with breakdown by sector and fuel type
    - *Sample Data*: Annual energy consumption by sector with 10+ year historical trends
    - *Reference*: https://www.seai.ie/data-and-insights/national-energy-balance/
  
  - **Potential Topics**: Carbon footprint modeling, renewable energy transition planning, climate impact prediction models

- **Clean Water (SDG 6)**: 
  - **EPA's water quality monitoring data**
    - *Data Evidence*: Water Framework Directive monitoring program data
    - *Sample Data*: Chemical and ecological status of water bodies with geographic coordinates
    - *Reference*: https://www.epa.ie/our-services/monitoring--assessment/freshwater--marine/
  
  - **Marine Institute's coastal monitoring**
    - *Data Evidence*: Marine water quality parameters and ocean condition monitoring
    - *Sample Data*: Sea temperature, salinity, nutrient levels, and marine biodiversity indices
    - *Reference*: https://www.marine.ie/Home/site-area/data-services/marine-data-centre
  
  - **Potential Topics**: Water pollution prediction, water treatment optimization, water resource management

- **Sustainable Cities (SDG 11)**: 
  - **CSO's census small area statistics**
    - *Data Evidence*: Census 2022 Small Area Population Statistics (SAPS)
    - *Sample Data*: Population density, housing type, commuting patterns, and demographic profiles at neighborhood level
    - *Reference*: https://www.cso.ie/en/census/
  
  - **BER ratings from SEAI**
    - *Data Evidence*: Building Energy Rating database with geocoded assessments
    - *Sample Data*: Energy performance of buildings by location, type, and age enables spatial analysis
    - *Reference*: https://www.seai.ie/data-and-insights/ber-statistics/
  
  - **Potential Topics**: Urban planning optimization, energy-efficient building design, public space utilization

- **Flood Risk Notification Systems (SDG 11 & 13)**: 
  - **OPW Flood Info Portal**
    - *Data Evidence*: The Office of Public Works (OPW) maintains Ireland's national flood information portal with comprehensive flood risk data
    - *Sample Data*: Interactive flood maps showing risk areas, historical flood events, flood risk management plans, and coastal monitoring data
    - *Reference*: https://www.floodinfo.ie/
  
  - **Met Éireann Weather Data**
    - *Data Evidence*: Ireland's meteorological service provides extensive historical and real-time weather data relevant to flood prediction
    - *Sample Data*: Hourly precipitation data from 25 synoptic stations, historical rainfall patterns, and MÉRA (Met Éireann ReAnalysis) climate datasets
    - *Reference*: https://www.met.ie/climate/available-data/
  
  - **Marine Institute Tide Levels**
    - *Data Evidence*: The Marine Institute's oceanographic data center monitors tidal conditions relevant to coastal flooding
    - *Sample Data*: Tidal predictions and real-time observations of water levels, marine buoy data on wave conditions, and integrated coastal monitoring
    - *Reference*: https://www.marine.ie/Home/site-area/data-services/marine-data-centre
  
  - **Potential Topics**: 
    - **Integrated flood early warning systems**
      - *Reasoning*: Combining OPW flood maps with Met Éireann precipitation forecasts and Marine Institute tidal data to create multi-factor flood risk prediction models with localized notifications.
    
    - **Climate change flood risk projection**
      - *Reasoning*: Utilizing historical flood and weather data alongside climate change projections to model future flood patterns and develop adaptation strategies for vulnerable areas.
    
    - **Smart city flood resilience planning**
      - *Reasoning*: Integrating flood risk data with urban infrastructure information to optimize flood defense investments and develop targeted notification systems for at-risk communities.

- **Zero Hunger/Sustainable Agriculture (SDG 2)**: 
  - **Teagasc National Farm Survey data**
    - *Data Evidence*: Teagasc conducts an annual National Farm Survey (NFS) collecting comprehensive data from 1,000-1,200 farms across Ireland.
    - *Sample Data*: Farm-level financial indicators, cropping programs, yields, environmental practices, and socioeconomic data on farm households.
    - *Reference*: https://www.teagasc.ie/rural-economy/rural-economy/national-farm-survey/
  
  - **CSO agricultural census**
    - *Data Evidence*: The CSO conducts regular agricultural censuses and surveys providing nationwide agricultural statistics.
    - *Sample Data*: Farm size distribution, crop acreage, livestock numbers, farm ownership structures, and agricultural practices by region.
    - *Reference*: https://www.cso.ie/en/statistics/agriculture/
  
  - **Potential Topics**: 
    - **Crop yield prediction models**
      - *Reasoning*: Using Teagasc farm survey data on yields, inputs, and environmental conditions to build prediction models that can help farmers optimize planting and harvesting decisions.
    
    - **Sustainable farming practice optimization**
      - *Reasoning*: Combining CSO data on agricultural practices with environmental impact data to identify optimal combinations of practices that maintain productivity while reducing environmental footprint.
    
    - **Food security planning systems**
      - *Reasoning*: Integrating agricultural production data with population and consumption statistics to model food supply chains and identify vulnerabilities in Ireland's food security system.

- **Good Health (SDG 3)**: 
  - **HSE health statistics**
    - *Data Evidence*: The HSE publishes regular performance reports and health service statistics.
    - *Sample Data*: Service utilization metrics, waiting lists, health outcomes by region, and health service performance indicators.
    - *Reference*: https://www.hse.ie/eng/services/publications/
  
  - **CSO health survey data**
    - *Data Evidence*: The Irish Health Survey provides detailed data on health status, behaviors, and access to services.
    - *Sample Data*: Self-reported health conditions, healthcare access measures, health behaviors (smoking, exercise, diet), and preventive care utilization.
    - *Reference*: https://www.cso.ie/en/statistics/health/
  
  - **Potential Topics**: 
    - **Disease outbreak prediction**
      - *Reasoning*: Using historical disease surveillance data combined with environmental, demographic, and mobility patterns to create early warning systems for disease outbreaks.
    
    - **Healthcare resource allocation optimization**
      - *Reasoning*: Utilizing HSE service utilization data alongside demographic projections to optimize the distribution of healthcare resources across regions and specialties.
    
    - **Personalized preventive health interventions**
      - *Reasoning*: Analyzing health survey data on behaviors and outcomes to develop targeted, personalized preventive health recommendations based on individual risk profiles.

## Conclusion

The Atlantec AI Challenge presents a unique opportunity for participants to develop innovative AI solutions with direct societal impact. By leveraging the rich datasets available from Irish public sector organizations, participants can address pressing challenges aligned with both national priorities and global Sustainable Development Goals.

The evidence-based approach outlined in this document demonstrates that Ireland possesses high-quality, AI-ready data resources across multiple domains. Successful projects will likely combine technical excellence with domain expertise to translate these data assets into practical, ethical AI applications.

We encourage participants to explore these datasets, identify specific problems within these domains, and develop solutions that demonstrate both technical sophistication and real-world applicability.