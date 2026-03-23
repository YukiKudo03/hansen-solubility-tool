# Contributing Guide

Hansen溶解度パラメータ 溶解性評価ツール — 開発者向けガイド

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **Python 3** — required for better-sqlite3 native compilation
- **C++ compiler:**
  - Windows: Visual Studio Build Tools (C++ workload)
  - macOS: `xcode-select --install`
  - Linux: `sudo apt install build-essential`

## Setup

```bash
git clone <repo-url>
cd hansen-solubility
npm install
```

This will build the `better-sqlite3` native module during install.

## Development

```bash
npm run dev          # Start Electron + Vite dev server (hot reload)
```

This runs two processes concurrently:
- `dev:main` — compiles TypeScript and starts Electron
- `dev:renderer` — starts Vite dev server for React UI

<!-- AUTO-GENERATED: scripts-table -->
## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron + Vite dev server (concurrent) |
| `npm run dev:main` | Compile main process TypeScript + launch Electron |
| `npm run dev:renderer` | Start Vite dev server for React renderer |
| `npm run build` | Production build (main + renderer) |
| `npm run build:main` | Compile main process TypeScript |
| `npm run build:renderer` | Bundle renderer with Vite |
| `npm start` | Launch built Electron app |
| `npm run package` | Build + package Windows installer (.exe) |
| `npm run package:mac` | Build + package macOS installer (.dmg) |
| `npm run package:linux` | Build + package Linux installer (.AppImage/.deb) |
| `npm run package:all` | Build + package all platforms |
| `npm run package:dir` | Build + package to directory (no installer) |
| `npm test` | Run all tests (pretest rebuild + unit + integration + renderer) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:unit` | Run unit tests only (src/core/) |
| `npm run test:literature` | Run literature validation tests |
| `npm run test:integration` | Run integration tests only (database) |
| `npm run typecheck` | Type-check without emitting |
| `npm run docker:build` | Build Docker image |
| `npm run docker:test` | Run all tests in Docker container |
| `npm run docker:test:unit` | Run unit tests in Docker |
| `npm run docker:test:integration` | Run integration tests in Docker |
| `npm run docker:dev` | Start dev environment in Docker |

**Note:** `pretest` script auto-runs `npm rebuild better-sqlite3` before each test to prevent ABI mismatch between Electron-compiled and Node.js-compiled native modules. Vitest uses `pool: 'forks'` for process isolation.
<!-- END AUTO-GENERATED: scripts-table -->

## Testing

### Run Tests

```bash
npm test                  # All tests (2604+ tests, 197+ files)
npm run test:unit        # Core logic (117 modules)
npm run test:integration # Database operations
npm run test:coverage    # With coverage report (target: 98%+)
npm run test:e2e         # Playwright E2E (295 tests, 30 specs)
npm run test:literature  # Literature value validation (147 cases)
```

### Writing Tests

- **Unit tests** go in `tests/unit/` — test pure functions in `src/core/`
- **Integration tests** go in `tests/integration/` — test SQLite repositories
- **Component tests** go in `tests/renderer/` — use `@testing-library/react`
- **E2E tests** go in `tests/e2e/` — use Playwright with Electron

Test framework: **Vitest** (globals enabled, no imports needed for `describe`/`it`/`expect`).

### Test Data

Use factories from `tests/renderer/factories.ts` for consistent test data.

### TDD Workflow

新機能はTDD（Red→Green→Refactor）で実装する:
1. テストを先に書く（Red: 失敗するテスト）
2. 最小限の実装で通す（Green）
3. リファクタリング

## Project Structure

```
src/
├── core/       Pure domain logic (no I/O, 100% testable)
│               117 modules: 90+ evaluation engines, 10 classifiers,
│               base calculators (hsp, contact-angle, blend-optimizer, etc.),
│               utilities (report, validation, csv-import, ghs-safety, etc.)
├── db/         SQLite data access layer (repository pattern)
│               8 repos: Parts, Solvent, NanoParticle, Drug, Dispersant, Settings, Bookmark, History
│               7 seed files: solvents, nano-particles, drugs, coatings, plasticizers, carriers, dispersants
├── i18n/       多言語対応 (i18next: 日本語/英語)
├── main/       Electron main process (lifecycle, IPC, 190+ handlers)
│               auto-updater (electron-updater)
└── renderer/   MD3 responsive UI (960×680)
                navigation.ts — 6カテゴリ・96タブ定義
                142 components (93 Views, 45+ Badges, 3 Nav, etc.)
                79 hooks (incl. useTheme, useCsvExport, useSortableTable, useBookmarks, etc.)
```

See `docs/CODEMAPS/INDEX.md` for detailed architecture.

## Code Style

- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + MD3 design tokens (`tailwind.config.ts` で定義)
- **Dark mode:** `darkMode: 'class'` — CSS変数ベースのテーマ切替
- **No linter configured** — follow existing patterns
- **Naming:** camelCase for TS, snake_case for DB columns
- **Shared components:** `SortTableHeader`, `useCsvExport`, `useSortableTable` を活用して重複を避ける

## PR Checklist

- [ ] All tests pass (`npm test` — 2604+ tests, 197+ test files)
- [ ] Type check passes (`npm run typecheck`)
- [ ] New features have unit tests (TDD recommended)
- [ ] UI changes have component tests
- [ ] Database schema changes include migration in `schema.ts` (`migrateDatabase`)
- [ ] Database changes update seed data if needed
- [ ] IPC changes update `ipc-handlers.ts`, `preload.ts`, and `preload.d.ts`
- [ ] New entity types added to `src/core/types.ts`
- [ ] Accessibility: `htmlFor`, `aria-label`, `role="alert"` for errors, keyboard navigation

## Docker

For isolated test environments without local native build dependencies:

```bash
npm run docker:test          # Full test suite in container
npm run docker:test:unit     # Unit tests only
```

Uses `node:20-bookworm-slim` with Python3 + g++ for better-sqlite3 compilation.
