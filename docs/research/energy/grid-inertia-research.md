# Grid Inertia Research: Public Data Sources and Analysis for Ireland

## Executive Summary

This research document provides a comprehensive analysis of available public data sources from SEAI, ESB, and EirGrid related to grid inertia and renewable energy integration in Ireland. The findings indicate that while neither SEAI nor ESB provides direct grid inertia measurements, EirGrid offers substantial real-time and historical data through its [Smart Grid Dashboard](https://smartgriddashboard.com/) and various other channels that can be used to analyze grid stability and inertia-related metrics.

## Key Findings

1. **EirGrid provides the most comprehensive grid data**, including real-time system information and historical frequency data
2. **Grid inertia data is monitored but not directly public** - it exists within EirGrid's Energy Management System (EMS)
3. **The Predictive Grid Inertia Management System has the highest feasibility** for the Atlantec AI Challenge
4. **Google Cloud Platform offers the best combination** of free credits and ML tools for this project

## 1. Data Source Analysis

### 1.1 EirGrid Data Sources (Primary Grid Operator)

#### Real-time Data
- **[Smart Grid Dashboard](https://smartgriddashboard.com/)** 
  - System demand and generation mix (15-minute intervals)
  - Wind generation output in real-time
  - CO2 intensity and emissions data
  - Interconnector flows
  - System Non-Synchronous Penetration (SNSP) data from 2022 onwards
  - CSV export functionality available

#### Historical Data
- **Frequency data**: Available at 5-second intervals dating back to 2014
- **Generation mix and system demand**: Historical records available
- **Wind generation data**: Comprehensive historical dataset
- **Access methods**: Available through third-party GitHub repositories:
  - [Daniel-Parke/EirGrid_Data_Download](https://github.com/Daniel-Parke/EirGrid_Data_Download)
  - [dclabby/EirgridDashboardAnalysis](https://github.com/dclabby/EirgridDashboardAnalysis)

#### System Inertia Information
- EirGrid's Energy Management System (EMS) monitors system inertia in real-time
- Not directly available to the public but mentioned in operational reports
- Academic collaborations may provide access to this data

### 1.2 SEAI Data Sources (Energy Authority)

SEAI primarily provides:
- National Energy Balance (annual data from 1990)
- Monthly Energy Data Portal
- Renewable energy statistics and projections
- Energy Data Portal with forecasts to 2030

**Note**: SEAI does not provide real-time grid operational data or direct inertia measurements.

### 1.3 ESB Networks Data

ESB Networks offers:
- Distribution network data through Networks for Net Zero program
- Research project data on renewable integration
- Capacity maps for network availability

**Note**: ESB focuses on distribution-level data rather than transmission-level inertia metrics.

## 2. Renewable Energy Data in Ireland

### 2.1 Current Renewable Mix
Based on 2023 data:
- **Wind**: 33.7% of electricity generation (most comprehensive dataset)
- **Solar**: 1.9% of electricity generation
- **Hydro**: 2.2% of electricity generation
- **Biomass**: Small contribution with less granular data

### 2.2 Data Availability by Source
1. **Wind Generation**
   - Real-time and historical output via EirGrid Dashboard
   - Forecast data available
   - Capacity and location information via SEAI reports

2. **Solar Generation**
   - Growing dataset but limited historical data
   - Capacity and location maps available

3. **Other Renewables**
   - Data available through SEAI Energy Balance
   - Less frequent updates compared to wind data

## 3. Grid Inertia Topic Analysis

### 3.1 Predictive Grid Inertia Management System (HIGHEST FEASIBILITY)

**Available Data**:
- System frequency data (5-second intervals)
- Wind generation forecasts and actuals
- System demand forecasts
- SNSP data

**Why It's Most Feasible**:
- Critical data is publicly accessible
- Similar systems implemented in other grids (National Grid ESO)
- Directly addresses Ireland's renewable integration challenges
- Could reduce renewable curtailment significantly

### 3.2 Grid Stability Warning System (HIGH FEASIBILITY)

**Available Data**:
- Real-time frequency measurements
- Rate of Change of Frequency (RoCoF) monitoring
- System event data (with academic collaboration)

**Implementation Considerations**:
- Can be built using public frequency data
- Event detection algorithms can be trained on historical data
- Aligns with EirGrid's operational priorities

### 3.3 Virtual Inertia Solutions (MEDIUM FEASIBILITY)

**Data Challenges**:
- Requires high-resolution frequency measurements (sub-second)
- Grid topology information not fully public
- Technical parameters of generators not publicly available

**Potential Workarounds**:
- Focus on battery storage integration
- Use publicly available frequency data for proof-of-concept
- Collaborate with academic institutions for detailed data

### 3.4 Optimal Dispatch for Inertia Management (MEDIUM FEASIBILITY)

**Data Limitations**:
- Generator technical capabilities are proprietary
- System inertia requirements are defined in operational policies but not publicly detailed
- Cost data for different generation sources not fully available

**Alternative Approach**:
- Use simplified models based on public generation mix data
- Focus on wind curtailment reduction as primary optimization metric

## 4. Academic and Industry Context

### 4.1 Key Research Institutions
- **University College Dublin**: Federico Milano's research group focuses on frequency stability
- **Queens University Belfast**: Battery storage for inertial response research

### 4.2 Notable Industry Projects
- **ESB Moneypoint Synchronous Compensator**: World's largest flywheel (4000MWs of inertia)
- **EirGrid DS3 Programme**: Operating with 75% non-synchronous generation
- **Low Carbon Inertia Services (LCIS)**: Auction system for grid stability services

## 5. Most Valuable Datasets for Atlantec AI Challenge

1. **EirGrid Frequency Data** (5-second intervals)
   - Foundation for all inertia-related analysis
   - Available through GitHub repositories
   - Critical for pattern recognition

2. **Wind Generation Forecasts and Actuals**
   - Essential for correlating renewables with stability
   - Accessible via Smart Grid Dashboard
   - Enables predictive modeling

3. **System Non-Synchronous Penetration (SNSP) Data**
   - Key metric for Irish grid management
   - Available from 2022 onwards
   - Critical for operational boundary understanding

4. **Historical System Events Data**
   - Valuable for anomaly detection training
   - May require academic collaboration
   - Essential for warning system development

5. **DS3 System Services Data**
   - Market mechanisms for stability services
   - Provides economic context
   - Useful for optimization solutions

## 6. Data Access Recommendations

### 6.1 Immediate Actions
1. Download historical frequency data using Daniel-Parke/EirGrid_Data_Download
2. Access Smart Grid Dashboard for recent operational data
3. Export SNSP data for correlation analysis

### 6.2 Collaboration Opportunities
1. Contact UCD's energy research group for high-resolution data
2. Explore research partnerships with EirGrid
3. Engage with ESB Networks' innovation team

## References and Sources

The research findings in this document are supported by multiple sources:

1. **EirGrid Data Sources**:
   - [Smart Grid Dashboard](https://smartgriddashboard.com/) - Real-time grid metrics interface
   - [EirGrid System Information](https://www.eirgrid.ie/grid/real-time-system-information)
   - [EirGrid Group System Information](https://www.eirgridgroup.com/how-the-grid-works/system-information/)

2. **Third-party Data Tools**:
   - [EirGrid Data Download (GitHub)](https://github.com/Daniel-Parke/EirGrid_Data_Download) - Historical frequency data extraction
   - [EirGrid Dashboard Analysis (GitHub)](https://github.com/dclabby/EirgridDashboardAnalysis) - Data analysis scripts

3. **SEAI Resources**:
   - [SEAI Energy Statistics](https://www.seai.ie/data-and-insights/seai-statistics)
   - [SEAI Energy Data Portal](https://www.seai.ie/data-and-insights/seai-statistics/energy-data/)
   - [Renewable Energy in Ireland Report](https://www.seai.ie/data-and-insights/seai-statistics/key-publications/renewable-energy-in-ireland)

4. **ESB Networks**:
   - [Networks for Net Zero Strategy](https://www.esbnetworks.ie/docs/default-source/publications/networks-for-net-zero-strategy-document.pdf)
   - [ESB Availability Capacity Map](https://www.esbnetworks.ie/new-connections/generator-connections-group/availability-capacity-map)

5. **Academic and Technical References**:
   - [Federico Milano's Research Profile](https://www.researchgate.net/profile/Federico-Milano) - UCD frequency stability research
   - [Grid Inertia Introduction](https://reactive-technologies.com/news/introduction-to-inertia/) - Technical overview
   - [Measuring Grid Inertia](https://watt-logic.com/2021/11/05/measuring-grid-inertia/) - Measurement techniques

6. **Industry Projects**:
   - [DS3 Programme Overview](https://www.eirgrid.ie/ds3-programme-delivering-secure-sustainable-electricity-system)
   - [Moneypoint Synchronous Condenser](https://www.siemens-energy.com/global/en/home/stories/irelands-great-grid-stabilizer.html)
   - [Low Carbon Inertia Services](https://www.power-technology.com/news/irelands-eirgrid-awards-contracts/)

## Conclusion

While direct grid inertia measurements are not publicly available, EirGrid provides sufficient proxy data through frequency measurements, SNSP metrics, and renewable generation data to develop meaningful grid inertia analysis tools. The Predictive Grid Inertia Management System represents the most feasible project option for the Atlantec AI Challenge, combining data availability with high impact potential for Ireland's renewable energy transition.