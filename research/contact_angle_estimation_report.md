# HSPによる接触角推定 調査レポート

調査日: 2026-03-15

---

## 1. エグゼクティブサマリー

Hansen溶解度パラメータ（HSP）から接触角を推定する手法を調査した。HSPの3成分（δD, δP, δH）から表面張力・表面エネルギー・界面張力を算出し、Young式により接触角θを求めることが可能である。本調査ではNakamoto-Yamamoto式（Langmuir 2023）を中心に、OWRK法、van Oss-Chaudhury-Good法、Beerbower式、Pirika相関式を比較検討し、実装に最適な手法を選定した。

**結論:** Nakamoto-Yamamoto式が最も直接的かつ実装が容易であり、HSPの3成分のみから接触角を推定できる。精度は実用的（誤差5-15°程度）で、傾向把握・スクリーニング用途に適する。

---

## 2. 理論的背景: HSPから接触角への経路

HSPから接触角を得るには、以下の3ステップの連鎖が必要である：

```
HSP (δD, δP, δH) → 表面張力/表面エネルギー → 界面張力 → Young式 → 接触角 θ
```

### 2.1 Young式（基礎）

固体-液体-気体の三相接触線における接触角θは以下で定義される：

```
γ_SV = γ_SL + γ_LV · cos(θ)
```

変形すると：

```
cos(θ) = (γ_SV − γ_SL) / γ_LV
```

ここで：
- `γ_SV` = 固体表面エネルギー（固体-気体）
- `γ_SL` = 固体-液体界面張力
- `γ_LV` = 液体表面張力（液体-気体）

θを予測するには、これら3つのγ値すべてが必要である。

---

## 3. 表面張力推定手法の比較

### 3.1 Nakamoto-Yamamoto式（2023, Langmuir） — **採用**

最も直接的なHSPベースのアプローチ。物質のHSP（δD, δP, δH）から表面/界面張力を推定する：

```
σ₁₂ = 0.0947·(δD₁ − δD₂)² + 0.0315·(δP₁ − δP₂)² + 0.0238·(δH₁ − δH₂)²
```

単位: mN/m

**液体表面張力**（液体 vs 空気）: 相手を空気（δD=0, δP=0, δH=0）として：

```
γ_LV = 0.0947·δD_L² + 0.0315·δP_L² + 0.0238·δH_L²
```

**固体表面エネルギー**: 同式で固体のHSP値を使用。

**界面張力**（液体 vs 固体）: HSP差を直接使用。

#### 係数の物理的意味

係数比は **4 : 1.33 : 1** で、HSP距離Ra²の係数比 **4 : 1 : 1** と類似している。これは分散力（δD）の寄与が最大であることを反映しており、物理的に一貫している。

#### 検証: 水の表面張力

水のHSP: δD=15.5, δP=16.0, δH=42.3

```
γ_LV = 0.0947 × 15.5² + 0.0315 × 16.0² + 0.0238 × 42.3²
     = 0.0947 × 240.25 + 0.0315 × 256.0 + 0.0238 × 1789.29
     = 22.75 + 8.06 + 42.58
     = 73.4 mN/m
```

実測値: 72.8 mN/m → 誤差 +0.8% で良好な一致。

#### 検証: PTFE × 水の接触角

PTFE HSP: δD=16.2, δP=1.8, δH=3.4

```
γ_SV = 0.0947 × 16.2² + 0.0315 × 1.8² + 0.0238 × 3.4²
     = 24.86 + 0.10 + 0.28 = 25.24 mN/m

γ_SL = 0.0947 × (16.2-15.5)² + 0.0315 × (1.8-16.0)² + 0.0238 × (3.4-42.3)²
     = 0.0947 × 0.49 + 0.0315 × 201.64 + 0.0238 × 1513.21
     = 0.05 + 6.35 + 36.01 = 42.41 mN/m

cos(θ) = (25.24 − 42.41) / 73.4 = −0.234
θ = arccos(−0.234) = 103.5°
```

実測値: 約108-115° → 概ね疎水性を正しく予測。

### 3.2 Beerbower式（古典的）

```
γ = 0.0715 · V_m^(1/3) · [δD² + 0.632·(δP² + δH²)]
```

V_m = モル体積 (cm³/mol)

**特徴:**
- 歴史的に最も引用されている
- モル体積が必要（追加パラメータ）
- 多くの化合物で実験データとの乖離が大きい
- δPとδHを「極性」として一括扱いし精度が落ちる

**不採用理由:** モル体積が必要、精度がNakamoto-Yamamoto式より劣る。

### 3.3 Pirika相関式（改良経験式）

498データポイントに基づく経験式：

```
γ = 0.0146 · (2.28·δD² + δP² + δH²) · V_m^0.2
```

**特徴:**
- Beerbower式より精度向上
- 依然としてモル体積が必要
- δDの係数2.28はNakamoto-Yamamoto式の4:1.33:1比と方向性が一致

**不採用理由:** モル体積が必要で実装の汎用性が下がる。

### 3.4 手法比較まとめ

| 手法 | 必要パラメータ | 精度 | 実装容易性 | 接触角推定 |
|------|---------------|------|-----------|-----------|
| **Nakamoto-Yamamoto** | δD, δP, δH のみ | 良好 | 容易 | 直接可能 |
| Beerbower | δD, δP, δH, V_m | 中程度 | 普通 | 間接的 |
| Pirika | δD, δP, δH, V_m | 良好 | 普通 | 間接的 |

---

## 4. 実験的手法との関連

### 4.1 OWRK法（Owens-Wendt-Rabel-Kaelble）

固体表面エネルギーを実験的に決定するための標準手法。表面エネルギーを分散成分と極性成分に分解する：

```
γ = γ^D + γ^P
```

OWRK式（Young式 + 幾何平均則の組合せ）：

```
γ_L · (1 + cos θ) / 2 = √(γ_S^D · γ_L^D) + √(γ_S^P · γ_L^P)
```

線形化すると：

```
γ_L·(1+cosθ) / (2·√γ_L^D) = √γ_S^P · √(γ_L^P/γ_L^D) + √γ_S^D
```

2種類以上の液体で接触角を測定することで、固体のγ_S^D、γ_S^Pを求める。

#### HSPとの対応関係

- **γ^D**（分散成分） ← 主に **δD** に対応
- **γ^P**（極性成分） ← **δP** と **δH** の合算に対応

Beerbower式が (δP² + δH²) をまとめて「極性」とする根拠はここにある。

### 4.2 van Oss-Chaudhury-Good法（vOCG法）

OWRKより精密な分解で、極性相互作用を酸-塩基成分に分割する：

```
γ = γ^LW + γ^AB
```

ここで：
- `γ^LW` = Lifshitz-van der Waals成分（非極性、≒ 分散力）
- `γ^AB = 2·√(γ⁺ · γ⁻)` = 酸-塩基成分
- `γ⁺` = Lewis酸（電子受容体）成分
- `γ⁻` = Lewis塩基（電子供与体）成分

vOCG接触角式：

```
γ_L · (1 + cosθ) / 2 = √(γ_S^LW · γ_L^LW) + √(γ_S⁺ · γ_L⁻) + √(γ_S⁻ · γ_L⁺)
```

3種類以上の液体で接触角を測定して固体の3成分を決定する。

#### HSPとの対応関係

- `γ^LW` ← **δD**（London分散力）
- `γ⁺` と `γ⁻` ← **δP** と **δH** の一部に対応

**限界:** 標準的なHSPではδHをプロトン供与体（酸）とプロトン受容体（塩基）に区別できないため、vOCG分解をHSPのみから完全に導出することはできない。

---

## 5. HSP距離（Ra）と濡れ性の相関

Hansen距離：

```
Ra² = 4·(δD₁ − δD₂)² + (δP₁ − δP₂)² + (δH₁ − δH₂)²
```

**定性的関係:** 液体と固体のRaが小さい → 界面張力γ_SLが小さい → cos(θ)が大きい → θが小さい（濡れやすい）

Nakamoto-Yamamoto式の界面張力 `σ₁₂ = 0.0947·ΔδD² + 0.0315·ΔδP² + 0.0238·ΔδH²` は、Ra²の重み付きバージョンに相当し、HSP距離と濡れ性の物理的つながりを定量的に裏付けている。

---

## 6. 実装に必要な追加パラメータ

### 採用手法（Nakamoto-Yamamoto）での要件

| パラメータ | 必要性 | ソース |
|-----------|--------|--------|
| δD, δP, δH（固体） | 必須 | 既存のPartデータ |
| δD, δP, δH（液体） | 必須 | 既存のSolventデータ |
| モル体積 V_m | 不要 | — |
| 既知の表面張力 | 不要（検証用には有用） | — |
| 酸/塩基分割 | 不要 | — |

**結論:** 既存のデータベースのHSP値のみで接触角推定が可能。追加データ不要。

---

## 7. 精度と限界

### 7.1 精度

- Nakamoto-Yamamoto論文では「実用的な濡れ性予測に十分」と報告
- 典型的な誤差: **5-15°**
- 定性的な傾向（親水/疎水の判別）は信頼性が高い

### 7.2 限界

1. **経験的係数:** 0.0947/0.0315/0.0238 はフィッティング値であり、全材料クラスへの汎用性は保証されない

2. **空気のHSP = (0,0,0) の仮定:** 厳密には近似

3. **酸-塩基区別なし:** 標準HSPのδHはプロトン供与/受容を区別しないため、強い極性系で精度が落ちる可能性

4. **表面 vs バルクHSP:** HSPはバルク熱力学量。ポリマー表面の鎖配向再編成などで表面HSPがバルクと異なる場合がある

5. **表面粗さ・不均一性:** Young式は理想的な平滑表面を仮定。実表面ではWenzel補正やCassie-Baxter補正が必要

6. **温度依存性:** HSPと表面張力はともに温度依存。室温（~25°C）を暗黙的に仮定

7. **ポリマー固有の効果:** 結晶化度、架橋密度、表面汚染は実際の接触角に影響するがHSPには反映されない

### 7.3 cos(θ) の値域制限

計算上 cos(θ) が [-1, 1] の範囲外になるケースがある。これは理論モデルの限界であり、実装では clamp 処理で対応する：

```typescript
cos(θ) = max(-1, min(1, (γ_SV − γ_SL) / γ_LV))
```

- cos(θ) > 1 → θ = 0°（完全濡れ）
- cos(θ) < -1 → θ = 180°（完全撥水）

---

## 8. 濡れ性分類

接触角に基づく6段階分類を設計した：

| レベル | 名称 | 接触角範囲 | 物理的意味 |
|--------|------|-----------|-----------|
| 1 | 超親水 (Super Hydrophilic) | θ < 10° | 液滴が薄膜状に広がる |
| 2 | 親水 (Hydrophilic) | 10° ≤ θ < 30° | 良好な濡れ性 |
| 3 | 濡れ性良好 (Wettable) | 30° ≤ θ < 60° | 中程度の濡れ性 |
| 4 | 中間 (Moderate) | 60° ≤ θ < 90° | 濡れ性と撥水性の境界 |
| 5 | 疎水 (Hydrophobic) | 90° ≤ θ < 150° | 液滴が球状に近い |
| 6 | 超撥水 (Super Hydrophobic) | θ ≥ 150° | 液滴がほぼ球形で転がる |

**θ = 90° の物理的意義:** Young式において cos(90°) = 0、すなわち γ_SV = γ_SL の境界。これを超えると液体が固体上で自発的に広がらなくなる。

---

## 9. 主要参考文献

### 本実装の基盤論文

1. **Nakamoto, S.; Yamamoto, H.** "Hansen Solubility Parameters for Directly Dealing with Surface and Interfacial Phenomena." *Langmuir* **2023**, 39(30), 10475-10484.
   - DOI: 10.1021/acs.langmuir.3c00913
   - Nakamoto-Yamamoto式の提案・検証論文
   - 接触角予測の実験検証（セッシル液滴法との比較）

### 表面エネルギー・HSP関連

2. **Hansen, C. M.** *Hansen Solubility Parameters: A User's Handbook*, 2nd ed.; CRC Press, 2007.
   - HSPの標準的教科書、表面エネルギーとの関連についての章を含む

3. **Free Surface Energy and Hansen Solubility Parameter Vector Field.** *Applied Sciences* **2024**, 14(13), 5834.
   - HSPベクトル場としての表面エネルギー解釈

4. **Critical assessment of the correlation between surface tension components and HSP.** *Colloids and Surfaces A* **2023**.
   - 表面張力成分とHSP相関の批判的評価

### 接触角・表面エネルギー測定法

5. **Owens, D. K.; Wendt, R. C.** "Estimation of the surface free energy of polymers." *J. Appl. Polym. Sci.* **1969**, 13, 1741-1747.
   - OWRK法の原論文

6. **van Oss, C. J.; Chaudhury, M. K.; Good, R. J.** "Interfacial Lifshitz-van der Waals and polar interactions in macroscopic systems." *Chem. Rev.* **1988**, 88(6), 927-941.
   - vOCG法の原論文

### オンラインリソース

7. Hansen Solubility Parameters — Surface Energy
   - https://www.hansen-solubility.com/HSP-science/Surface_Energy.php

8. Pirika — DIY HSP, Methods to Calculate/Estimate Your Own HSP
   - https://www.pirika.com/ENG/HSP/E-Book/Chap30.html

9. KRÜSS Scientific — OWRK Method
   - https://www.kruss-scientific.com/en/know-how/glossary/owens-wendt-rabel-and-kaelble-owrk-method

10. KRÜSS Scientific — van Oss and Good Method
    - https://www.kruss-scientific.com/en/know-how/glossary/oss-and-good-method

11. Ossila — A Guide to Surface Energy
    - https://www.ossila.com/pages/a-guide-to-surface-energy

12. AccuDyne Test — Solubility Table (Surface Tension, HSP, Molar Volume)
    - https://www.accudynetest.com/solubility_table.html

---

## 10. 実装判断のまとめ

| 判断項目 | 決定 | 理由 |
|---------|------|------|
| 推定手法 | Nakamoto-Yamamoto式 | HSP 3成分のみで完結、追加パラメータ不要 |
| 分類レベル | 6段階 | θ=90° を含む物理的に意味のある境界設定 |
| 閾値カスタマイズ | 対応 | 材料分野により最適な閾値が異なるため |
| cos(θ) clamp | 実装 | 理論モデルの限界への対処 |
| 精度注記 | UIに表示 | 「推定値であり実測値とは誤差が生じる」旨を明記 |
| 代替手法 | 将来検討 | Beerbower/Pirika式の選択肢を将来的に追加可能 |
