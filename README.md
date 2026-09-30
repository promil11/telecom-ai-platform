# 📡 AetherTel Enterprise Sales & Hyperlocal Marketing Engine

> **An AI-powered B2B Lead Scoring, Spatial Telemetry, and Omnichannel Geo-Marketing Platform for Telecommunications Operators.**

---

## 🌟 Executive Overview

**AetherTel CorePlatform** is an enterprise-grade telecommunications solution designed to solve two core revenue challenges for telecom operators:

1. **B2B Enterprise Lead Scoring & Proposal Automation:** Ranks corporate accounts (Banks, Mines, Logistics, Healthcare) based on optical fiber proximity, contract renewal windows, and bandwidth demand — and auto-generates 1-Click Executive RFP Proposal Decks in sub-seconds.
2. **B2C Hyperlocal Geo-Marketing & Spatial Telemetry:** Monitors cell towers and footfall density across key urban sectors (Airports, Campuses, Business Districts) to automatically dispatch localized WhatsApp, SMS, or Push offers when footfall thresholds are breached.

---

## 🚀 Key Features & Architectural Pillars

### 1. 🤖 AI B2B Lead Scoring Engine & Proposal Copilot
* **Gradient Boosted Decision Classifier:** 95.4% predictive accuracy trained on enterprise telco datasets.
* **SHAP Explainability Drivers:** Transparent point contributions (+ / -) detailing why an enterprise account scored high or low.
* **Real-Time Score Simulator:** Interactive sliders (Fiber Distance, Contract Expiry, Bandwidth Need, Portal Pings) to simulate deal scores live.
* **📄 AI Proposal & Sales Copilot:** 1-Click executive RFP proposal deck generator with technical architecture specs, 99.999% SLA uptime terms, civil trenching fee waivers, and projected 3-Year customer ROI calculations.

### 2. 🌐 Hyperlocal Geo Engine & GIS Spatial Telemetry
* **Cell Tower Telemetry Radar:** Real-time GIS tracking of active cell tower nodes (5G mmWave, 5G Sub-6, LTE-A) and connected subscriber density.
* **Haversine Spatial Engine:** High-precision distance calculations between device GPS pings and geofences.
* **Geofence Trigger Matrix:** Automated threshold monitoring (e.g. UP Hatfield Student Campus, OR Tambo International Arrivals, Sandton CBD).
* **Traffic Burst Simulator:** Test crowd spikes and observe real-time automated offer dispatches.

### 3. 🛡️ Frequency Capping & Anti-Spam Policy Manager
* **Tower Cooldown Window:** Configurable 24-hour to 72-hour cooldown per device per tower to eliminate duplicate SMS spam.
* **Global Weekly Cap:** Limit total promotional messages per subscriber across all towers per week.
* **Regulatory Quiet Hours:** Automated dispatch queuing during night hours (21:00 PM to 08:00 AM) complying with TRAI, POPIA, and GDPR regulations.
* **Event Dwell Filters:** Trigger rules based on `ON_ENTRY`, `ON_DWELL_15M`, or `ON_EXIT`.

### 4. 💬 Multilingual AI Copy Studio & WhatsApp 2-Way Chatbot Simulator
* **LLM Multilingual Copy Generator:** Generates hyper-localized copy in 10+ South African and global languages (isiZulu, Afrikaans, isiXhosa, English, Sepedi, Setswana, Hindi, French).
* **Channel Formats:** Mobile App Push, SMS Gateway, WhatsApp Business, and Social Ads.
* **💬 Interactive 2-Way WhatsApp Chatbot Simulator:** Authentic mobile WhatsApp interface featuring live typing status, interactive quick-action options (10GB Data Pack, eSIM Travel Pass, Balance Check), smart NLP intent parsing (handles negative statements and cancellations gracefully), and instant transaction receipt cards with USSD activation codes (`*135*29#`).

### 5. 📊 Omnichannel Campaign Analytics
* Real-time tracking of sent, delivered, clicked, and converted users across all channels.
* Total pipeline revenue attribution in South African Rand (ZAR) and weighted forecasts.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, TypeScript, Vite, Lucide Icons, Custom CSS Design System with Light/Dark Mode support.
* **Microservices Backend:** Node.js, Express microservices (`api-gateway`, `lead-scoring-service`, `geo-campaign-service`, `ai-content-service`, `campaign-orchestrator-service`).
* **Database & Persistence:** SQLite / Neon Cloud PostgreSQL.
* **Offline Demo Mode:** Built-in network fallbacks in `apiClient.ts` for zero-downtime client demonstrations.

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js (v18 or higher)
* npm

### Running the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/promil11/telecom-ai-platform.git
   cd telecom-ai-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application (Microservices + Frontend):**
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser.

---

## ☁️ Deployment

### Deploying to Vercel (Recommended)
This repository includes a pre-configured `frontend/vercel.json` for single-page application (SPA) rewrites.

1. Connect your GitHub repository to **[Vercel](https://vercel.com)**.
2. Set Root Directory to `frontend`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Click **Deploy**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
