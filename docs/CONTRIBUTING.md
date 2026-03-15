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
| `npm run package:dir` | Build + package to directory (no installer) |
| `npm test` | Run all tests (unit + integration + renderer) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:unit` | Run unit tests only (src/core/) |
| `npm run test:integration` | Run integration tests only (database) |
| `npm run typecheck` | Type-check without emitting |
| `npm run docker:build` | Build Docker image |
| `npm run docker:test` | Run all tests in Docker container |
| `npm run docker:test:unit` | Run unit tests in Docker |
| `npm run docker:test:integration` | Run integration tests in Docker |
| `npm run docker:dev` | Start dev environment in Docker |
<!-- END AUTO-GENERATED: scripts-table -->

## Testing

### Run Tests

```bash
npm test                  # All tests
npm run test:unit        # Core logic (hsp, risk, report, validation)
npm run test:integration # Database operations
npm run test:coverage    # With coverage report
npm run test:e2e         # Playwright E2E (requires built app)
```

### Writing Tests

- **Unit tests** go in `tests/unit/` — test pure functions in `src/core/`
- **Integration tests** go in `tests/integration/` — test SQLite repositories
- **Component tests** go in `tests/renderer/` — use `@testing-library/react`
- **E2E tests** go in `tests/e2e/` — use Playwright with Electron

Test framework: **Vitest** (globals enabled, no imports needed for `describe`/`it`/`expect`).

### Test Data

Use factories from `tests/renderer/factories.ts` for consistent test data.

## Project Structure

```
src/
├── core/       Pure domain logic (no I/O, 100% testable)
├── db/         SQLite data access layer (repository pattern)
├── main/       Electron main process (lifecycle, IPC)
└── renderer/   React UI (components, hooks)
```

See `docs/CODEMAPS/INDEX.md` for detailed architecture.

## Code Style

- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS utility classes only
- **No linter configured** — follow existing patterns
- **Naming:** camelCase for TS, snake_case for DB columns

## PR Checklist

- [ ] All tests pass (`npm test`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] New features have unit tests
- [ ] UI changes have component tests
- [ ] Database schema changes include migration in `schema.ts` (`migrateDatabase`)
- [ ] Database changes update seed data if needed
- [ ] IPC changes update both `ipc-handlers.ts` and `preload.ts`

## Docker

For isolated test environments without local native build dependencies:

```bash
npm run docker:test          # Full test suite in container
npm run docker:test:unit     # Unit tests only
```

Uses `node:20-bookworm-slim` with Python3 + g++ for better-sqlite3 compilation.
