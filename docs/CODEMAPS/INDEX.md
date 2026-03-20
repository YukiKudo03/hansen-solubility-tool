<!-- Generated: 2026-03-21 | Files scanned: 237 | Token estimate: ~980 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for HSP-based material compatibility evaluation. **18 evaluation pipelines** + comparison report + 3D visualization + advanced analytics + bookmarks + evaluation history.

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — System diagram, pipelines, module boundaries

### Implementation Details
- **[backend.md](./backend.md)** — IPC handlers (110+), repository pattern, validation
- **[frontend.md](./frontend.md)** — MD3 responsive layout, 24 tabs, 20 hooks, dark mode
- **[data.md](./data.md)** — SQLite schema (9 tables), repositories (8), seed data
- **[dependencies.md](./dependencies.md)** — External packages, build tools

## Key Insights

### Architecture
- **Electron Multi-Process:** Main (business logic + IPC) ↔ Renderer (React UI)
- **Pure Core:** `src/core/` contains no I/O — 32 modules
- **Repository Pattern:** `src/db/` — 8 repos (Parts, Solvent, NanoParticle, Drug, Dispersant, Settings, Bookmark, History)
- **i18n:** i18next (ja/en), **Dark Mode:** Tailwind `darkMode: 'class'`
- **Auto-Update:** electron-updater via GitHub Releases
- **Cross-Platform:** Win (NSIS) / macOS (dmg) / Linux (AppImage)

### Evaluation Pipelines

```
Core (10):
  A: Polymer-Solvent Risk         → RED小=危険
  B: Nanoparticle Dispersion      → RED小=良好
  C: Contact Angle                → θ小=親水
  D: Solvent Blend Optimization   → Ra最小化
  E: Swelling Prediction          → RED小=膨潤大
  F: Drug Solubility              → RED小=溶解性良好
  G: Chemical Resistance          → RED大=耐性良好（逆向き）
  H: Plasticizer Selection        → RED小=相溶性良好
  I: DDS Carrier Selection        → RED小=適合性良好
  J: Dispersant Selection         → dual-HSP anchor+solvation → 複合RED

Advanced (8):
  K: Adhesion Prediction          → 接着強度評価
  L: TEAS Plot                    → Toxic, Explosive, Aesthetic, Safe分析
  M: Bagley Plot                  → 膜形成能評価
  N: 2D Projection                → δD-δP平面射影
  O: Sphere Fitting               → HSP最適球当てはめ
  P: Green Solvent Selection      → 環境友好的溶媒評価
  Q: Multi-Objective Selection    → Pareto最適複合選定
  R: Group Contribution HSP       → 官能基からのHSP推定

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
- **Testing:** Vitest 2.1 (1000+ unit) + Playwright 1.58 (98+ E2E)

## Module Tour

### src/core/ (39 files, ~4900 lines)
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
- `dispersant-selection.ts` — Dual-HSP分散剤スクリーニング（anchor+solvation評価）
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

### src/db/ (12 files, ~1780 lines)
- `schema.ts` — 9 tables + 2 indexes
- `repository.ts` — 6 repository interfaces + DTOs
- `sqlite-repository.ts` — 6 SQLite implementations
- `bookmark-repository.ts`, `history-repository.ts` — 新機能用repos
- 7 seed files: solvents(135), nano-particles(18), drugs(16), coatings(12), plasticizers(10), carriers(11), dispersants(~10)

### src/main/ (3 files, ~1075 lines)
- `main.ts` — App startup, DB init, auto-updater
- `ipc-handlers.ts` — **110+ IPC handlers** (CRUD + 18評価 + ブックマーク + 履歴 + インポート)
- `preload.ts` — Context-isolated bridge

### src/renderer/ (65 files, ~7000 lines)
- `App.tsx` — MD3 responsive layout + `useTheme()`
- `navigation.ts` — 6カテゴリ・24タブ (新: 分散剤選定タブ追加)
- `components/` — 42 components (22 Views, 9 Badges, 3 Nav, SortTableHeader, BookmarkButton, etc.)
- `hooks/` — 20 hooks (useCsvExport, useSortableTable, useBookmarks, useTheme, useDispersantSelection, etc.)

### src/i18n/ (2 files)
- `translations.ts` — ja/en 60+キー
- `index.ts` — i18next初期化

### tests/ (133 files, 1100+ unit/renderer + 25 E2E specs)

## Database Schema (8 tables)

| Table | Rows | Purpose |
|-------|------|---------|
| `parts_groups` | ~10 | Material groups |
| `parts` | ~83 | Polymers + coatings + carriers |
| `solvents` | ~95 | Solvents + plasticizers (tagged) |
| `nano_particles` | 18 | Nanoparticle materials |
| `drugs` | 16 | Pharmaceutical APIs |
| `dispersants` | ~10 | Surfactant dispersants (dual-HSP) |
| `settings` | ~10 | Config (key-value) |
| `bookmarks` | dynamic | 評価条件のブックマーク |
| `evaluation_history` | dynamic (≤1000) | 評価結果の自動保存 |

## File Statistics

| Category | Files | Lines | Key Contents |
|----------|-------|-------|-------------|
| **Core** | 39 | 4,900 | 18評価エンジン, 10分類器, ユーティリティ |
| **Database** | 12 | 1,780 | Schema, 8 repos, 7 seed files |
| **Main** | 3 | 1,100 | Electron, IPC (110+), preload |
| **Renderer** | 65 | 7,000 | 42 components, 20 hooks, i18n |
| **Tests** | 133 | — | 1100+ unit/renderer + 25 E2E |
| **Total** | 254 | 14,880+ | — |

---

**Last Updated:** 2026-03-21 | **Status:** 18 evaluation pipelines complete, test coverage 91%
