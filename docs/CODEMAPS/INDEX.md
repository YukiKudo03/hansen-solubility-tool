<!-- Generated: 2026-03-20 | Files scanned: 225 | Token estimate: ~950 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for HSP-based material compatibility evaluation. **17 evaluation pipelines** + comparison report + 3D visualization + advanced analytics + bookmarks + evaluation history.

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
Core (9):
  A: Polymer-Solvent Risk         → RED小=危険
  B: Nanoparticle Dispersion      → RED小=良好
  C: Contact Angle                → θ小=親水
  D: Solvent Blend Optimization   → Ra最小化
  E: Swelling Prediction          → RED小=膨潤大
  F: Drug Solubility              → RED小=溶解性良好
  G: Chemical Resistance          → RED大=耐性良好（逆向き）
  H: Plasticizer Selection        → RED小=相溶性良好
  I: DDS Carrier Selection        → RED小=適合性良好

Advanced (8):
  J: Adhesion Prediction          → 接着強度評価
  K: TEAS Plot                    → Toxic, Explosive, Aesthetic, Safe分析
  L: Bagley Plot                  → 膜形成能評価
  M: 2D Projection                → δD-δP平面射影
  N: Sphere Fitting               → HSP最適球当てはめ
  O: Green Solvent Selection      → 環境友好的溶媒評価
  P: Multi-Objective Selection    → Pareto最適複合選定
  Q: Group Contribution HSP       → 官能基からのHSP推定

Analytics (3):
  + Comparison Report             → 複数材料×溶媒の横断RED比較
  + HSP 3D Visualization          → Plotly.js δD-δP-δH空間プロット
  + Evaluation History            → 自動保存結果参照
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

### src/core/ (38 files, ~4700 lines)
Pure domain logic (testable, no side effects)

**計算エンジン 基本:**
- `hsp.ts` — `calculateRa()`, `calculateRed()` (全パイプライン共通)
- `contact-angle.ts` — Nakamoto-Yamamoto式
- `contact-angle-methods.ts` — Owens-Wendt法（代替手法）
- `temperature-hsp.ts` — Barton法の温度補正
- `thermal-expansion-data.ts` — 27溶媒の体積膨張係数
- `blend-optimizer.ts` — グリッドサーチ最適化
- `evaporation.ts` — Antoine式+Raoult則の蒸発シミュレーション
- `mixture.ts` — 溶媒混合HSP計算
- `comparison.ts` — バッチ評価マトリクス
- `hsp-visualization.ts` — 3Dプロットデータ生成

**新規計算エンジン (拡張分析):**
- `group-contribution.ts` — Van Krevelen-Hoftyzer法HSP推定 (+201行)
- `solubility-estimation.ts` — Greenhalgh-Williams式溶解度推定
- `adhesion.ts` — 接着強度評価エンジン
- `teas-plot.ts` — TEAS分析（毒性・爆発・美観・安全）
- `bagley-plot.ts` — 膜形成能評価プロット
- `projection-2d.ts` — δD-δP平面上の2D投影計算
- `sphere-fitting.ts` — HSP最適球当てはめアルゴリズム
- `green-solvent.ts` — グリーン溶媒スコアリング
- `multi-objective.ts` — Pareto最適化フロント計算

**分類器 (9種):**
- `risk.ts`, `dispersibility.ts`, `wettability.ts`, `swelling.ts`
- `drug-solubility.ts`, `chemical-resistance.ts`, `plasticizer.ts`, `carrier-selection.ts`
- `solvent-finder.ts` — スクリーニングユーティリティ

**その他:**
- `types.ts` — 全型定義 (500+ lines)
- `validation.ts`, `report.ts` (9 CSV formatters), `accuracy-warnings.ts`
- `bookmark.ts`, `evaluation-history.ts`, `csv-import.ts`
- `ghs-safety.ts`, `theme.ts`, `pdf-report.ts`

### src/db/ (11 files, ~1660 lines)
- `schema.ts` — 8 tables + 2 indexes
- `repository.ts` — 5 repository interfaces + DTOs
- `sqlite-repository.ts` — 5 SQLite implementations
- `bookmark-repository.ts`, `history-repository.ts` — 新機能用repos
- 6 seed files: solvents(135), nano-particles(18), drugs(16), coatings(12), plasticizers(10), carriers(11)

### src/main/ (3 files, ~1075 lines)
- `main.ts` — App startup, DB init, auto-updater
- `ipc-handlers.ts` — **100+ IPC handlers** (CRUD + 17評価 + ブックマーク + 履歴 + インポート)
- `preload.ts` — Context-isolated bridge

### src/renderer/ (62 files, ~6770 lines)
- `App.tsx` — MD3 responsive layout + `useTheme()`
- `navigation.ts` — 6カテゴリ・23タブ (新: 分析タブ追加)
- `components/` — 40 components (20 Views, 8 Badges, 3 Nav, SortTableHeader, BookmarkButton, etc.)
- `hooks/` — 19 hooks (useCsvExport, useSortableTable, useBookmarks, useTheme, etc.)

### src/i18n/ (2 files)
- `translations.ts` — ja/en 60+キー
- `index.ts` — i18next初期化

### tests/ (79 files, 975+ unit + 98+ E2E)

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
| **Core** | 38 | 4,700 | 17評価エンジン, 9分類器, ユーティリティ |
| **Database** | 11 | 1,680 | Schema, 7 repos, 6 seed files |
| **Main** | 3 | 1,075 | Electron, IPC (100+), preload |
| **Renderer** | 62 | 6,770 | 40 components, 19 hooks, i18n |
| **Tests** | 79 | — | 975 unit + 98 E2E |
| **Total** | 225 | 14,225+ | — |

---

**Last Updated:** 2026-03-20 | **Status:** 17 evaluation pipelines complete, test coverage 91%
