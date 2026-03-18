<!-- Generated: 2026-03-18 | Files scanned: 197 | Token estimate: ~950 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for HSP-based material compatibility evaluation. **9 evaluation pipelines** + comparison report + 3D visualization + bookmarks + evaluation history.

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — System diagram, pipelines, module boundaries

### Implementation Details
- **[frontend.md](./frontend.md)** — MD3 responsive layout, 15 tabs, 19 hooks, dark mode
- **[data.md](./data.md)** — SQLite schema (8 tables), repositories (7), seed data
- **[dependencies.md](./dependencies.md)** — External packages, build tools

## Key Insights

### Architecture
- **Electron Multi-Process:** Main (business logic + IPC) ↔ Renderer (React UI)
- **Pure Core:** `src/core/` contains no I/O — 31 modules
- **Repository Pattern:** `src/db/` — 7 repos (Parts, Solvent, NanoParticle, Drug, Settings, Bookmark, History)
- **i18n:** i18next (ja/en), **Dark Mode:** Tailwind `darkMode: 'class'`
- **Auto-Update:** electron-updater via GitHub Releases
- **Cross-Platform:** Win (NSIS) / macOS (dmg) / Linux (AppImage)

### Evaluation Pipelines

```
A: Polymer-Solvent Risk         → RED小=危険
B: Nanoparticle Dispersion      → RED小=良好
C: Contact Angle                → θ小=親水
D: Solvent Blend Optimization   → Ra最小化
E: Swelling Prediction          → RED小=膨潤大
F: Drug Solubility              → RED小=溶解性良好
G: Chemical Resistance          → RED大=耐性良好（逆向き）
H: Plasticizer Selection        → RED小=相溶性良好
I: DDS Carrier Selection        → RED小=適合性良好
+ Comparison Report             → 複数材料×溶媒の横断RED比較
+ HSP 3D Visualization          → Plotly.js δD-δP-δH空間プロット
```

### Tech Stack
- **Framework:** Electron 41 + React 19 + Vite 5
- **Language:** TypeScript 5.9 (strict)
- **Database:** SQLite (better-sqlite3 12.8), WAL mode
- **Styling:** Tailwind CSS 3.4, MD3 design tokens, dark mode
- **3D Plot:** Plotly.js (plotly.js-basic-dist-min)
- **i18n:** i18next + react-i18next
- **Testing:** Vitest 2.1 (928+ unit) + Playwright 1.58 (98+ E2E)

## Module Tour

### src/core/ (31 files, ~3350 lines)
Pure domain logic (testable, no side effects)

**計算エンジン:**
- `hsp.ts` — `calculateRa()`, `calculateRed()` (全パイプライン共通)
- `contact-angle.ts` — Nakamoto-Yamamoto式
- `contact-angle-methods.ts` — Owens-Wendt法（代替手法）
- `temperature-hsp.ts` — Barton法の温度補正
- `thermal-expansion-data.ts` — 27溶媒の体積膨張係数
- `blend-optimizer.ts` — グリッドサーチ最適化
- `evaporation.ts` — Antoine式+Raoult則の蒸発シミュレーション
- `group-contribution.ts` — Van Krevelen-Hoftyzer法HSP推定
- `solubility-estimation.ts` — Greenhalgh-Williams式溶解度推定
- `mixture.ts` — 溶媒混合HSP計算
- `comparison.ts` — バッチ評価マトリクス
- `hsp-visualization.ts` — 3Dプロットデータ生成

**分類器 (9種):**
- `risk.ts`, `dispersibility.ts`, `wettability.ts`, `swelling.ts`
- `drug-solubility.ts`, `chemical-resistance.ts`, `plasticizer.ts`, `carrier-selection.ts`
- `solvent-finder.ts` — スクリーニングユーティリティ

**その他:**
- `types.ts` — 全型定義 (450+ lines)
- `validation.ts`, `report.ts` (9 CSV formatters), `accuracy-warnings.ts`
- `bookmark.ts`, `evaluation-history.ts`, `csv-import.ts`
- `ghs-safety.ts`, `theme.ts`, `pdf-report.ts`

### src/db/ (11 files, ~1660 lines)
- `schema.ts` — 8 tables + 2 indexes
- `repository.ts` — 5 repository interfaces + DTOs
- `sqlite-repository.ts` — 5 SQLite implementations
- `bookmark-repository.ts`, `history-repository.ts` — 新機能用repos
- 6 seed files: solvents(135), nano-particles(18), drugs(16), coatings(12), plasticizers(10), carriers(11)

### src/main/ (3 files, ~940 lines)
- `main.ts` — App startup, DB init, auto-updater
- `ipc-handlers.ts` — **80+ IPC handlers** (CRUD + 評価 + ブックマーク + 履歴 + インポート)
- `preload.ts` — Context-isolated bridge

### src/renderer/ (55 files, ~5180 lines)
- `App.tsx` — MD3 responsive layout + `useTheme()`
- `navigation.ts` — 5カテゴリ・15タブ
- `components/` — 32 components (12 Views, 8 Badges, 3 Nav, SortTableHeader, BookmarkButton, etc.)
- `hooks/` — 19 hooks (useCsvExport, useSortableTable, useBookmarks, useTheme, etc.)

### src/i18n/ (2 files)
- `translations.ts` — ja/en 60+キー
- `index.ts` — i18next初期化

### tests/ (95 files, 928+ unit + 98+ E2E)

## Database Schema (8 tables)

| Table | Rows | Purpose |
|-------|------|---------|
| `parts_groups` | ~10 | Material groups |
| `parts` | ~83 | Polymers + coatings + carriers |
| `solvents` | ~145 | Solvents + plasticizers |
| `nano_particles` | 18 | Nanoparticle materials |
| `drugs` | 16 | Pharmaceutical APIs |
| `settings` | ~10 | Config (key-value) |
| `bookmarks` | dynamic | 評価条件のブックマーク |
| `evaluation_history` | dynamic (≤1000) | 評価結果の自動保存 |

## File Statistics

| Category | Files | Lines | Key Contents |
|----------|-------|-------|-------------|
| **Core** | 31 | 3,350 | 計算エンジン, 9分類器, ユーティリティ |
| **Database** | 11 | 1,660 | Schema, 7 repos, 6 seed files |
| **Main** | 3 | 940 | Electron, IPC (80+), preload |
| **Renderer** | 55 | 5,180 | 32 components, 19 hooks, i18n |
| **Tests** | 95 | — | 928 unit + 98 E2E |
| **Total** | 197 | 11,130+ | — |

---

**Last Updated:** 2026-03-18 | **Status:** Current (全Phase完了 + 文献改善)
