<!-- Generated: 2026-03-15 | Node 18+ required -->

# External Dependencies & Build Tools

## Production Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| **better-sqlite3** | 12.8.0 | SQLite database driver | Native module, synchronous API |
| **react** | 19.2.4 | UI framework | Latest with hooks, RSC experimental |
| **react-dom** | 19.2.4 | React rendering to DOM | Paired with react version |

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

### Build & Packaging
| Package | Version | Purpose |
|---------|---------|---------|
| **electron-builder** | 26.8.1 | Package Electron to .exe/.dmg |
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
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration"
}
```

## Configuration Files

### TypeScript
- **tsconfig.json** — Main config (strict mode, ES2020 target)
- **tsconfig.node.json** — Main process config (CommonJS, no JSX)
- **vitest.config.ts** — Test runner config

### Vite
- **vite.renderer.config.ts** — Renderer build config
  - React plugin enabled
  - Electron preload configured
  - HTML entry point: `src/renderer/index.html`

### Tailwind CSS
- **tailwind.config.js** — Theme customization
- **postcss.config.js** — PostCSS with Tailwind + autoprefixer

### Electron
- **electron-builder.yml** or config in package.json
  - Target: Windows installer
  - Output directory: `dist/`

### ESLint/Prettier (if configured)
- Not present in package.json (optional to add)

## Installation & Runtime Requirements

- **Node.js:** 18.0+ (for npm scripts)
- **Python 3:** Required by better-sqlite3 (native compilation)
- **C++ compiler:**
  - Windows: Visual Studio Build Tools
  - macOS: Xcode CLI tools
  - Linux: build-essential

**Install command:**
```bash
npm install
# Builds better-sqlite3 native module during install
```

## Build Artifacts

### Development
- TypeScript → `dist/main/main.js` (compiled once)
- JSX → served via Vite dev server (hot reload)
- Database → `{userData}/hansen.db` (created on app startup)

### Production
- Main process: `dist/main/main.js` (tsc output)
- Renderer: `dist/renderer/index.html`, `dist/renderer/assets/` (Vite build)
- Package: `.exe` installer in `dist/` (electron-builder)

## Environment Variables

**Vite Dev Server:**
- `VITE_DEV_SERVER_URL` — Set by Vite, checked in main.ts to load dev server vs. production HTML

**Database:**
- None (hardcoded to `{userData}/hansen.db`)

## Docker Support (Optional)

**Files detected:**
- `docker-compose.yml` — Main dev environment
- `docker-compose.test.yml` — Isolated test environment

**Services:**
- `docker:build` — Build application image
- `docker:test` — Run all tests in container
- `docker:test:unit` — Unit tests only
- `docker:test:integration` — Integration tests only
- `docker:dev` — Development server

## Dependency Tree (Top-Level)

```
hansen-solubility
├── runtime
│   ├── better-sqlite3 (C++ native)
│   ├── react
│   └── react-dom
├── dev: build tools
│   ├── typescript (tsc)
│   ├── vite + plugin-react
│   ├── electron + electron-builder
│   └── concurrently
├── dev: testing
│   └── vitest + coverage-v8
└── dev: styling
    ├── tailwindcss
    ├── postcss
    └── autoprefixer
```

## Security Considerations

- **Context Isolation:** Enabled (Electron preload bridge)
- **Node Integration:** Disabled (unsafe)
- **Sandbox:** Disabled (required for native module access)
- **Preload:** Validates IPC messages via whitelist in `preload.ts`

## Performance Notes

- **better-sqlite3:** Synchronous but fast (no event loop blocking concern)
- **Tailwind:** Purges unused CSS in production build
- **Electron:** 41.0.2 includes V8 snapshot for faster startup
- **Vite:** ESM-based dev server, no bundle in dev mode

---

**Related:** See `architecture.md` for system design, `data.md` for database setup.
