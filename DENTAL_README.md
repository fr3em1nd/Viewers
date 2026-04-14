# DentalView Pro - Dental SaaS Platform (OHIF Customization)

A dental imaging platform built on top of [OHIF Viewer](https://github.com/OHIF/Viewers), providing a specialized **Dental Mode** with custom UI, measurement presets, and a backend for authentication and state persistence.

## Architecture Overview

```
Viewers/
├── extensions/dental/          # Dental Extension (UI components, panels, protocols)
│   └── src/
│       ├── components/         # PracticeHeader, ToothSelector, DentalThemeToggle
│       ├── panels/             # DentalMeasurementsPanel
│       ├── hangingprotocols/   # 2x2 Dental Hanging Protocol
│       └── utils/              # Tooth numbering (FDI/Universal)
├── modes/dental/               # Dental Mode (wiring, toolbar, tool groups)
│   └── src/
│       ├── index.ts            # Mode definition, routes, lifecycle
│       ├── toolbarButtons.ts   # Dental-specific toolbar config
│       └── initToolGroups.ts   # Cornerstone tool initialization
├── dental-backend/             # Backend API (Express + SQLite)
│   └── src/server.js           # Auth, viewer state, measurements persistence
└── platform/app/public/config/
    └── dental.js               # App config for dental deployment
```

## Features

### A) Dental Mode UI Customization

| Feature | Description |
|---------|-------------|
| **Dental Theme Toggle** | Switches between standard OHIF and dental-specific color scheme (teal/cyan palette, dark surface) |
| **Practice Header** | Replaces standard header with practice name ("DentalView Pro"), patient info (name, ID, date, modality), and tooth selector |
| **Tooth Selector** | Interactive dental chart supporting both FDI (international) and Universal (US) numbering systems — click any tooth to select it |
| **2x2 Hanging Protocol** | Top-left: current image, Top-right: prior exam (same modality), Bottom: bitewing placeholders (auto-matches series with "bitewing" description) |

### B) Dental Measurements Palette

| Feature | Description |
|---------|-------------|
| **One-Click Presets** | PA Length (mm), Canal Angle (°), Crown Width (mm), Root Length (mm), Bone Level (mm), Implant Length (mm) |
| **Auto-Labeling** | Each preset activates the appropriate Cornerstone tool (Length/Angle) with standardized labels |
| **Measurements List** | Right panel displays all measurements with label, value, and type. Click to jump to measurement in viewport |
| **Sort & Filter** | Sort by label (A-Z), value (#), or time. Filter by type: All, Length, Angle |
| **Export JSON** | Download all study measurements as structured JSON |

### C) Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user (email, password, name, practiceName) |
| `/api/auth/login` | POST | Login, returns JWT token |
| `/api/auth/me` | GET | Get current user profile (requires auth) |
| `/api/state/:studyUID` | GET/PUT/DELETE | Persist/retrieve/delete viewer state per study (requires auth) |
| `/api/measurements/:studyUID` | GET/POST | Persist/retrieve measurements per study (requires auth) |
| `/api/health` | GET | Health check |

## Quick Start

### Prerequisites

- Node.js >= 18
- Yarn 1.x

### 1. Install Dependencies

```bash
# From the repo root
yarn install
```

### 2. Start the Backend

```bash
cd dental-backend
npm install
npm start
# Backend runs on http://localhost:3001
# Demo credentials: demo@dentalview.com / dental123
```

### 3. Start the OHIF Viewer (Dental Config)

```bash
# From the repo root
APP_CONFIG=config/dental.js yarn dev
```

### 4. Open in Browser

Navigate to `http://localhost:3000`. Select a study and choose **"Dental Mode"** from the mode selector.

## Build for Production

```bash
# Build extension
yarn workspace @ohif/extension-dental build

# Build mode
yarn workspace @ohif/mode-dental build

# Build full app
yarn build:viewer
```

## Dental Mode Workflow

1. Open a study from the study list
2. Select **"Dental Mode"** — the 2x2 hanging protocol auto-arranges viewports
3. Use the **Practice Header** to view patient info and select a tooth
4. Open the **Dental Measurements** panel (right sidebar) to see measurement presets
5. Click a preset (e.g., "PA Length") to activate the tool, then draw on the viewport
6. Measurements appear in the right panel with label, value, and type
7. Sort/filter measurements, then click **Export JSON** to download

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Cornerstone.js 3D, OHIF Core
- **Backend**: Express.js, SQLite (better-sqlite3), JWT (jsonwebtoken), bcryptjs
- **Build**: Webpack 5, Yarn Workspaces, Lerna

## Key Files

| File | Purpose |
|------|---------|
| `extensions/dental/src/index.ts` | Extension entry — registers panels, hanging protocols, commands |
| `extensions/dental/src/panels/DentalMeasurementsPanel.tsx` | Measurements palette with presets, list, sort/filter, export |
| `extensions/dental/src/components/PracticeHeader.tsx` | Custom header with practice info, patient data, tooth selector |
| `extensions/dental/src/components/ToothSelector.tsx` | Interactive dental chart (FDI/Universal numbering) |
| `extensions/dental/src/components/DentalThemeToggle.tsx` | Theme toggle component |
| `extensions/dental/src/hangingprotocols/hpDental2x2.ts` | 2x2 grid hanging protocol definition |
| `extensions/dental/src/utils/toothNumbering.ts` | FDI and Universal tooth numbering data/helpers |
| `modes/dental/src/index.ts` | Mode definition — layout, panels, toolbar, lifecycle |
| `modes/dental/src/toolbarButtons.ts` | Dental-specific toolbar button configuration |
| `modes/dental/src/initToolGroups.ts` | Cornerstone tool group initialization |
| `dental-backend/src/server.js` | Express API with auth, state persistence, measurements |
| `platform/app/public/config/dental.js` | OHIF app config for dental deployment |
