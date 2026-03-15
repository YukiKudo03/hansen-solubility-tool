# Phase 1: HSP工学応用機能 設計書

## 概要

Hansen溶解度パラメータ（HSP）評価ツールに3つの工学応用機能を追加する。
既存アーキテクチャ（Electron + React + TypeScript + SQLite）のパターンを踏襲し、
TDD手法で実装する。

### 対象機能
1. **溶剤ブレンド最適化** — ターゲットHSPに最適な混合溶媒を自動探索
2. **膨潤度予測** — エラストマー/ゴムの溶剤膨潤リスクを5段階で予測
3. **薬物溶解性予測** — 医薬品有効成分（API）と溶媒の溶解性を5段階で予測

### アーキテクチャ方針
既存パターン踏襲型（アプローチA）を採用。各機能を既存の3パイプラインと同じパターンで追加する。

---

## 1. 溶剤ブレンド最適化

### 1.1 目的
ターゲットHSP値に対し、DB内の溶媒から最適な2〜3成分混合を自動探索する。
既存MixtureLab（手動混合比入力）の「逆問題」を解く機能。

### 1.2 アルゴリズム
- グリッドサーチによる全組合せ探索
- 2成分: 溶媒ペア × 分率刻み → Ra計算 → ソート
- 3成分: 溶媒トリプル × 2次元分率グリッド → Ra計算 → ソート
- HSP加重平均は `δ_mix = Σ φi·δi` をインライン計算（`mixHSP()` は `MixtureComponent[]` を要求するため直接使用せず、同等の体積分率加重平均を `blend-optimizer.ts` 内で実装）
- `calculateRa()` (hsp.ts) を再利用

### 1.3 データモデル

```typescript
/** ブレンド最適化の入力（コア層） */
interface BlendOptimizationInput {
  targetHSP: HSPValues;
  candidateSolvents: Solvent[];  // コア層ではSolvent[]を受け取る
  maxComponents: 2 | 3;
  stepSize: number;              // default: 0.05 (5%), 有効範囲: 0 < stepSize <= 1
  topN: number;                  // default: 20, 返却する上位結果数
}

/** ブレンド最適化の個別結果 */
interface BlendResult {
  components: { solvent: Solvent; volumeFraction: number }[];
  blendHSP: HSPValues;
  ra: number;
}

/** ブレンド最適化の全体結果 */
interface BlendOptimizationResult {
  targetHSP: HSPValues;
  topResults: BlendResult[];     // Ra昇順 Top N
  evaluatedAt: Date;
}
```

**IPC層の設計:** 既存パターンに従い、IPCハンドラは `candidateSolventIds: number[]` を受け取り、
リポジトリからSolventを解決してからコア関数に渡す。rendererからSolventオブジェクトを直接渡さない。

### 1.4 コアロジック
- ファイル: `src/core/blend-optimizer.ts`
- 関数: `optimizeBlend(input: BlendOptimizationInput): BlendOptimizationResult`
- 内部で体積分率加重平均HSPを計算（`δ_mix = Σ φi·δi`）
- 依存: `calculateRa()` (hsp.ts)
- 探索中は `topN` 件のみ保持するヒープ的アプローチで省メモリ化

### 1.6 バリデーション
- `validateBlendOptimizationInput()` を `validation.ts` に追加
- `stepSize`: 0 < stepSize <= 1（0でループ無限、>1で結果なし）
- `topN`: 正の整数
- `candidateSolvents`: `candidateSolvents.length >= maxComponents`（2成分探索なら最低2件、3成分なら最低3件）
- `targetHSP`: 各成分が非負の有限値

### 1.5 UI
- 新タブ「溶剤ブレンド最適化」
- ターゲットHSP入力（手入力 or 既存材料から選択）
- 候補溶媒のチェックリスト選択
- 結果: Ra昇順のランキングテーブル + 組成表示 + CSV出力

---

## 2. 膨潤度予測

### 2.1 目的
エラストマー/ゴム材料と溶媒の組合せから、HSP距離ベースで膨潤度を5段階で予測する。

### 2.2 理論的背景
- Flory-Huggins理論: χ = Vm·(δ1-δ2)²/(R·T)
- HSP 3次元ではRa/REDがより精度の高い指標
- RED < 1（HSP球内）= 溶媒浸透しやすい = 膨潤リスク大

### 2.3 データモデル

```typescript
/** 膨潤レベル (1=最も膨潤, 5=膨潤なし) */
enum SwellingLevel {
  Severe = 1,     // 著しい膨潤（溶解に近い）
  High = 2,       // 高膨潤
  Moderate = 3,   // 中程度の膨潤
  Low = 4,        // 軽微な膨潤
  Negligible = 5, // 膨潤なし
}

/** 膨潤度閾値設定 (RED値ベース) */
interface SwellingThresholds {
  severeMax: number;    // default: 0.5
  highMax: number;      // default: 0.8
  moderateMax: number;  // default: 1.0
  lowMax: number;       // default: 1.5
}

/** 膨潤度予測結果 */
interface SwellingResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  swellingLevel: SwellingLevel;
}

/** グループ全体の膨潤度予測結果 */
interface GroupSwellingResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: SwellingResult[];
  evaluatedAt: Date;
  thresholdsUsed: SwellingThresholds;
}
```

### 2.4 コアロジック
- ファイル: `src/core/swelling.ts`
- 関数: `classifySwelling(red, thresholds)`, `getSwellingLevelInfo(level)`
- 依存: `calculateRa()`, `calculateRed()` (hsp.ts)

### 2.5 材料適合性に関する注意
膨潤度予測は主にエラストマー/ゴム材料を対象とする。既存の `Part.materialType` フィールドを活用し、
UIで非エラストマー材料が含まれるグループを選択した場合は警告メッセージを表示する（ブロックはしない）。
テストケースに「materialTypeがnullまたは非エラストマーの場合の警告表示」を含める。

### 2.5b 閾値の物理的意味
`moderateMax` のデフォルト値 1.0 は HSP球の境界（RED = 1.0）に対応する物理的に有意な閾値である。
ユーザーは自由に変更可能だが、設定UIでRED = 1.0の意味について注釈を表示する。
バリデーションは既存パターン同様の厳密な単調増加のみを要求する。

### 2.6 既存リスク評価との違い

| 項目 | 溶解性リスク | 膨潤度予測 |
|------|-------------|-----------|
| 対象 | 全ポリマー | エラストマー/ゴム |
| 指標 | RED → 溶解リスク | RED → 膨潤度 |
| 閾値 | 独立した設定 | 膨潤に特化した設定 |
| 文脈 | 「溶解するか」 | 「どの程度膨潤するか」 |

### 2.7 UI
- 新タブ「膨潤度予測」
- グループ + 溶媒を選択 → 全Partの膨潤度一覧
- 結果テーブル: Part名, Ra, RED, 膨潤レベルバッジ + CSV出力
- 設定画面に膨潤度閾値を追加

---

## 3. 薬物溶解性予測

### 3.1 目的
薬物（API）と溶媒の組合せから、HSP距離ベースで溶解性を5段階で予測する。

### 3.2 データモデル

```typescript
/** 薬物（有効成分） */
interface Drug {
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

/** 薬物溶解性レベル (1=最良, 5=不溶) */
enum DrugSolubilityLevel {
  Excellent = 1,
  Good = 2,
  Partial = 3,
  Poor = 4,
  Insoluble = 5,
}

/** 薬物溶解性閾値設定 (RED値ベース) */
interface DrugSolubilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  partialMax: number;    // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 薬物溶解性予測結果 */
interface DrugSolubilityResult {
  drug: Drug;
  solvent: Solvent;
  ra: number;
  red: number;
  solubility: DrugSolubilityLevel;
}

/** 薬物に対する全溶媒スクリーニング結果 */
interface DrugSolubilityScreeningResult {
  drug: Drug;
  results: DrugSolubilityResult[];
  evaluatedAt: Date;
  thresholdsUsed: DrugSolubilityThresholds;
}
```

### 3.3 DBスキーマ

```sql
CREATE TABLE IF NOT EXISTS drugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_en TEXT,
  cas_number TEXT,
  delta_d REAL NOT NULL,
  delta_p REAL NOT NULL,
  delta_h REAL NOT NULL,
  r0 REAL NOT NULL,
  mol_weight REAL,
  log_p REAL,
  therapeutic_category TEXT,
  notes TEXT
);
```

### 3.4 シードデータ
代表的な医薬品 15〜20件（文献ベースHSP値）:
アセトアミノフェン、イブプロフェン、アスピリン、カフェイン、インドメタシン、
ピロキシカム、ナプロキセン、ニフェジピン、グリセオフルビン 等

### 3.5 コアロジック
- ファイル: `src/core/drug-solubility.ts`
- 関数: `classifyDrugSolubility()`, `getDrugSolubilityLevelInfo()`, `screenDrugSolvents()`
- 依存: `calculateRa()`, `calculateRed()` (hsp.ts)

### 3.6 リポジトリ

`DrugRepository` インターフェース（既存 `NanoParticleRepository` と同パターン）:

```typescript
/** 薬物作成用DTO（任意フィールドはオプショナル） */
interface CreateDrugDto {
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

interface DrugRepository {
  getAll(): Drug[];
  getById(id: number): Drug | null;        // 既存パターンに合わせて | null
  getByTherapeuticCategory(category: string): Drug[];
  search(query: string): Drug[];           // name, nameEn, therapeuticCategory で部分一致検索
  create(dto: CreateDrugDto): Drug;
  update(drug: Drug): void;
  delete(id: number): void;
}
```

`SqliteDrugRepository` で実装。

### 3.7 UI
- 新タブ「薬物溶解性」
- 2モード: 個別評価（薬物+溶媒選択）/ 溶媒スクリーニング（薬物選択→全溶媒一覧）
- DatabaseEditorに薬物タブ追加
- 設定画面に薬物溶解性閾値を追加

---

## 4. 全体構成

### 4.1 タブ構成（変更後）

```
既存: 溶解性評価 | データベース編集 | 混合溶媒 | ナノ粒子分散 | 接触角推定 | 設定
追加: 溶剤ブレンド最適化 | 膨潤度予測 | 薬物溶解性
```

### 4.2 新規ファイル

| レイヤー | ファイル | 内容 |
|----------|----------|------|
| Core | `src/core/blend-optimizer.ts` | グリッドサーチ最適化 |
| Core | `src/core/swelling.ts` | 膨潤度分類・レベル情報 |
| Core | `src/core/drug-solubility.ts` | 薬物溶解性分類・スクリーニング |
| DB | `src/db/seed-drugs.ts` | 薬物シードデータ |
| Hook | `src/renderer/hooks/useBlendOptimizer.ts` | ブレンド最適化Hook |
| Hook | `src/renderer/hooks/useSwelling.ts` | 膨潤度Hook |
| Hook | `src/renderer/hooks/useDrugSolubility.ts` | 薬物溶解性Hook |
| Hook | `src/renderer/hooks/useDrugs.ts` | 薬物CRUD Hook |
| View | `src/renderer/components/BlendOptimizerView.tsx` | ブレンド最適化UI |
| View | `src/renderer/components/SwellingView.tsx` | 膨潤度UI |
| View | `src/renderer/components/DrugSolubilityView.tsx` | 薬物溶解性UI |
| View | `src/renderer/components/SwellingBadge.tsx` | 膨潤バッジ |
| View | `src/renderer/components/DrugSolubilityBadge.tsx` | 溶解性バッジ |
| Test | `tests/unit/blend-optimizer.test.ts` | ブレンド最適化テスト |
| Test | `tests/unit/swelling.test.ts` | 膨潤度テスト |
| Test | `tests/unit/drug-solubility.test.ts` | 薬物溶解性テスト |
| Test | `tests/renderer/BlendOptimizerView.test.tsx` | UIテスト |
| Test | `tests/renderer/SwellingView.test.tsx` | UIテスト |
| Test | `tests/renderer/DrugSolubilityView.test.tsx` | UIテスト |

### 4.3 既存ファイル変更

| ファイル | 変更内容 |
|----------|----------|
| `src/core/types.ts` | 新型定義追加 |
| `src/core/validation.ts` | `validateBlendOptimizationInput()`, `validateSwellingThresholds()`, `validateDrugSolubilityThresholds()`, `validateDrugInput()` 追加 |
| `src/core/report.ts` | 3機能分のCSVフォーマッタ追加 |
| `src/db/schema.ts` | `drugs` テーブル追加 |
| `src/db/repository.ts` | `DrugRepository` インターフェース追加 |
| `src/db/sqlite-repository.ts` | `SqliteDrugRepository` 実装追加 |
| `src/main/main.ts` | 薬物シードデータ投入 |
| `src/main/ipc-handlers.ts` | 3機能分のIPCハンドラ追加 |
| `src/preload.ts` | 新APIメソッド公開 |
| `src/preload.d.ts` | 型定義追加 |
| `src/renderer/App.tsx` | 3タブ追加 |
| `src/renderer/components/DatabaseEditor.tsx` | 薬物CRUD UI追加 |
| `src/renderer/components/SettingsView.tsx` | 膨潤度・薬物溶解性閾値設定UI追加 |

### 4.4 TDD実装順序（各機能ごと）

```
1. types.ts に型定義追加
2. テストファイル作成（RED: 全テスト失敗）
3. コアロジック実装（GREEN: テスト通過）
4. バリデーション テスト → 実装
5. リポジトリ テスト → 実装（薬物溶解性のみ）
6. IPCハンドラ追加
7. Rendererテスト → Hook + View実装
8. リファクタ（REFACTOR）
```

### 4.5 ブランチ戦略

```
master
  └── feature/phase1-engineering-applications
        ├── 作業1: 溶剤ブレンド最適化
        ├── 作業2: 膨潤度予測
        └── 作業3: 薬物溶解性予測
      → 全3機能完了後、masterへマージ
```

---

## 5. スコープ外（Phase 2で対応）

- 塗膜の耐薬品性予測
- 可塑剤の選定支援
- 薬物送達キャリア選定（DDS）
