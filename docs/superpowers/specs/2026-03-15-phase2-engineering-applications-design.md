# Phase 2: HSP工学応用機能 設計書

## 概要

Phase 1（溶剤ブレンド最適化・膨潤度予測・薬物溶解性予測）に続き、3つの工学応用機能を追加する。
Phase 2では**新テーブルは作成せず**、既存エンティティ（Part, Solvent, Drug）にシードデータを追加し、
専用のUIと分類ロジックを構築する。

### 対象機能
1. **塗膜の耐薬品性予測** — コーティング材料の薬品耐性を5段階で予測
2. **可塑剤の選定支援** — ポリマーに適した可塑剤をHSP距離でスクリーニング
3. **薬物送達キャリア選定（DDS）** — 薬物に最適なキャリア材料をスクリーニング

### アーキテクチャ方針
Phase 1と同じ既存パターン踏襲型（アプローチA）。新DBテーブルなし。

### エンティティマッピング
| 機能 | 対象材料 | 既存エンティティ | 比較対象 | 既存エンティティ |
|------|---------|----------------|---------|----------------|
| 耐薬品性 | 塗膜 | Part（「コーティング材料」グループ） | 薬品 | Solvent |
| 可塑剤選定 | ポリマー | Part | 可塑剤 | Solvent（notesに「可塑剤」タグ） |
| DDS | 薬物 | Drug | キャリア | Part（「DDSキャリア」グループ） |

---

## 1. 塗膜の耐薬品性予測

### 1.1 目的
塗膜（コーティング）材料と薬品（溶媒）の組合せから、HSP距離ベースで耐薬品性を5段階で予測する。

### 1.2 理論的背景
- RED小 = HSP球内 = 溶媒が浸透しやすい = **耐性なし**
- RED大 = HSP球外 = 溶媒が浸透しない = **耐性良好**
- 既存の溶解リスク評価と**解釈が逆転**する

### 1.3 データモデル

```typescript
/** 耐薬品性レベル (1=耐性なし, 5=優秀な耐性) — RED大=耐性良好 */
enum ChemicalResistanceLevel {
  NoResistance = 1,   // 耐性なし（塗膜が溶解・剥離）
  Poor = 2,           // 低耐性
  Moderate = 3,       // 中程度の耐性
  Good = 4,           // 良好な耐性
  Excellent = 5,      // 優秀な耐性
}

/** 耐薬品性閾値設定 (RED値ベース) — RED大=良好 */
interface ChemicalResistanceThresholds {
  noResistanceMax: number;  // default: 0.5
  poorMax: number;          // default: 0.8
  moderateMax: number;      // default: 1.2
  goodMax: number;          // default: 2.0
}

/** 個別部品の耐薬品性予測結果 */
interface ChemicalResistanceResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  resistanceLevel: ChemicalResistanceLevel;
}

/** グループ全体の耐薬品性予測結果 */
interface GroupChemicalResistanceResult {
  partsGroup: PartsGroup;
  solvent: Solvent;
  results: ChemicalResistanceResult[];
  evaluatedAt: Date;
  thresholdsUsed: ChemicalResistanceThresholds;
}
```

### 1.4 コアロジック（`src/core/chemical-resistance.ts`）
- `classifyChemicalResistance(red, thresholds)`: RED → ChemicalResistanceLevel
  - **注意: 他の分類関数と解釈方向が逆。RED小→Level低(NoResistance=1=最悪), RED大→Level高(Excellent=5=最良)**
  - 実装上はif-else分岐の方向は同じ（RED昇順に閾値チェック）だが、Level番号の意味が逆
  - テストで必ず `RED=0.3 → NoResistance(1)` と `RED=2.5 → Excellent(5)` を検証すること
- `getChemicalResistanceLevelInfo(level)`: ラベル・説明・色
- 依存: `calculateRa()`, `calculateRed()` (hsp.ts)

### 1.4b Badgeコンポーネントの色方向に関する注意
ChemicalResistanceBadgeは他のBadge（Dispersibility, Swelling等）と**色の方向が逆**になる。
Level 1(NoResistance)=赤, Level 5(Excellent)=緑。他のBadgeではLevel 1=緑（最良）。
各Badgeコンポーネントは独立した色マッピングを持ち、共通ユーティリティは使用しないこと。

### 1.5 シードデータ（`src/db/seed-coatings.ts`）
既存PartsGroupに「コーティング材料」グループを追加（10〜15件）:
エポキシ樹脂、ウレタン樹脂、アクリル樹脂、フッ素樹脂(PTFE)、シリコーン樹脂、
アルキド樹脂、フェノール樹脂、塩化ビニル樹脂コーティング、ポリエステル樹脂、
メラミン樹脂 等

### 1.6 UI
- 新タブ「耐薬品性予測」
- コーティンググループ + 溶媒選択 → 全部品の耐薬品性一覧
- 結果テーブル: 塗膜名, Ra, RED, 耐薬品性バッジ + CSV出力
- 設定画面に耐薬品性閾値を追加

---

## 2. 可塑剤の選定支援

### 2.1 目的
ポリマー材料（Part）に対し、可塑剤（Solventとして登録）から最適なものをRED値でスクリーニングする。

### 2.2 理論的背景
- RED小 = 相溶性良好 = 可塑化効果大
- ナノ粒子分散スクリーニングと同構造

### 2.3 データモデル

```typescript
/** 可塑剤相溶性レベル (1=最良, 5=不相溶) — RED小=相溶性良好 */
enum PlasticizerCompatibilityLevel {
  Excellent = 1,
  Good = 2,
  Fair = 3,
  Poor = 4,
  Incompatible = 5,
}

/** 可塑剤相溶性閾値設定 (RED値ベース) */
interface PlasticizerCompatibilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  fairMax: number;       // default: 1.0
  poorMax: number;       // default: 1.5
}

/** 可塑剤スクリーニング結果 */
interface PlasticizerScreeningResult {
  part: Part;
  solvent: Solvent;
  ra: number;
  red: number;
  compatibility: PlasticizerCompatibilityLevel;
}

/** ポリマーに対する全可塑剤スクリーニング結果 */
interface PlasticizerEvaluationResult {
  part: Part;
  results: PlasticizerScreeningResult[];
  evaluatedAt: Date;
  thresholdsUsed: PlasticizerCompatibilityThresholds;
}
```

### 2.4 コアロジック（`src/core/plasticizer.ts`）
- `classifyPlasticizerCompatibility(red, thresholds)`: RED → PlasticizerCompatibilityLevel
- `getPlasticizerCompatibilityLevelInfo(level)`: ラベル・説明・色
- `screenPlasticizers(part, solvents, thresholds)`: 全可塑剤スクリーニング
- 依存: `calculateRa()`, `calculateRed()` (hsp.ts)

### 2.5 可塑剤の識別方法
Solventテーブルの `notes` フィールドに `[可塑剤]` タグを含めてシードデータを登録する。

**リポジトリ変更が必要:** 既存の `SolventRepository` / `SqliteSolventRepository` に
`getPlasticizers(): Solvent[]` メソッドを追加する（`notes LIKE '%可塑剤%'` でクエリ）。
既存の `searchSolvents()` は `name`, `name_en`, `cas_number` のみ検索するため、`notes` 検索には新メソッドが必要。

`src/db/repository.ts` と `src/db/sqlite-repository.ts` を変更対象に追加。
専用IPC: `solvents:getPlasticizers` を追加。

### 2.6 シードデータ（`src/db/seed-plasticizers.ts`）
Solventテーブルに可塑剤を追加（10〜15件、notesに `[可塑剤]` タグ）:
フタル酸ジオクチル(DOP)、フタル酸ジブチル(DBP)、アジピン酸ジオクチル(DOA)、
クエン酸トリブチル(TBC)、クエン酸アセチルトリブチル(ATBC)、
リン酸トリクレジル(TCP)、セバシン酸ジオクチル(DOS)、
エポキシ化大豆油(ESBO)、トリメリット酸トリオクチル(TOTM)、
アセチルクエン酸トリエチル(ATEC) 等

### 2.7 UI
- 新タブ「可塑剤選定」
- ポリマー（Part）選択 → 全可塑剤をRED昇順で一覧表示
- 結果テーブル: 可塑剤名, δD, δP, δH, Ra, RED, 相溶性バッジ + CSV出力
- 設定画面に可塑剤相溶性閾値を追加

---

## 3. 薬物送達キャリア選定（DDS）

### 3.1 目的
薬物（Drug）に対し、キャリア材料（Partとして登録）から最適なものをRED値でスクリーニングする。

### 3.2 理論的背景
- RED小 = 薬物とキャリアの親和性が高い = カプセル化効率が高い
- Drug × Part の新しい組合せだが、計算はRa/REDそのもの

### 3.3 データモデル

```typescript
/** キャリア適合性レベル (1=最良, 5=不適) — RED小=適合性良好 */
enum CarrierCompatibilityLevel {
  Excellent = 1,
  Good = 2,
  Fair = 3,
  Poor = 4,
  Incompatible = 5,
}

/** キャリア適合性閾値設定 (RED値ベース) */
interface CarrierCompatibilityThresholds {
  excellentMax: number;  // default: 0.5
  goodMax: number;       // default: 0.8
  fairMax: number;       // default: 1.0
  poorMax: number;       // default: 1.5
}

/** キャリアスクリーニング結果 */
interface CarrierScreeningResult {
  drug: Drug;
  carrier: Part;
  ra: number;
  red: number;
  compatibility: CarrierCompatibilityLevel;
}

/** 薬物に対する全キャリアスクリーニング結果 */
interface CarrierEvaluationResult {
  drug: Drug;
  results: CarrierScreeningResult[];
  evaluatedAt: Date;
  thresholdsUsed: CarrierCompatibilityThresholds;
}
```

### 3.4 コアロジック（`src/core/carrier-selection.ts`）
- `classifyCarrierCompatibility(red, thresholds)`: RED → CarrierCompatibilityLevel
- `getCarrierCompatibilityLevelInfo(level)`: ラベル・説明・色
- `screenCarriers(drug, carriers, thresholds)`: Drug × Part[] スクリーニング
  - `calculateRa(drug.hsp, carrier.hsp)` / `calculateRed(drug.hsp, carrier.hsp, carrier.r0)`
  - **重要: r0はキャリア（Part）のものを使用する。キャリアがHSP球の所有者であり、Drugは探針。Drug.r0を渡さないこと。**
- 依存: `calculateRa()`, `calculateRed()` (hsp.ts)

### 3.5 シードデータ（`src/db/seed-carriers.ts`）
既存PartsGroupに「DDSキャリア」グループを追加（10〜12件）:
PLGA、PLA、PEG、PCL、キトサン、ゼラチン、HPMC、
エチルセルロース、Eudragit、リン脂質(DPPC)、PLGA-PEG 等

### 3.6 UI
- 新タブ「キャリア選定（DDS）」
- 2モード: 個別評価（Drug + キャリア選択）/ キャリアスクリーニング（Drug選択 → 全キャリア一覧）
- Drug選択: Phase 1の `useDrugs()` Hookを再利用
- キャリア選択: 「DDSキャリア」グループのPartを表示
- 結果テーブル: キャリア名, δD, δP, δH, R₀, Ra, RED, 適合性バッジ + CSV出力
- 設定画面にキャリア適合性閾値を追加

---

## 4. 全体構成

### 4.1 タブ構成（変更後）
```
既存(9): 溶解性評価 | DB編集 | 混合溶媒 | ナノ粒子分散 | 接触角推定 | ブレンド最適化 | 膨潤度予測 | 薬物溶解性 | 設定
追加(3): 耐薬品性予測 | 可塑剤選定 | キャリア選定（DDS）
```

### 4.2 新規ファイル

| レイヤー | ファイル | 内容 |
|----------|----------|------|
| Core | `src/core/chemical-resistance.ts` | 耐薬品性分類 |
| Core | `src/core/plasticizer.ts` | 可塑剤相溶性分類・スクリーニング |
| Core | `src/core/carrier-selection.ts` | キャリア適合性分類・スクリーニング |
| DB | `src/db/seed-coatings.ts` | コーティング材料シードデータ |
| DB | `src/db/seed-plasticizers.ts` | 可塑剤シードデータ |
| DB | `src/db/seed-carriers.ts` | DDSキャリアシードデータ |
| Hook | `src/renderer/hooks/useChemicalResistance.ts` | 耐薬品性Hook |
| Hook | `src/renderer/hooks/usePlasticizer.ts` | 可塑剤選定Hook |
| Hook | `src/renderer/hooks/useCarrierSelection.ts` | キャリア選定Hook |
| View | `src/renderer/components/ChemicalResistanceView.tsx` | 耐薬品性UI |
| View | `src/renderer/components/PlasticizerView.tsx` | 可塑剤選定UI |
| View | `src/renderer/components/CarrierSelectionView.tsx` | キャリア選定UI |
| View | `src/renderer/components/ChemicalResistanceBadge.tsx` | 耐薬品性バッジ |
| View | `src/renderer/components/PlasticizerBadge.tsx` | 相溶性バッジ |
| View | `src/renderer/components/CarrierBadge.tsx` | 適合性バッジ |
| Test | `tests/unit/chemical-resistance.test.ts` | 耐薬品性テスト |
| Test | `tests/unit/plasticizer.test.ts` | 可塑剤テスト |
| Test | `tests/unit/carrier-selection.test.ts` | キャリア選定テスト |

### 4.3 既存ファイル変更

| ファイル | 変更内容 |
|----------|----------|
| `src/core/types.ts` | 新型定義追加（3機能分） |
| `src/core/validation.ts` | `validateChemicalResistanceThresholds()`, `validatePlasticizerThresholds()`, `validateCarrierThresholds()` 追加 |
| `src/core/report.ts` | 3機能分のCSVフォーマッタ追加 |
| `src/main/main.ts` | シードデータ投入呼び出し追加 |
| `src/db/repository.ts` | `SolventRepository` に `getPlasticizers()` メソッド追加 |
| `src/db/sqlite-repository.ts` | `SqliteSolventRepository` に `getPlasticizers()` 実装追加 |
| `src/main/ipc-handlers.ts` | 3機能分のIPCハンドラ追加 |
| `src/main/preload.ts` | 新APIメソッド公開 |
| `src/preload.d.ts` | 型定義追加 |
| `src/renderer/App.tsx` | 3タブ追加 |
| `src/renderer/components/SettingsView.tsx` | 3機能の閾値設定UI追加 |

### 4.4 TDD実装順序

```
1. types.ts に型定義追加
2. テストファイル作成（RED）
3. コアロジック実装（GREEN）
4. バリデーション テスト → 実装
5. シードデータ追加
6. IPCハンドラ + Preload追加
7. Hook + View + Badge 実装
8. App.tsx + SettingsView 更新
```

### 4.5 ブランチ戦略
```
master
  └── feature/phase2-engineering-applications
      → 全3機能完了後、masterへマージ
```
