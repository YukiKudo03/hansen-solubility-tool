# ナノ粒子分散液におけるハンセン溶解度パラメータ（HSP）の貢献と応用

## 1. はじめに

機能性材料のナノ粒子分散液の設計において、適切な溶媒・分散媒の選定は材料性能を決定づける最重要課題である。従来、溶媒選定は試行錯誤に依存していたが、**ハンセン溶解度パラメータ（HSP）** の導入により、分子間相互作用に基づく系統的・定量的な材料選定が可能となった。

本レポートでは、ナノ粒子分散液分野におけるHSPの貢献を調査し、当プロジェクト（HSP評価ツール）への機能拡張の方向性を示す。

---

## 2. HSPの基礎とナノ粒子分散への拡張

### 2.1 HSPの3成分

HSPは凝集エネルギー密度を以下の3成分に分解する：

| パラメータ | 記号 | 意味 |
|-----------|------|------|
| 分散力項 | δD | ファンデルワールス力（London分散力） |
| 極性項 | δP | 双極子間相互作用 |
| 水素結合項 | δH | 水素結合性相互作用 |

全溶解度パラメータ: **δ² = δD² + δP² + δH²**

### 2.2 ポリマー溶解からナノ粒子分散への概念拡張

HSPは元来、ポリマーの溶解性予測のために開発された。ナノ粒子への拡張においては、粒子**表面**のHSP値を決定し、溶媒との親和性を評価するアプローチが確立されている。

- **ポリマー系**: バルク材料のHSP ⇔ 溶媒のHSP → 溶解性予測
- **ナノ粒子系**: 粒子表面（リガンド含む）のHSP ⇔ 溶媒のHSP → 分散安定性予測

ナノ粒子では、**粒子表面のリガンド（表面修飾剤）がHSP値を支配する**ため、同一材料でも表面修飾により大きくHSP値が変化する点が重要である。

### 2.3 RED値による分散性の定量評価

粒子-溶媒間のHSP距離（Ra）と相互作用半径（R₀）から、相対エネルギー差（RED）を算出する：

- **Ra = √[4(δD₁−δD₂)² + (δP₁−δP₂)² + (δH₁−δH₂)²]**
- **RED = Ra / R₀**

| RED値 | 分散性 |
|-------|--------|
| < 1.0 | 良好な分散（HSP球内） |
| ≈ 1.0 | 境界領域 |
| > 1.0 | 不良な分散（凝集・沈降） |

---

## 3. 主要応用分野と研究事例

### 3.1 カーボンナノ材料（CNT・グラフェン）

カーボンナノ材料の分散は、HSP研究の中で最も活発な分野の一つである。

**代表的なHSP値:**

| 材料 | δD | δP | δH | 出典 |
|------|----|----|-----|------|
| SWCNT（単層CNT） | 19.4 | 6.0 | 4.5 | Bergin et al. |
| MWCNT（多層CNT） | 16.0 | 10.0 | 8.5 | 文献値 |
| グラフェン | 18.0 | 9.3 | 7.7 | Hernandez et al. |
| C60フラーレン | 19.7 | 2.9 | 2.7 | Hansen |

**知見:**
- CNTは高いδD値を持ち、芳香族系・塩素系溶媒（高δD溶媒）と親和性が高い
- 短いCNTは長いCNTより分散性が優れる
- 官能基化CNTはHSP球フィッティングの精度が低下する傾向がある
- 最適溶媒例: ジクロロベンゼン/ベンズアルデヒド（50v/50v）混合溶媒

**参考文献:**
- [HSP Examples: Carbon Nanotubes](https://hansen-solubility.com/HSP-examples/cnt.php)
- [Determination of carbon nanoparticle dispersion solubility parameters](https://www.sciencedirect.com/science/article/abs/pii/S0167732223023462)
- [Measurement of Multicomponent Solubility Parameters for Graphene](https://pubs.acs.org/doi/10.1021/la903188a)

### 3.2 金属ナノ粒子（Ag・Cu等）— 印刷エレクトロニクス

プリンテッドエレクトロニクス用ナノインクの分散設計において、HSPが実用化されている。

**事例: オレイルアミンキャップ銀ナノ粒子（OAm-Ag NPs）**

| パラメータ | 値 (MPa^0.5) |
|-----------|-------------|
| δD₀ | 16.5 |
| δP₀ | 2.7 |
| δH₀ | 0.01 |
| R₀（相互作用半径） | 4.8 |

**重要な発見:**
- RED値が低い溶媒で調製したインクは、焼結後のAg膜にクラックが少なく、結晶粒径が大きい
- デカン（RED = 0.64）が最良の分散溶媒として同定された
- OAmキャップにより極性・水素結合成分が極めて小さく、非極性溶媒との親和性が支配的

**参考文献:**
- [Hansen Solubility Parameter Analysis on Dispersion of Oleylamine-Capped Silver Nanoinks](https://pmc.ncbi.nlm.nih.gov/articles/PMC9230637/)
- [Hansen Solubility Parameters of Surfactant-Capped Silver Nanoparticles for Ink and Printing Technologies](https://pubs.acs.org/doi/10.1021/la502948b)

### 3.3 無機酸化物ナノ粒子（TiO₂・ZnO・SiO₂・ZrO₂）

機能性セラミックナノ粒子の分散にもHSPが広く適用されている。

**TiO₂ナノ粒子:**
- HSPとDLVO理論は**相補的**関係にある
- ゼータ電位が高く誘電率も高い溶媒では、静電反発による追加安定化が得られる
- 静電反発が無視できる条件では、HSP球内の溶媒のみが安定分散を実現
- 粒子径が小さくなるほど粒子間力が強くなり、分散がより困難

**ZnO量子ドット:**
- 表面リガンドの極性がHSP値の極性成分に直接反映される
- HSP測定は、コロイド粒子の表面特性を定量化する有効な手法として確立

**ZrO₂ナノ結晶:**
- カルボン酸グラフト粒子のアルキル鎖長によりHSP値が系統的に変化
- 長鎖アルキル基 → 非極性溶媒に分散
- 短鎖（酢酸）グラフト → 極性溶媒に分散

**参考文献:**
- [TiO2 nanoparticle dispersions: Complementarity of Hansen Parameters and DLVO](https://www.sciencedirect.com/science/article/abs/pii/S0927775721012024)
- [Systematic Investigation of Dispersions of Unmodified Inorganic Nanoparticles](https://pubs.acs.org/doi/10.1021/ie201973u)
- [Suspension- and powder-based derivation of Hansen dispersibility parameters for ZnO quantum dots](https://www.sciencedirect.com/science/article/abs/pii/S1674200118301809)

### 3.4 医薬品ナノ粒子・ドラッグデリバリーシステム

製薬分野では、高分子マトリックス中の薬物分散性予測にHSPが活用されている。

**応用例:**
- **マイクロカプセル化**: メチレンクロライドに代わる低毒性溶媒の同定（PCLポリマーマトリックス）
- **固体分散体**: 薬物-ポリマー相溶性の予測（アモルファス固体分散体の設計）
- **脂質ナノキャリア**: 固体脂質ナノ粒子（SLN）・ナノ構造脂質キャリア（NLC）の脂質選択
- **薬物放出制御**: ポリマーマトリックスの細孔サイズとHSP差の相関

**参考文献:**
- [Application of Hansen solubility parameters for drug distribution in microspheres](http://kinampark.com/PL/files/Vay%202011,%20Application%20of%20Hansen%20solubility%20parameters%20for%20understanding%20and%20prediction%20of%20drug%20distribution%20in%20microspheres.pdf)
- [Hansen solubility parameter predictions for lipid nanocarriers](https://pmc.ncbi.nlm.nih.gov/articles/PMC7078564/)

---

## 4. ナノ粒子HSP決定の方法論

### 4.1 溶媒スクリーニング法（Hansen溶解球法）

最も広く用いられる標準的手法：

1. ナノ粒子を10〜20種の溶媒に分散
2. 分散品質を評価（目視、DLS、遠心沈降分析など）
3. 各溶媒を「良溶媒」「貧溶媒」に分類
4. HSPiPソフトウェア等でHSP球をフィッティング
5. 球の中心座標 = 粒子表面のHSP、球の半径 = R₀

### 4.2 分析的遠心分離法

沈降挙動を定量的に測定する手法：
- 遠心加速度下での沈降時間（t*）を測定
- 正規化して分散性をランク付け
- 主観的判断の排除が可能

### 4.3 NMR緩和法

溶媒-粒子間の分子間力を高感度で検出：
- 溶媒緩和NMR測定により溶媒適合性を迅速評価
- 良溶媒・貧溶媒の系統的測定からHSP球を構築
- 混合溶媒の設計にも適用可能

### 4.4 組み合わせ論的アプローチ（最新）

2021年にRSC Nanoscale Advancesで提案されたフレームワーク：
- 全可能なスコアリング順列を計算（2^N通り）
- 実験データで順列を段階的に絞り込み
- 不確実性を定量的に報告
- 単一の「正しい値」ではなくHSP値の範囲を提示

**参考文献:**
- [Towards a framework for evaluating and reporting HSP: applications to particle dispersions](https://pubs.rsc.org/en/content/articlehtml/2021/na/d1na00405k)
- [Determination of Hansen parameters for particles: A standardized routine](https://www.sciencedirect.com/science/article/pii/S0921883118300980)

---

## 5. HSPアプローチの強みと限界

### 5.1 強み

| 項目 | 説明 |
|------|------|
| **系統的溶媒選定** | 試行錯誤から脱却し、HSPデータベースから最適溶媒を予測可能 |
| **混合溶媒設計** | 体積分率加重平均でHSP値を調整し、粒子表面HSPにマッチングさせることが可能 |
| **表面特性の定量化** | リガンド交換や表面修飾の効果をHSP変化として定量評価できる |
| **スケーラビリティ** | 少数の実験から広範な溶媒空間を探索可能 |
| **コスト効率** | 高価な分析装置なしでも目視評価で実施可能 |
| **既存データベースとの互換性** | 溶媒HSPデータベースは充実しており、即座に活用可能 |

### 5.2 限界

| 項目 | 説明 |
|------|------|
| **静電相互作用の非考慮** | DLVO理論で扱われる静電反発力を考慮しない。高誘電率溶媒中での荷電粒子では追加安定化が生じ得る |
| **主観的分類** | 良溶媒/貧溶媒の二値分類に主観が入りやすい |
| **表面リガンド依存性** | 同一材料でもリガンドによりHSP値が大きく変動し、「材料固有のHSP」の一般化が困難 |
| **粒子径効果** | 微小粒子ほど粒子間力が強くなる効果はHSPでは説明できない |
| **動的安定性の非評価** | HSPは熱力学的親和性を評価するが、動的分散安定性（沈降速度等）は直接予測しない |
| **官能基化粒子でのフィッティング不良** | 表面が不均一な粒子ではHSP球のフィッティング精度が低下 |

### 5.3 DLVO理論との相補性

最新の研究（TiO₂系）では、HSPとDLVO理論の**併用**が推奨されている：

- **HSP**: 溶媒-粒子表面間の化学的親和性を評価
- **DLVO**: 静電反発力とファンデルワールス引力のバランスを評価

静電反発が無視できる系（低誘電率溶媒中の非荷電粒子）ではHSPが支配的、荷電粒子系ではDLVO的な考慮が追加で必要となる。

---

## 6. 最新動向と技術トレンド

### 6.1 機械学習との統合

HSP、COSMO-based分子情報、分子アクセスシステムキー（MACCS）を説明変数として、機械学習モデルによるナノ粒子分散性予測が2024年に報告されている。HSP値を特徴量として活用することで、溶媒-修飾剤の組み合わせスクリーニングを高速化する試みが進行中。

**参考文献:**
- [Prediction of Nanoparticle Dispersion by Machine Learning Using Various Molecular Descriptors](https://pubs.acs.org/doi/10.1021/acs.iecr.3c02581)

### 6.2 DiPEVa法（代替手法）

Distance in Parameter-Extended Volume and Area（DiPEVa）法は、HSPを拡張した手法として注目されている。特にカーボン量子ドットを除くカーボンナノ粒子系でHansen法を上回る性能を示したと報告されている。

### 6.3 HSPの表面・界面への直接適用

2023年のLangmuir誌で、HSPを表面・界面現象に直接適用するフレームワークが提案され、ナノ粒子表面エネルギーの評価への展開が期待されている。

**参考文献:**
- [Hansen Solubility Parameters for Directly Dealing with Surface and Interfacial Phenomena](https://pubs.acs.org/doi/10.1021/acs.langmuir.3c00913)

---

## 7. 当プロジェクトへの機能拡張提案

### 7.1 現状の強み

当プロジェクト（HSP評価ツール）は以下の基盤を既に有している：

- 約85種の溶媒HSPデータベース（物性データ含む）
- Ra/RED計算エンジン
- リスク分類システム（5段階）
- 混合溶媒HSP予測機能（MixtureLab）
- CSV出力機能

### 7.2 提案する拡張機能

#### A. ナノ粒子データベースの追加

| 項目 | 内容 |
|------|------|
| **新テーブル** | `nano_particles` |
| **基本HSP** | δD, δP, δH, R₀ |
| **粒子固有項目** | 粒子径、表面修飾剤（リガンド種）、材質カテゴリ |
| **シードデータ候補** | CNT、グラフェン、Ag NP、TiO₂、ZnO、SiO₂、ZrO₂、量子ドット等 |

#### B. 粒子-溶媒適合性評価機能

- 既存のRa/RED計算エンジンをそのまま活用
- ナノ粒子を選択 → 溶媒候補のRED値を一覧表示
- 分散性リスク分類（閾値はナノ粒子用にカスタマイズ可能）
- 複数溶媒の混合によるHSPマッチング最適化

#### C. 最適溶媒探索（逆引き）機能

- ナノ粒子のHSP値を入力 → RED < 1.0の溶媒を自動検索
- 混合溶媒の組成最適化提案
- 物性制約（沸点、粘度、表面張力等）によるフィルタリング

#### D. HSP球の可視化

- 3D Hansen空間でのナノ粒子HSP球と溶媒点の可視化
- 良溶媒/貧溶媒の直感的な判別支援

---

## 8. まとめ

ハンセン溶解度パラメータは、ナノ粒子分散液の設計において以下の点で決定的な貢献をしている：

1. **溶媒選定の合理化**: 試行錯誤から定量的予測への転換
2. **表面修飾の定量評価**: リガンドの効果をHSP変化として可視化
3. **混合溶媒設計**: 体積分率調整による最適HSPマッチング
4. **分野横断的適用**: カーボンナノ材料、金属NP、酸化物NP、医薬品NPまで幅広く実証済み
5. **産業的実用性**: インク配合、塗料、コーティング、電子材料製造で実用化

一方、静電相互作用の非考慮やリガンド依存性などの限界もあり、DLVO理論との併用や機械学習との統合が進む最新トレンドを踏まえた機能設計が重要である。

当プロジェクトの既存HSP基盤（溶媒DB・計算エンジン・混合溶媒機能）は、ナノ粒子分散液材料選定支援への拡張に十分な素地を持っており、比較的少ない追加開発で高い実用的価値を提供できる。

---

## 参考文献一覧

### 総論・レビュー
- [Hansen Solubility Parameters 公式サイト](https://hansen-solubility.com/)
- [Hansen solubility parameter - Wikipedia](https://en.wikipedia.org/wiki/Hansen_solubility_parameter)
- [Hansen Solubility Parameter - ScienceDirect Topics](https://www.sciencedirect.com/topics/engineering/hansen-solubility-parameter)

### ナノ粒子分散の枠組み
- [Towards a framework for evaluating and reporting HSP: applications to particle dispersions (Nanoscale Advances, 2021)](https://pubs.rsc.org/en/content/articlehtml/2021/na/d1na00405k)
- [Determination of Hansen parameters for particles: A standardized routine (Advanced Powder Technology, 2018)](https://www.sciencedirect.com/science/article/pii/S0921883118300980)
- [Systematic Investigation of Dispersions of Unmodified Inorganic Nanoparticles (Ind. Eng. Chem. Res., 2012)](https://pubs.acs.org/doi/10.1021/ie201973u)

### カーボンナノ材料
- [HSP Examples: Carbon Nanotubes](https://hansen-solubility.com/HSP-examples/cnt.php)
- [Measurement of Multicomponent Solubility Parameters for Graphene (Langmuir, 2010)](https://pubs.acs.org/doi/10.1021/la903188a)
- [Determination of carbon nanoparticle dispersion solubility parameters (J. Mol. Liquids, 2023)](https://www.sciencedirect.com/science/article/abs/pii/S0167732223023462)
- [Dispersion of pristine and PANI-functionalized CNTs in designed solvent mixtures](https://www.sciencedirect.com/science/article/abs/pii/S2352492817300958)

### 金属ナノ粒子インク
- [Hansen Solubility Parameter Analysis on Dispersion of Oleylamine-Capped Silver Nanoinks (Nanomaterials, 2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9230637/)
- [Hansen Solubility Parameters of Surfactant-Capped Silver Nanoparticles (Langmuir, 2014)](https://pubs.acs.org/doi/10.1021/la502948b)

### 無機酸化物ナノ粒子
- [TiO2 nanoparticle dispersions: Complementarity of Hansen Parameters and DLVO (Colloids Surf. A, 2021)](https://www.sciencedirect.com/science/article/abs/pii/S0927775721012024)
- [Hansen solubility parameter analysis on the dispersion of zirconia nanocrystals (J. Nanopart. Res., 2013)](https://www.researchgate.net/publication/254264210_Hansen_solubility_parameter_analysis_on_the_dispersion_of_zirconia_nanocrystals)
- [Hansen dispersibility parameters for ZnO quantum dots (J. Materiomics, 2018)](https://www.sciencedirect.com/science/article/abs/pii/S1674200118301809)

### 医薬品・ドラッグデリバリー
- [Application of HSP for drug distribution in microspheres (Vay, 2011)](http://kinampark.com/PL/files/Vay%202011,%20Application%20of%20Hansen%20solubility%20parameters%20for%20understanding%20and%20prediction%20of%20drug%20distribution%20in%20microspheres.pdf)
- [HSP predictions for lipid nanocarriers (PMC, 2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7078564/)

### 最新動向
- [Prediction of Nanoparticle Dispersion by Machine Learning (Ind. Eng. Chem. Res., 2024)](https://pubs.acs.org/doi/10.1021/acs.iecr.3c02581)
- [Hansen Solubility Parameters for Surface and Interfacial Phenomena (Langmuir, 2023)](https://pubs.acs.org/doi/10.1021/acs.langmuir.3c00913)
- [Determination of HSP of carbon nano-onions (J. Mol. Liquids, 2020)](https://www.sciencedirect.com/science/article/abs/pii/S0167732219336098)
- [Determination of HSP and In Situ Visualization of Antimonene (ACS Appl. Nano Mater., 2024)](https://pubs.acs.org/doi/10.1021/acsanm.3c04189)

### 日本語参考資料
- [溶解度パラメータ（SP値、HSP値）— CERI](https://www.cerij.or.jp/service/05_polymer/Hildebrand_Hansen.html)
- [Hansen溶解度パラメータを用いた相溶性の評価 — 山本秀樹](https://www.jstage.jst.go.jp/article/jieenermix/98/6/98_665/_pdf)
- [HSPiP ソフトウェア — UNIPOS](https://www.unipos.net/products/hspip/)
- [ナノ粒子のHSP特性化 — pirika.com](https://pirika.com/ENG/HSP/E-Book/Chap29.html)
