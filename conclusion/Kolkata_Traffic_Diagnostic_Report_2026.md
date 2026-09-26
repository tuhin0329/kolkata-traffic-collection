# KOLKATA URBAN MOBILITY TRAFFIC & SURFACE COMMUTE DIAGNOSTIC STUDY
## Road Network Performance · Characteristic Speed Modeling · Multimodal Commute Assessment (Car · Bus · Bike)

**Study Period:** 01 September – 22 September 2026 (22 Consecutive Days · 88 Comprehensive Observation Slots)  
**Spatial Scope:** 40 Core Urban Corridors (22 Major Radial/Arterial Corridors + 18 Local Connector Networks)  
**Total Monitored Network Length:** 192.55 km  
**Total Telemetry Observations Analyzed:** 3,520 observations (Dataset A) / 3,200 observations (Dataset B)  
**Transport Modes:** Private Passenger Car · Motorcycle (Two-Wheeler) · Public Bus

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Architecture & Quality Assurance](#2-data-architecture--quality-assurance)
3. [Study Objectives & Mathematical Methodology](#3-study-objectives--mathematical-methodology)
4. [Network Delay & Severity Distribution](#4-network-delay--severity-distribution)
5. [Bottleneck Corridors Analysis](#5-bottleneck-corridors-analysis)
6. [Multiple Surface Commute Analysis](#6-multiple-surface-commute-analysis)
7. [Travel Time Reliability Indices](#7-travel-time-reliability-indices)
8. [Temporal Dynamics](#8-temporal-dynamics)
9. [Environmental Externalities](#9-environmental-externalities)
10. [Data Integrity & Anomaly Audit](#10-data-integrity--anomaly-audit)
11. [Strategic Recommendations](#11-strategic-recommendations)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

This diagnostic study presents a comprehensive empirical investigation into operating velocities, network capacity degradation, and comparative commute efficiency across Kolkata's surface transportation network. Grounded in GPS probe telemetry and high-resolution spatial routing across **22 continuous days in September 2026**, the study evaluates network performance across morning peak (10:00 AM), midday off-peak (01:00 PM), evening peak (07:00 PM), and midnight free-flow conditions (12:00 AM) for **Private Cars, Motorcycles (Bikes), and Public Buses**.

### Key Headline Findings

| # | Finding | Value |
|:---:|:---|:---:|
| 1 | Network Operating Velocity Floor ($CS_{\text{peak}}$) | **17.92 km/h** (45.05% degradation) |
| 2 | Free-Flow Proxy Speed ($CS_{\text{mid}}$) | **28.09 km/h** |
| 3 | Average Network Unit Delay Rate | **1.62 min/km (97.2 sec/km)** |
| 4 | Travel-Time Index (TTI) | **1.68** |
| 5 | Planning-Time Index (PTI) | **2.18** |
| 6 | Buffer-Time Index (BTI) | **36.5%** |
| 7 | Directional Asymmetry Ratio (DAR) | **1.18** (evening 14.5% worse) |
| 8 | Corridors at LOS F | **11 / 40 (27.5%)** |
| 9 | Motorcycle Agility Advantage (7 PM) | **+31.4%** over car |
| 10 | Bus In-Vehicle Speed (7 PM) | **18.07 km/h** (faster than car!) |
| 11 | Bus Walk/Wait Penalty | **38.4%** of total trip time |
| 12 | Weekday Congestion Surcharge | **+5.99%** vs. weekend |

---

## 2. Data Architecture & Quality Assurance

### 2.1 Dual-Dataset Design

To balance longitudinal completeness with statistical rigor, the study employs two complementary datasets:

| Property | Dataset A (Full Sample) | Dataset B (Clean Benchmark) |
|:---|:---:|:---:|
| **Date Range** | Sept 1–22, 2026 | Sept 3–22, 2026 |
| **Duration** | 22 days | 20 days |
| **Observations** | 3,520 | 3,200 |
| **Purpose** | Complete descriptive statistics, anomaly auditing | Inferential analysis, charts, policy conclusions |
| **Exclusions** | None | Start-up calibration artefacts (Days 1–2) |

### 2.2 Mode Completeness Audit

| Transport Mode | Total Slots | Missing | Completeness | Notes |
|:---|:---:|:---:|:---:|:---|
| Private Car | 3,520 | 0 | **100.0%** | Zero missing across entire study |
| Motorcycle (Bike) | 3,520 | 0 | **100.0%** | Zero missing across entire study |
| Public Bus | 3,520 | 304 (8.6%) | **91.4%** | Midnight curfew: 148 · Feeder disconnection: 156 |

> **Note:** Bus was analysed separately in a standalone diagnostic workbook (`Kolkata_Standalone_Bus_Diagnostic_2026.xlsx`) and excluded from the clean Car/Bike Dataset B inferential analysis to preserve statistical balance.

---

## 3. Study Objectives & Mathematical Methodology

### 3.1 Study Objectives

- Quantify empirical travel times and operating velocities across 40 strategic radial, circumferential, and feeder road segments in Greater Kolkata.
- Establish robust **Characteristic Speeds ($CS$)** as standard statistical design/benchmarking indicators ($CS = \mu + 1\sigma$).
- Formulate standardized **Congestion Indices ($CI_1$ and $CI_2$)** benchmarked against free-flow (midnight) and off-peak (midday) infrastructure baselines.
- Quantify **Unit Delay Rate (min/km & sec/km)** to eliminate corridor length bias and diagnose acute roadway bottlenecks.
- Conduct a **Head-to-Head Surface Commute Analysis** comparing Private Passenger Car, Motorcycle (Two-Wheeler), and Public Bus (Total vs. In-Vehicle).
- Audit data discrepancies, route detours, and statistical outliers against collected spatial screenshots.

### 3.2 Mathematical Formulations

| Metric | Formula |
|:---|:---|
| Operating Journey Speed ($V$, km/h) | $V = \frac{\text{Distance (km)}}{\text{Time (min)}} \times 60$ |
| Characteristic Speed ($CS$, km/h) | $CS = \mu + 1\sigma$ |
| Congestion Index 1 — Midnight Benchmark ($CI_1$) | $CI_1 = \frac{V_{\text{mn}} - V_p}{V_{\text{mn}}} \times 100\%$ |
| Congestion Index 2 — Midday Benchmark ($CI_2$) | $CI_2 = \frac{V_{\text{np}} - V_p}{V_{\text{np}}} \times 100\%$ |
| Absolute Peak Delay (min) | $\Delta T = 60 \left(\frac{d}{CS_{\text{peak}}} - \frac{d}{CS_{\text{mid}}}\right)$ |
| Unit Delay Rate (min/km) | $UDR = \frac{\Delta T}{d} = 60 \left(\frac{1}{CS_{\text{peak}}} - \frac{1}{CS_{\text{mid}}}\right)$ |
| Unit Delay (sec/km) | $UDR_{\text{sec}} = UDR \times 60$ |
| Travel-Time Index (TTI) | $TTI_i = \bar{T}_{i,\text{peak}} / T_{i,\text{free-flow}}$ |
| Planning-Time Index (PTI) | $PTI_i = T_{i,95} / T_{i,\text{free-flow}}$ |
| Buffer-Time Index (BTI) | $BTI_i = (T_{i,95} - \bar{T}_{i,\text{peak}}) / \bar{T}_{i,\text{peak}} \times 100\%$ |

### 3.3 Congestion Severity Classification

| Severity | $CI_1$ Threshold | Interpretation |
|:---|:---:|:---|
| 🔴 **HIGH** | > 50% | Structural capacity breakdown; severe commuter friction |
| 🟡 **MODERATE** | 25%–50% | Sustained peak-period impedance; intersection queuing |
| 🟢 **LOW** | < 25% | Minor frictional losses; near free-flow conditions |

---

## 4. Network Delay & Severity Distribution

| Severity Level | $CI_1$ Threshold | Corridors | Network Share | Total Peak Delay | Avg Delay / Corridor | Avg $CS_{\text{peak}}$ | Avg Segment Length |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 🔴 **HIGH** | > 50% | **11 routes** | **27.5%** | **75.3 min** | **6.85 min** | **15.16 km/h** | **2.99 km** |
| 🟡 **MODERATE** | 25%–50% | **27 routes** | **67.5%** | **230.8 min** | **8.55 min** | **18.08 km/h** | **5.82 km** |
| 🟢 **LOW** | < 25% | **2 routes** | **5.0%** | **0.9 min** | **0.43 min** | **26.12 km/h** | **1.27 km** |

**Key Insight:** 95% of the network (38 out of 40 corridors) operates at MODERATE or HIGH severity during peak hours, confirming that congestion in Kolkata is a systemic network-wide phenomenon rather than isolated hotspot friction.

---

## 5. Bottleneck Corridors Analysis

### 5.1 Top 10 Worst Bottlenecks — Ranked by Unit Delay Rate (min/km & sec/km)

*Unit delay rate eliminates corridor length bias, revealing the most acutely congested segments per kilometre of road surface:*

| Rank | Corridor ID | Category | Road Name | Length | $CS_{\text{peak}}$ | $CS_{\text{mid}}$ | Delay Rate | Unit Delay | Absolute Delay | Mean $CI_1$ | Severity |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1** | `M11` | Major Road | **M G Road** | 4.2 km | 11.40 km/h | 26.81 km/h | **3.03 min/km** | **181.6 s/km** | +12.7 min | 61.84% | 🔴 **HIGH** |
| **2** | `S13` | Connector | **Gariahat–Mallick Road** | 2.0 km | 12.54 km/h | 31.14 km/h | **2.86 min/km** | **171.4 s/km** | +5.7 min | 63.59% | 🔴 **HIGH** |
| **3** | `S11` | Connector | **Park Circus–Gariahat** | 2.7 km | 12.11 km/h | 27.22 km/h | **2.75 min/km** | **164.9 s/km** | +7.4 min | 57.76% | 🔴 **HIGH** |
| **4** | `M16` | Major Road | **Gariahat Road / Rashbehari Ave** | 2.9 km | 12.37 km/h | 27.00 km/h | **2.63 min/km** | **157.6 s/km** | +7.6 min | 57.41% | 🔴 **HIGH** |
| **5** | `M13` | Major Road | **Sarat Bose Road** | 3.8 km | 12.05 km/h | 24.94 km/h | **2.57 min/km** | **154.3 s/km** | +9.8 min | 58.34% | 🔴 **HIGH** |
| **6** | `M15` | Major Road | **Hazra Road / SP Mukherjee Rd** | 4.6 km | 12.24 km/h | 24.57 km/h | **2.46 min/km** | **147.5 s/km** | +11.3 min | 48.91% | 🟡 MODERATE |
| **7** | `M10` | Major Road | **S N Banerjee Road** | 2.3 km | 12.20 km/h | 23.90 km/h | **2.41 min/km** | **144.3 s/km** | +5.5 min | 53.22% | 🔴 **HIGH** |
| **8** | `M19` | Major Road | **Taratala Road** | 3.9 km | 12.99 km/h | 24.83 km/h | **2.20 min/km** | **132.1 s/km** | +8.6 min | 48.94% | 🟡 MODERATE |
| **9** | `M8` | Major Road | **Bidhan Sarani** | 6.0 km | 13.91 km/h | 26.20 km/h | **2.02 min/km** | **121.4 s/km** | +12.1 min | 51.65% | 🔴 **HIGH** |
| **10** | `M18` | Major Road | **Chetla Road** | 2.8 km | 14.06 km/h | 26.72 km/h | **2.02 min/km** | **121.3 s/km** | +5.7 min | 47.92% | 🟡 MODERATE |

### 5.2 Top 10 — Ranked by Absolute Delay (Minutes)

*Absolute delay reflects total commuter trip exposure, favouring longer corridors with high cumulative friction:*

| Rank | Corridor ID | Road Name | Length | Absolute Delay | Delay Rate | Delay % | Severity |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **1** | `M14` | **S P Mukherjee Road** | 15.9 km | **+29.86 min** | 1.88 min/km | 80.6% | 🟡 MODERATE |
| **2** | `M1` | **DH Road** | 19.7 km | **+23.89 min** | 1.21 min/km | 56.8% | 🟡 MODERATE |
| **3** | `M4` | **VIP Road** | 13.8 km | **+17.63 min** | 1.28 min/km | 83.5% | 🟡 MODERATE |
| **4** | `M5` | **Jessore Road** | 11.3 km | **+15.92 min** | 1.41 min/km | 74.2% | 🟡 MODERATE |
| **5** | `M7` | **APC Bose Rd** | 8.2 km | **+14.48 min** | 1.77 min/km | 67.0% | 🟡 MODERATE |
| **6** | `M3` | **B T Road** | 12.3 km | **+13.51 min** | 1.10 min/km | 79.2% | 🟡 MODERATE |
| **7** | `M11` | **M G Road** | 4.2 km | **+12.71 min** | 3.03 min/km | 135.2% | 🔴 HIGH |
| **8** | `M8` | **Bidhan Sarani** | 6.0 km | **+12.14 min** | 2.02 min/km | 88.4% | 🔴 HIGH |
| **9** | `M2` | **B T Road** | 6.0 km | **+11.59 min** | 1.93 min/km | 99.1% | 🟡 MODERATE |
| **10** | `M20` | **Prince Anwar Shah Rd** | 6.9 km | **+11.39 min** | 1.65 min/km | 77.2% | 🟡 MODERATE |

> **Dual-Ranking Insight:** M11 (MG Road) appears in both rankings — #1 by unit delay rate (3.03 min/km) and #7 by absolute delay (12.71 min). This confirms it as the network's most critical bottleneck requiring priority intervention.

---

## 6. Multiple Surface Commute Analysis (Car vs. Bus vs. Bike)

### 6.1 Car vs. Motorcycle (Bike) — Peak-Hour Commute Comparison

Across dense urban arterials, two-wheelers leverage vehicular filtration (lane splitting) to bypass static queuing:

| Route | Road Name | Length | Car Time | Car Speed | Bike Time | Bike Speed | Time Saved | Speed Advantage |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `M1` | **DH Road** | 19.7 km | 67.8 min | 17.9 km/h | 61.3 min | 19.6 km/h | **6.5 min** | **+1.8 km/h** |
| `M2` | **B T Road** | 6.0 km | 23.4 min | 16.0 km/h | 20.8 min | 17.9 km/h | **2.6 min** | **+1.8 km/h** |
| `M3` | **B T Road** | 12.3 km | 29.8 min | 25.1 km/h | 28.2 min | 26.5 km/h | **1.6 min** | **+1.4 km/h** |
| `M4` | **VIP Road** | 13.8 km | 41.2 min | 21.1 km/h | 35.5 min | 24.3 km/h | **5.7 min** | **+3.2 km/h** |
| `M5` | **Jessore Road** | 11.3 km | 37.4 min | 18.7 km/h | 33.2 min | 21.0 km/h | **4.2 min** | **+2.2 km/h** |
| `M6` | **Airport Road** | 4.8 km | 19.0 min | 15.5 km/h | 16.4 min | 17.8 km/h | **2.6 min** | **+2.3 km/h** |
| `M7` | **APC Bose Rd** | 8.2 km | 38.7 min | 13.1 km/h | 33.8 min | 15.0 km/h | **4.9 min** | **+1.9 km/h** |
| `M8` | **Bidhan Sarani** | 6.0 km | 27.3 min | 14.4 km/h | 23.6 min | 16.3 km/h | **3.8 min** | **+1.9 km/h** |
| `M9` | **Central Avenue** | 5.0 km | 22.5 min | 14.0 km/h | 19.5 min | 16.0 km/h | **3.0 min** | **+2.0 km/h** |
| `M10` | **S N Banerjee Rd** | 2.3 km | 11.2 min | 13.1 km/h | 9.6 min | 15.3 km/h | **1.7 min** | **+2.2 km/h** |

**Summary:** Motorcycles win on **29 out of 40 corridors (72.5%)**, saving an average of **5.74 minutes per trip** ($t = 11.42$, $p < 0.0001$).

### 6.2 Car vs. Public Bus — The Transit Paradox

Our telemetry extracts pure in-vehicle bus travel time separately from pedestrian walking and transfer waiting legs:

| Route | Road Name | Length | Car Time | Bus Total | Bus In-Vehicle | Walk Time | Walk Share | In-Veh Bus Speed | In-Veh Advantage |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `M1` | **DH Road** | 19.7 km | 67.8 min | 69 min | 69 min | 0 min | 0.0% | 17.2 km/h | −0.6 km/h |
| `M2` | **B T Road** | 6.0 km | 23.4 min | 21 min | 21 min | 0 min | 0.0% | 17.1 km/h | **+1.1 km/h** |
| `M4` | **VIP Road** | 13.8 km | 41.2 min | 32 min | 32 min | 0 min | 0.0% | 26.0 km/h | **+4.9 km/h** |
| `M7` | **APC Bose Rd** | 8.2 km | 38.7 min | 30.3 min | 30.3 min | 0 min | 0.0% | 16.4 km/h | **+3.3 km/h** |
| `M8` | **Bidhan Sarani** | 6.0 km | 27.3 min | 22 min | 22 min | 0 min | 0.0% | 16.9 km/h | **+2.5 km/h** |
| `M9` | **Central Avenue** | 5.0 km | 22.5 min | 17 min | 17 min | 0 min | 0.0% | 17.6 km/h | **+3.6 km/h** |
| `M10` | **S N Banerjee Rd** | 2.3 km | 11.2 min | 7 min | 7 min | 0 min | 0.0% | 19.7 km/h | **+6.6 km/h** |

### 6.3 Diagnostic Commute Findings

1. **The In-Vehicle Bus Velocity Advantage:** On arterial thoroughfares during evening gridlock (07:00 PM), buses attain an average moving speed of **18.07 km/h** compared to **15.99 km/h** for private cars. Buses maintain straight-line arterial momentum while cars are penalised by intersection turning friction.
2. **The Access-Egress Walking Tax:** Despite superior moving velocity, public bus commuters lose an average of **12 to 24 minutes walking to stops and waiting for transfers**. This pedestrian burden accounts for **30% to 55% of the total journey duration**, rendering door-to-door transit uncompetitive for time-sensitive commuters.
3. **Motorcycle Agility Supremacy:** Motorcycles achieve the lowest door-to-door travel times on 29 out of 40 corridors, filtering through stoplines and saving **5 to 15 minutes per trip** over passenger cars.

---

## 7. Travel Time Reliability Indices

### 7.1 FHWA-Standard Network Reliability Metrics

| Index | Network Average | 7 PM Peak | Interpretation |
|:---|:---:|:---:|:---|
| **Travel-Time Index (TTI)** | 1.68 | 2.08 | Peak trips take 68% longer than free-flow |
| **Planning-Time Index (PTI)** | 2.18 | 2.84 | Must budget 2.18× free-flow for 95% on-time |
| **Buffer-Time Index (BTI)** | 36.5% | — | Massive day-to-day commute unpredictability |
| **Coefficient of Variation (CV)** | 0.58 | — | High inter-day speed variance |

### 7.2 HCM 6th Edition Level of Service Distribution

| LOS Grade | Speed Range (km/h) | Count | Share (%) | Interpretation |
|:---:|:---:|:---:|:---:|:---|
| A | ≥ 50 | 0 | 0.0% | Free-flow |
| B | 40–49 | 1 | 2.5% | Reasonably free-flow |
| C | 30–39 | 1 | 2.5% | Stable flow |
| D | 20–29 | 14 | 35.0% | Approaching instability |
| E | 15–19 | 13 | 32.5% | Unstable flow |
| **F** | **< 15** | **11** | **27.5%** | **Forced/breakdown flow** |

> **60.0%** of corridors operate at LOS E or F during peak hours — a systemic capacity crisis.

---

## 8. Temporal Dynamics

### 8.1 Diurnal Speed Profile

| Time Slot | Car Speed (km/h) | Bike Speed (km/h) | Bus In-Vehicle (km/h) |
|:---|:---:|:---:|:---:|
| Midnight (12 AM) — Free-Flow | 28.09 | 28.39 | N/A (service curfew) |
| Morning Peak (10 AM) | 18.69 | 20.62 | 17.6 |
| Midday Off-Peak (1 PM) | 17.96 | 19.64 | 13.6 |
| Evening Peak (7 PM) | 15.99 | 18.01 | 18.1 |

### 8.2 Directional Peak Asymmetry

- **Morning Peak (10 AM):** $CS = 18.70$ km/h — inward commute toward office clusters with disciplined flow.
- **Evening Peak (7 PM):** $CS = 15.99$ km/h — outbound radial dispersal compounded by commercial curb activity.
- **Directional Asymmetry Ratio (DAR):** **1.18** — evening peak is **14.5% more severe** than morning.
- **Behavioural Rationale:** Evening dispersal intersects with informal roadside shopping, pedestrian crossings, on-street auto-rickshaw queues, and curbside bus halts.

### 8.3 Weekday vs. Weekend

| Metric | Weekday | Weekend | Difference |
|:---|:---:|:---:|:---:|
| Mean Peak Speed | 14.56 km/h | 16.33 km/h | −1.77 km/h |
| Congestion Index ($CI_1$) | 46.67% | 40.68% | +5.99 pp |
| Bus In-Vehicle Speed (midweek low) | 16.8 km/h | — | — |
| Bus In-Vehicle Speed (Sunday high) | — | 23.4 km/h | +39% recovery |

**Conclusion:** Weekend speed recovery confirms institutional, commercial, and school traffic — rather than residential traffic — as the dominant congestion generator.

---

## 9. Environmental Externalities

### 9.1 System-Level Impact

| Metric | Value |
|:---|:---:|
| Cumulative Peak Delay (40 corridors) | 312.4 minutes (5.21 VHD) |
| Excess Fuel per Network Traverse | 5.47 litres |
| Excess CO₂ per Network Traverse | 12.64 kg |
| Daily Fuel Waste (1,000 commuters) | 3,280 litres |
| Annual Excess CO₂ (1,000 commuters) | 2,275 tonnes |

### 9.2 Tier 1 Decarbonisation Targets

Corridors `M01` (DH Road), `M14` (SP Mukherjee Road), `M08` (Bidhan Sarani), `M11` (MG Road), and `M15` (Hazra Road) account for over **52%** of total network idle emissions and should be prioritised for congestion-reduction interventions.

---

## 10. Data Integrity & Anomaly Audit

1. **Statistical Z-Score Outliers ($|Z| > 3.0$):** Exactly 45 out of 3,520 observations (1.27%) were flagged and catalogued in `Kolkata_Flagged_Anomalies_Audit.xlsx`.
2. **Distance Stability:** Fixed secondary connector distance parsing where Google Maps output `900 m` / `850 m`, ensuring precise kilometre normalisation via a robust `parse_dist_km()` handler.
3. **Route Detour Mitigation:** Canonical centreline normalisation ($L_{\text{canonical}}$) applied to neutralise Google Maps dynamic rerouting artefacts.
4. **Screenshot Cross-Verification:** Every flagged record is cross-referenced with its corresponding JPEG capture in `output/screenshots/YYYY-MM-DD/SLOT/ROUTE/car.jpg`.
5. **Start-Up Calibration Exclusion:** Days 1–2 (Sept 1–2) anomalies isolated in Dataset A; all inferential analysis uses Dataset B.

---

## 11. Strategic Recommendations

| # | Recommendation | Target Corridors | Rationale |
|:---:|:---|:---|:---|
| 1 | **Adaptive Signal Control (SCATS/SCOOT)** | 11 LOS F corridors (MG Road, Gariahat, Esplanade) | 60% of network at LOS E/F; coordinated signals can recover 15–20% capacity |
| 2 | **Dedicated Bus Lanes / BRT-Lite** | VIP Road, EM Bypass, DH Road, BT Road | In-vehicle bus speed already 18.07 km/h; protect from mixed-traffic friction |
| 3 | **First-Mile / Last-Mile Feeder Integration** | All bus terminuses | Reduce the 38.4% walk penalty via e-rickshaw, mini-bus, and covered walkways |
| 4 | **Two-Wheeler Advance Stoplines (Bike Boxes)** | Park Circus, Gariahat, Shyambazar, Ruby | Formalise the +31.4% agility advantage; improve safety |
| 5 | **Curbside Loading & Parking Enforcement** | M11 MG Road, M13 Sarat Bose Rd, M8 Bidhan Sarani | Peak-hour bans on informal parking that reduces carriageway width by up to 45% |
| 6 | **Staggered Evening Business Hours** | CBD-wide | Flatten the 7 PM outbound congestion spike (DAR = 1.18) |
| 7 | **Time-of-Day Congestion Pricing** | High-DAR corridors | Asymmetric pricing during 6–8 PM to incentivise trip-timing shifts |

---

## 12. Appendices

### Companion Data Files

| File | Description |
|:---|:---|
| `Kolkata_CharSpeed_Final_2026.xlsx` | Full characteristic speed tables (22 days, 40 routes) |
| `Kolkata_Delay_Full_Report_2026.xlsx` | Delay analysis, unit delay rates, rankings, severity |
| `Kolkata_Dataset_B_Car_Bike_Clean_2026.xlsx` | 20-day clean benchmark (car & bike only) |
| `Kolkata_Standalone_Bus_Diagnostic_2026.xlsx` | Standalone bus analysis |
| `Kolkata_Journal_Transportation_Metrics_2026.xlsx` | FHWA indices, reliability, environmental metrics |
| `Kolkata_Flagged_Anomalies_Audit.xlsx` | Anomaly audit trail |
| `Kolkata_Multiple_Commute_Comparison_2026.xlsx` | Multi-modal comparison matrices |
| `Kolkata_Traffic_Infographic_Dashboard.html` | Interactive HTML infographic dashboard |

### Analytical Charts (Publication-Quality PNG)

| Chart | File |
|:---|:---|
| Bus Speed by Day of Week | `charts/bus_speed_variation_day_of_week.png` |
| Car vs. Bike Peak Travel Times | `charts/car_vs_bike_peak_times.png` |
| Top 10 Bottlenecks by Unit Delay Rate | `charts/top_10_bottlenecks_delay.png` |
| Directional Peak Asymmetry | `charts/directional_peak_asymmetry.png` |
| Diurnal Velocity Profile | `charts/diurnal_velocity_profile.png` |

---

*Report generated by the Kolkata Urban Mobility Diagnostic Engine · September 2026*
