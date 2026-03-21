# Hansen Solubility Parameter Evaluation Tool

**Hansen溶解度パラメータ 溶解性評価ツール**

![Tests](https://img.shields.io/badge/tests-2170%2B-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98.88%25-brightgreen)
![Pipelines](https://img.shields.io/badge/pipelines-70%2B-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Platform](https://img.shields.io/badge/platform-Win%20%7C%20macOS%20%7C%20Linux-lightgrey)

A production-grade desktop application for **Hansen Solubility Parameter (HSP)** based material compatibility evaluation. Supports **70+ evaluation pipelines** across 6 categories, enabling researchers and engineers to quantitatively assess solubility, adhesion, permeability, and more.

HSPに基づく材料適合性を定量評価するデスクトップアプリケーション。溶解性評価、接触角推定、膨潤度予測、ガス透過性など70以上の専門評価パイプラインを搭載。

```
┌──────────────────────────────────────────────────────────┐
│  Hansen溶解度パラメータ 溶解性評価ツール                   │
├───────────┬──────────────────────────────────────────────┤
│ 評価 (31) │  Material Group: [PP / PE / PS ...]          │
│ 選定 (24) │  Solvent:        [Toluene ▼]                │
│ 最適化(17)│  ┌─────────────────────────────────────┐    │
│ データ (3)│  │ Part    │  Ra   │  RED  │  Risk     │    │
│ 分析 (16) │  │ PP-H    │  3.2  │  0.41 │ 🔴 危険   │    │
│ 設定  (1) │  │ PP-Co   │  5.1  │  0.65 │ 🟠 要警戒 │    │
│           │  │ PP-R    │  8.7  │  1.12 │ 🟡 要注意 │    │
│           │  └─────────────────────────────────────┘    │
└───────────┴──────────────────────────────────────────────┘
```

---

## Features

### 70+ Evaluation Pipelines across 6 Categories

| Category | Count | Description |
|----------|:-----:|-------------|
| **Evaluation** (評価) | 31 | Solubility, contact angle, swelling, chemical resistance, adhesion, ESC, gas permeability, membrane separation, coating defects, and more |
| **Selection** (選定) | 24 | Nanoparticle dispersion, dispersant, plasticizer, carrier, co-crystal screening, pigment dispersion, CNT/graphene, MXene, and more |
| **Optimization** (最適化) | 17 | Blend optimization, supercritical CO2, drug solubility, green solvent, multi-objective, perovskite solvent, Li-battery electrolyte, and more |
| **Data** (データ) | 3 | Database editor, mixture lab, evaluation history |
| **Analysis** (分析) | 16 | 3D visualization, Teas plot, Bagley plot, group contribution, copolymer HSP estimation, temperature/pressure correction, inverse HSP, and more |
| **Settings** (設定) | 1 | Thresholds, theme (light/dark/system), language (ja/en) |

### Core Computation Modules

- **HSP Calculator** — Ra distance, RED value, 5-level risk classification
- **Contact Angle** — Nakamoto-Yamamoto & Owens-Wendt methods
- **Blend Optimizer** — Grid-search optimization for solvent mixtures
- **Sphere Fitting** — Optimal HSP sphere (center + R0) from solubility data
- **Group Contribution** — Van Krevelen-Hoftyzer HSP estimation
- **Temperature Correction** — Barton method for temperature-dependent HSP
- **Green Solvent Scoring** — Environmental impact assessment
- **Multi-Objective** — Pareto front optimization
- **3D Visualization** — Interactive Plotly.js HSP sphere plots
- **Teas / Bagley / 2D Plots** — Multiple HSP visualization methods
- **Evaporation Simulation** — Antoine equation + Raoult's law

### Additional Features

- **Bookmarks** — Save and restore evaluation conditions
- **Evaluation History** — Auto-save up to 1000 evaluation results
- **CSV Export** — Export results from any evaluation pipeline
- **PDF Report** — Generate PDF reports
- **Dark Mode** — Light / Dark / System theme with MD3 design tokens
- **i18n** — Japanese / English
- **Auto-Update** — Automatic updates via GitHub Releases
- **Responsive UI** — Desktop drawer / Tablet rail / Mobile bottom nav

---

## Quick Start

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **Python 3** — Required for better-sqlite3 native compilation
- **C++ Compiler:**
  - Windows: Visual Studio Build Tools (C++ workload)
  - macOS: `xcode-select --install`
  - Linux: `sudo apt install build-essential python3`

### Development

```bash
git clone https://github.com/YukiKudo03/hansen_solubility.git
cd hansen_solubility
npm install
npm run dev
```

This starts both the Electron main process and Vite dev server with hot reload.

### Build & Package

```bash
npm run build                # Production build
npm run package              # Windows installer (.exe)
npm run package:mac          # macOS installer (.dmg)
npm run package:linux        # Linux installer (.AppImage)
npm run package:all          # All platforms
```

### Testing

```bash
npm test                     # All tests (2170+ tests)
npm run test:unit            # Unit tests (core logic)
npm run test:integration     # Database integration tests
npm run test:coverage        # With V8 coverage report
npm run test:e2e             # Playwright E2E tests (98+ specs)
npm run test:literature      # Literature value validation (147 cases)
npm run typecheck            # TypeScript type checking
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 41 + React 19 |
| Language | TypeScript 5.9 (strict mode) |
| Database | SQLite (better-sqlite3 12.8, WAL mode) |
| Build | Vite 5 + electron-builder |
| Styling | Tailwind CSS 3.4 + MD3 design tokens |
| 3D Plot | Plotly.js (plotly.js-basic-dist-min) |
| i18n | i18next + react-i18next |
| Testing | Vitest 2.1 (2170+ tests) + Playwright 1.58 (98+ E2E) |
| PDF | jsPDF |
| Auto-Update | electron-updater (GitHub Releases) |

---

## Project Structure

```
src/
├── core/           Pure domain logic (no I/O, 117 modules)
│                   70+ evaluation engines, 10 classifiers,
│                   HSP calculator, blend optimizer, sphere fitting, etc.
├── db/             SQLite data access layer (repository pattern)
│                   8 repositories, 7 seed data files, 9 tables
├── i18n/           Internationalization (Japanese / English)
├── main/           Electron main process
│                   167 IPC handlers, auto-updater, DB initialization
└── renderer/       React UI (MD3 responsive layout)
                    142 components, 69 hooks, 6-category navigation
```

---

## Database

SQLite database with 9 tables, automatically initialized on first launch:

| Table | Seed Data | Description |
|-------|-----------|-------------|
| `parts_groups` | 7 groups | Polymer material groups |
| `parts` | ~83 materials | Polymers, coatings, carriers (HSP + R0) |
| `solvents` | ~135 solvents | Solvents with physical properties |
| `nano_particles` | 18 particles | CNT, graphene, Ag NP, TiO2, ZnO, etc. |
| `drugs` | 16 APIs | Pharmaceutical active ingredients |
| `dispersants` | ~10 | Surfactant dispersants (dual-HSP model) |
| `settings` | key-value | App configuration |
| `bookmarks` | dynamic | Saved evaluation conditions |
| `evaluation_history` | dynamic (max 1000) | Auto-saved evaluation results |

**Database location:**
- Windows: `%APPDATA%\hansen-solubility-tool\hansen.db`
- macOS: `~/Library/Application Support/hansen-solubility-tool/hansen.db`
- Linux: `~/.config/hansen-solubility-tool/hansen.db`

---

## Documentation

| Document | Description |
|----------|-------------|
| **[docs/USER_MANUAL.md](docs/USER_MANUAL.md)** | User manual (Japanese) — full guide for all 70+ pipelines |
| **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Developer guide — setup, testing, code style, PR checklist |
| **[docs/RUNBOOK.md](docs/RUNBOOK.md)** | Operations guide — build, deploy, auto-update, troubleshooting |
| **[docs/CODEMAPS/](docs/CODEMAPS/)** | Architecture documentation — system design, module details |

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron + Vite dev server (hot reload) |
| `npm run build` | Production build (main + renderer) |
| `npm start` | Launch built Electron app |
| `npm run package` | Build + package Windows installer |
| `npm run package:mac` | Build + package macOS installer |
| `npm run package:linux` | Build + package Linux installer |
| `npm run package:all` | Build + package all platforms |
| `npm test` | Run all tests (2170+) |
| `npm run test:coverage` | Tests with V8 coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:literature` | Literature validation tests |
| `npm run typecheck` | TypeScript type checking |

---

## License

[ISC](LICENSE)
