# 🌾 KisanMitra (किसानमित्र) — Agri Marketplace & Smart Logistics

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_%26_Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Empowering 140M+ Indian Farmers with Direct SuperMart Procurement, AI Crop Diagnostics, Logistics Route Optimization, and Multilingual Voice AI.**

---

## 🌐 Live Application URLs

| Environment | URL | Status |
| :--- | :--- | :--- |
| **🚀 Production / Shared App** | [https://ais-pre-peksjw4proe32du33dpgv4-85681166021.asia-southeast1.run.app](https://ais-pre-peksjw4proe32du33dpgv4-85681166021.asia-southeast1.run.app) | `Live & Operational` |
| **🛠️ Development Preview** | [https://ais-dev-peksjw4proe32du33dpgv4-85681166021.asia-southeast1.run.app](https://ais-dev-peksjw4proe32du33dpgv4-85681166021.asia-southeast1.run.app) | `Active Dev Container` |

---

## 📌 Executive Summary

**KisanMitra** is a full-stack digital agriculture ecosystem built to eliminate middlemen exploitation in India's agricultural supply chain. By directly connecting verified smallholder farmers and Farmer Producer Organizations (FPOs) with commercial supermarts (Reliance Fresh, DMart, BigBasket, Nature's Basket), KisanMitra ensures farmers earn **18%–35% higher farm-gate realizations** while marts secure fresh produce with full traceability.

The platform integrates **Google Gemini 2.5 Flash** for real-time multilingual agronomy advisory, camera-based crop disease diagnosis, dynamic demand forecasting, multi-stop cold-chain logistics routing, and automated Google Workspace pitch deck generation.

---

## ✨ Key Features & Capabilities

### 1. 🚜 Direct Farmer-to-Mart Marketplace
- **Zero Middlemen Exploitation**: Farmers list harvests directly with verified high-resolution images, mandi benchmarking, and organic certifications (PKVY / NCOF).
- **Direct Bulk Bids**: Supermarts post verifiable procurement demands with upfront pricing, escrow guarantees, and automated order fulfillment.
- **Smart Market Demand Matching**: Algorithmic notification center pairing farmer harvests with supermart procurement surges to maximize farm-gate income.

### 2. 🔬 AI Crop Doctor & Visual Diagnostics
- **Multimodal Visual Diagnostics**: Farmers snap or upload crop photos; Gemini 2.5 Flash analyzes lesions, fungal blight, and pest attacks in seconds.
- **Local Remedies & Dosages**: Prescribes both organic bio-controls (Neem oil, Trichoderma) and standard IPM (Integrated Pest Management) protocols in regional languages.

### 3. 🧪 Soil Health & Scientific Agronomy Advisory
- **NPK & Micronutrient Analytics**: Soil test report ingestion with precise fertilizer and bio-fertilizer recommendations.
- **Drone Spray & Irrigation Scheduling**: Tailored climate-resilient water and nutrient scheduling based on soil type (black loamy, red laterite, alluvial).

### 4. 🚚 Multi-Stop Cold-Chain Logistics Optimization
- **Fleet & Capacity Allocation**: Dynamically matches reefer trucks, mini-trucks (Bolero Maxi, Tata Ace), and multi-ton reefers to farm clusters.
- **Route & Mileage Minimization**: Optimizes pick-up sequences across farm gates to reduce transit time and prevent produce degradation.

### 5. 🗣️ Voice-First Regional Accessibility
- **Trilingual Native Support**: Fully localized in **Marathi (मराठी)**, **Hindi (हिंदी)**, and **English**.
- **Speech Synthesis & Recognition**: Web Speech API integration allowing farmers to dictate listings, listen to advisory briefings, and query market prices hands-free.

### 6. 🔐 Multi-Role Authentication & Security
- **Dual Role Architecture**: Seamless toggle and tailored dashboards for **Farmers / FPOs** and **Mart Procurement Buyers**.
- **Flexible Auth**: Instant Mobile OTP login with auto-fill, 4-digit security PIN fallback, and Google Identity / Firebase Authentication.
- **Firestore RBAC**: Strict field-level validation and owner-only access controls enforced via `firestore.rules`.

### 7. 📊 Google Workspace Integration
- **One-Click Slide Deck Export**: Automatically generates investor-ready Google Slides presentations summarizing farm yield metrics, procurement contracts, and escrow histories.

### 8. 📱 Progressive Web App (PWA)
- **Offline Reliability**: Service worker caching for poor network connectivity in remote farm belts.
- **Home Screen Installable**: Native app-like experience on Android, iOS, and desktop browsers.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19 SPA)                     │
│  Tailwind CSS v4 • Motion Animations • Recharts • Lucide • D3 Geo     │
│  Multilingual Voice Engine (Marathi, Hindi, English) • PWA Offline     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS / JSON / FormData
┌────────────────────────────────────▼───────────────────────────────────┐
│                    SERVER LAYER (Express.js on Node 22)                │
│  Security Headers Guard • In-Memory Rate Limiting • Sanitizer Guard    │
│  Proxy Routes (/api/ai/*) • Static Dist Server • Vite Middleware       │
└──────────────┬─────────────────────┬────────────────────┬──────────────┘
               │                     │                    │
   ┌───────────▼───────────┐ ┌───────▼────────┐ ┌─────────▼──────────────┐
   │  Google Gemini 2.5    │ │ Firebase Cloud │ │ Google Workspace /     │
   │  Flash SDK            │ │ Firestore DB & │ │ Identity Services      │
   │  • Crop Diagnostics   │ │ Auth Engine    │ │ • Slides Deck Export   │
   │  • Demand Forecast    │ │ • Strict RBAC  │ │ • OAuth Token Client   │
   │  • Logistics Engine   │ │ • Live Listen  │ │ • User Verification    │
   └───────────────────────┘ └────────────────┘ └────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript 5.8, Vite 6, React DOM 19 |
| **Styling & UI** | Tailwind CSS v4, Motion (Framer Motion), Lucide React, Canvas Confetti |
| **Data Visualization** | Recharts, D3.js (geo & charts), QR Code generator |
| **Backend & Server** | Node.js 22, Express.js 4, tsx runtime |
| **Artificial Intelligence** | `@google/genai` TypeScript SDK (Gemini 2.5 Flash) |
| **Cloud & Database** | Google Cloud Firestore (Rules v2), Firebase Authentication |
| **Workspace & Maps** | Google Slides API, Google Identity Services, `@vis.gl/react-google-maps` |
| **Mobile & Offline** | `vite-plugin-pwa`, Workbox Service Worker |

---

## 📂 Repository File Structure

```text
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            # Structured bug reporting template
│   │   └── feature_request.md       # Feature proposal template
│   ├── PULL_REQUEST_TEMPLATE.md     # Quality checklist for pull requests
│   └── workflows/
│       └── ci.yml                   # Automated GitHub Actions CI workflow
├── public/                          # Static icons, manifest, favicon
├── src/
│   ├── components/                  # 30+ modular React UI components
│   │   ├── AuthGatewayView.tsx      # Dual-role authentication portal
│   │   ├── CropYieldAnalyticsSection.tsx # Yield predictions & charts
│   │   ├── DiseaseDiagnosticsModal.tsx # AI Crop Doctor multimodal scanner
│   │   ├── GoogleSlidesExportModal.tsx # Pitch deck generator
│   │   ├── LogisticsSupportView.tsx # Cold-chain route optimizer
│   │   ├── MarketplaceView.tsx      # Farm-to-mart trade floor
│   │   ├── StockAlertNotificationCenter.tsx # Demand surge alerts
│   │   └── ...                      # Modals, maps, calculators, navbar
│   ├── lib/
│   │   └── firebase.ts              # Firebase app, db, auth initialization
│   ├── services/
│   │   ├── aiService.ts             # Gemini AI API caller (client proxy)
│   │   ├── authService.ts           # Local session & credential manager
│   │   ├── googleAuthService.ts     # Google OAuth / GSI client
│   │   └── slidesExportService.ts   # Google Slides automation
│   ├── types/
│   │   └── index.ts                 # Full TypeScript domain interfaces
│   ├── utils/
│   │   └── stockAlertEngine.ts      # Automated market matching rules
│   ├── App.tsx                      # Root state orchestrator
│   ├── main.tsx                     # React 19 entry point
│   └── index.css                    # Tailwind CSS v4 root stylesheet
├── .env.example                     # Environment variable template
├── firebase-applet-config.json      # Client configuration for Firebase
├── firebase-blueprint.json          # Firestore schema definition
├── firestore.rules                  # Production Firestore security rules
├── index.html                       # HTML5 entry with security metadata
├── metadata.json                    # AI Studio manifest & capabilities
├── package.json                     # NPM packages & build scripts
├── server.ts                        # Express full-stack backend server
├── tsconfig.json                    # Strict TypeScript configuration
└── vite.config.ts                   # Vite 6 + Tailwind 4 + PWA plugin
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory modeled after `.env.example`:

```bash
# Gemini AI API Key (Server-side proxy routes)
GEMINI_API_KEY="AIzaSy..."

# Application URL (Auto-injected in production container)
APP_URL="https://ais-pre-peksjw4proe32du33dpgv4-85681166021.asia-southeast1.run.app"

# Google OAuth Client ID for GIS & Firebase Sign-In
VITE_GOOGLE_CLIENT_ID="754097816895-gt2m2bmv8augicfo7coa2ulgn9c3fqoq.apps.googleusercontent.com"
```

> **Security Note**: Never commit `.env` or raw API credentials to version control. The application utilizes backend proxy endpoints in `server.ts` to shield secrets from browser inspection.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v20.0.0 or higher (Node 22 recommended)
- **NPM**: v10.0.0 or higher

### 1. Clone Repository
```bash
git clone https://github.com/your-username/kisanmitra-agri-marketplace.git
cd kisanmitra-agri-marketplace
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Google Gemini API Key and credentials
```

### 4. Run Development Server
```bash
npm run dev
```
The full-stack application will boot at: **`http://localhost:3000`**

### 5. Production Build & Start
```bash
# 1. Typecheck and bundle frontend assets
npm run build

# 2. Start production Express server
npm run start
```

---

## 🧪 Quality & Verification Commands

| Command | Action |
| :--- | :--- |
| `npm run lint` | Runs TypeScript static type analysis (`tsc --noEmit`) |
| `npm run build` | Compiles production assets into `/dist` with PWA manifest |
| `npm run start` | Executes the production Express container on port 3000 |
| `npm run clean` | Cleans previous build artifacts and cache |

---

## 📡 REST API Reference

All backend AI endpoints are secured with rate-limiting, sanitized body parsers, and error-shielding middleware.

### 1. `POST /api/ai/diagnose-crop`
- **Purpose**: Upload crop image with symptom description for visual pest/disease diagnosis.
- **Payload**: `{ "imageBase64": "...", "cropName": "Tomato", "symptoms": "Yellow leaf curl" }`
- **Response**: `{ "diagnosis": "...", "confidence": 0.94, "organicRemedy": "...", "chemicalRemedy": "..." }`

### 2. `POST /api/ai/crop-advisory`
- **Purpose**: Retrieve localized agronomy advice based on soil type, acreage, and season.
- **Payload**: `{ "soilType": "Black Loamy", "district": "Nashik", "language": "mr" }`

### 3. `POST /api/ai/demand-forecast`
- **Purpose**: Predict mandi price trajectories and supermart bulk procurement trends.

### 4. `POST /api/slides/generate-pitch-deck`
- **Purpose**: Programmatically assemble and return a Google Slides presentation URL for investor or banking presentations.

### 5. `GET /api/health`
- **Purpose**: Health check endpoint returning `{ "status": "ok", "service": "KisanSetu API" }`.

---

## 🛡️ Security & Privacy Guardrails

- **Zero Inline Script Execution**: Protected with strict CSP headers (`Content-Security-Policy: frame-ancestors *`).
- **Input Sanitization**: Recursive prototype-pollution and XSS striping on all JSON request bodies.
- **Firestore Rules v2**: Client-side Firestore writes are restricted by authenticated UID matching and strict schema validation limits.
- **Data Privacy**: No farmer phone numbers, GPS coordinates, or financial records are shared without explicit user authorization.

---

## 🤝 Contributing

We welcome contributions from developers, agronomists, and designers! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/SmartIrrigationAI`).
3. Commit your Changes (`git commit -m 'feat: Add smart irrigation scheduler'`).
4. Push to the Branch (`git push origin feature/SmartIrrigationAI`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📞 Support & Community

- **Project Lead**: KisanMitra Open Source Initiative
- **Issue Tracker**: [GitHub Issues](https://github.com/your-username/kisanmitra-agri-marketplace/issues)
- **Email Contact**: `engineeringstudies5@gmail.com` gmail message

