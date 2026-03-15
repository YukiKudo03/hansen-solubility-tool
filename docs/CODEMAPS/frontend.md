<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 12 | Token estimate: ~850 -->

# Frontend Component Architecture

## Component Hierarchy

```
src/renderer/main.tsx (React entry point)
    └── App.tsx (tab router, state: activeTab: 'report' | 'database' | 'settings')
        ├── ReportView.tsx (Evaluation workflow)
        │   ├── PartsGroupSelector.tsx (dropdown select, state: selectedGroup)
        │   ├── SolventSelector.tsx (search + dropdown, state: selectedSolvent)
        │   ├── Button "評価実行" → calls window.api.evaluate()
        │   └── ResultsTable.tsx (conditional render if result)
        │       └── RiskBadge.tsx (reusable risk level badge)
        │
        ├── DatabaseEditor.tsx (CRUD UI for parts groups, parts, solvents)
        │   └── Full table editor (add/edit/delete rows)
        │
        ├── SettingsView.tsx (Risk threshold adjustment)
        │   └── Form inputs for dangerousMax, warningMax, etc.
        └── ErrorBoundary.tsx (catches React errors, shows fallback UI)
```

## Component Details

### ReportView.tsx
**Purpose:** Main evaluation workflow
**State:**
- `selectedGroup: PartsGroup | null`
- `selectedSolvent: Solvent | null`
- `result: GroupEvaluationResult | null`
- `isEvaluating: boolean`
- `error: string | null`

**Key Methods:**
- `handleEvaluate()` → calls `window.api.evaluate(groupId, solventId)`
- `handleExportCsv()` → calls `window.api.saveCsv(formatCsv(result))`

**Displays:** Solvent HSP values + physical properties (bp, viscosity, sg, st) as info cards (null-safe)

**Styling:** Tailwind grid layout, card shadow, button states

### ResultsTable.tsx
**Purpose:** Display evaluation results in table form
**Props:**
- `result: GroupEvaluationResult`

**Columns:**
- Part name, material type
- Part HSP (δD, δP, δH)
- Solvent name, HSP values
- Ra (Hansen distance)
- RED (Relative Energy Difference)
- Risk level (with badge)

### RiskBadge.tsx
**Purpose:** Visual risk level indicator
**Props:**
- `riskLevel: RiskLevel` (enum: 1-5)

**Maps to Tailwind classes:**
- 1 (Dangerous) → `bg-red-100 text-red-800`
- 2 (Warning) → `bg-orange-100 text-orange-800`
- 3 (Caution) → `bg-yellow-100 text-yellow-800`
- 4 (Hold) → `bg-blue-100 text-blue-800`
- 5 (Safe) → `bg-green-100 text-green-800`

### PartsGroupSelector.tsx
**Purpose:** Select a parts group for evaluation
**Props:**
- `onSelect: (group: PartsGroup) => void`
- `selected: PartsGroup | null`

**Behavior:** Dropdown loads groups via hook `usePartsGroups()`

### SolventSelector.tsx
**Purpose:** Search & select solvent for evaluation
**Props:**
- `onSelect: (solvent: Solvent) => void`
- `selected: Solvent | null`

**Features:** Text search input, dropdown with filtered results

### DatabaseEditor.tsx
**Purpose:** CRUD management of all data
**Tabs/Sections:**
- Parts Groups (add/edit/delete)
- Parts (add/edit/delete per group)
- Solvents (add/edit/delete)

### ErrorBoundary.tsx
**Purpose:** Catch React render errors gracefully
**Implementation:** Class component with `componentDidCatch()` and `getDerivedStateFromError()`
**Fallback:** Displays error message with retry button

### SettingsView.tsx
**Purpose:** Configure risk thresholds
**Inputs:** Form for RiskThresholds interface
```ts
dangerousMax: number  // default: 0.5
warningMax: number    // default: 0.8
cautionMax: number    // default: 1.2
holdMax: number       // default: 2.0
```

## Hooks

### usePartsGroups()
**Purpose:** Load & manage parts groups
**Signature:**
```ts
hook usePartsGroups(): {
  groups: PartsGroup[]
  loading: boolean
  error: string | null
  refresh(): Promise<void>
}
```
**IPC Calls:** `parts:getAllGroups`

### useSolvents()
**Purpose:** Load & manage solvents
**Signature:**
```ts
hook useSolvents(): {
  solvents: Solvent[]
  loading: boolean
  error: string | null
  search(query: string): Promise<Solvent[]>
  refresh(): Promise<void>
}
```
**IPC Calls:** `solvents:getAll`, `solvents:search`

### useEvaluation()
**Purpose:** Handle evaluation async logic
**Signature:**
```ts
hook useEvaluation(): {
  result: GroupEvaluationResult | null
  loading: boolean
  error: string | null
  evaluate(groupId: number, solventId: number): Promise<GroupEvaluationResult | null>
  reset(): void
}
```
**IPC Calls:** `evaluate`

## IPC Interface (window.api)

Exposed by `src/main/preload.ts`:

```ts
window.api = {
  // Parts groups
  getAllGroups(): Promise<PartsGroup[]>
  getGroupById(id: number): Promise<PartsGroup | null>
  createGroup(dto: CreatePartsGroupDto): Promise<PartsGroup>
  updateGroup(id: number, dto: Partial<CreatePartsGroupDto>): Promise<PartsGroup | null>
  deleteGroup(id: number): Promise<boolean>

  // Parts
  createPart(dto: CreatePartDto): Promise<Part>
  updatePart(id: number, dto: Partial<CreatePartDto>): Promise<Part | null>
  deletePart(id: number): Promise<boolean>

  // Solvents
  getAllSolvents(): Promise<Solvent[]>
  getSolventById(id: number): Promise<Solvent | null>
  searchSolvents(query: string): Promise<Solvent[]>
  createSolvent(dto: CreateSolventDto): Promise<Solvent>
  updateSolvent(id: number, dto: Partial<CreateSolventDto>): Promise<Solvent | null>
  deleteSolvent(id: number): Promise<boolean>

  // Evaluation
  evaluate(groupId: number, solventId: number): Promise<GroupEvaluationResult>

  // Settings
  getThresholds(): Promise<RiskThresholds>
  setThresholds(thresholds: RiskThresholds): Promise<void>

  // Export
  saveCsv(content: string): Promise<{ saved: boolean; filePath?: string }>
}
```

## Styling Strategy

- **Framework:** Tailwind CSS 3.4.19
- **Layout:** Tailwind grid, flexbox (no custom CSS)
- **Colors:**
  - Primary: `bg-blue-600` (buttons), `border-blue-700`
  - Neutral: `bg-gray-50`, `text-gray-800`, `border-gray-200`
  - Status: See RiskBadge colors
- **Responsive:** `grid-cols-1 md:grid-cols-2` patterns for mobile breakpoint

## Type Definitions

All component props typed via `src/core/types.ts`:

```ts
interface Part { id, groupId, name, materialType, hsp, r0, notes }
interface PartsGroup { id, name, description, parts }
interface Solvent { id, name, nameEn, casNumber, hsp, molarVolume, molWeight, boilingPoint, viscosity, specificGravity, surfaceTension, notes }
interface GroupEvaluationResult { partsGroup, solvent, results, evaluatedAt, thresholdsUsed }
interface PartEvaluationResult { part, solvent, ra, red, riskLevel }
```

---

**Related:** See `architecture.md` for IPC flow, `data.md` for database schema.
