# Runbook

Hansen溶解度パラメータ評価ツール — 運用・デプロイガイド

## Build & Package

### Windows Installer

```bash
npm run build              # Compile TypeScript + bundle React
npm run package            # Build + create Windows installer
```

**Output:** `out/Hansen溶解度パラメータ評価ツール Setup {version}.exe`

### Build Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| Main process JS | `dist/main/` | Compiled Electron main |
| Renderer bundle | `dist/renderer/` | Vite-bundled React app |
| Windows installer | `out/*.exe` | NSIS installer (x64) |
| Portable exe | `out/*.exe` | Standalone portable build |

### Electron Builder Config

- **Config:** `electron-builder.yml`
- **App ID:** `com.hansen-solubility.tool`
- **Targets:** NSIS installer + portable (Windows x64)
- **ASAR:** Enabled, with `better-sqlite3` unpacked for native module access
- **Icon:** `build/icon.ico`
- **Installer language:** Japanese (code 1041)

## Database

### Location

| OS | Path |
|----|------|
| Windows | `%APPDATA%\hansen-solubility-tool\hansen.db` |
| macOS | `~/Library/Application Support/hansen-solubility-tool/hansen.db` |
| Linux | `~/.config/hansen-solubility-tool/hansen.db` |

### Initialization

On first launch:
1. SQLite database created at user data path
2. Schema tables created (`parts_groups`, `parts`, `solvents`, `nano_particles`, `drugs`, `settings`)
3. Migration run (adds physical property columns if upgrading from older version)
4. Seed data loaded:
   - ~85 solvents with physical properties
   - 7 polymer groups (~60 parts)
   - 18 nanoparticles (CNT, graphene, Ag NP, TiO₂, ZnO, etc.)
   - 15 drugs (アセトアミノフェン, イブプロフェン, etc.)
   - 12 coating materials (「コーティング材料」group)
   - 10 plasticizers (Solvent with [可塑剤] tag)
   - 11 DDS carriers (「DDSキャリア」group)

### Backup

Copy `hansen.db` to back up all user data. The database uses WAL mode, so also copy `hansen.db-wal` and `hansen.db-shm` if they exist.

### Reset

Delete `hansen.db` (and `-wal`/`-shm` files) to reset to defaults. Data will be re-seeded on next launch.

## Common Issues

### `better-sqlite3` build fails on install

**Cause:** Missing native build tools.

**Fix:**
```bash
# Windows
npm install --global windows-build-tools
# or install Visual Studio Build Tools with C++ workload

# macOS
xcode-select --install

# Linux
sudo apt install python3 make g++
```

Then retry: `npm install`

### Electron fails to start

**Cause:** Main process TypeScript not compiled.

**Fix:**
```bash
npm run build:main
npm start
```

### Database locked error

**Cause:** Multiple instances of the app running, or WAL file corruption.

**Fix:**
1. Close all app instances
2. Delete `hansen.db-wal` and `hansen.db-shm` (not the main `.db` file)
3. Restart the app

### Native module version mismatch

**Cause:** `better-sqlite3` compiled for wrong Electron version.

**Fix:**
```bash
npx @electron/rebuild
```

### Vite dev server not connecting

**Cause:** Port conflict or renderer not started.

**Fix:**
1. Check if port 5173 is available
2. Run `npm run dev` (starts both processes)
3. If separate, start renderer first: `npm run dev:renderer`, then `npm run dev:main`

## Docker Testing

Run tests in Docker when local native build is problematic:

```bash
npm run docker:test              # All tests with coverage
npm run docker:test:unit         # Unit tests only
npm run docker:test:integration  # Integration tests only
```

**Base image:** `node:20-bookworm-slim` with Python3, make, g++.

## Verification

```bash
npm run typecheck         # TypeScript type checking
npm test                  # All test suites
npm run test:coverage     # Coverage report
npm run test:e2e          # E2E tests (requires app build first)
```

### Pre-release Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` — all tests green (349+ tests: unit 349 + renderer 85)
- [ ] `npm run test:e2e` — E2E tests pass
- [ ] `npm run package` — installer builds successfully
- [ ] Install and run the packaged app
- [ ] Verify polymer evaluation workflow (select group + solvent → evaluate → export CSV)
- [ ] Verify nanoparticle dispersion screening (select particle → screen all solvents → CSV export)
- [ ] Verify contact angle estimation (group mode + screening mode)
- [ ] Verify solvent blend optimization (target HSP + candidate solvents → ranking)
- [ ] Verify swelling prediction (group + solvent → swelling levels + elastomer warning)
- [ ] Verify drug solubility (drug + solvent/screening → solubility levels)
- [ ] Verify chemical resistance (coating group + solvent → resistance levels)
- [ ] Verify plasticizer selection (polymer → plasticizer screening)
- [ ] Verify DDS carrier selection (drug + carrier group/screening)
- [ ] Verify database editor (add/edit/delete operations for all entities)
- [ ] Verify mixture lab (create mixture → register to DB)
- [ ] Verify settings (all 9 threshold configurations persist)
