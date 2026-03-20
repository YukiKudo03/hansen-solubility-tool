# Runbook

Hansen溶解度パラメータ評価ツール — 運用・デプロイガイド

## Build & Package

### Windows Installer

```bash
npm run build              # Compile TypeScript + bundle React
npm run package            # Build + create Windows installer
```

**Output:** `out/Hansen溶解度パラメータ評価ツール Setup {version}.exe`

### macOS / Linux

```bash
npm run package:mac        # macOS (.dmg + .zip, x64 + arm64)
npm run package:linux      # Linux (.AppImage + .deb, x64)
npm run package:all        # All platforms
```

### Build Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| Main process JS | `dist/main/` | Compiled Electron main |
| Renderer bundle | `dist/renderer/` | Vite-bundled React app |
| Windows installer | `out/*.exe` | NSIS installer (x64) |
| Portable exe | `out/*.exe` | Standalone portable build |
| macOS disk image | `out/*.dmg` | macOS installer (x64 + arm64) |
| Linux AppImage | `out/*.AppImage` | Linux portable (x64) |
| Linux deb | `out/*.deb` | Debian package (x64) |

### Electron Builder Config

- **Config:** `electron-builder.yml`
- **App ID:** `com.hansen-solubility.tool`
- **Targets:** Windows (NSIS + portable), macOS (dmg + zip), Linux (AppImage + deb)
- **ASAR:** Enabled, with `better-sqlite3` unpacked for native module access
- **Icon:** `build/icon.ico` (Win), `build/icon.icns` (Mac)
- **Installer language:** Japanese (code 1041)
- **Auto-update:** GitHub Releases via `electron-updater`

## Auto-Update

アプリは起動時にGitHub Releasesから最新バージョンを自動確認する。

- `autoDownload: true` — バックグラウンドダウンロード
- `autoInstallOnAppQuit: true` — 終了時に自動インストール
- 開発時（`VITE_DEV_SERVER_URL` 設定時）はスキップ

### リリース手順

```bash
# 1. バージョン更新
npm version patch  # or minor, major

# 2. ビルド + パッケージ
npm run package:all

# 3. GitHub Release 作成
gh release create v1.x.x out/*.exe out/*.dmg out/*.AppImage --title "v1.x.x" --notes "..."
```

## Database

### Location

| OS | Path |
|----|------|
| Windows | `%APPDATA%\hansen-solubility-tool\hansen.db` |
| macOS | `~/Library/Application Support/hansen-solubility-tool/hansen.db` |
| Linux | `~/.config/hansen-solubility-tool/hansen.db` |

### Schema (9 tables)

| Table | Purpose |
|-------|---------|
| `parts_groups` | ポリマー材料グループ |
| `parts` | 個別材料（HSP + R₀） |
| `solvents` | 溶媒（HSP + 物性値） |
| `nano_particles` | ナノ粒子（HSP + カテゴリ + 表面修飾） |
| `drugs` | 薬物（HSP + logP + 治療カテゴリ） |
| `dispersants` | 分散剤（anchor HSP + solvation HSP + HLB） |
| `settings` | アプリ設定（閾値等、key-value） |
| `bookmarks` | 評価条件のブックマーク |
| `evaluation_history` | 評価履歴の自動保存（上限1000件） |

### Initialization

On first launch:
1. SQLite database created at user data path
2. Schema tables created (9 tables)
3. Migration run (adds physical property columns if upgrading from older version)
4. Seed data loaded:
   - ~135 solvents with physical properties
   - 7 polymer groups (~41 parts)
   - 18 nanoparticles (CNT, graphene, Ag NP, TiO₂, ZnO, etc.)
   - 16 drugs (アセトアミノフェン, イブプロフェン, etc.)
   - 12 coating materials (「コーティング材料」group)
   - 10 plasticizers (Solvent with [可塑剤] tag)
   - 11 DDS carriers (「DDSキャリア」group)
   - ~10 dispersants (oleylamine, PVP, SDS, Tween 80, etc.)

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
npm test                  # All test suites (1100+ tests across 100+ files)
npm run test:coverage     # Coverage report (target: 90%+)
npm run test:e2e          # E2E tests (98+ tests)
npm run test:literature   # Literature validation (147 cases)
```

### Pre-release Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` — all tests green (1100+ unit/integration/component tests, coverage 90%+)
- [ ] `npm run test:e2e` — 98+ E2E tests pass
- [ ] `npm run package` — installer builds successfully
- [ ] Install and run the packaged app
- [ ] Verify polymer evaluation workflow (select group + solvent → evaluate → export CSV)
- [ ] Verify adhesion prediction (group + solvent → adhesion levels)
- [ ] Verify nanoparticle dispersion screening (select particle → screen all solvents → CSV export)
- [ ] Verify contact angle estimation (group mode + screening mode)
- [ ] Verify solvent blend optimization (target HSP + candidate solvents → ranking)
- [ ] Verify blend optimizer material reference (ポリマー/ナノ粒子/薬物からHSP自動入力)
- [ ] Verify swelling prediction (group + solvent → swelling levels + elastomer warning)
- [ ] Verify drug solubility (drug + solvent/screening → solubility levels)
- [ ] Verify chemical resistance (coating group + solvent → resistance levels)
- [ ] Verify plasticizer selection (polymer → plasticizer screening)
- [ ] Verify DDS carrier selection (drug + carrier group/screening)
- [ ] Verify dispersant selection (particle + solvent → dual-HSP anchor/solvation ranking)
- [ ] Verify multi-objective solvent selection (target HSP + multiple criteria → ranking)
- [ ] Verify green solvent screening (environmental criteria filtering)
- [ ] Verify HSP sphere fitting (material data → optimal HSP + R₀ calculation)
- [ ] Verify comparison report (multiple materials × solvents → heatmap)
- [ ] Verify HSP 3D visualization (group selection → 3D plot with spheres)
- [ ] Verify TEAS plot analysis (solvent Hansen parameters visualization)
- [ ] Verify Bagley plot analysis (temperature-dependent viscosity)
- [ ] Verify 2D projection analysis (dimensional reduction visualization)
- [ ] Verify group contribution estimation (molecular structure → HSP prediction)
- [ ] Verify bookmarks (save + restore evaluation conditions)
- [ ] Verify evaluation history (auto-save + filter + delete)
- [ ] Verify database editor (add/edit/delete operations for all entities)
- [ ] Verify mixture lab (create mixture → register to DB)
- [ ] Verify dark mode toggle (Light / Dark / System)
- [ ] Verify accuracy warnings display in applicable views
- [ ] Verify settings (all threshold configurations persist + theme persist)
