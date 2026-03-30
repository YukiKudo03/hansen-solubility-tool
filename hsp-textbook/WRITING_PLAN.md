# HSP教科書 執筆計画

## 基本仕様

| 項目 | 仕様 |
|------|------|
| 出力先 | `hsp-textbook/chapters/ch01.md` ～ `ch20.md` |
| 文体 | ハイブリッド（本文「である」調 / コラム・演習は語り口） |
| ボリューム | 各章10-20ページ相当（コンパクト版） |
| 方程式 | LaTeX主体 + 複雑な式にはUnicode併記 |
| 言語 | 日本語（専門用語は英語併記） |
| ソース | `hsp-textbook/results/Ch*.json`（20章分の構造化リサーチデータ） |

## 章構成テンプレート

```markdown
# 第N章 日本語タイトル
**Chapter N: English Title**

> **概要:** 2-3文のsynopsis

## 学習目標
- 目標1
- 目標2
- ...

## N.1 セクション名
（本文: 理論・方程式・解説）

## N.2 セクション名
...

---

### 演習問題
（worked_examples を具体的数値付き計算例として展開）

### 章末問題
（review_questions を日本語で展開）

### ソフトウェア実習
（software_demo の操作手順）

### 参考文献
（key_references をリスト化）
```

## 執筆ラウンド

### Round 1: Part I — 基礎理論
| 章 | タイトル | JSON | 難易度 | 推定ページ |
|----|---------|------|--------|-----------|
| Ch01 | HSP基礎理論 | Ch01_HSP_Fundamentals.json | undergraduate | 10-15pp |
| Ch02 | 熱力学的基盤 | Ch02_Thermodynamic_Foundations.json | graduate | 10-15pp |
| Ch03 | 温度・圧力効果 | Ch03_Temperature_Pressure_Effects.json | graduate | 10-15pp |
| Ch04 | HSP推算法 | Ch04_HSP_Estimation_Methods.json | graduate | 15-20pp |

### Round 2: Part II + Part III
| 章 | タイトル | JSON | 難易度 | 推定ページ |
|----|---------|------|--------|-----------|
| Ch05 | 接触角と濡れ性 | Ch05_Contact_Angle_Wettability.json | graduate | 10-15pp |
| Ch06 | 接着設計工学 | Ch06_Adhesion_Engineering.json | graduate | 15-20pp |
| Ch07 | 高分子の溶解と膨潤 | Ch07_Polymer_Solubility_Swelling.json | graduate | 15-20pp |
| Ch08 | ブレンドとリサイクル | Ch08_Polymer_Blends_Recycling.json | graduate | 15-20pp |

### Round 3: Part IV 前半
| 章 | タイトル | JSON | 難易度 | 推定ページ |
|----|---------|------|--------|-----------|
| Ch09 | 医薬品とDDS | Ch09_Pharmaceutical_Drug_Delivery.json | graduate | 15-20pp |
| Ch10 | バイオ医薬品と賦形剤 | Ch10_Biopharmaceuticals_Excipients.json | advanced | 15-20pp |
| Ch11 | ナノ材料分散 | Ch11_Nanomaterials_Dispersion.json | graduate | 15-20pp |
| Ch12 | コーティングと薄膜 | Ch12_Coatings_Films.json | graduate | 15-20pp |

### Round 4: Part IV 後半 + Part V 前半
| 章 | タイトル | JSON | 難易度 | 推定ページ |
|----|---------|------|--------|-----------|
| Ch13 | エネルギー・環境 | Ch13_Energy_Environment.json | graduate | 15-20pp |
| Ch14 | 食品・化粧品 | Ch14_Food_Cosmetics.json | graduate | 15-20pp |
| Ch15 | 産業特殊応用 | Ch15_Industrial_Specialty.json | graduate | 15-20pp |
| Ch16 | 溶媒選定と最適化 | Ch16_Solvent_Selection_Optimization.json | graduate | 15-20pp |

### Round 5: Part V 後半
| 章 | タイトル | JSON | 難易度 | 推定ページ |
|----|---------|------|--------|-----------|
| Ch17 | 可視化と解析 | Ch17_Visualization_Analysis.json | undergraduate | 10-15pp |
| Ch18 | データ管理と品質 | Ch18_Data_Management_Quality.json | graduate | 10-15pp |
| Ch19 | ソフトウェア設計 | Ch19_Software_Architecture.json | graduate | 10-15pp |
| Ch20 | 将来展望 | Ch20_Future_Directions.json | advanced | 10-15pp |

## 執筆ガイドライン

### 本文の書き方
- JSONの `key_concepts` を論理的な流れで組み立て、教科書的な解説文にする
- `historical_context` を冒頭の導入部に組み込む
- `equations` はLaTeX + Unicode併記（複雑な式の場合）で本文中に配置
- セクション分けは概念の自然な流れに従う（JSONの順序に縛られない）

### 方程式の記法
```markdown
$$R_a = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{H2})^2}$$

> Unicode: Ra = √{4(δD1 − δD2)² + (δP1 − δP2)² + (δH1 − δH2)²}
```

### 演習問題
- `worked_examples` の各項目を、問題文→解法→解答の3段階で展開
- 具体的な数値を使い、計算過程を段階的に示す

### ソフトウェア実習
- `software_demo` のデータを基に、ツールの操作手順を箇条書きで記載
- 入力値と期待される出力を明示

### 図表プレースホルダー
- `[図N.x: タイトル — 説明]` 形式で本文中に配置
- `[表N.x: タイトル — 説明]` 形式で本文中に配置

### 参考文献
- `key_references` を章末にリスト化
- 本文中は [著者名, 年] 形式で参照

## 品質基準

- [ ] 各章に学習目標が3-5個あること
- [ ] 主要方程式に導出の動機と物理的意味の説明があること
- [ ] 演習問題に具体的な数値と解答があること
- [ ] ソフトウェア実習の手順が再現可能であること
- [ ] 章間の相互参照が適切であること
- [ ] 前提知識（prerequisites）への言及があること
