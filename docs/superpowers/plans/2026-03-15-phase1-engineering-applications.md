# Phase 1: HSP工学応用機能 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** HSP評価ツールに溶剤ブレンド最適化・膨潤度予測・薬物溶解性予測の3機能を追加する

**Architecture:** 既存パイプラインと同じパターン（Core純粋関数 → IPC Handler → React Hook → View）で各機能を実装。TDD（RED→GREEN→REFACTOR）で進行。全3機能を `feature/phase1-engineering-applications` ブランチで開発し、完了後masterへマージ。

**Tech Stack:** TypeScript, Vitest, Electron IPC, React 19, Tailwind CSS, SQLite (better-sqlite3)

**Spec:** `docs/superpowers/specs/2026-03-15-phase1-engineering-applications-design.md`

---

## Chunk 1: ブランチ作成 + 共通型定義

### Task 1: ブランチ作成

**Files:** なし（git操作のみ）

- [ ] **Step 1: フィーチャーブランチを作成**

```bash
git checkout -b feature/phase1-engineering-applications
```

- [ ] **Step 2: 確認**

```bash
git branch --show-current
```
Expected: `feature/phase1-engineering-applications`

---

### Task 2: 型定義の追加

**Files:**
- Modify: `src/core/types.ts`

- [ ] **Step 1: `src/core/types.ts` に膨潤度・薬物溶解性・ブレンド最適化の型を追加**

ファイル末尾に以下を追加:

```typescript
// ─── 膨潤度予測系 ───────────────────────────

/** 膨潤レベル (1=最も膨潤, 5=膨潤なし) — RED小=膨潤大 */
export enum SwellingLevel {
  Severe = 1,     // 著しい膨潤（溶解に近い）
  High = 2,       // 高膨潤
  Moderate = 3,   // 中程度の膨潤
  Low = 4,        // 軽微な膨潤
  Negligible = 5, // 膨潤なし
}

/** 膨潤度閾値設定 (RED値ベース) */
export interface SwellingThresholds {
  severeMax: number;    // default: 0.5
  highMax: number;      // default: 0.8
  moderateMax: number;  // default: 1.0
  lowMax: number;       // default: 1.5
}

/** 膨潤度予測結果 */
export interface SwellingResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  swellingLevel: SwellingLevel;
}

/** グループ全体の膨潤度予測結果 */
export interface GroupSwellingResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: SwellingResult[];
  evaluatedAt: Date;
  thresholdsUsed: SwellingThresholds;
}

// ─── 薬物溶解性予測系 ───────────────────────────

/** 薬物（有効成分） */
export interface Drug {
  id: number;
  name: string;
  nameEn: string | null;
  casNumber: string | null;
  hsp: HSPValues;
  r0: number;
  molWeight: number | null;
  logP: number | null;
  therapeuticCategory: string | null;
  notes: string | null;
}

/** 薬物溶解性レベル (1=最良, 5=不溶) — RED小=溶解性良好 */
export enum DrugSolubilityLevel {
  Excellent = 1, // 優秀な溶解性（HSP球の深部）
  Good = 2,      // 良好な溶解性
  Partial = 3,   // 部分的に溶解（境界付近）
  Poor = 4,      // 溶解性低い
  Insoluble = 5, // 不溶
}

/** 薬物溶解性閾値設定 (RED値ベース) */
export interface DrugSolubilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  partialMax: number;    // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 薬物溶解性予測結果 */
export interface DrugSolubilityResult {
  drug: Drug;
  solvent: Solvent;
  ra: number;
  red: number;
  solubility: DrugSolubilityLevel;
}

/** 薬物に対する全溶媒スクリーニング結果 */
export interface DrugSolubilityScreeningResult {
  drug: Drug;
  results: DrugSolubilityResult[];
  evaluatedAt: Date;
  thresholdsUsed: DrugSolubilityThresholds;
}

// ─── 溶剤ブレンド最適化系 ───────────────────────────

/** ブレンド最適化の入力（コア層） */
export interface BlendOptimizationInput {
  targetHSP: HSPValues;
  candidateSolvents: Solvent[];
  maxComponents: 2 | 3;
  stepSize: number;   // default: 0.05 (5%), 有効範囲: 0 < stepSize <= 1
  topN: number;       // default: 20
}

/** ブレンド最適化の個別結果 */
export interface BlendResult {
  components: { solvent: Solvent; volumeFraction: number }[];
  blendHSP: HSPValues;
  ra: number;
}

/** ブレンド最適化の全体結果 */
export interface BlendOptimizationResult {
  targetHSP: HSPValues;
  topResults: BlendResult[];
  evaluatedAt: Date;
}
```

- [ ] **Step 2: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/core/types.ts
git commit -m "feat: Phase1工学応用機能の型定義を追加（膨潤度・薬物溶解性・ブレンド最適化）"
```

---

## Chunk 2: 溶剤ブレンド最適化（コア + バリデーション + テスト）

### Task 3: ブレンド最適化のテスト作成（RED）

**Files:**
- Create: `tests/unit/blend-optimizer.test.ts`

- [ ] **Step 1: テストファイルを作成**

```typescript
import { describe, it, expect } from 'vitest';
import { optimizeBlend, blendHSP } from '../../src/core/blend-optimizer';
import type { Solvent, HSPValues, BlendOptimizationInput } from '../../src/core/types';

/** テスト用ソルベント生成ヘルパー */
function makeSolvent(id: number, name: string, deltaD: number, deltaP: number, deltaH: number): Solvent {
  return {
    id, name, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH },
    molarVolume: null, molWeight: null, boilingPoint: null,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  };
}

describe('blendHSP', () => {
  it('単一溶媒の場合、そのHSPを返す', () => {
    const solvents: Solvent[] = [makeSolvent(1, 'A', 15.0, 5.0, 7.0)];
    const fractions = [1.0];
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.0);
    expect(result.deltaP).toBeCloseTo(5.0);
    expect(result.deltaH).toBeCloseTo(7.0);
  });

  it('2溶媒の50:50混合', () => {
    const solvents = [
      makeSolvent(1, 'A', 16.0, 4.0, 6.0),
      makeSolvent(2, 'B', 14.0, 8.0, 10.0),
    ];
    const fractions = [0.5, 0.5];
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.0);
    expect(result.deltaP).toBeCloseTo(6.0);
    expect(result.deltaH).toBeCloseTo(8.0);
  });

  it('3溶媒の体積分率加重平均', () => {
    const solvents = [
      makeSolvent(1, 'A', 15.0, 3.0, 6.0),
      makeSolvent(2, 'B', 18.0, 6.0, 9.0),
      makeSolvent(3, 'C', 12.0, 9.0, 12.0),
    ];
    const fractions = [0.5, 0.3, 0.2];
    // δD = 15*0.5 + 18*0.3 + 12*0.2 = 7.5 + 5.4 + 2.4 = 15.3
    const result = blendHSP(solvents, fractions);
    expect(result.deltaD).toBeCloseTo(15.3);
  });
});

describe('optimizeBlend', () => {
  const solventA = makeSolvent(1, 'Toluene', 18.0, 1.4, 2.0);
  const solventB = makeSolvent(2, 'Ethanol', 15.8, 8.8, 19.4);
  const solventC = makeSolvent(3, 'Acetone', 15.5, 10.4, 7.0);

  it('2成分探索で結果がRa昇順', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2,
      stepSize: 0.1,
      topN: 5,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
    expect(result.topResults.length).toBeLessThanOrEqual(5);
    // Ra昇順の確認
    for (let i = 1; i < result.topResults.length; i++) {
      expect(result.topResults[i].ra).toBeGreaterThanOrEqual(result.topResults[i - 1].ra);
    }
  });

  it('3成分探索で結果が返る', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 16.0, deltaP: 6.0, deltaH: 8.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 3,
      stepSize: 0.2,
      topN: 3,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
    expect(result.topResults.length).toBeLessThanOrEqual(3);
  });

  it('各結果のcomponentsの体積分率合計が1.0', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2,
      stepSize: 0.1,
      topN: 10,
    };
    const result = optimizeBlend(input);
    for (const r of result.topResults) {
      const total = r.components.reduce((sum, c) => sum + c.volumeFraction, 0);
      expect(total).toBeCloseTo(1.0);
    }
  });

  it('topNで結果数が制限される', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB, solventC],
      maxComponents: 2,
      stepSize: 0.1,
      topN: 2,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeLessThanOrEqual(2);
  });

  it('候補溶媒が2つで2成分探索が動作する', () => {
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB],
      maxComponents: 2,
      stepSize: 0.1,
      topN: 5,
    };
    const result = optimizeBlend(input);
    expect(result.topResults.length).toBeGreaterThan(0);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const input: BlendOptimizationInput = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      candidateSolvents: [solventA, solventB],
      maxComponents: 2,
      stepSize: 0.5,
      topN: 1,
    };
    const result = optimizeBlend(input);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/blend-optimizer.test.ts
```
Expected: FAIL（`blend-optimizer` モジュールが存在しない）

---

### Task 4: ブレンド最適化コアロジックの実装（GREEN）

**Files:**
- Create: `src/core/blend-optimizer.ts`

- [ ] **Step 1: `src/core/blend-optimizer.ts` を作成**

```typescript
/**
 * 溶剤ブレンド最適化 — グリッドサーチによる最適混合比探索
 *
 * ターゲットHSPに最も近い混合溶媒をRa（Hansen距離）最小で探索する。
 */
import type { HSPValues, Solvent, BlendOptimizationInput, BlendResult, BlendOptimizationResult } from './types';
import { calculateRa } from './hsp';

/**
 * 溶媒群と体積分率からブレンドHSPを計算する
 * δ_mix = Σ φi·δi （体積分率加重平均）
 */
export function blendHSP(solvents: Solvent[], fractions: number[]): HSPValues {
  let deltaD = 0;
  let deltaP = 0;
  let deltaH = 0;
  for (let i = 0; i < solvents.length; i++) {
    deltaD += fractions[i] * solvents[i].hsp.deltaD;
    deltaP += fractions[i] * solvents[i].hsp.deltaP;
    deltaH += fractions[i] * solvents[i].hsp.deltaH;
  }
  return { deltaD, deltaP, deltaH };
}

/**
 * topN件を保持するミニヒープ的な挿入
 * 配列をRa昇順にソートし、topNを超えたら末尾を切り捨て
 */
function insertResult(results: BlendResult[], newResult: BlendResult, topN: number): void {
  if (results.length < topN) {
    results.push(newResult);
    results.sort((a, b) => a.ra - b.ra);
  } else if (newResult.ra < results[results.length - 1].ra) {
    results[results.length - 1] = newResult;
    results.sort((a, b) => a.ra - b.ra);
  }
}

/**
 * 2成分ブレンドの探索
 */
function search2Components(
  targetHSP: HSPValues,
  solvents: Solvent[],
  stepSize: number,
  topN: number,
): BlendResult[] {
  const results: BlendResult[] = [];
  const n = solvents.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let f = stepSize; f <= 1 - stepSize + 1e-9; f += stepSize) {
        const f1 = f;
        const f2 = 1 - f;
        const blended = blendHSP([solvents[i], solvents[j]], [f1, f2]);
        const ra = calculateRa(targetHSP, blended);
        insertResult(results, {
          components: [
            { solvent: solvents[i], volumeFraction: Math.round(f1 * 1000) / 1000 },
            { solvent: solvents[j], volumeFraction: Math.round(f2 * 1000) / 1000 },
          ],
          blendHSP: blended,
          ra,
        }, topN);
      }
    }
  }

  return results;
}

/**
 * 3成分ブレンドの探索
 */
function search3Components(
  targetHSP: HSPValues,
  solvents: Solvent[],
  stepSize: number,
  topN: number,
): BlendResult[] {
  const results: BlendResult[] = [];
  const n = solvents.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let f1 = stepSize; f1 <= 1 - 2 * stepSize + 1e-9; f1 += stepSize) {
          for (let f2 = stepSize; f2 <= 1 - f1 - stepSize + 1e-9; f2 += stepSize) {
            const f3 = 1 - f1 - f2;
            if (f3 < stepSize - 1e-9) continue;
            const blended = blendHSP(
              [solvents[i], solvents[j], solvents[k]],
              [f1, f2, f3],
            );
            const ra = calculateRa(targetHSP, blended);
            insertResult(results, {
              components: [
                { solvent: solvents[i], volumeFraction: Math.round(f1 * 1000) / 1000 },
                { solvent: solvents[j], volumeFraction: Math.round(f2 * 1000) / 1000 },
                { solvent: solvents[k], volumeFraction: Math.round(f3 * 1000) / 1000 },
              ],
              blendHSP: blended,
              ra,
            }, topN);
          }
        }
      }
    }
  }

  return results;
}

/**
 * ブレンド最適化を実行する
 */
export function optimizeBlend(input: BlendOptimizationInput): BlendOptimizationResult {
  const { targetHSP, candidateSolvents, maxComponents, stepSize, topN } = input;

  const topResults = maxComponents === 2
    ? search2Components(targetHSP, candidateSolvents, stepSize, topN)
    : search3Components(targetHSP, candidateSolvents, stepSize, topN);

  return {
    targetHSP,
    topResults,
    evaluatedAt: new Date(),
  };
}
```

- [ ] **Step 2: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/blend-optimizer.test.ts
```
Expected: ALL PASS

- [ ] **Step 3: コミット**

```bash
git add src/core/blend-optimizer.ts tests/unit/blend-optimizer.test.ts
git commit -m "feat: 溶剤ブレンド最適化のコアロジックとテストを追加"
```

---

### Task 5: ブレンド最適化バリデーションのテストと実装

**Files:**
- Create: `tests/unit/blend-optimizer-validation.test.ts`
- Modify: `src/core/validation.ts`

- [ ] **Step 1: バリデーションテストを作成**

```typescript
import { describe, it, expect } from 'vitest';
import { validateBlendOptimizationInput } from '../../src/core/validation';

describe('validateBlendOptimizationInput', () => {
  it('有効な入力でnull', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 20,
    })).toBeNull();
  });

  it('stepSize=0でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0, topN: 20,
    })).toBeTruthy();
  });

  it('stepSize>1でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 1.5, topN: 20,
    })).toBeTruthy();
  });

  it('負のstepSizeでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: -0.1, topN: 20,
    })).toBeTruthy();
  });

  it('topN=0でエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 0,
    })).toBeTruthy();
  });

  it('候補数 < maxComponentsでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: 17.0, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 2, maxComponents: 3, stepSize: 0.05, topN: 20,
    })).toBeTruthy();
  });

  it('負のターゲットHSPでエラー', () => {
    expect(validateBlendOptimizationInput({
      targetDeltaD: -1, targetDeltaP: 5.0, targetDeltaH: 10.0,
      candidateCount: 3, maxComponents: 2, stepSize: 0.05, topN: 20,
    })).toBeTruthy();
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/blend-optimizer-validation.test.ts
```
Expected: FAIL

- [ ] **Step 3: `src/core/validation.ts` にバリデーション関数を追加**

ファイル末尾に追加:

```typescript
export function validateBlendOptimizationInput(input: {
  targetDeltaD: number;
  targetDeltaP: number;
  targetDeltaH: number;
  candidateCount: number;
  maxComponents: 2 | 3;
  stepSize: number;
  topN: number;
}): string | null {
  const hspErr = validateHSPValues(input.targetDeltaD, input.targetDeltaP, input.targetDeltaH);
  if (hspErr) return `ターゲットHSP: ${hspErr}`;
  if (!Number.isFinite(input.stepSize) || input.stepSize <= 0 || input.stepSize > 1) {
    return '刻み幅は0より大きく1以下の数値を入力してください';
  }
  if (!Number.isInteger(input.topN) || input.topN <= 0) {
    return '表示件数は正の整数を入力してください';
  }
  if (input.candidateCount < input.maxComponents) {
    return `候補溶媒は${input.maxComponents}件以上選択してください`;
  }
  return null;
}
```

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/blend-optimizer-validation.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: 既存テストが壊れていないことを確認**

```bash
npx vitest run tests/unit/
```
Expected: ALL PASS

- [ ] **Step 6: コミット**

```bash
git add tests/unit/blend-optimizer-validation.test.ts src/core/validation.ts
git commit -m "feat: ブレンド最適化のバリデーション追加"
```

---

## Chunk 3: 膨潤度予測（コア + バリデーション + テスト）

### Task 6: 膨潤度分類のテスト作成（RED）

**Files:**
- Create: `tests/unit/swelling.test.ts`

- [ ] **Step 1: テストファイルを作成**

```typescript
import { describe, it, expect } from 'vitest';
import { classifySwelling, DEFAULT_SWELLING_THRESHOLDS, getSwellingLevelInfo } from '../../src/core/swelling';
import { SwellingLevel } from '../../src/core/types';

describe('classifySwelling', () => {
  it('RED < 0.5 → Severe', () => {
    expect(classifySwelling(0.3)).toBe(SwellingLevel.Severe);
  });

  it('RED = 0.0 → Severe', () => {
    expect(classifySwelling(0.0)).toBe(SwellingLevel.Severe);
  });

  it('RED = 0.5 → High (境界)', () => {
    expect(classifySwelling(0.5)).toBe(SwellingLevel.High);
  });

  it('RED = 0.7 → High', () => {
    expect(classifySwelling(0.7)).toBe(SwellingLevel.High);
  });

  it('RED = 0.8 → Moderate (境界)', () => {
    expect(classifySwelling(0.8)).toBe(SwellingLevel.Moderate);
  });

  it('RED = 0.95 → Moderate', () => {
    expect(classifySwelling(0.95)).toBe(SwellingLevel.Moderate);
  });

  it('RED = 1.0 → Low (境界)', () => {
    expect(classifySwelling(1.0)).toBe(SwellingLevel.Low);
  });

  it('RED = 1.3 → Low', () => {
    expect(classifySwelling(1.3)).toBe(SwellingLevel.Low);
  });

  it('RED = 1.5 → Negligible (境界)', () => {
    expect(classifySwelling(1.5)).toBe(SwellingLevel.Negligible);
  });

  it('RED = 3.0 → Negligible', () => {
    expect(classifySwelling(3.0)).toBe(SwellingLevel.Negligible);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifySwelling(-0.1)).toThrow();
  });

  it('カスタム閾値が適用される', () => {
    const custom = { severeMax: 0.3, highMax: 0.6, moderateMax: 0.9, lowMax: 1.2 };
    expect(classifySwelling(0.25, custom)).toBe(SwellingLevel.Severe);
    expect(classifySwelling(0.35, custom)).toBe(SwellingLevel.High);
    expect(classifySwelling(0.65, custom)).toBe(SwellingLevel.Moderate);
    expect(classifySwelling(0.95, custom)).toBe(SwellingLevel.Low);
    expect(classifySwelling(1.25, custom)).toBe(SwellingLevel.Negligible);
  });
});

describe('DEFAULT_SWELLING_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_SWELLING_THRESHOLDS;
    expect(t.severeMax).toBeLessThan(t.highMax);
    expect(t.highMax).toBeLessThan(t.moderateMax);
    expect(t.moderateMax).toBeLessThan(t.lowMax);
  });
});

describe('getSwellingLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [
      SwellingLevel.Severe,
      SwellingLevel.High,
      SwellingLevel.Moderate,
      SwellingLevel.Low,
      SwellingLevel.Negligible,
    ];
    for (const level of levels) {
      const info = getSwellingLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/swelling.test.ts
```
Expected: FAIL

---

### Task 7: 膨潤度分類の実装（GREEN）

**Files:**
- Create: `src/core/swelling.ts`

- [ ] **Step 1: `src/core/swelling.ts` を作成**

```typescript
/**
 * 膨潤度予測の分類ロジック
 *
 * エラストマー/ゴム材料向け。RED小=膨潤大。
 * 既存のRiskLevel（溶解リスク）とは文脈が異なり、
 * 膨潤度に特化した閾値とラベルを持つ。
 */
import { SwellingLevel } from './types';
import type { SwellingThresholds } from './types';

/** デフォルト閾値 */
export const DEFAULT_SWELLING_THRESHOLDS: SwellingThresholds = {
  severeMax: 0.5,
  highMax: 0.8,
  moderateMax: 1.0,
  lowMax: 1.5,
};

/** 膨潤レベルの表示情報 */
export interface SwellingLevelInfo {
  level: SwellingLevel;
  label: string;
  description: string;
  color: string;
}

const SWELLING_LEVEL_INFO: Record<SwellingLevel, SwellingLevelInfo> = {
  [SwellingLevel.Severe]: {
    level: SwellingLevel.Severe,
    label: '著しい膨潤',
    description: '溶解に近い状態・使用不可',
    color: 'red',
  },
  [SwellingLevel.High]: {
    level: SwellingLevel.High,
    label: '高膨潤',
    description: '大きな体積変化・要注意',
    color: 'orange',
  },
  [SwellingLevel.Moderate]: {
    level: SwellingLevel.Moderate,
    label: '中程度',
    description: '軟化や寸法変化の可能性',
    color: 'yellow',
  },
  [SwellingLevel.Low]: {
    level: SwellingLevel.Low,
    label: '軽微',
    description: '実用上問題なし',
    color: 'teal',
  },
  [SwellingLevel.Negligible]: {
    level: SwellingLevel.Negligible,
    label: '膨潤なし',
    description: '耐薬品性良好',
    color: 'green',
  },
};

/**
 * RED値から膨潤レベルを判定する
 */
export function classifySwelling(
  red: number,
  thresholds: SwellingThresholds = DEFAULT_SWELLING_THRESHOLDS,
): SwellingLevel {
  if (red < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  if (red < thresholds.severeMax) return SwellingLevel.Severe;
  if (red < thresholds.highMax) return SwellingLevel.High;
  if (red < thresholds.moderateMax) return SwellingLevel.Moderate;
  if (red < thresholds.lowMax) return SwellingLevel.Low;
  return SwellingLevel.Negligible;
}

/**
 * 膨潤レベルの表示情報を取得する
 */
export function getSwellingLevelInfo(level: SwellingLevel): SwellingLevelInfo {
  return SWELLING_LEVEL_INFO[level];
}
```

- [ ] **Step 2: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/swelling.test.ts
```
Expected: ALL PASS

- [ ] **Step 3: コミット**

```bash
git add src/core/swelling.ts tests/unit/swelling.test.ts
git commit -m "feat: 膨潤度予測のコアロジックとテストを追加"
```

---

### Task 8: 膨潤度バリデーションのテストと実装

**Files:**
- Modify: `src/core/validation.ts`
- Modify: `tests/unit/validation.test.ts`

- [ ] **Step 1: `tests/unit/validation.test.ts` に膨潤度閾値バリデーションテストを追記**

ファイル末尾に追加:

```typescript
describe('validateSwellingThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateSwellingThresholds({ severeMax: 0.5, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeNull();
  });

  it('負の値でエラー', () => {
    expect(validateSwellingThresholds({ severeMax: -0.1, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });

  it('順序が不正でエラー', () => {
    expect(validateSwellingThresholds({ severeMax: 0.5, highMax: 0.3, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });

  it('NaNでエラー', () => {
    expect(validateSwellingThresholds({ severeMax: NaN, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 })).toBeTruthy();
  });
});
```

importに `validateSwellingThresholds` を追加すること。

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/validation.test.ts
```
Expected: FAIL（`validateSwellingThresholds` が存在しない）

- [ ] **Step 3: `src/core/validation.ts` に実装を追加**

ファイル末尾に追加:

```typescript
export function validateSwellingThresholds(t: {
  severeMax: number;
  highMax: number;
  moderateMax: number;
  lowMax: number;
}): string | null {
  const vals = [t.severeMax, t.highMax, t.moderateMax, t.lowMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.severeMax < t.highMax && t.highMax < t.moderateMax && t.moderateMax < t.lowMax)) {
    return '閾値は severeMax < highMax < moderateMax < lowMax の順でなければなりません';
  }
  return null;
}
```

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/validation.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add src/core/validation.ts tests/unit/validation.test.ts
git commit -m "feat: 膨潤度閾値バリデーション追加"
```

---

## Chunk 4: 薬物溶解性予測（コア + DB + バリデーション + テスト）

### Task 9: 薬物溶解性分類のテスト作成（RED）

**Files:**
- Create: `tests/unit/drug-solubility.test.ts`

- [ ] **Step 1: テストファイルを作成**

```typescript
import { describe, it, expect } from 'vitest';
import {
  classifyDrugSolubility,
  DEFAULT_DRUG_SOLUBILITY_THRESHOLDS,
  getDrugSolubilityLevelInfo,
  screenDrugSolvents,
} from '../../src/core/drug-solubility';
import { DrugSolubilityLevel } from '../../src/core/types';
import type { Drug, Solvent } from '../../src/core/types';

function makeDrug(id: number, deltaD: number, deltaP: number, deltaH: number, r0: number): Drug {
  return {
    id, name: `Drug${id}`, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH }, r0,
    molWeight: null, logP: null, therapeuticCategory: null, notes: null,
  };
}

function makeSolvent(id: number, name: string, deltaD: number, deltaP: number, deltaH: number): Solvent {
  return {
    id, name, nameEn: null, casNumber: null,
    hsp: { deltaD, deltaP, deltaH },
    molarVolume: null, molWeight: null, boilingPoint: null,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  };
}

describe('classifyDrugSolubility', () => {
  it('RED < 0.5 → Excellent', () => {
    expect(classifyDrugSolubility(0.3)).toBe(DrugSolubilityLevel.Excellent);
  });

  it('RED = 0.0 → Excellent', () => {
    expect(classifyDrugSolubility(0.0)).toBe(DrugSolubilityLevel.Excellent);
  });

  it('RED = 0.5 → Good (境界)', () => {
    expect(classifyDrugSolubility(0.5)).toBe(DrugSolubilityLevel.Good);
  });

  it('RED = 0.8 → Partial (境界)', () => {
    expect(classifyDrugSolubility(0.8)).toBe(DrugSolubilityLevel.Partial);
  });

  it('RED = 1.0 → Poor (境界)', () => {
    expect(classifyDrugSolubility(1.0)).toBe(DrugSolubilityLevel.Poor);
  });

  it('RED = 1.5 → Insoluble (境界)', () => {
    expect(classifyDrugSolubility(1.5)).toBe(DrugSolubilityLevel.Insoluble);
  });

  it('RED = 3.0 → Insoluble', () => {
    expect(classifyDrugSolubility(3.0)).toBe(DrugSolubilityLevel.Insoluble);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyDrugSolubility(-0.1)).toThrow();
  });

  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 0.3, goodMax: 0.6, partialMax: 0.9, poorMax: 1.2 };
    expect(classifyDrugSolubility(0.25, custom)).toBe(DrugSolubilityLevel.Excellent);
    expect(classifyDrugSolubility(0.35, custom)).toBe(DrugSolubilityLevel.Good);
    expect(classifyDrugSolubility(0.65, custom)).toBe(DrugSolubilityLevel.Partial);
    expect(classifyDrugSolubility(0.95, custom)).toBe(DrugSolubilityLevel.Poor);
    expect(classifyDrugSolubility(1.25, custom)).toBe(DrugSolubilityLevel.Insoluble);
  });
});

describe('DEFAULT_DRUG_SOLUBILITY_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.partialMax);
    expect(t.partialMax).toBeLessThan(t.poorMax);
  });
});

describe('getDrugSolubilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [
      DrugSolubilityLevel.Excellent,
      DrugSolubilityLevel.Good,
      DrugSolubilityLevel.Partial,
      DrugSolubilityLevel.Poor,
      DrugSolubilityLevel.Insoluble,
    ];
    for (const level of levels) {
      const info = getDrugSolubilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenDrugSolvents', () => {
  const drug = makeDrug(1, 17.0, 10.0, 8.0, 5.0);
  const solvents = [
    makeSolvent(1, 'Close', 17.1, 10.1, 8.1),     // 近い → RED小
    makeSolvent(2, 'Medium', 15.0, 5.0, 4.0),      // 中間
    makeSolvent(3, 'Far', 25.0, 1.0, 1.0),          // 遠い → RED大
  ];

  it('結果がRED昇順にソートされる', () => {
    const result = screenDrugSolvents(drug, solvents);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].red).toBeGreaterThanOrEqual(result.results[i - 1].red);
    }
  });

  it('全溶媒が結果に含まれる', () => {
    const result = screenDrugSolvents(drug, solvents);
    expect(result.results.length).toBe(3);
  });

  it('結果にdrugが正しく設定される', () => {
    const result = screenDrugSolvents(drug, solvents);
    expect(result.drug.id).toBe(1);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const result = screenDrugSolvents(drug, solvents);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/drug-solubility.test.ts
```
Expected: FAIL

---

### Task 10: 薬物溶解性コアロジックの実装（GREEN）

**Files:**
- Create: `src/core/drug-solubility.ts`

- [ ] **Step 1: `src/core/drug-solubility.ts` を作成**

```typescript
/**
 * 薬物溶解性予測の分類・スクリーニングロジック
 *
 * 医薬品有効成分（API）と溶媒の溶解性をRED値で5段階評価する。
 * RED小=溶解性良好。
 */
import { DrugSolubilityLevel } from './types';
import type { Drug, Solvent, DrugSolubilityThresholds, DrugSolubilityResult, DrugSolubilityScreeningResult } from './types';
import { calculateRa, calculateRed } from './hsp';

/** デフォルト閾値 */
export const DEFAULT_DRUG_SOLUBILITY_THRESHOLDS: DrugSolubilityThresholds = {
  excellentMax: 0.5,
  goodMax: 0.8,
  partialMax: 1.0,
  poorMax: 1.5,
};

/** 薬物溶解性レベルの表示情報 */
export interface DrugSolubilityLevelInfo {
  level: DrugSolubilityLevel;
  label: string;
  description: string;
  color: string;
}

const DRUG_SOLUBILITY_LEVEL_INFO: Record<DrugSolubilityLevel, DrugSolubilityLevelInfo> = {
  [DrugSolubilityLevel.Excellent]: {
    level: DrugSolubilityLevel.Excellent,
    label: '優秀',
    description: '非常に高い溶解性が期待できる',
    color: 'green',
  },
  [DrugSolubilityLevel.Good]: {
    level: DrugSolubilityLevel.Good,
    label: '良好',
    description: '良好な溶解性が期待できる',
    color: 'teal',
  },
  [DrugSolubilityLevel.Partial]: {
    level: DrugSolubilityLevel.Partial,
    label: '部分的',
    description: '部分的に溶解（条件次第）',
    color: 'yellow',
  },
  [DrugSolubilityLevel.Poor]: {
    level: DrugSolubilityLevel.Poor,
    label: '不良',
    description: '溶解性が低い',
    color: 'orange',
  },
  [DrugSolubilityLevel.Insoluble]: {
    level: DrugSolubilityLevel.Insoluble,
    label: '不溶',
    description: '溶解しない',
    color: 'red',
  },
};

/**
 * RED値から薬物溶解性レベルを判定する
 */
export function classifyDrugSolubility(
  red: number,
  thresholds: DrugSolubilityThresholds = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS,
): DrugSolubilityLevel {
  if (red < 0) {
    throw new Error('RED値は非負でなければなりません');
  }
  if (red < thresholds.excellentMax) return DrugSolubilityLevel.Excellent;
  if (red < thresholds.goodMax) return DrugSolubilityLevel.Good;
  if (red < thresholds.partialMax) return DrugSolubilityLevel.Partial;
  if (red < thresholds.poorMax) return DrugSolubilityLevel.Poor;
  return DrugSolubilityLevel.Insoluble;
}

/**
 * 薬物溶解性レベルの表示情報を取得する
 */
export function getDrugSolubilityLevelInfo(level: DrugSolubilityLevel): DrugSolubilityLevelInfo {
  return DRUG_SOLUBILITY_LEVEL_INFO[level];
}

/**
 * 薬物に対して全溶媒をスクリーニングし、REDでソートして返す
 */
export function screenDrugSolvents(
  drug: Drug,
  solvents: Solvent[],
  thresholds: DrugSolubilityThresholds = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS,
): DrugSolubilityScreeningResult {
  const results: DrugSolubilityResult[] = solvents.map((solvent) => {
    const ra = calculateRa(drug.hsp, solvent.hsp);
    const red = calculateRed(drug.hsp, solvent.hsp, drug.r0);
    const solubility = classifyDrugSolubility(red, thresholds);
    return { drug, solvent, ra, red, solubility };
  });

  results.sort((a, b) => a.red - b.red);

  return {
    drug,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}
```

- [ ] **Step 2: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/drug-solubility.test.ts
```
Expected: ALL PASS

- [ ] **Step 3: コミット**

```bash
git add src/core/drug-solubility.ts tests/unit/drug-solubility.test.ts
git commit -m "feat: 薬物溶解性予測のコアロジックとテストを追加"
```

---

### Task 11: 薬物バリデーションのテストと実装

**Files:**
- Modify: `src/core/validation.ts`
- Modify: `tests/unit/validation.test.ts`

- [ ] **Step 1: `tests/unit/validation.test.ts` に薬物関連バリデーションテストを追記**

ファイル末尾に追加（importに `validateDrugInput`, `validateDrugSolubilityThresholds` を追加）:

```typescript
describe('validateDrugInput', () => {
  it('有効な入力でnull', () => {
    expect(validateDrugInput({
      name: 'Acetaminophen', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0,
    })).toBeNull();
  });

  it('名前が空でエラー', () => {
    expect(validateDrugInput({
      name: '', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0,
    })).toBeTruthy();
  });

  it('負のHSP値でエラー', () => {
    expect(validateDrugInput({
      name: 'Test', deltaD: -1, deltaP: 9.4, deltaH: 13.3, r0: 5.0,
    })).toBeTruthy();
  });

  it('R0=0でエラー', () => {
    expect(validateDrugInput({
      name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 0,
    })).toBeTruthy();
  });

  it('CAS番号フォーマット不正でエラー', () => {
    expect(validateDrugInput({
      name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0, casNumber: 'invalid',
    })).toBeTruthy();
  });

  it('CAS番号が空文字でも有効', () => {
    expect(validateDrugInput({
      name: 'Test', deltaD: 17.2, deltaP: 9.4, deltaH: 13.3, r0: 5.0, casNumber: '',
    })).toBeNull();
  });
});

describe('validateDrugSolubilityThresholds', () => {
  it('有効な閾値でnull', () => {
    expect(validateDrugSolubilityThresholds({
      excellentMax: 0.5, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5,
    })).toBeNull();
  });

  it('負の値でエラー', () => {
    expect(validateDrugSolubilityThresholds({
      excellentMax: -0.1, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5,
    })).toBeTruthy();
  });

  it('順序が不正でエラー', () => {
    expect(validateDrugSolubilityThresholds({
      excellentMax: 0.5, goodMax: 0.3, partialMax: 1.0, poorMax: 1.5,
    })).toBeTruthy();
  });
});
```

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/validation.test.ts
```
Expected: FAIL

- [ ] **Step 3: `src/core/validation.ts` に実装を追加**

ファイル末尾に追加:

```typescript
export function validateDrugInput(input: {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  casNumber?: string;
  molWeight?: number;
  logP?: number;
}): string | null {
  const nameErr = validateName(input.name);
  if (nameErr) return nameErr;
  const hspErr = validateHSPValues(input.deltaD, input.deltaP, input.deltaH);
  if (hspErr) return hspErr;
  const r0Err = validateR0(input.r0);
  if (r0Err) return r0Err;
  const casErr = validateCasNumber(input.casNumber);
  if (casErr) return casErr;
  if (input.molWeight !== undefined && (!Number.isFinite(input.molWeight) || input.molWeight <= 0)) {
    return '分子量は正の数値を入力してください';
  }
  return null;
}

export function validateDrugSolubilityThresholds(t: {
  excellentMax: number;
  goodMax: number;
  partialMax: number;
  poorMax: number;
}): string | null {
  const vals = [t.excellentMax, t.goodMax, t.partialMax, t.poorMax];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) {
    return '閾値はすべて0以上の数値を入力してください';
  }
  if (!(t.excellentMax < t.goodMax && t.goodMax < t.partialMax && t.partialMax < t.poorMax)) {
    return '閾値は excellentMax < goodMax < partialMax < poorMax の順でなければなりません';
  }
  return null;
}
```

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/validation.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add src/core/validation.ts tests/unit/validation.test.ts
git commit -m "feat: 薬物入力・溶解性閾値バリデーション追加"
```

---

### Task 12: 薬物DBスキーマ + リポジトリ + シードデータ

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `src/db/repository.ts`
- Modify: `src/db/sqlite-repository.ts`
- Create: `src/db/seed-drugs.ts`
- Modify: `src/main/main.ts`

- [ ] **Step 1: `src/db/schema.ts` — SCHEMA_SQLに`drugs`テーブルを追加**

`settings`テーブルの直前に追加:

```sql
CREATE TABLE IF NOT EXISTS drugs (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  name_en               TEXT,
  cas_number            TEXT,
  delta_d               REAL NOT NULL,
  delta_p               REAL NOT NULL,
  delta_h               REAL NOT NULL,
  r0                    REAL NOT NULL,
  mol_weight            REAL,
  log_p                 REAL,
  therapeutic_category  TEXT,
  notes                 TEXT,
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now'))
);
```

- [ ] **Step 2: `src/db/repository.ts` — CreateDrugDto + DrugRepositoryインターフェースを追加**

import文を以下に変更:
```typescript
import type { Part, PartsGroup, Solvent, RiskThresholds, NanoParticle, NanoParticleCategory, Drug } from '../core/types';
```

ファイル末尾に:

```typescript
/** 薬物作成DTO */
export interface CreateDrugDto {
  name: string;
  nameEn?: string;
  casNumber?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  molWeight?: number;
  logP?: number;
  therapeuticCategory?: string;
  notes?: string;
}

export interface DrugRepository {
  getAll(): Drug[];
  getById(id: number): Drug | null;
  getByTherapeuticCategory(category: string): Drug[];
  search(query: string): Drug[];
  create(dto: CreateDrugDto): Drug;
  update(id: number, dto: Partial<CreateDrugDto>): Drug | null;  // 注: specは update(drug: Drug): void だが、既存NanoParticleRepositoryパターン(id, dto)に合わせる
  delete(id: number): boolean;
}
```

- [ ] **Step 3: `src/db/sqlite-repository.ts` — SqliteDrugRepositoryを追加**

既存の `SqliteNanoParticleRepository` パターンに従い、ファイル末尾にクラスを追加。
行→Drugオブジェクト変換で `hsp: { deltaD, deltaP, deltaH }` を構成する（既存パターン参照）。

- [ ] **Step 4: `src/db/seed-drugs.ts` を作成**

文献ベースのHSP値で15件の代表的医薬品のシードデータ。
`seedDrugs(db)` 関数をエクスポート（既存 `seedNanoParticles` パターン参照）。

代表的な薬物（文献HSP値）:
- アセトアミノフェン (17.2, 9.4, 13.3, R0=5.0)
- イブプロフェン (17.6, 5.2, 8.0, R0=6.0)
- アスピリン (18.1, 7.3, 9.5, R0=5.5)
- カフェイン (19.5, 10.1, 13.8, R0=5.0)
- インドメタシン (19.0, 10.2, 8.0, R0=6.5)
- ナプロキセン (18.8, 6.4, 10.2, R0=5.5)
- ニフェジピン (19.6, 7.8, 6.5, R0=6.0)
- グリセオフルビン (18.5, 8.7, 10.2, R0=5.5)
- ピロキシカム (20.1, 11.5, 9.8, R0=5.0)
- フェナセチン (17.5, 8.5, 11.0, R0=5.5)
- ケトプロフェン (18.2, 6.8, 9.0, R0=5.5)
- スルファメトキサゾール (19.0, 12.5, 11.0, R0=5.0)
- カルバマゼピン (19.8, 8.5, 7.2, R0=6.0)
- フェニトイン (20.5, 9.0, 8.5, R0=5.5)
- テオフィリン (19.0, 11.0, 14.0, R0=5.0)

- [ ] **Step 5: `src/main/main.ts` — seedDrugs呼び出しを追加**

ファイル先頭のimport文に追加:
```typescript
import { seedDrugs } from '../db/seed-drugs';
```

`seedNanoParticles(db);` の直後に呼び出しを追加:
```typescript
seedDrugs(db);
```

- [ ] **Step 6: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 7: コミット**

```bash
git add src/db/schema.ts src/db/repository.ts src/db/sqlite-repository.ts src/db/seed-drugs.ts src/main/main.ts
git commit -m "feat: 薬物テーブル・リポジトリ・シードデータを追加"
```

---

## Chunk 5: CSV出力 + IPCハンドラ + Preload

### Task 13: CSVフォーマッタの追加

**Files:**
- Modify: `src/core/report.ts`
- Modify: `tests/unit/report.test.ts`

- [ ] **Step 1: `tests/unit/report.test.ts` に3機能分のCSVテストを追記**

膨潤度CSV、薬物溶解性CSV、ブレンド最適化CSVのテストを追加。
既存の `formatCsv` テストパターンに従い、BOM付きUTF-8ヘッダー行の検証を含める。

- [ ] **Step 2: テスト実行で失敗を確認**

```bash
npx vitest run tests/unit/report.test.ts
```
Expected: FAIL

- [ ] **Step 3: `src/core/report.ts` に3つのフォーマッタを追加**

`formatSwellingCsv(result: GroupSwellingResult)`, `formatDrugSolubilityCsv(result: DrugSolubilityScreeningResult)`, `formatBlendOptimizationCsv(result: BlendOptimizationResult)` を追加。
既存の `formatCsv`, `formatNanoDispersionCsv` パターンに従う。

- [ ] **Step 4: テスト実行で全パスを確認**

```bash
npx vitest run tests/unit/report.test.ts
```
Expected: ALL PASS

- [ ] **Step 5: コミット**

```bash
git add src/core/report.ts tests/unit/report.test.ts
git commit -m "feat: 膨潤度・薬物溶解性・ブレンド最適化のCSVフォーマッタ追加"
```

---

### Task 14: IPCハンドラの追加

**Files:**
- Modify: `src/main/ipc-handlers.ts`

- [ ] **Step 1: `registerIpcHandlers` の引数に `drugRepo: DrugRepository` を追加**

関数シグネチャを変更:

```typescript
export function registerIpcHandlers(
  partsRepo: PartsRepository,
  solventRepo: SolventRepository,
  settingsRepo: SettingsRepository,
  nanoParticleRepo: NanoParticleRepository,
  drugRepo: DrugRepository,  // 追加
): void {
```

- [ ] **Step 2: 膨潤度予測のIPCハンドラを追加**

`contactAngle:screenSolvents` ハンドラの後に追加:

```typescript
  // --- 膨潤度予測 ---
  ipcMain.handle('swelling:evaluate', (_, partsGroupId: number, solventId: number) => {
    const group = partsRepo.getGroupById(partsGroupId);
    if (!group) throw new Error(`部品グループ (ID: ${partsGroupId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('swelling_thresholds');
    const thresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_SWELLING_THRESHOLDS })
      : { ...DEFAULT_SWELLING_THRESHOLDS };

    const results = group.parts.map((part) => {
      const ra = calculateRa(part.hsp, solvent.hsp);
      const red = calculateRed(part.hsp, solvent.hsp, part.r0);
      const swellingLevel = classifySwelling(red, thresholds);
      return { part, solvent, ra, red, swellingLevel };
    });

    return { partsGroup: group, solvent, results, evaluatedAt: new Date(), thresholdsUsed: thresholds };
  });
```

膨潤度閾値設定のgetters/settersも追加。

- [ ] **Step 3: 薬物CRUD + 溶解性評価のIPCハンドラを追加**

薬物CRUD（`nanoParticles:*` ハンドラと同じパターンで実装）:

```typescript
  // --- 薬物 CRUD ---
  ipcMain.handle('drugs:getAll', () => drugRepo.getAll());
  ipcMain.handle('drugs:getById', (_, id: number) => drugRepo.getById(id));
  ipcMain.handle('drugs:getByCategory', (_, category: string) => drugRepo.getByTherapeuticCategory(category));
  ipcMain.handle('drugs:search', (_, query: string) => drugRepo.search(query));
  ipcMain.handle('drugs:create', (_, dto) => {
    const err = validateDrugInput(dto);
    if (err) throw new Error(err);
    return drugRepo.create(dto);
  });
  ipcMain.handle('drugs:update', (_, id, dto) => drugRepo.update(id, dto));
  ipcMain.handle('drugs:delete', (_, id: number) => drugRepo.delete(id));
```

薬物溶解性評価（`nanoDispersion:evaluate` / `nanoDispersion:screenAll` と同じパターンで実装）:

```typescript
  // --- 薬物溶解性評価 ---
  ipcMain.handle('drugSolubility:evaluate', (_, drugId: number, solventId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const solvent = solventRepo.getSolventById(solventId);
    if (!solvent) throw new Error(`溶媒 (ID: ${solventId}) が見つかりません`);

    const thresholdsJson = settingsRepo.getSetting('drug_solubility_thresholds');
    const thresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS })
      : { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };

    const ra = calculateRa(drug.hsp, solvent.hsp);
    const red = calculateRed(drug.hsp, solvent.hsp, drug.r0);
    const solubility = classifyDrugSolubility(red, thresholds);
    const singleResult = { drug, solvent, ra, red, solubility };
    return { drug, results: [singleResult], evaluatedAt: new Date(), thresholdsUsed: thresholds };
  });

  ipcMain.handle('drugSolubility:screenAll', (_, drugId: number) => {
    const drug = drugRepo.getById(drugId);
    if (!drug) throw new Error(`薬物 (ID: ${drugId}) が見つかりません`);
    const solvents = solventRepo.getAllSolvents();
    const thresholdsJson = settingsRepo.getSetting('drug_solubility_thresholds');
    const thresholds = thresholdsJson
      ? safeJsonParse(thresholdsJson, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS })
      : { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };
    return screenDrugSolvents(drug, solvents, thresholds);
  });
```

薬物溶解性閾値設定のgetters/setters:
```typescript
  ipcMain.handle('settings:getDrugSolubilityThresholds', () => {
    const json = settingsRepo.getSetting('drug_solubility_thresholds');
    if (!json) return { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS };
    return safeJsonParse(json, { ...DEFAULT_DRUG_SOLUBILITY_THRESHOLDS });
  });
  ipcMain.handle('settings:setDrugSolubilityThresholds', (_, thresholds) => {
    const err = validateDrugSolubilityThresholds(thresholds);
    if (err) throw new Error(err);
    settingsRepo.setSetting('drug_solubility_thresholds', JSON.stringify(thresholds));
  });
```

- [ ] **Step 4: ブレンド最適化のIPCハンドラを追加**

```typescript
  // --- ブレンド最適化 ---
  ipcMain.handle('blend:optimize', (_, params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }) => {
    const err = validateBlendOptimizationInput({
      targetDeltaD: params.targetDeltaD,
      targetDeltaP: params.targetDeltaP,
      targetDeltaH: params.targetDeltaH,
      candidateCount: params.candidateSolventIds.length,
      maxComponents: params.maxComponents,
      stepSize: params.stepSize,
      topN: params.topN,
    });
    if (err) throw new Error(err);

    const candidateSolvents = params.candidateSolventIds.map((id) => {
      const solvent = solventRepo.getSolventById(id);
      if (!solvent) throw new Error(`溶媒 (ID: ${id}) が見つかりません`);
      return solvent;
    });

    return optimizeBlend({
      targetHSP: { deltaD: params.targetDeltaD, deltaP: params.targetDeltaP, deltaH: params.targetDeltaH },
      candidateSolvents,
      maxComponents: params.maxComponents,
      stepSize: params.stepSize,
      topN: params.topN,
    });
  });
```

- [ ] **Step 5: `src/main/main.ts` — drugRepoを生成してregisterIpcHandlersに渡す**

```typescript
const drugRepo = new SqliteDrugRepository(db);
registerIpcHandlers(partsRepo, solventRepo, settingsRepo, nanoParticleRepo, drugRepo);
```

- [ ] **Step 6: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: コミット**

```bash
git add src/main/ipc-handlers.ts src/main/main.ts
git commit -m "feat: 膨潤度・薬物溶解性・ブレンド最適化のIPCハンドラ追加"
```

---

### Task 15: Preload + 型定義の更新

**Files:**
- Modify: `src/main/preload.ts`
- Modify: `src/preload.d.ts`

- [ ] **Step 1: `src/main/preload.ts` に新APIメソッドを追加**

既存パターンに従い、膨潤度・薬物・ブレンド最適化のIPC呼び出しを追加。

- [ ] **Step 2: `src/preload.d.ts` に型定義を追加**

`ElectronAPI` インターフェースに新メソッドの型を追加。

- [ ] **Step 3: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: コミット**

```bash
git add src/main/preload.ts src/preload.d.ts
git commit -m "feat: 新機能のPreload API公開・型定義更新"
```

---

## Chunk 6: React UI（Hooks + Views + App統合）

### Task 16: React Hooks の作成

**Files:**
- Create: `src/renderer/hooks/useSwelling.ts`
- Create: `src/renderer/hooks/useDrugs.ts`
- Create: `src/renderer/hooks/useDrugSolubility.ts`
- Create: `src/renderer/hooks/useBlendOptimizer.ts`

- [ ] **Step 1: 各Hookを作成**

既存の `useContactAngle.ts`, `useNanoDispersion.ts` パターンに従う。
各Hookは `useState` + `useCallback` で IPC呼び出しをラップ。

- [ ] **Step 2: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: コミット**

```bash
git add src/renderer/hooks/useSwelling.ts src/renderer/hooks/useDrugs.ts src/renderer/hooks/useDrugSolubility.ts src/renderer/hooks/useBlendOptimizer.ts
git commit -m "feat: 膨潤度・薬物・ブレンド最適化のReact Hooks追加"
```

---

### Task 17: Badge コンポーネントの作成

**Files:**
- Create: `src/renderer/components/SwellingBadge.tsx`
- Create: `src/renderer/components/DrugSolubilityBadge.tsx`

- [ ] **Step 1: 既存の `RiskBadge.tsx` / `DispersibilityBadge.tsx` パターンに従って作成**

各Badgeはレベルenumを受け取り、対応するラベル・色でTailwindバッジを表示。

- [ ] **Step 2: コミット**

```bash
git add src/renderer/components/SwellingBadge.tsx src/renderer/components/DrugSolubilityBadge.tsx
git commit -m "feat: 膨潤度・薬物溶解性のBadgeコンポーネント追加"
```

---

### Task 18: View コンポーネントの作成

**Files:**
- Create: `src/renderer/components/SwellingView.tsx`
- Create: `src/renderer/components/DrugSolubilityView.tsx`
- Create: `src/renderer/components/BlendOptimizerView.tsx`

- [ ] **Step 1: `SwellingView.tsx` — 既存 `ReportView.tsx` パターンに従う**

グループ選択 + 溶媒選択 → 評価実行 → 結果テーブル（Part名, Ra, RED, 膨潤バッジ）+ CSV出力。

**重要（spec 2.5）:** 非エラストマー材料の警告を実装すること:
- グループ選択時に `parts` の `materialType` を確認
- `materialType` が null または非エラストマー（`'elastomer'`, `'rubber'` 以外）の部品が含まれる場合、黄色の警告バナーを表示:
  「このグループにはエラストマー/ゴム以外の材料が含まれています。膨潤度予測はエラストマー向けの指標です。」
- 警告は表示のみ（ブロックしない）

- [ ] **Step 2: `DrugSolubilityView.tsx` — 既存 `NanoDispersionView.tsx` パターンに従う**

2モード: 個別評価（薬物+溶媒選択）/ 溶媒スクリーニング（薬物選択→全溶媒一覧）。

- [ ] **Step 3: `BlendOptimizerView.tsx`**

ターゲットHSP入力（手入力 or 既存材料選択）+ 候補溶媒チェックリスト + 実行 → 結果ランキングテーブル + CSV出力。

- [ ] **Step 4: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: コミット**

```bash
git add src/renderer/components/SwellingView.tsx src/renderer/components/DrugSolubilityView.tsx src/renderer/components/BlendOptimizerView.tsx
git commit -m "feat: 膨潤度・薬物溶解性・ブレンド最適化のViewコンポーネント追加"
```

---

### Task 19: App.tsx にタブを追加 + 設定・DB画面の更新

**Files:**
- Modify: `src/renderer/App.tsx`
- Modify: `src/renderer/components/SettingsView.tsx`
- Modify: `src/renderer/components/DatabaseEditor.tsx`

- [ ] **Step 1: `App.tsx` — Tab型と配列に3タブ追加**

```typescript
type Tab = 'report' | 'database' | 'mixture' | 'nanoDispersion' | 'contactAngle'
  | 'blendOptimizer' | 'swelling' | 'drugSolubility' | 'settings';
```

タブ配列に追加:
```typescript
{ id: 'blendOptimizer', label: '溶剤ブレンド最適化' },
{ id: 'swelling', label: '膨潤度予測' },
{ id: 'drugSolubility', label: '薬物溶解性' },
```

レンダリング部分に追加:
```typescript
{activeTab === 'blendOptimizer' && <BlendOptimizerView />}
{activeTab === 'swelling' && <SwellingView />}
{activeTab === 'drugSolubility' && <DrugSolubilityView />}
```

- [ ] **Step 2: `SettingsView.tsx` — 膨潤度・薬物溶解性閾値設定UIを追加**

既存の分散性閾値・濡れ性閾値設定のパターンに従う。

**重要（spec 2.5b）:** 膨潤度閾値セクションに注釈を追加:
「※ moderateMax のデフォルト値 1.0 は HSP球の境界（RED = 1.0）に対応します。RED < 1.0 は溶媒がHSP球内にあり、浸透・膨潤が起きやすいことを意味します。」

- [ ] **Step 3: `DatabaseEditor.tsx` — 薬物CRUDタブを追加**

既存のナノ粒子CRUDパターンに従い、薬物の追加・編集・削除UIを追加。

- [ ] **Step 4: ビルドが通ることを確認**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: コミット**

```bash
git add src/renderer/App.tsx src/renderer/components/SettingsView.tsx src/renderer/components/DatabaseEditor.tsx
git commit -m "feat: App.tsxに3タブ追加、設定・DB画面を更新"
```

---

## Chunk 7: Rendererテスト + 全テスト確認 + マージ

### Task 20: Rendererテストの作成

**Files:**
- Create: `tests/renderer/SwellingView.test.tsx`
- Create: `tests/renderer/DrugSolubilityView.test.tsx`
- Create: `tests/renderer/BlendOptimizerView.test.tsx`

- [ ] **Step 1: 各テストファイルを作成**

既存の `tests/renderer/` パターンに従い、`@testing-library/react` で:
- コンポーネントがレンダリングされること
- セレクター操作が動くこと
- ローディング状態の表示
- window.api のモック

`SwellingView.test.tsx` にはmaterialType警告テストを含めること（spec 2.5）:
- materialTypeがnullの部品を含むグループ選択時に警告メッセージが表示される
- materialTypeが'elastomer'の部品のみの場合は警告が表示されない

- [ ] **Step 2: テスト実行で失敗を確認（RED）**

```bash
npx vitest run tests/renderer/SwellingView.test.tsx tests/renderer/DrugSolubilityView.test.tsx tests/renderer/BlendOptimizerView.test.tsx
```
Expected: FAIL（Viewコンポーネントが未作成のため）

注意: このステップはTask 18（View作成）の**前**に行う。Task 18の実装でGREENにする。
Task 18完了後に再度テスト実行して全パスを確認する。

- [ ] **Step 3: テスト実行で全パスを確認（GREEN — Task 18完了後）**

```bash
npx vitest run tests/renderer/
```
Expected: ALL PASS（新規 + 既存）

- [ ] **Step 3: コミット**

```bash
git add tests/renderer/SwellingView.test.tsx tests/renderer/DrugSolubilityView.test.tsx tests/renderer/BlendOptimizerView.test.tsx
git commit -m "test: 膨潤度・薬物溶解性・ブレンド最適化のRendererテスト追加"
```

---

### Task 21: 全テスト実行 + マージ

- [ ] **Step 1: 全ユニットテスト実行**

```bash
npx vitest run
```
Expected: ALL PASS

- [ ] **Step 2: TypeScriptビルド確認**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: masterへマージ**

```bash
git checkout master
git merge feature/phase1-engineering-applications --no-ff -m "feat: Phase1 HSP工学応用機能（溶剤ブレンド最適化・膨潤度予測・薬物溶解性予測）を追加"
```

- [ ] **Step 4: マージ後テスト確認**

```bash
npx vitest run
```
Expected: ALL PASS
