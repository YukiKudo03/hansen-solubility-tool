<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 37 | Token estimate: ~950 -->

# Frontend Component Architecture

## Component Hierarchy (12 Tabs)

```
App.tsx (tab router)
├── ReportView (A: polymer risk) → PartsGroupSelector + SolventSelector → ResultsTable + RiskBadge
├── NanoDispersionView (B: nano screening) → Category + Particle → DispersibilityBadge
├── ContactAngleView (C: contact angle) → 2 modes (group/screening) → WettabilityBadge
├── BlendOptimizerView (D: blend optimization) → Target HSP + Solvent checkboxes → Ranking table
├── SwellingView (E: swelling) → Group + Solvent + elastomer warning → SwellingBadge
├── DrugSolubilityView (F: drug solubility) → Drug + Solvent/screening → DrugSolubilityBadge
├── ChemicalResistanceView (G: chemical resistance) → Group + Solvent → ChemicalResistanceBadge
├── PlasticizerView (H: plasticizer) → Group + Part → PlasticizerBadge
├── CarrierSelectionView (I: DDS carrier) → Drug + CarrierGroup/screening → CarrierBadge
├── DatabaseEditor (CRUD for groups, parts, solvents, drugs)
├── MixtureLab (mixed solvent creation)
├── SettingsView (9 threshold configurations)
└── ErrorBoundary
```

## Badges (7 components, each independent color mapping)

| Badge | Levels | Direction | L1 Color | L5 Color |
|-------|--------|-----------|----------|----------|
| RiskBadge | 1-5 | L1=worst | red | green |
| DispersibilityBadge | 1-5 | L1=best | green | red |
| WettabilityBadge | 1-6 | L1=hydrophilic | blue | red |
| SwellingBadge | 1-5 | L1=worst | red | green |
| DrugSolubilityBadge | 1-5 | L1=best | green | red |
| ChemicalResistanceBadge | 1-5 | **L1=worst** | **red** | **green** |
| PlasticizerBadge | 1-5 | L1=best | green | red |
| CarrierBadge | 1-5 | L1=best | green | red |

**Note:** ChemicalResistanceBadge has **inverted** direction (L1=NoResistance=red, L5=Excellent=green).

## Hooks (13)

| Hook | IPC Methods | Returns |
|------|-------------|---------|
| usePartsGroups | parts:getAllGroups | groups[], loading |
| useSolvents | solvents:getAll | solvents[], loading |
| useEvaluation | evaluate | result, loading, error, evaluate() |
| useNanoParticles | nanoParticles:getAll/getByCategory | particles[], loading |
| useNanoDispersion | nanoDispersion:screenAll/screenFiltered | result, loading, error |
| useContactAngle | contactAngle:evaluate/screenSolvents | result, loading, error, evaluate(), screenAll() |
| useBlendOptimizer | blend:optimize | result, loading, error, optimize() |
| useSwelling | swelling:evaluate | result, loading, error, evaluate() |
| useDrugs | drugs:getAll | drugs[], loading, refresh() |
| useDrugSolubility | drugSolubility:evaluate/screenAll | result, loading, error, evaluate(), screenAll() |
| useChemicalResistance | chemicalResistance:evaluate | result, loading, error, evaluate() |
| usePlasticizer | plasticizer:screen | result, loading, error, screen() |
| useCarrierSelection | carrier:evaluate/screenAll | result, loading, error, evaluate(), screenAll() |

## IPC Interface (window.api) — 70+ Methods

```
Parts CRUD:           getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, createPart, updatePart, deletePart (8)
Solvents CRUD:        getAll, getById, search, create, update, delete, createMixture, getPlasticizers (8)
NanoParticles CRUD:   getAll, getById, getByCategory, search, create, update, delete (7)
Drugs CRUD:           getAll, getById, getByCategory, search, create, update, delete (7)
Pipeline A:           evaluate (1)
Pipeline B:           evaluateNanoDispersion, screenAll, screenFiltered (3)
Pipeline C:           estimateContactAngle, screenContactAngle (2)
Pipeline D:           optimizeBlend (1)
Pipeline E:           evaluateSwelling (1)
Pipeline F:           evaluateDrugSolubility, screenDrugSolvents (2)
Pipeline G:           evaluateChemicalResistance (1)
Pipeline H:           screenPlasticizers (1)
Pipeline I:           evaluateCarrier, screenCarriers (2)
Settings (9 pairs):   get/set × Thresholds, Dispersibility, Wettability, Swelling, DrugSolubility, ChemResistance, Plasticizer, Carrier (18)
Export:               saveCsv (1)
```

---

**Related:** See `architecture.md` for pipeline details, `data.md` for database schema.
