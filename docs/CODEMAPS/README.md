# Codemaps — Architecture Documentation

This directory contains token-lean architectural documentation for the Hansen Solubility project, updated on 2026-03-20.

## Quick Start

- **New to the project?** Start with [INDEX.md](./INDEX.md)
- **Need system overview?** See [architecture.md](./architecture.md)
- **Building UI?** Check [frontend.md](./frontend.md)
- **Working with data?** Read [data.md](./data.md)
- **Adding dependencies?** Reference [dependencies.md](./dependencies.md)

## Files

| Codemap | Size | Purpose |
|---------|------|---------|
| [INDEX.md](./INDEX.md) | 8.2K | Navigation guide, module tour, critical paths |
| [architecture.md](./architecture.md) | 9.5K | System diagram, 17 evaluators, data flow |
| [frontend.md](./frontend.md) | 7.1K | 40 components, 6 nav categories, 23 tabs |
| [data.md](./data.md) | 5.8K | SQLite schema, repositories, seed data |
| [dependencies.md](./dependencies.md) | 5.6K | Packages, build tools, Docker |

**Total:** 1050 lines, ~36.2K, ~3,000 tokens

## Key Information

### System Architecture
- Electron 41 (main + renderer process)
- React 19 UI with Tailwind CSS 3
- SQLite database with better-sqlite3
- Context-isolated IPC communication

### Core Modules
- **src/core/** — 17 evaluation engines + 9 classifiers (38 files, 4,700 lines)
- **src/db/** — SQLite layer (8 tables, ~145 seed solvents)
- **src/main/** — Electron lifecycle + 100+ IPC handlers
- **src/renderer/** — 40 React components, 19 hooks, 6 nav categories

### Evaluation Pipeline
```
Select Group + Solvent → Click "評価実行"
→ window.api.evaluate() → Calculate Ra & RED
→ Classify Risk (5 levels) → Display Results → Export CSV
```

## Freshness

All codemaps include generation timestamp: `<!-- Generated: 2026-03-20 -->`

Update when:
- Major feature added
- API route changed
- Database schema modified
- Dependencies updated to major version
- Architecture refactored

## Generation

To regenerate from source (if script exists):
```bash
npx tsx scripts/codemaps/generate.ts
```

## Usage

These codemaps are the **single source of truth** for architecture. Reference in:
- Code reviews (verify architecture compliance)
- Developer onboarding (explain system structure)
- API documentation (supplement with actual code)
- Planning discussions (system design reference)

## Notes

- Codemaps focus on **structure**, not implementation details
- All paths are absolute (`src/...`)
- Type signatures included, implementations omitted
- Diagrams are ASCII (no external image dependencies)
- Cross-references between codemaps avoid duplication

---

**Generated:** 2026-03-20 | **Version:** 1.5.0 | **Status:** Current (17 evaluators, 1094 tests, 87%+ coverage)

See [../.reports/codemap-diff.txt](../../.reports/codemap-diff.txt) for generation report.
