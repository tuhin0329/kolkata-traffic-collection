# 🚦 Kolkata Diurnal Multi-Modal Traffic & Transit Research Dataset

[![Automated 24/7 Traffic Collection](https://github.com/tuhin0329/kolkata-traffic-collection/actions/workflows/traffic_collector.yml/badge.svg)](https://github.com/tuhin0329/kolkata-traffic-collection/actions/workflows/traffic_collector.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-v22-00D8A2?logo=puppeteer)](https://pptr.dev/)
[![ExcelJS](https://img.shields.io/badge/ExcelJS-Formatted%20Spreadsheets-217346?logo=microsoft-excel)](https://github.com/exceljs/exceljs)

A high-precision, longitudinal urban mobility dataset capturing real-time traffic dynamics, transit competitiveness, and speed variations across **40 major arterial corridors and local connectors in the Kolkata Metropolitan Area**.

---

## 📌 1. Research Objectives & Methodology

This project autonomously collects synchronized, multi-modal travel time and congestion metrics across **4 critical diurnal time slots** every single day:

| Diurnal Slot | Indian Standard Time (IST) | Traffic Regime Classification |
| :--- | :---: | :--- |
| **Slot 1** | `12:00 AM` (Midnight) | Free-flow baseline (Zero congestion) |
| **Slot 2** | `10:00 AM` (Morning Peak) | Inbound commuter rush & commercial peaks |
| **Slot 3** | `01:00 PM` (Afternoon) | Inter-peak baseline & off-peak commercial traffic |
| **Slot 4** | `07:00 PM` (Evening Peak) | Outbound commuter rush & arterial bottlenecks |

---

## 🚗 🚌 🛵 2. Multi-Modal Dimensions Collected

For every single corridor across each time slot, the following empirical parameters are extracted and computed:

1. **Private Automobile (Car)**:
   - Distance ($\text{km}$), Travel Time ($\text{min}$), Average Speed ($\text{km/h}$), and Real-Time Delay Severity (`Good`, `Moderate`, `High`).
2. **Two-Wheeler (Motorcycle/Scooter)**:
   - Dedicated two-wheeler routing distance, travel time, average speed ($\text{km/h}$), and relative time difference vs. private car ($\Delta t$).
3. **Public Transit (Bus)**:
   - True in-vehicle transit time ($\text{min}$), access/egress walking time ($\text{min}$), matched bus routes, and Transit Competitiveness Ratio ($\text{Bus Time} / \text{Car Time}$).
   - **Zero False Walking Filter**: Eliminates walking fallback cards to preserve transit data purity.
4. **Visual Proof & Verification**:
   - Automated 1080p high-definition vector map renders preserved for every route.

---

## 🗺️ 3. Monitored Corridors (40 Strategic Road Networks)

### 🔹 Major Arterial Roads (M1 – M23)
- **M1**: Diamond Harbour Road (Mominpore ➔ Amtala)
- **M2**: B.T. Road (Shyambazar ➔ Dunlop)
- **M3**: B.T. Road Extension (Dunlop ➔ Barrackpore)
- **M4**: VIP Road (Ultadanga ➔ NSCBI Airport)
- **M5**: Jessore Road (Airport ➔ Barasat)
- **M6**: Airport Road (Airport ➔ Dum Dum Station)
- **M7**: A.P.C. Road (Shyambazar ➔ Rabindra Sadan)
- **M8**: Bidhan Sarani (Shyambazar ➔ Esplanade)
- **M9**: Central Avenue / C.R. Avenue (Shyambazar ➔ Esplanade)
- **M10**: S.N. Banerjee Road (Sealdah ➔ Esplanade)
- **M11**: M.G. Road (Sealdah ➔ Howrah Station)
- **M12**: C.I.T. Road (Moulali ➔ Park Circus)
- **M13**: Sarat Bose Road (Beckbagan ➔ Rabindra Sarobar)
- **M14**: S.P. Mukherjee Road (Esplanade ➔ Garia)
- **M15**: Hazra Road / S.P. Mukherjee Connector
- **M16**: Gariahat Road / Rashbehari Avenue
- **M18**: Chetla Road Connector
- **M19**: Tollygunge – Taratala Road
- **M20**: Prince Anwar Shah Road (Tollygunge ➔ Avishikta)
- **M21**: Karunamoyee Road (Salt Lake Sector ➔ Karunamoyee)
- **M22**: Canal South Road (Karunamoyee ➔ Chingrighata)
- **M23**: VIP Road Connector

### 🔸 Local Connector Segments (S1 – S19)
- **S1 – S7**: E.M. Bypass sections (Baishnabghata, Patuli, Highland Park, Ajoy Nagar, Kalikapur, Ruby, Science City, Chingrighata)
- **S8 – S10**: Sealdah, Park Circus & Science City Connectors
- **S11 – S19**: Gariahat, Jadavpur Police Station, Sulekha, Baghajatin, Baishnabghata network loops

---

## ⚙️ 4. Autonomous 24/7 Cloud Architecture
