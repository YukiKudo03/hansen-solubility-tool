<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 106 | Token estimate: ~950 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for HSP-based material compatibility evaluation. **9 evaluation pipelines** covering polymer dissolution, nanoparticle dispersion, contact angle, solvent blending, swelling, drug solubility, chemical resistance, plasticizer selection, and DDS carrier selection.

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — System diagram, 9 evaluation pipelines, module boundaries

### Implementation Details
- **[frontend.md](./frontend.md)** — React components (12 tabs), hooks (13), IPC interface (70+ methods)
- **[data.md](./data.md)** — SQLite schema (6 tables), repositories (5), seed data (85 solvents + 18 nanoparticles + 15 drugs + 12 coatings + 10 plasticizers + 11 carriers)
- **[dependencies.md](./dependencies.md)** — External packages, build tools, Docker support

## Key Insights

### Architecture
- **Electron Multi-Process:** Main process (business logic) ↔ Renderer process (React UI) via IPC
- **Pure Core:** `src/core/` contains no I/O — 16 modules for calculations, classification, CSV export
- **Repository Pattern:** `src/db/` abstracts SQLite via interfaces (5 repos: Parts, Solvent, NanoParticle, Drug, Settings)
- **Type Safety:** 100% TypeScript across all layers with strict mode enabled

### Nine Evaluation Pipelines

```
Pipeline A: Polymer-Solvent Risk         → RED小=危険（溶解する）
Pipeline B: Nanoparticle Dispersion      → RED小=良好（分散する）
Pipeline C: Contact Angle                → θ小=親水, θ大=疎水
Pipeline D: Solvent Blend Optimization   → Ra最小化（逆問題）
Pipeline E: Swelling Prediction          → RED小=膨潤大
Pipeline F: Drug Solubility              → RED小=溶解性良好
Pipeline G: Chemical Resistance          → RED大=耐性良好（逆向き）
Pipeline H: Plasticizer Selection        → RED小=相溶性良好
Pipeline I: DDS Carrier Selection        → RED小=適合性良好（carrier.r0使用）
```

### Tech Stack
- **Framework:** Electron 41 + React 19 + Vite 5
- **Language:** TypeScript 5.9 (strict)
- **Database:** SQLite with better-sqlite3 12.8
- **Styling:** Tailwind CSS 3.4
- **Testing:** Vitest 2.1 (349 unit tests)

## Module Tour

### src/core/ (16 files)
Pure domain logic (testable, no side effects)
- `types.ts` — All domain types (HSPValues, Part, Solvent, Drug, NanoParticle, 9 level enums, thresholds, results)
- `hsp.ts` — Hansen distance: `calculateRa()`, `calculateRed()` (shared by all RED-based pipelines)
- `risk.ts` — Pipeline A: `classifyRisk()` → RiskLevel 1-5
- `dispersibility.ts` — Pipeline B: `classifyDispersibility()` → DispersibilityLevel 1-5
- `wettability.ts` — Pipeline C: `classifyWettability()` → WettabilityLevel 1-6
- `contact-angle.ts` — Nakamoto-Yamamoto式: surface tension + Young's equation
- `blend-optimizer.ts` — Pipeline D: `optimizeBlend()` grid search
- `swelling.ts` — Pipeline E: `classifySwelling()` → SwellingLevel 1-5
- `drug-solubility.ts` — Pipeline F: `classifyDrugSolubility()`, `screenDrugSolvents()`
- `chemical-resistance.ts` — Pipeline G: `classifyChemicalResistance()` (RED逆向き)
- `plasticizer.ts` — Pipeline H: `classifyPlasticizerCompatibility()`, `screenPlasticizers()`
- `carrier-selection.ts` — Pipeline I: `classifyCarrierCompatibility()`, `screenCarriers()`
- `solvent-finder.ts` — `screenSolvents()`, `filterByConstraints()`
- `report.ts` — CSV export: 9 formatters (BOM-prefixed UTF-8)
- `validation.ts` — Input validators (12+ functions)
- `mixture.ts` — Solvent mixture calculations

### src/db/ (9 files)
Data access layer (SQLite via better-sqlite3)
- `schema.ts` — 6 tables: parts_groups, parts, solvents, nano_particles, drugs, settings
- `repository.ts` — 5 repository interfaces + DTOs
- `sqlite-repository.ts` — 5 SQLite implementations
- `seed-data.ts` — ~85 solvents + 7 polymer groups
- `seed-nano-particles.ts` — 18 nanoparticles
- `seed-drugs.ts` — 15 drugs (API)
- `seed-coatings.ts` — 12 coating materials (PartsGroup)
- `seed-plasticizers.ts` — 10 plasticizers (Solvent with [可塑剤] tag)
- `seed-carriers.ts` — 11 DDS carriers (PartsGroup)

### src/main/ (3 files)
- `main.ts` — App startup, DB init, seed loading (6 seed functions)
- `ipc-handlers.ts` — **70+ IPC handlers**
- `preload.ts` — Context-isolated bridge (70+ methods)

### src/renderer/ (37 files)
- `App.tsx` — Tab router (12 tabs)
- `components/` — 24 components (9 Views, 7 Badges, 4 Selectors, 3 Shared, 1 ErrorBoundary)
- `hooks/` — 13 hooks

### tests/ (16 unit + 15 renderer + integration + e2e)
- Unit: 349 tests covering all core logic
- Renderer: Component + hook tests

## Database Schema Summary

| Table | Purpose | Rows | Relationships |
|-------|---------|------|---------------|
| `parts_groups` | Material groups | ~10 | 1 → Many with parts |
| `parts` | Polymers + coatings + carriers | ~83 | Many ← 1 from parts_groups |
| `solvents` | Solvents + plasticizers | ~95 | No FK (plasticizers tagged in notes) |
| `nano_particles` | Nanoparticle materials | 18 | No FK |
| `drugs` | Pharmaceutical APIs | 15 | No FK |
| `settings` | Config (thresholds) | ~8 | Key-value store |

## File Statistics

| Category | Files | Purpose |
|----------|-------|---------|
| **Core** | 16 | HSP, 9 classifiers, report, validation, mixture, blend-optimizer |
| **Database** | 9 | Schema, repositories, 6 seed files |
| **Main Process** | 3 | Electron lifecycle, IPC (70+), preload |
| **Renderer** | 37 | React components (24) + hooks (13) + entry |
| **Tests** | 31+ | Unit (349) + Renderer + Integration + E2E |

---

**Last Updated:** 2026-03-15 | **Status:** Current (Phase 1 + Phase 2 complete)
