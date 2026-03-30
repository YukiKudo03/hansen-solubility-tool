<!-- Generated: 2026-03-24 | Updated: 2026-03-31 | Files scanned: 2 | Token estimate: ~750 -->

# External Dependencies & Build Tools

## Production Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| **better-sqlite3** | 12.8.0 | SQLite database driver | Native module, synchronous API |
| **react** | 19.2.4 | UI framework | Latest with hooks |
| **react-dom** | 19.2.4 | React rendering to DOM | Paired with react version |
| **plotly.js-basic-dist-min** | 3.4.0 | Data visualization | 3D scatter, mesh, HSP spheres |
| **react-plotly.js** | 2.6.0 | React Plotly wrapper | Declarative chart components |
| **jspdf** | 4.2.1 | PDF generation | Evaluation report export |
| **electron-updater** | 6.8.3 | Auto-update | GitHub Releases |
| **i18next** | 25.8.18 | Internationalization | ja/en |
| **react-i18next** | 16.5.8 | React i18n integration | useTranslation hook |

## Development Dependencies

### Core Development
| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| **typescript** | 5.9.3 | Type checking & compilation | Strict mode configured |
| **electron** | 41.0.2 | Desktop framework | Main + renderer process |
| **vite** | 5.4.21 | Build tool & dev server | Fast bundling |
| **@vitejs/plugin-react** | 4.7.0 | JSX transform plugin | Replaces @babel/preset-react |

### React & Types
| Package | Version | Purpose |
|---------|---------|---------|
| @types/react | 19.2.14 | React type definitions |
| @types/react-dom | 19.2.3 | React-DOM types |
| @types/better-sqlite3 | 7.6.13 | Database driver types |
| @types/node | 25.5.0 | Node.js type definitions |

### Testing
| Package | Version | Purpose |
|---------|---------|---------|
| **vitest** | 2.1.9 | Unit/integration test framework |
| @vitest/coverage-v8 | 2.1.9 | Code coverage reporter (V8) |
| **@playwright/test** | 1.58.2 | E2E testing framework |
| @testing-library/react | 16.3.2 | React component testing |
| @testing-library/dom | 10.4.1 | DOM query helpers |
| @testing-library/jest-dom | 6.9.1 | Custom matchers |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| happy-dom | 20.8.4 | Lightweight DOM for tests |

### Build & Packaging
| Package | Version | Purpose |
|---------|---------|---------|
| **electron-builder** | 26.8.1 | Package Electron to .exe/.dmg |
| **@electron/rebuild** | 4.0.3 | Rebuild native modules for Electron |
| **concurrently** | 9.2.1 | Run multiple npm scripts in parallel |

### CSS & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | 3.4.19 | Utility-first CSS framework |
| **postcss** | 8.5.8 | CSS transformation tool |
| **autoprefixer** | 10.4.27 | Add vendor prefixes |

## Build Scripts

```json
{
  "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\"",
  "dev:main": "tsc -p tsconfig.node.json && electron .",
  "dev:renderer": "vite --config vite.renderer.config.ts",
  "build": "npm run build:main && npm run build:renderer",
  "build:main": "tsc -p tsconfig.node.json",
  "build:renderer": "vite build --config vite.renderer.config.ts",
  "start": "electron .",
  "package": "npm run build && electron-builder --win",
  "pretest": "npm rebuild better-sqlite3 --silent",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed"
}
```

**Note:** `pretest` script auto-rebuilds better-sqlite3 for system Node.js (avoids ABI mismatch with Electron-compiled native module). Vitest uses `pool: 'forks'` for process isolation.

## Configuration Files

### TypeScript
- **tsconfig.json** — Main config (strict mode, ES2020 target)
- **tsconfig.node.json** — Main process config (CommonJS, no JSX)

### Vite
- **vite.config.ts** — Vitest config (pool: forks, coverage: v8)
- **vite.renderer.config.ts** — Renderer build config (React plugin, preload)

### Tailwind CSS
- **tailwind.config.js** — Theme customization, MD3 design tokens
- **postcss.config.js** — PostCSS with Tailwind + autoprefixer

### Electron
- electron-builder config in package.json
- Target: Windows (NSIS) / macOS (dmg) / Linux (AppImage)

## Installation & Runtime Requirements

- **Node.js:** 18.0+ (for npm scripts)
- **Python 3:** Required by better-sqlite3 (native compilation)
- **C++ compiler:**
  - Windows: Visual Studio Build Tools
  - macOS: Xcode CLI tools
  - Linux: build-essential

## Build Artifacts

### Development
- TypeScript → `dist/main/main.js` (compiled once)
- JSX → served via Vite dev server (hot reload)
- Database → `{userData}/hansen.db` (created on app startup)

### Production
- Main process: `dist/main/main.js` (tsc output)
- Renderer: `dist/renderer/index.html`, `dist/renderer/assets/` (Vite build)
- Package: `.exe` installer in `dist/` (electron-builder)

## Docker Support (Optional)

- `docker-compose.yml` — Main dev environment
- `docker-compose.test.yml` — Isolated test environment
- Services: `docker:build`, `docker:test`, `docker:test:unit`, `docker:test:integration`, `docker:dev`

## Security Considerations

- **Context Isolation:** Enabled (Electron preload bridge)
- **Node Integration:** Disabled
- **Sandbox:** Enabled (`sandbox: true` — 2026-03-31 hardened)
- **Preload:** Validates IPC messages via whitelist in `preload.ts`
- **IPC Validation:** All CRUD handlers (create + update) validated
- **History Save:** Pipeline allowlist + 1MB JSON size cap
- **DevTools:** Guarded by `NODE_ENV === 'development'`
- **File I/O:** `fs.promises` (non-blocking) + 10MB size limit on import

---

**Last Updated:** 2026-03-31

**Related:** See `architecture.md` for system design, `backend.md` for main process, `data.md` for database.
