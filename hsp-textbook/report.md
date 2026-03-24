# Hansen Solubility Parameters: Theory, Computation, and Applications

**HSP教科書 — 理論・計算・応用の体系的教科書**

全20章 | 本プロジェクトの117コアモジュール全てをカバー

## 統計サマリー

| 項目 | 値 |
|------|-----|
| 総ページ数（推定） | 932 pp |
| 方程式 | 149 |
| キーコンセプト | 277 |
| 演習問題 | 79 |
| 参考文献 | 184 |
| 図表 | 152 |
| 復習問題 | 100 |
| 対応モジュール数 | 116 |

---

## 目次 (Table of Contents)

### Part I: 基礎理論 (Fundamentals)

1. [HSP Fundamentals: From Hildebrand Parameter to Three-Dimensional Hansen Space](#ch01-hsp-fundamentals) — 35pp | undergraduate | 6 eqs | 6 modules
2. [Thermodynamic Foundations of Hansen Solubility Parameters](#ch02-thermodynamic-foundations) — 35pp | graduate | 7 eqs | 5 modules
3. [Temperature and Pressure Effects on Hansen Solubility Parameters](#ch03-temperature-pressure-effects) — 35pp | graduate | 10 eqs | 6 modules
4. [HSP Estimation Methods](#ch04-hsp-estimation-methods) — 45pp | graduate | 10 eqs | 7 modules

### Part II: 表面科学と接着 (Surface Science & Adhesion)

5. [Contact Angle and Wettability](#ch05-contact-angle-wettability) — 40pp | graduate | 9 eqs | 5 modules
6. [Adhesion Engineering](#ch06-adhesion-engineering) — 50pp | graduate | 7 eqs | 8 modules

### Part III: 高分子科学 (Polymer Science)

7. [Polymer Solubility and Swelling: Multi-Axis Risk Assessment via RED and Flory-Rehner Automation](#ch07-polymer-solubility-swelling) — 45pp | graduate | 6 eqs | 10 modules
8. [Polymer Blends and Recycling](#ch08-polymer-blends-recycling) — 55pp | graduate | 8 eqs | 7 modules

### Part IV: 応用分野 (Application Domains)

9. [Pharmaceutical Drug Delivery](#ch09-pharmaceutical-drug-delivery) — 60pp | graduate | 7 eqs | 8 modules
10. [Biopharmaceuticals and Excipients](#ch10-biopharmaceuticals-excipients) — 50pp | advanced_research | 7 eqs | 8 modules
11. [Nanomaterials Dispersion Science](#ch11-nanomaterials-dispersion) — 50pp | graduate | 8 eqs | 5 modules
12. [Coatings and Thin Films](#ch12-coatings-films) — 60pp | graduate | 9 eqs | 9 modules
13. [Energy and Environmental Applications](#ch13-energy-environment) — 65pp | graduate | 8 eqs | 8 modules
14. [Food and Cosmetics](#ch14-food-cosmetics) — 55pp | graduate | 9 eqs | 8 modules
15. [Industrial Specialty Applications](#ch15-industrial-specialty) — 55pp | graduate | 9 eqs | 5 modules

### Part V: 先端手法と実践 (Advanced Methods & Practice)

16. [Solvent Selection and Optimization](#ch16-solvent-selection-optimization) — 55pp | graduate | 10 eqs | 6 modules
17. [Visualization and Analysis of HSP Space](#ch17-visualization-analysis) — 40pp | undergraduate | 7 eqs | 6 modules
18. [Data Management and Quality Assurance: CSV Import, Database Design, and Report Generation](#ch18-data-management-quality) — 32pp | graduate | 3 eqs | 7 modules
19. [Software Architecture and Design Principles for HSP Computation Tools](#ch19-software-architecture) — 35pp | graduate | 3 eqs | 18 modules
20. [Future Directions in Hansen Solubility Parameter Research](#ch20-future-directions) — 35pp | advanced_research | 6 eqs | 8 modules

---

## 各章詳細 (Chapter Details)

---
# Part I: 基礎理論 (Fundamentals)

## Chapter 1: HSP Fundamentals: From Hildebrand Parameter to Three-Dimensional Hansen Space
**HSP基礎理論 — Hildebrandパラメータから三次元Hansen空間へ**

**Level:** chapter

**Parent:** Part I: Fundamentals

**Synopsis:** This chapter introduces the theoretical foundation of Hansen Solubility Parameters (HSP), tracing the evolution from Hildebrand's one-dimensional solubility parameter to Hansen's three-component decomposition into dispersion (deltaD), polar (deltaP), and hydrogen-bonding (deltaH) contributions. It covers the key quantitative tools: Ra distance for measuring HSP similarity, RED (Relative Energy Difference) for normalization against interaction radius R0, the Hansen sphere concept for solubility boundary visualization, and a five-level risk classification system. The chapter also presents solvent mixture HSP calculation via volume-fraction-weighted averaging and batch evaluation matrices for multi-material x multi-solvent screening.

### Key Concepts

  - Hildebrand solubility parameter (delta_total) and cohesive energy density
  - Hansen's three-component decomposition: deltaD (dispersion), deltaP (polar), deltaH (hydrogen bonding)
  - Units: MPa^(1/2) for all HSP components
  - Hansen distance Ra with the empirical factor of 4 for the dispersion term: Ra^2 = 4(deltaD1 - deltaD2)^2 + (deltaP1 - deltaP2)^2 + (deltaH1 - deltaH2)^2
  - Interaction radius R0 defining the Hansen sphere boundary
  - Relative Energy Difference (RED = Ra / R0) as the normalized solubility criterion
  - Hansen sphere: the three-dimensional solubility envelope in HSP space
  - Five-level risk classification based on RED thresholds (Dangerous, Warning, Caution, Hold, Safe)
  - Default risk thresholds: Dangerous < 0.5, Warning < 0.8, Caution < 1.2, Hold < 2.0, Safe >= 2.0
  - Solvent mixture HSP via volume-fraction-weighted linear averaging
  - Volume ratio to volume fraction conversion for mixture calculations
  - Batch comparison matrix: all-pairs evaluation of materials x solvents
  - Comparison statistics: min/max/mean RED across the evaluation matrix

### Equations

  - **name**: Hildebrand Solubility Parameter | **latex**: \delta = \sqrt{\frac{\Delta H_v - RT}{V_m}} | **explanation**: Total solubility parameter from molar heat of vaporization and molar volume, representing cohesive e...
  - **name**: Hansen Decomposition | **latex**: \delta^2 = \delta_D^2 + \delta_P^2 + \delta_H^2 | **explanation**: The total Hildebrand parameter is decomposed into three independent contributions: dispersion forces...
  - **name**: Hansen Distance (Ra) | **latex**: R_a = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{... | **explanation**: Distance between two substances in Hansen space. The factor of 4 on the dispersion term is an empiri...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{R_a}{R_0} | **explanation**: Normalized distance relative to the interaction radius R0. RED < 1 generally indicates solubility; R...
  - **name**: Mixture HSP (Volume-Fraction Weighted Average) | **latex**: \delta_{i,mix} = \sum_k \phi_k \, \delta_{i,k} \quad (i = D, P, H) | **explanation**: Each HSP component of a mixture is the volume-fraction-weighted average of the pure component values...
  - **name**: Arrhenius Log-Mixing Rule for Viscosity | **latex**: \ln \eta_{mix} = \sum_k \phi_k \ln \eta_k | **explanation**: Mixture viscosity is estimated using a logarithmic volume-fraction mixing rule, more accurate than s...

**Historical Context:** Joel H. Hildebrand introduced the one-dimensional solubility parameter concept in 1936, based on the square root of cohesive energy density. Charles M. Hansen, in his 1967 doctoral thesis at the Technical University of Denmark, proposed decomposing this single parameter into three components representing dispersion, polar, and hydrogen-bonding interactions. This breakthrough enabled the prediction of solubility as a geometric problem in three-dimensional space. Hansen's seminal paper 'The Three Dimensional Solubility Parameter and Solvent Diffusion Coefficient' (1967) and subsequent textbook 'Hansen Solubility Parameters: A User's Handbook' (1st ed. 2000, 2nd ed. 2007) established HSP as the standard framework in coatings, polymers, and pharmaceutical industries. The factor-of-4 coefficient on the dispersion axis was empirically derived to produce approximately spherical solubility envelopes for most polymers.

### Related Project Modules

  - hsp.ts
  - risk.ts
  - types.ts
  - comparison.ts
  - mixture.ts
  - validation.ts

### Learning Objectives

  - Explain the physical meaning of each HSP component (deltaD, deltaP, deltaH) and their origin from intermolecular forces
  - Calculate Ra distance and RED value between any two substances given their HSP values and interaction radius
  - Apply the five-level risk classification system to assess solvent compatibility with a polymer material
  - Compute the HSP of a solvent mixture from its component volume fractions using linear mixing rules
  - Construct and interpret a batch evaluation matrix for screening multiple solvents against multiple materials

### Practical Applications

  - Selecting safe cleaning solvents for polymer components in manufacturing
  - Screening solvents for polymer dissolution in coatings formulation
  - Designing solvent blends to achieve a target HSP for optimal performance
  - Predicting chemical resistance of polymer parts to industrial fluids
  - Multi-material compatibility screening in product design (e.g., gaskets, seals, O-rings)
  - Pharmaceutical excipient-solvent compatibility assessment
  - Evaluating environmental replacement solvents by comparing HSP proximity to regulated solvents

### Worked Examples

  - **title**: Ra and RED Calculation for PVC vs. Common Solvents | **description**: Given PVC (deltaD=18.2, deltaP=7.5, deltaH=8.3, R0=3.5) and three solvents (THF, acetone, hexane), c...
  - **title**: Designing a Binary Solvent Mixture to Target a Specific HSP | **description**: Two solvents (toluene and ethanol) are mixed at varying volume ratios. Calculate the mixture HSP at ...
  - **title**: Batch Evaluation Matrix for Automotive Seal Materials | **description**: Construct a comparison matrix for 4 rubber materials (NBR, EPDM, FKM, silicone) against 6 common aut...

### Key References

  - **author**: Hansen, C. M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Hildebrand, J. H.; Scott, R. L. | **year**: 1950 | **title**: The Solubility of Nonelectrolytes, 3rd Edition, Reinhold Publishing
  - **author**: Hansen, C. M. | **year**: 1967 | **title**: The Three Dimensional Solubility Parameter and Solvent Diffusion Coefficient, Doctoral Dissertation,...
  - **author**: Barton, A. F. M. | **year**: 1991 | **title**: CRC Handbook of Solubility Parameters and Other Cohesion Parameters, 2nd Edition, CRC Press
  - **author**: Burke, J. | **year**: 1984 | **title**: Solubility Parameters: Theory and Application, The Book and Paper Group Annual, Vol. 3, AIC
  - **author**: Van Krevelen, D. W.; Te Nijenhuis, K. | **year**: 2009 | **title**: Properties of Polymers, 4th Edition, Elsevier (Chapter 7: Cohesive Properties and Solubility)
  - **author**: Abbott, S.; Hansen, C. M.; Yamamoto, H. | **year**: 2015 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com
  - **author**: Stefanis, E.; Panayiotou, C. | **year**: 2008 | **title**: Prediction of Hansen Solubility Parameters with a New Group-Contribution Method, International Journ...

**Cross References:** Ch02_Thermodynamic_Foundations, Ch03_Temperature_Pressure_Effects, Ch04_HSP_Estimation_Methods

**Difficulty Level:** undergraduate

**Estimated Pages:** 35

### Figures Needed

  - **title**: Evolution from 1D Hildebrand to 3D Hansen Space | **description**: Conceptual diagram showing the decomposition of the single Hildebrand parameter into three orthogona...
  - **title**: Hansen Sphere in 3D HSP Space | **description**: 3D scatter plot showing a polymer center point with interaction radius R0 forming a sphere, with goo...
  - **title**: Five-Level Risk Classification Diagram | **description**: Concentric rings or bar chart showing the five risk zones (Dangerous, Warning, Caution, Hold, Safe) ...
  - **title**: Solvent Mixture Path in HSP Space | **description**: 3D plot showing how a binary mixture traces a straight line between the two pure solvent HSP coordin...
  - **title**: Batch Evaluation Heatmap | **description**: Color-coded matrix (materials as rows, solvents as columns) showing RED values with risk-level color...

### Tables Needed

  - **title**: HSP Values of Common Solvents | **description**: Table listing 15-20 common solvents with their deltaD, deltaP, deltaH values (MPa^1/2), molar volume...
  - **title**: HSP Values and R0 of Common Polymers | **description**: Table listing 10-15 common polymers (PVC, PMMA, PS, PE, PP, Nylon, epoxy, etc.) with their HSP value...
  - **title**: Five-Level Risk Classification Thresholds | **description**: Table detailing each risk level (Dangerous through Safe), its RED range, label, description, and rec...
  - **title**: Sample Batch Evaluation Matrix Output | **description**: Worked example showing a 4x6 material-solvent matrix with computed Ra, RED, and risk level for each ...

### Software Demo

  - **tab**: HSP Risk Evaluation (HSPリスク評価)
  - **inputs**: Select a parts group containing several polymer materials (e.g., rubber seal materials). Select multiple solvents from the database. Use default risk thresholds (Dangerous < 0.5, Warning < 0.8, Caution < 1.2, Hold < 2.0).
  - **expected_output**: A color-coded comparison matrix showing Ra, RED, and risk level for every material-solvent combination. The heatmap immediately highlights dangerous combinations in red and safe combinations in green. Students can also switch to the mixture calculator tab to blend two solvents and see how the mixture HSP and resulting RED values change with volume fraction.
  - **learning_value**: Demonstrates the core HSP workflow from raw parameters to actionable risk assessment, reinforcing Ra/RED calculation and the five-level classification in an interactive setting.

### Review Questions

  - Why does the Hansen distance formula include a factor of 4 on the dispersion term (deltaD)? What would happen to the shape of the solubility region if this factor were removed?
  - A polymer has HSP values (deltaD=17.0, deltaP=9.0, deltaH=5.0) with R0=6.0. A solvent has HSP values (deltaD=15.5, deltaP=6.0, deltaH=4.5). Calculate Ra and RED. What risk level does this correspond to under default thresholds?
  - Explain why the volume-fraction-weighted linear mixing rule works well for HSP values of mixtures, but not for properties like viscosity. What alternative mixing rule is used for viscosity?
  - A batch evaluation of 5 materials against 10 solvents produces 50 RED values. The minimum RED is 0.3 and the maximum is 4.2. What does this range tell you about the diversity of the material-solvent set?
  - Compare the Hildebrand solubility parameter approach with the Hansen three-parameter approach. Give an example of two solvents that have similar Hildebrand parameters but very different Hansen parameters, and explain why one dissolves a given polymer while the other does not.


## Chapter 2: Thermodynamic Foundations of Hansen Solubility Parameters
**HSPの熱力学的基盤**

**Level:** chapter

**Parent:** Part I: Fundamentals

**Synopsis:** This chapter establishes the thermodynamic underpinning of Hansen Solubility Parameters by connecting them to Flory-Huggins lattice theory and the chi interaction parameter. It extends the framework to gel swelling equilibrium via Flory-Rehner theory, crystalline polymer dissolution via Flory dilution theory, partition coefficient estimation from HSP distance, and corrections for associating liquids such as water and alcohols.

### Key Concepts

  - Flory-Huggins lattice model for polymer-solvent mixing
  - Flory-Huggins chi interaction parameter and its relation to Ra (HSP distance)
  - Free energy of mixing: combinatorial entropy and enthalpic contributions
  - Critical chi parameter and polymer-solvent phase boundaries
  - Flory-Rehner equation for crosslinked gel swelling equilibrium
  - Elastic free energy contribution from crosslinked networks
  - Equilibrium polymer volume fraction in swollen gels
  - Flory dilution theory and melting point depression of crystalline polymers
  - Dissolution temperature prediction from chi and heat of fusion
  - Partition coefficient estimation from HSP distance differences (delta Ra-squared)
  - Semi-quantitative log K prediction from Flory-Huggins framework
  - Associating liquid corrections for hydrogen-bonding solvents (water, alcohols)
  - Alpha parameter for temperature-dependent hydrogen bond network disruption
  - Limitations of regular solution theory for strongly associating systems

### Equations

  - **name**: Flory-Huggins chi from HSP distance | **latex**: \chi = \frac{V_s \cdot Ra^2}{6 R T} | **explanation**: Relates the Flory-Huggins interaction parameter to the Hansen distance Ra, solvent molar volume Vs, ...
  - **name**: Critical chi parameter | **latex**: \chi_c = \frac{1}{2} \left( \frac{1}{\sqrt{N_1}} + \frac{1}{\sqrt{N_2}} \right)^2 | **explanation**: Defines the upper limit of chi for miscibility in a binary polymer system with degrees of polymeriza...
  - **name**: Flory-Huggins free energy of mixing | **latex**: \frac{\Delta G_{mix}}{RT} = n_1 \ln \phi_1 + n_2 \ln \phi_2 + n_1 \phi_2 \chi | **explanation**: The lattice model free energy of mixing consisting of combinatorial entropy (first two terms) and an...
  - **name**: Flory-Rehner swelling equilibrium | **latex**: \ln(1 - \phi_p) + \phi_p + \chi \phi_p^2 = -V_s \nu_e \left( \phi_p^{1/3} - \frac{\phi_p}{2} \right) | **explanation**: Balances the thermodynamic mixing drive (left side) against the elastic restoring force of the cross...
  - **name**: Flory dilution theory (melting point depression) | **latex**: \frac{1}{T_d} - \frac{1}{T_m^0} = \frac{R}{\Delta H_u} \cdot \frac{V_u}{V_1} \left( \phi_1 - \chi \p... | **explanation**: Predicts how the dissolution temperature Td of a crystalline polymer decreases with increasing solve...
  - **name**: Partition coefficient from HSP distance | **latex**: \ln K \approx -\frac{V_{solute} \cdot \Delta Ra^2}{6 R T} | **explanation**: Semi-quantitative estimation of the partition coefficient between two phases using the difference in...
  - **name**: Associating liquid dH correction | **latex**: \delta_H^2(T) = \delta_H^2(T_{ref}) \cdot \left(1 - \alpha \frac{T - T_{ref}}{T_{ref}} \right) | **explanation**: Temperature correction for the hydrogen bonding HSP component of associating liquids (water, alcohol...

**Historical Context:** The Flory-Huggins lattice theory was independently developed by Paul Flory and Maurice Huggins in 1941-1942, providing the first statistical mechanical treatment of polymer-solvent mixing. Flory and Rehner extended the framework to crosslinked systems in 1943 (J. Chem. Phys. 11:521). Flory's dilution theory for crystalline polymers appeared in his seminal 1953 monograph 'Principles of Polymer Chemistry.' The connection between chi and HSP distance (Ra) was formalized by Lindvig, Michelsen, and Kontogeorgis in 2002 (Fluid Phase Equilibria 203:247-260), building on Hansen's original 1967 three-parameter decomposition. Corrections for associating liquids draw on Barton's 1991 handbook and Hansen's treatment of temperature effects in Chapter 5 of his 2007 handbook.

**Related Project Modules:** flory-huggins.ts, flory-rehner.ts, flory-melting-point.ts, partition-coefficient.ts, associating-liquid-correction.ts

**Prerequisites:** Ch01_Introduction_to_HSP

### Learning Objectives

  - Derive the Flory-Huggins chi parameter from Hansen distance Ra and explain the physical meaning of each term
  - Apply Flory-Rehner theory to predict equilibrium swelling of crosslinked elastomers and gels
  - Use Flory dilution theory to estimate dissolution temperatures of crystalline polymers in solvents
  - Estimate partition coefficients between two immiscible phases using HSP distance differences
  - Understand why associating liquids (water, alcohols) require special corrections and apply the alpha-parameter model

### Practical Applications

  - Predicting polymer-solvent miscibility and constructing phase diagrams for coatings formulation
  - Estimating crosslink density of rubber vulcanizates from equilibrium swelling measurements
  - Selecting solvents for dissolving or processing crystalline engineering plastics (e.g., PEEK, PPS, nylon)
  - Predicting octanol-water partition coefficients for environmental fate modeling of chemicals
  - Designing drug delivery hydrogels with controlled swelling ratios
  - Correcting HSP-based predictions for aqueous and alcoholic systems in pharmaceutical and food applications
  - Screening solvent candidates for extraction and purification processes based on partition selectivity

### Worked Examples

  - **title**: Chi parameter calculation for polystyrene in toluene | **description**: Given the HSP values for polystyrene and toluene, calculate Ra, then chi at 25 deg C, and compare wi...
  - **title**: Equilibrium swelling of a crosslinked PDMS elastomer | **description**: Use the Flory-Rehner equation to predict the volume swelling ratio Q of a PDMS network with known cr...
  - **title**: Dissolution temperature of polyethylene in xylene | **description**: Apply the Flory melting point depression equation to predict the temperature at which high-density p...
  - **title**: Partition coefficient estimation for a pesticide between octanol and water | **description**: Calculate delta Ra-squared for a model pesticide between octanol and water phases, estimate log K, a...

### Key References

  - **author**: Flory, P. J. | **year**: 1942 | **title**: Thermodynamics of High Polymer Solutions, J. Chem. Phys. 10:51-61
  - **author**: Huggins, M. L. | **year**: 1942 | **title**: Some Properties of Solutions of Long-chain Compounds, J. Phys. Chem. 46:151-158
  - **author**: Flory, P. J.; Rehner, J. | **year**: 1943 | **title**: Statistical Mechanics of Cross-Linked Polymer Networks II. Swelling, J. Chem. Phys. 11:521-526
  - **author**: Flory, P. J. | **year**: 1953 | **title**: Principles of Polymer Chemistry, Cornell University Press
  - **author**: Hansen, C. M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd ed., CRC Press
  - **author**: Lindvig, T.; Michelsen, M. L.; Kontogeorgis, G. M. | **year**: 2002 | **title**: A Flory-Huggins model based on the Hansen solubility parameters, Fluid Phase Equilibria 203:247-260
  - **author**: Barton, A. F. M. | **year**: 1991 | **title**: Handbook of Solubility Parameters and Other Cohesion Parameters, 2nd ed., CRC Press
  - **author**: Mark, J. E.; Erman, B. | **year**: 2007 | **title**: Rubberlike Elasticity: A Molecular Primer, 2nd ed., Cambridge University Press
  - **author**: Tian, Y.; Booth, J.; Meehan, E.; Jones, D. S.; Li, S.; Andrews, G. P. | **year**: 2013 | **title**: Construction of Drug-Polymer Thermodynamic Phase Diagrams Using Flory-Huggins Interaction Theory, Mo...

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Flory-Huggins lattice model schematic | **description**: Diagram showing a 2D lattice with polymer chain segments and solvent molecules occupying lattice sit...
  - **title**: Chi vs Ra plot | **description**: Graph showing the relationship between Flory-Huggins chi parameter and Hansen distance Ra for variou...
  - **title**: Phase diagram with binodal and spinodal curves | **description**: Free energy of mixing versus composition plot showing the common tangent construction, binodal, and ...
  - **title**: Flory-Rehner swelling equilibrium curve | **description**: Plot of the Flory-Rehner residual function versus polymer volume fraction showing the root (equilibr...
  - **title**: Melting point depression diagram | **description**: Graph of dissolution temperature Td versus solvent volume fraction phi1 for a crystalline polymer at...
  - **title**: Partition coefficient correlation | **description**: Scatter plot of estimated log K from HSP distance differences versus experimental log Kow for a set ...
  - **title**: Associating liquid dH temperature dependence | **description**: Plot comparing the hydrogen bonding parameter dH versus temperature for water, methanol, and ethanol...

### Tables Needed

  - **title**: HSP values and chi parameters for common polymer-solvent pairs | **description**: Table listing dD, dP, dH, Ra, molar volume, and calculated chi for 10-15 representative polymer-solv...
  - **title**: Associating liquid database parameters | **description**: Table of associating liquid species (water, methanol, ethanol, ethylene glycol, acetic acid) with th...
  - **title**: Flory-Rehner swelling data for elastomers | **description**: Table of crosslink densities, chi values, and predicted versus measured equilibrium swelling ratios ...
  - **title**: Melting point depression data for crystalline polymers | **description**: Table comparing predicted and experimental dissolution temperatures for PE, PET, and nylon in variou...

### Software Demo

  - **tab**: Flory-Huggins chi calculation tab and Swelling evaluation tab
  - **inputs**: Select a polymer (e.g., polystyrene) and a solvent (e.g., toluene) from the database, enter the solvent molar volume (106.3 cm3/mol for toluene), and set temperature to 298.15 K. For swelling demo, additionally enter crosslink density.
  - **expected_output**: The tool calculates Ra, chi parameter, and critical chi, then displays a miscibility assessment (miscible/partial/immiscible). For Flory-Rehner, it outputs the equilibrium polymer volume fraction and volume swelling ratio Q.

### Review Questions

  - Explain why the factor of 6 appears in the chi = Vs*Ra^2/(6RT) equation and how it relates to the three-component decomposition of the solubility parameter.
  - For a polymer-solvent system with chi = 0.48 and a high molecular weight polymer, predict whether the system is miscible, partially miscible, or immiscible. What changes if the polymer molecular weight is reduced to an oligomer with N = 10?
  - Describe how the Flory-Rehner equation balances thermodynamic and elastic contributions to determine swelling equilibrium. What happens to the equilibrium swelling ratio if crosslink density is doubled?
  - Why do associating liquids like water require a special correction to their hydrogen bonding parameter, and what physical phenomenon does the alpha parameter capture?
  - A solute has Ra = 5.0 MPa^0.5 to octanol and Ra = 12.0 MPa^0.5 to water. Estimate the sign and approximate magnitude of log K(octanol/water) and explain the physical basis of this prediction.


## Chapter 3: Temperature and Pressure Effects on Hansen Solubility Parameters
**Temperature and Pressure Effects on Hansen Solubility Parameters**

**Level:** chapter

**Parent:** Part I: Fundamentals

**Synopsis:** This chapter addresses how HSP values change with temperature and pressure, two critical process variables in industrial applications. It covers the Barton method for temperature correction using thermal expansion coefficients, pressure corrections via the Tait equation for liquids and the Giddings equation for supercritical CO2, evaporation simulation using the Antoine equation and Raoult's law, and HSP estimation methods for ionic liquids and deep eutectic solvents (DES) through cation-anion composition averaging.

### Key Concepts

  - Barton method for HSP temperature correction (density-ratio power-law for dD and dP, exponential decay for dH)
  - Thermal expansion coefficient (volumetric expansion coefficient alpha) and its role in density estimation
  - Density ratio estimation from thermal expansion: rho(T)/rho(T0) = 1/(1 + alpha * deltaT)
  - Temperature exponents for HSP components: dD ~ rho^1.25, dP ~ rho^0.5, dH ~ exp(-1.22e-3 * deltaT)
  - Associating liquid correction for hydrogen-bonding solvents (water, alcohols, glycols)
  - Isothermal compressibility and the Tait equation for pressure-dependent molar volume
  - Giddings equation for supercritical CO2 solubility parameter estimation
  - Span-Wagner EOS approximation for CO2 density at supercritical conditions
  - HSP component decomposition of scCO2 (dD:dP:dH ratio from Williams-Martin 2002)
  - Antoine equation for vapor pressure calculation
  - Raoult's law for ideal mixture evaporation rates
  - Time-dependent HSP drift during solvent evaporation from mixed systems
  - Cation-anion composition method for ionic liquid and DES HSP estimation
  - Temperature correction of dH in ionic liquids using associating liquid models

### Equations

  - **name**: Density ratio from thermal expansion | **latex**: \frac{\rho(T)}{\rho(T_0)} = \frac{1}{1 + \alpha \Delta T} | **explanation**: Estimates the ratio of density at target temperature T to reference temperature T0 using the volumet...
  - **name**: Barton correction for dispersion parameter | **latex**: \delta_D(T) = \delta_D(T_0) \left(\frac{\rho(T)}{\rho(T_0)}\right)^{1.25} | **explanation**: Temperature correction of the dispersion HSP component using density ratio raised to the 1.25 power.
  - **name**: Barton correction for polar parameter | **latex**: \delta_P(T) = \delta_P(T_0) \left(\frac{\rho(T)}{\rho(T_0)}\right)^{0.5} | **explanation**: Temperature correction of the polar HSP component using density ratio raised to the 0.5 power.
  - **name**: Barton correction for hydrogen-bonding parameter | **latex**: \delta_H(T) = \delta_H(T_0) \exp\left(-1.22 \times 10^{-3} \Delta T\right) | **explanation**: Exponential decay model for the hydrogen-bonding HSP component with temperature, reflecting weakenin...
  - **name**: Associating liquid dH correction | **latex**: \delta_H^2(T) = \delta_H^2(T_{\mathrm{ref}}) \left(1 - \alpha_{\mathrm{assoc}} \frac{T - T_{\mathrm{... | **explanation**: For associating liquids (water, alcohols), a steeper dH decay model accounting for hydrogen-bond net...
  - **name**: Tait equation (simplified) for molar volume under pressure | **latex**: V_m(P) = V_m(P_0) \left(1 - \beta_T (P - P_0)\right) | **explanation**: Simplified Tait equation relating molar volume change under pressure using isothermal compressibilit...
  - **name**: Pressure correction of HSP | **latex**: \delta(P) = \delta(P_0) \sqrt{\frac{V_m(P_0)}{V_m(P)}} | **explanation**: General pressure correction for HSP values based on inverse square root of the molar volume ratio.
  - **name**: Giddings equation for scCO2 total solubility parameter | **latex**: \delta_t = 1.25 \, P_c^{0.5} \frac{\rho}{\rho_{\mathrm{liq,eff}}} | **explanation**: Giddings equation estimating the total solubility parameter of supercritical CO2 from its critical p...
  - **name**: Antoine equation for vapor pressure | **latex**: \log_{10}(P / \mathrm{kPa}) = A - \frac{B}{C + T} | **explanation**: Three-parameter Antoine equation relating vapor pressure to temperature, fundamental for evaporation...
  - **name**: Raoult's law for partial pressure | **latex**: P_i = x_i \, P_i^{\mathrm{sat}}(T) | **explanation**: Ideal solution model relating the partial pressure of component i to its mole fraction and saturated...

**Historical Context:** The temperature dependence of solubility parameters was first systematically treated by Allan Barton in his 1983 'Handbook of Solubility Parameters and Other Cohesion Parameters' (2nd edition 1991), where he proposed the density-ratio power-law corrections for dD and dP, and the exponential decay for dH. The Giddings equation for supercritical fluid solubility parameters was introduced by J.C. Giddings, M.N. Myers, and J.W. King in their 1968 Science paper. Williams and Martin (2002) refined the HSP component decomposition for scCO2 using chromatographic data. The Tait equation for liquid compressibility dates back to P.G. Tait's work in 1888. Ionic liquid HSP estimation methods emerged in the 2010s, with researchers such as Marciniak (2010) and Paduszynski and Domanska (2012) applying group contribution and composition-averaging approaches to these novel solvents.

### Related Project Modules

  - temperature-hsp.ts
  - thermal-expansion-data.ts
  - pressure-hsp.ts
  - evaporation.ts
  - ionic-liquid-des-hsp.ts
  - associating-liquid-correction.ts

**Prerequisites:** Ch01_Introduction_to_HSP, Ch02_Three_Component_Theory

### Learning Objectives

  - Apply the Barton method to correct HSP values for temperature using thermal expansion coefficients, understanding the different exponents for dD (1.25), dP (0.5), and the exponential decay for dH
  - Calculate pressure-corrected HSP values for liquids using the simplified Tait equation and isothermal compressibility
  - Estimate HSP values for supercritical CO2 at given temperature and pressure conditions using the Giddings equation and density estimation
  - Simulate time-dependent HSP evolution during mixed-solvent evaporation using Antoine equation vapor pressures and Raoult's law
  - Estimate HSP values for ionic liquids and deep eutectic solvents using the cation-anion composition averaging method with optional temperature correction

### Practical Applications

  - Predicting solvent-polymer compatibility at elevated processing temperatures (e.g., coating, extrusion)
  - Designing supercritical CO2 extraction processes by matching scCO2 HSP to target solute
  - Optimizing paint and coating drying processes by understanding HSP drift during solvent evaporation
  - Selecting ionic liquid solvents for green chemistry processes at various operating temperatures
  - High-pressure polymer processing (injection molding, extrusion) where pressure affects solvent-polymer interactions
  - Formulating deep eutectic solvents with tailored HSP for specific dissolution or extraction tasks
  - Quality control of thin-film coating processes where temperature gradients cause compositional HSP drift
  - Designing supercritical fluid chromatography (SFC) mobile phases with known HSP values

### Worked Examples

  - **title**: Temperature correction of toluene HSP from 25C to 80C | **description**: Given toluene HSP at 25C (dD=18.0, dP=1.4, dH=2.0) and thermal expansion coefficient alpha=1.08e-3 K...
  - **title**: scCO2 HSP estimation at 20 MPa and 40C | **description**: Using the Giddings equation and CO2 critical constants, estimate the density of supercritical CO2 at...
  - **title**: Evaporation HSP trajectory of acetone-toluene mixture | **description**: Simulate a 50:50 mole fraction mixture of acetone and toluene evaporating at 25C. Track the time evo...
  - **title**: Ionic liquid HSP estimation for [BMIM][BF4] | **description**: Estimate the HSP of 1-butyl-3-methylimidazolium tetrafluoroborate by applying the cation-anion compo...

### Key References

  - **author**: Barton, A.F.M. | **year**: 1991 | **title**: Handbook of Solubility Parameters and Other Cohesion Parameters, 2nd Edition, CRC Press
  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, Chapter 5 (Temperature effects), CRC P...
  - **author**: Giddings, J.C.; Myers, M.N.; King, J.W. | **year**: 1968 | **title**: Dense-Gas Chromatography at Pressures to 2000 Atmospheres, Science, 162(3849):67-73
  - **author**: Williams, L.L.; Rubin, J.B.; Edwards, H.W. | **year**: 2004 | **title**: Calculation of Hansen Solubility Parameter Values for a Range of Pressure and Temperature Conditions...
  - **author**: Span, R.; Wagner, W. | **year**: 1996 | **title**: A New Equation of State for Carbon Dioxide Covering the Fluid Region from the Triple-Point Temperatu...
  - **author**: Marciniak, A. | **year**: 2010 | **title**: The Solubility Parameters of Ionic Liquids, International Journal of Molecular Sciences, 11(5):1973-...
  - **author**: Paduszynski, K.; Domanska, U. | **year**: 2012 | **title**: Solubility Parameters of Ionic Liquids: An Alternative Assessment, Journal of Physical Chemistry B, ...
  - **author**: Tait, P.G. | **year**: 1888 | **title**: Report on Some of the Physical Properties of Fresh Water and of Sea Water, Physics and Chemistry of ...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2013 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 4th Edition, e-book

**Difficulty Level:** graduate

**Estimated Pages:** 35

### Figures Needed

  - **title**: HSP temperature dependence plot for common solvents | **description**: Line plots showing dD, dP, and dH as functions of temperature (0-150C) for representative solvents (...
  - **title**: Density ratio vs temperature for various thermal expansion coefficients | **description**: Graph showing rho(T)/rho(T0) curves for alpha values ranging from 0.2e-3 (water) to 1.6e-3 (diethyl ...
  - **title**: scCO2 HSP as a function of pressure at constant temperature | **description**: Plot of delta_t and component HSP (dD, dP, dH) for supercritical CO2 at 313K as pressure varies from...
  - **title**: scCO2 density phase diagram | **description**: Contour plot or 3D surface of CO2 density as a function of temperature and pressure, highlighting th...
  - **title**: Evaporation HSP trajectory in Hansen space | **description**: 3D trajectory plot showing how the HSP of a ternary solvent mixture evolves over time as volatile co...
  - **title**: Antoine equation vapor pressure curves | **description**: Semi-log plot of vapor pressure vs temperature for 8-10 common solvents using Antoine equation const...
  - **title**: Associating vs non-associating dH temperature correction comparison | **description**: Comparison plot showing dH(T) for water and ethanol using both the standard Barton exponential decay...
  - **title**: Cation-anion HSP composition diagram for ionic liquids | **description**: Schematic diagram showing how cation and anion HSP values are weighted to produce the composite ioni...

### Tables Needed

  - **title**: Thermal expansion coefficients for common solvents | **description**: Table listing CAS number, solvent name, and volumetric thermal expansion coefficient alpha (K^-1) fo...
  - **title**: Antoine equation constants for common solvents | **description**: Table of Antoine constants (A, B, C) for solvents in the evaporation module database, with valid tem...
  - **title**: CO2 critical constants and Giddings equation parameters | **description**: Table summarizing CO2 critical temperature, pressure, density, molecular weight, and the effective r...
  - **title**: Associating liquid parameters | **description**: Table of associating liquid model parameters (deltaH_ref, reference temperature, association paramet...
  - **title**: HSP temperature correction comparison at selected temperatures | **description**: Comparative table showing HSP values of 5 representative solvents at 25C, 50C, 80C, and 120C calcula...
  - **title**: scCO2 HSP at representative extraction conditions | **description**: Table of estimated scCO2 HSP values (dD, dP, dH, delta_t) and density at common extraction condition...

### Software Demo

  - **tab**: Temperature/Pressure HSP Correction
  - **inputs**: Select a solvent (e.g., toluene, CAS 108-88-3) from the database. Enter reference HSP values (dD=18.0, dP=1.4, dH=2.0 at 25C). Set target temperature to 80C. The thermal expansion coefficient is auto-populated from the built-in database. For pressure correction, enter target pressure (e.g., 50 MPa) and isothermal compressibility. For scCO2 mode, enter pressure (20 MPa) and temperature (313 K).
  - **expected_output**: Temperature-corrected HSP values at the target temperature with all three components recalculated. For scCO2 mode, estimated density, reduced density, total solubility parameter, and HSP components (dD, dP, dH). Evaporation simulation produces a time-series chart of HSP drift and composition change for mixed-solvent systems.

### Review Questions

  - Why does the Barton method use different power-law exponents for dD (1.25) and dP (0.5)? What physical reasoning underlies the exponential decay model for dH?
  - Explain why the standard Barton exponential decay for dH is inadequate for associating liquids like water. How does the associating-liquid model improve the prediction?
  - A coating formulation uses a 70:30 (mole fraction) mixture of MEK and xylene at 60C. Using the Barton method and thermal expansion data, estimate the mixture HSP at this temperature and explain how it differs from the 25C values.
  - Describe the Giddings equation for supercritical CO2 and explain why scCO2 solvent power increases dramatically near the critical point. How does the HSP component ratio (dD:dP:dH) for scCO2 compare to conventional organic solvents?
  - During the drying of a ternary solvent coating, the fastest-evaporating component leaves first. Using Antoine equation vapor pressures and Raoult's law, explain qualitatively how the film's HSP changes over time and what practical consequences this can have for coating defects.


## Chapter 4: HSP Estimation Methods
**HSP推算法**

**Level:** chapter

**Parent:** Part I: Fundamentals

**Synopsis:** This chapter provides a comprehensive treatment of all major methods for estimating Hansen Solubility Parameters. It covers group contribution methods (Van Krevelen-Hoftyzer and Stefanis-Panayiotou), copolymer HSP estimation via volume-fraction-weighted averaging, Nelder-Mead sphere fitting from dissolution test data, QSPR-based machine learning prediction from molecular descriptors, bootstrap uncertainty quantification, and inverse determination of surface HSP from contact angle measurements.

### Key Concepts

  - Group contribution methods for HSP estimation
  - Van Krevelen-Hoftyzer method using molar attraction constants (Fd, Fp, Eh) and molar volume
  - Stefanis-Panayiotou first-order and second-order group contribution approach with universal constants
  - Copolymer HSP estimation via volume-fraction-weighted linear mixing rule
  - Nelder-Mead simplex optimization for HSP sphere fitting
  - Solvent classification (good/poor) as input to sphere fitting
  - Objective function design: maximizing correct classification rate while minimizing sphere radius
  - QSPR (Quantitative Structure-Property Relationship) regression from molecular descriptors
  - Molecular descriptors: molar volume, logP, H-bond donors/acceptors, aromatic ring count
  - Bootstrap resampling for 95% confidence interval estimation of HSP center and R0
  - Percentile-based confidence interval calculation
  - Surface HSP determination as an inverse problem from contact angle data
  - Owens-Wendt approach combined with HSP-to-surface-energy conversion
  - Young-Dupre equation for work of adhesion from contact angle
  - Ordinary least squares fitting of surface energy components

### Equations

  - **name**: Van Krevelen-Hoftyzer dispersion component | **latex**: \delta_D = \frac{\sum F_{di}}{V} | **explanation**: Dispersion solubility parameter from sum of molar attraction constants divided by molar volume
  - **name**: Van Krevelen-Hoftyzer polar component | **latex**: \delta_P = \frac{\sqrt{\sum F_{pi}^2}}{V} | **explanation**: Polar solubility parameter from root sum of squares of polar attraction constants divided by molar v...
  - **name**: Van Krevelen-Hoftyzer hydrogen bonding component | **latex**: \delta_H = \sqrt{\frac{\sum E_{hi}}{V}} | **explanation**: Hydrogen bonding solubility parameter from square root of sum of H-bond energies divided by molar vo...
  - **name**: Stefanis-Panayiotou general formula | **latex**: \delta_i = \sum_j N_j C_{j,i} + \sum_k M_k D_{k,i} + W_i | **explanation**: HSP component i equals sum of first-order group contributions plus second-order corrections plus uni...
  - **name**: Copolymer HSP mixing rule | **latex**: \delta_{cop} = \sum_i \phi_i \delta_i | **explanation**: Copolymer HSP estimated as volume-fraction-weighted average of homopolymer HSP values
  - **name**: Nelder-Mead objective function | **latex**: \text{cost} = -\left(\frac{N_{correct}}{N_{total}} - 0.001 \cdot R_0\right) | **explanation**: Minimization objective combining correct classification rate with a penalty on sphere radius R0
  - **name**: Young-Dupre work of adhesion | **latex**: W_a = \gamma_{LV}(1 + \cos\theta) | **explanation**: Work of adhesion from liquid surface tension and contact angle theta
  - **name**: Geometric mean mixing for surface energy | **latex**: \frac{W_a}{2} = \sqrt{\gamma_D^s \gamma_D^L} + \sqrt{\gamma_P^s \gamma_P^L} + \sqrt{\gamma_H^s \gamm... | **explanation**: Extended Owens-Wendt equation with three surface energy components for HSP-compatible analysis
  - **name**: HSP to surface energy conversion | **latex**: \gamma_D = 0.0947 \, \delta_D^2, \quad \gamma_P = 0.0315 \, \delta_P^2, \quad \gamma_H = 0.0238 \, \... | **explanation**: Empirical proportionality constants linking HSP components to surface energy components
  - **name**: Bootstrap 95% confidence interval | **latex**: CI_{95\%} = [P_{2.5}(\hat{\theta}^*), \, P_{97.5}(\hat{\theta}^*)] | **explanation**: 95% confidence interval from 2.5th and 97.5th percentiles of bootstrap distribution of fitted parame...

**Historical Context:** Group contribution methods for predicting solubility parameters trace back to Hoy (1970) and Van Krevelen and Hoftyzer (1976), who compiled molar attraction constants (Fd, Fp) and hydrogen bonding energies (Eh) for common structural groups, published in 'Properties of Polymers'. Stefanis and Panayiotou (2008) introduced an improved two-level group contribution scheme with first-order and second-order structural groups plus universal constants, achieving better accuracy for complex molecules. The Nelder-Mead simplex algorithm (Nelder & Mead, 1965) was adapted for HSP sphere fitting as an alternative to grid search, enabling automated determination of optimal sphere center and radius from dissolution test data. QSPR approaches for HSP prediction emerged in the 2000s, notably by Gharagheizi et al. (2011) who used molecular descriptors and regression models. Bootstrap uncertainty quantification (Efron, 1979) was later applied to assess confidence intervals in fitted HSP parameters. Surface HSP determination via contact angle measurements builds on the Owens-Wendt (1969) surface energy decomposition framework.

### Related Project Modules

  - group-contribution.ts
  - group-contribution-updates.ts
  - copolymer-hsp-estimation.ts
  - sphere-fitting.ts
  - ml-hsp-prediction.ts
  - hsp-uncertainty-quantification.ts
  - surface-hsp-determination.ts

### Learning Objectives

  - Apply the Van Krevelen-Hoftyzer group contribution method to estimate HSP of a new compound from its molecular structure
  - Use the Stefanis-Panayiotou two-level group contribution method with first-order and second-order corrections for improved accuracy
  - Estimate copolymer HSP from monomer HSP values using volume-fraction-weighted averaging
  - Understand the Nelder-Mead optimization algorithm for fitting an HSP sphere to solvent dissolution test data
  - Evaluate uncertainty in HSP estimates using bootstrap resampling and 95% confidence intervals

### Practical Applications

  - Predicting HSP for novel polymers before synthesis, guiding material design decisions
  - Selecting candidate solvents for new polymers or resins when no experimental dissolution data exists
  - Estimating HSP of copolymers and polymer blends from known homopolymer parameters for coating formulation
  - Automated HSP sphere fitting from systematic dissolution screening data in paint and adhesive R&D
  - Rapid QSPR-based HSP screening of large chemical libraries for virtual solvent selection
  - Quantifying uncertainty in HSP database values to assess reliability for formulation predictions
  - Determining surface HSP of substrates from contact angle measurements for adhesion optimization
  - Quality control validation of HSP values by comparing group contribution estimates with experimental sphere fitting results

### Worked Examples

  - **title**: Van Krevelen-Hoftyzer estimation of poly(methyl methacrylate) HSP | **description**: Decompose PMMA repeat unit into structural groups (-CH3, -CH2-, >C<, -COO-), look up Fd, Fp, Eh, V v...
  - **title**: Stefanis-Panayiotou estimation of toluene HSP | **description**: Select first-order groups (ACH x5, AC x1, CH3 x1) and apply the SP formula with universal constants ...
  - **title**: Nelder-Mead sphere fitting from 20 solvent dissolution tests | **description**: Given a dataset of 20 solvents classified as good or poor for an epoxy resin, run the Nelder-Mead op...
  - **title**: Bootstrap uncertainty analysis of fitted HSP | **description**: Using the 20-solvent dataset from the previous example, perform 200 bootstrap iterations of the sphe...

### Key References

  - **author**: Van Krevelen, D.W.; Te Nijenhuis, K. | **year**: 2009 | **title**: Properties of Polymers, 4th Edition, Chapter 7: Cohesive Properties and Solubility
  - **author**: Stefanis, E.; Panayiotou, C. | **year**: 2008 | **title**: Prediction of Hansen Solubility Parameters with a New Group-Contribution Method, International Journ...
  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Nelder, J.A.; Mead, R. | **year**: 1965 | **title**: A Simplex Method for Function Minimization, The Computer Journal, 7(4), 308-313
  - **author**: Gharagheizi, F.; Eslamimanesh, A.; Mohammadi, A.H.; Richon, D. | **year**: 2011 | **title**: Determination of Hansen Solubility Parameters from QSPR Models, Journal of Chemical & Engineering Da...
  - **author**: Efron, B. | **year**: 1979 | **title**: Bootstrap Methods: Another Look at the Jackknife, Annals of Statistics, 7(1), 1-26
  - **author**: Owens, D.K.; Wendt, R.C. | **year**: 1969 | **title**: Estimation of the Surface Free Energy of Polymers, Journal of Applied Polymer Science, 13(8), 1741-1...
  - **author**: Hoy, K.L. | **year**: 1970 | **title**: New Values of the Solubility Parameters from Vapor Pressure Data, Journal of Paint Technology, 42, 7...
  - **author**: Jurs, P.C.; Bakken, G.A.; McClelland, H.E. | **year**: 2000 | **title**: Computational Methods for the Analysis of Chemical Sensor Array Data from Volatile Analytes, Chemica...

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Van Krevelen-Hoftyzer Group Contribution Workflow | **description**: Flowchart showing the process from molecular structure decomposition into groups, lookup of Fd/Fp/Eh...
  - **title**: Stefanis-Panayiotou Two-Level Group Scheme | **description**: Diagram illustrating first-order groups and second-order structural corrections, showing how univers...
  - **title**: Nelder-Mead Simplex Optimization Progression | **description**: 3D Hansen space plot showing the simplex vertices moving toward the optimal HSP center over iteratio...
  - **title**: Comparison of Estimation Methods | **description**: Bar chart or radar plot comparing HSP values obtained by Van Krevelen, Stefanis-Panayiotou, sphere f...
  - **title**: Bootstrap Confidence Interval Distributions | **description**: Histograms of deltaD, deltaP, deltaH, and R0 from N bootstrap iterations, with 2.5th and 97.5th perc...
  - **title**: Contact Angle Measurement Setup for Surface HSP | **description**: Schematic showing sessile drop on a surface with contact angle theta, along with the data flow to su...

### Tables Needed

  - **title**: Van Krevelen-Hoftyzer Group Contribution Constants | **description**: Complete table of structural groups with Fd, Fp, Eh, and V values (aliphatic, aromatic, oxygen-conta...
  - **title**: Stefanis-Panayiotou First-Order Group Contributions | **description**: Table of 30+ first-order groups with dD, dP, dH increment values and universal constants W_D, W_P, W...
  - **title**: Stefanis-Panayiotou Second-Order Correction Groups | **description**: Table of second-order structural corrections (alcohol, aromatic ring, conjugation) with their dD, dP...
  - **title**: Comparison of Estimated vs Literature HSP Values | **description**: Validation table comparing group contribution estimates with experimental HSP values for 10-15 commo...
  - **title**: Molecular Descriptors for QSPR HSP Prediction | **description**: Table listing the molecular descriptors (molar volume, logP, H-bond donors/acceptors, aromatic rings...

### Software Demo

  - **tab**: Group Contribution (族寄与法) tab and HSP Sphere Fitting (HSP球算出) tab
  - **inputs**: In the Group Contribution tab, select structural groups (e.g., CH3 x2, CH2 x4, OH x1) and their counts, then choose Van Krevelen or Stefanis-Panayiotou method. In the Sphere Fitting tab, enter solvent dissolution test data with good/poor classification.
  - **expected_output**: The Group Contribution tab displays estimated deltaD, deltaP, deltaH values with confidence level (high/medium/low) and any warnings. The Sphere Fitting tab shows the optimized HSP center coordinates, interaction radius R0, fitness score, correct classification count, and list of misclassified solvents.
  - **workflow**: 1. Open Group Contribution tab and add first-order groups for the target molecule. 2. Click the HSP estimation button to obtain predicted HSP. 3. Switch to Sphere Fitting tab and enter dissolution test data for the same material. 4. Run sphere fitting and compare the fitted center with the group contribution estimate. 5. Optionally run bootstrap analysis to obtain 95% confidence intervals.

### Review Questions

  - Explain the difference between the Van Krevelen-Hoftyzer and Stefanis-Panayiotou group contribution methods. Under what circumstances would you prefer one over the other?
  - Why does the Van Krevelen-Hoftyzer method use different mathematical forms for deltaD (linear sum), deltaP (root sum of squares), and deltaH (square root of ratio)? What physical reasoning underlies each formula?
  - Describe the Nelder-Mead simplex algorithm as applied to HSP sphere fitting. What are the roles of reflection, expansion, contraction, and shrinkage operations? Why is a penalty term on R0 included in the objective function?
  - A bootstrap analysis of a 15-solvent dissolution dataset yields a 95% CI for deltaD of [16.2, 19.8] MPa^0.5. What factors could cause this interval to be wide, and how would you narrow it?
  - Discuss the advantages and limitations of QSPR-based HSP prediction compared to group contribution methods. For which types of molecules might QSPR outperform group contribution, and vice versa?


---
# Part II: 表面科学と接着 (Surface Science & Adhesion)

## Chapter 5: Contact Angle and Wettability
**接触角と濡れ性**

**Level:** chapter

**Parent:** Part II: Surface Science

**Synopsis:** This chapter covers the science of contact angles and wettability from the perspective of Hansen Solubility Parameters. It presents the Nakamoto-Yamamoto empirical equation for estimating surface tension from HSP values, Young's equation for contact angle prediction, and the Owens-Wendt method for decomposing surface energy into dispersive and polar components. A six-level wettability classification system (from superhydrophilic to superhydrophobic) is introduced, along with the Owens-Wendt-Kaelble model for calculating work of adhesion (Wa). The chapter concludes with quantitative evaluation of surface treatment effects through changes in Wa and Ra distance.

### Key Concepts

  - Young's equation relating contact angle to surface/interfacial tensions
  - Nakamoto-Yamamoto empirical equation converting HSP to surface tension via coefficients (0.0947, 0.0315, 0.0238)
  - HSP-based interfacial tension estimation from component differences
  - Owens-Wendt method for splitting surface energy into dispersive and polar components
  - Surface energy component decomposition: dispersive (delta_D) vs polar (delta_P + delta_H)
  - Six-level wettability classification: superhydrophilic (<10 deg), hydrophilic (<30 deg), wettable (<60 deg), moderate (<90 deg), hydrophobic (<150 deg), superhydrophobic (>=150 deg)
  - Work of adhesion (Wa) and the Owens-Wendt-Kaelble model
  - Extended three-component Owens-Wendt model including hydrogen bonding term
  - Two-component vs three-component surface energy models for adhesion prediction
  - Young-Dupre equation: Wa = gamma_LV(1 + cos theta)
  - Surface treatment effect quantification via Wa improvement ratio (Wa_after / Wa_before)
  - Ra distance reduction as a complementary metric for surface treatment effectiveness
  - Panayiotou-Stefanis/Toyota correlation for HSP-to-surface-energy conversion

### Equations

  - **name**: Nakamoto-Yamamoto surface tension from HSP | **latex**: \gamma = 0.0947 \, \delta_D^2 + 0.0315 \, \delta_P^2 + 0.0238 \, \delta_H^2 | **explanation**: Empirical equation estimating surface tension (mN/m) from HSP components using fitted proportionalit...
  - **name**: HSP-based interfacial tension | **latex**: \gamma_{SL} = 0.0947 (\delta_{D1} - \delta_{D2})^2 + 0.0315 (\delta_{P1} - \delta_{P2})^2 + 0.0238 (... | **explanation**: Interfacial tension between two materials estimated from squared differences of their HSP components
  - **name**: Young's equation | **latex**: \cos\theta = \frac{\gamma_{SV} - \gamma_{SL}}{\gamma_{LV}} | **explanation**: Fundamental equation relating equilibrium contact angle to solid-vapor, solid-liquid, and liquid-vap...
  - **name**: Owens-Wendt interfacial tension | **latex**: \gamma_{SL} = \gamma_{SV} + \gamma_{LV} - 2\left(\sqrt{\gamma_{SV}^d \gamma_{LV}^d} + \sqrt{\gamma_{... | **explanation**: Interfacial tension from dispersive and polar surface energy components using geometric mean combini...
  - **name**: Surface energy component split from HSP | **latex**: \gamma^d = 0.0947 \, \delta_D^2, \quad \gamma^p = 0.0315 \, \delta_P^2 + 0.0238 \, \delta_H^2 | **explanation**: Decomposition of total surface energy into dispersive component (from delta_D) and polar component (...
  - **name**: Owens-Wendt-Kaelble work of adhesion (2-component) | **latex**: W_a = 2\left(\sqrt{\gamma_D^1 \gamma_D^2} + \sqrt{\gamma_P^1 \gamma_P^2}\right) | **explanation**: Work of adhesion between two materials using geometric mean of dispersive and polar surface energy c...
  - **name**: Extended work of adhesion (3-component) | **latex**: W_a = 2\left(\sqrt{\gamma_D^1 \gamma_D^2} + \sqrt{\gamma_P^1 \gamma_P^2} + \sqrt{\gamma_H^1 \gamma_H... | **explanation**: Three-component extension including hydrogen bonding surface energy for HSP-compatible adhesion anal...
  - **name**: Young-Dupre equation | **latex**: W_a = \gamma_{LV}(1 + \cos\theta) | **explanation**: Work of adhesion derived from liquid surface tension and contact angle, linking measurable quantitie...
  - **name**: Surface treatment improvement ratio | **latex**: \text{Improvement Ratio} = \frac{W_{a,\text{after}}}{W_{a,\text{before}}} | **explanation**: Dimensionless ratio quantifying how much surface treatment improves adhesion; values > 1 indicate im...

**Historical Context:** Young's equation for contact angle was first proposed by Thomas Young in 1805, establishing the foundational relationship between wetting and surface tensions. The modern quantitative framework for surface energy decomposition began with Fowkes (1964), who introduced the concept of splitting surface energy into dispersive and non-dispersive components. Owens and Wendt (1969) extended this by applying a geometric mean combining rule to both dispersive and polar contributions, enabling practical determination of surface energy components from contact angle measurements. Kaelble (1970) further developed this framework for polymer adhesion applications. The connection between Hansen Solubility Parameters and surface energy was established through empirical correlations, notably by Panayiotou and Stefanis (2002) and Toyota researchers, who fitted proportionality coefficients (0.0947, 0.0315, 0.0238) linking HSP components to surface energy components. The Nakamoto-Yamamoto formulation (Langmuir, 2023) provided a direct HSP-to-surface-tension conversion. The six-level wettability classification system synthesizes decades of industrial practice from coatings, biomedical devices, and self-cleaning surface technologies.

**Related Project Modules:** contact-angle.ts, contact-angle-methods.ts, wettability.ts, work-of-adhesion.ts, surface-treatment-quantification.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch04_HSP_Estimation_Methods

### Learning Objectives

  - Estimate contact angles between solid-liquid pairs using HSP values and the Nakamoto-Yamamoto/Young's equation approach
  - Decompose surface energy into dispersive and polar components using the Owens-Wendt framework applied to HSP data
  - Classify wettability into six levels based on contact angle thresholds and understand the physical meaning of each level
  - Calculate work of adhesion using both two-component and three-component Owens-Wendt-Kaelble models
  - Quantitatively evaluate the effectiveness of surface treatments by comparing Wa and Ra before and after treatment

### Practical Applications

  - Predicting coating wettability on polymer substrates before formulation trials
  - Screening surface treatments (plasma, corona, UV-ozone) by comparing predicted Wa improvement ratios
  - Optimizing ink-substrate combinations for printing processes by matching surface energy components
  - Evaluating biocompatibility of medical device surfaces through wettability classification
  - Designing self-cleaning or anti-fouling surfaces by targeting specific wettability levels
  - Quality control of surface treatment processes by monitoring contact angle and Wa metrics
  - Adhesive selection for bonding dissimilar materials based on work of adhesion predictions
  - Predicting paint adhesion failure by identifying low-Wa interfaces in multilayer systems

### Worked Examples

  - **title**: HSP-based contact angle estimation for water on polyethylene | **description**: Given HSP values for water (deltaD=15.5, deltaP=16.0, deltaH=42.3) and polyethylene (deltaD=17.1, de...
  - **title**: Owens-Wendt surface energy decomposition | **description**: For a polycarbonate substrate (deltaD=18.4, deltaP=4.0, deltaH=7.0), split the surface energy into d...
  - **title**: Surface treatment quantification for PP with corona treatment | **description**: Polypropylene before treatment (deltaD=17.0, deltaP=0, deltaH=0.5) and after corona treatment (delta...
  - **title**: Wettability classification across material families | **description**: Calculate contact angles for a probe liquid on five materials spanning the wettability spectrum (gla...

### Key References

  - **author**: Young, T. | **year**: 1805 | **title**: An Essay on the Cohesion of Fluids, Philosophical Transactions of the Royal Society of London, 95, 6...
  - **author**: Fowkes, F.M. | **year**: 1964 | **title**: Attractive Forces at Interfaces, Industrial & Engineering Chemistry, 56(12), 40-52
  - **author**: Owens, D.K.; Wendt, R.C. | **year**: 1969 | **title**: Estimation of the Surface Free Energy of Polymers, Journal of Applied Polymer Science, 13(8), 1741-1...
  - **author**: Kaelble, D.H. | **year**: 1970 | **title**: Dispersion-Polar Surface Tension Properties of Organic Solids, Journal of Adhesion, 2(2), 66-81
  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 3: Methods of Chara...
  - **author**: Panayiotou, C. | **year**: 2002 | **title**: The QCHB Model of Fluids and Their Mixtures, Journal of Chemical Thermodynamics, 35, 413-436 [uncert...
  - **author**: de Gennes, P.-G. | **year**: 1985 | **title**: Wetting: Statics and Dynamics, Reviews of Modern Physics, 57, 827-863
  - **author**: van Oss, C.J.; Chaudhury, M.K.; Good, R.J. | **year**: 1988 | **title**: Interfacial Lifshitz-van der Waals and Polar Interactions in Macroscopic Systems, Chemical Reviews, ...
  - **author**: Nakamoto, H.; Yamamoto, T. | **year**: 2023 | **title**: HSP-Based Surface Tension Estimation Using Empirical Coefficients, Langmuir [uncertain]

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Young's Equation Force Balance Diagram | **description**: Schematic of a sessile drop on a flat solid surface showing the three interfacial tensions (gamma_SV...
  - **title**: HSP-to-Surface-Tension Conversion Workflow | **description**: Flowchart showing the path from HSP values through the Nakamoto-Yamamoto coefficients to surface ten...
  - **title**: Owens-Wendt Surface Energy Decomposition | **description**: Bar charts comparing dispersive and polar surface energy components for several common polymers, der...
  - **title**: Six-Level Wettability Classification Scale | **description**: Visual scale showing contact angle ranges (0-180 degrees) with color-coded zones for each wettabilit...
  - **title**: Work of Adhesion Comparison: 2-Component vs 3-Component Model | **description**: Scatter plot comparing Wa values calculated by the standard 2-component Owens-Wendt model versus the...
  - **title**: Surface Treatment Effect Visualization | **description**: Before/after comparison chart showing Wa and Ra values for a substrate-adhesive pair, with improveme...

### Tables Needed

  - **title**: Nakamoto-Yamamoto Coefficients | **description**: Table of the three empirical coefficients (C_D=0.0947, C_P=0.0315, C_H=0.0238) with their units, phy...
  - **title**: Wettability Classification Thresholds | **description**: Table of six wettability levels with contact angle ranges, labels, physical descriptions, and repres...
  - **title**: Surface Energy Components of Common Polymers | **description**: Table listing 10-15 common polymers with their HSP values, computed dispersive and polar surface ene...
  - **title**: Contact Angle Predictions vs Experimental Values | **description**: Validation table comparing HSP-predicted contact angles with experimentally measured values for vari...
  - **title**: Surface Treatment Effects on Industrial Substrates | **description**: Table of common surface treatments (plasma, corona, UV-ozone, flame) showing before/after HSP values...

### Software Demo

  - **tab**: Contact Angle Estimation (接触角推定) tab
  - **inputs**: Select a parts group containing solid substrates (e.g., common polymers) and a probe liquid (e.g., water). Choose between group evaluation mode (one liquid vs all parts) or screening mode (all liquids vs one part).
  - **expected_output**: Results table displays for each solid-liquid pair: contact angle (degrees), wettability level badge (color-coded), surface tension gamma_LV, surface energy gamma_SV, and interfacial tension gamma_SL. Results are sortable by any column and exportable to CSV.
  - **workflow**: 1. Open the Contact Angle Estimation tab. 2. Select group mode and choose a parts group containing polymer substrates. 3. Select water as the probe liquid. 4. Click evaluate to compute contact angles for all parts in the group. 5. Observe wettability badges and sort results by contact angle. 6. Switch to screening mode to test one substrate against all available solvents. 7. Export results to CSV for further analysis.

### Review Questions

  - Derive the contact angle prediction formula starting from Young's equation and the Nakamoto-Yamamoto surface tension equation. What assumptions are made when applying HSP-based surface tension estimates to Young's equation?
  - The Owens-Wendt method decomposes surface energy into dispersive and polar components. In the HSP-based implementation, delta_P and delta_H are combined into a single polar term. Discuss the physical justification and potential limitations of this simplification.
  - A surface treatment changes a substrate's HSP from (17.0, 0, 0.5) to (17.0, 5.0, 4.0) MPa^0.5. Without performing calculations, predict qualitatively how this will affect (a) surface energy, (b) contact angle with water, and (c) work of adhesion with an epoxy adhesive. Then verify with calculations.
  - Compare the two-component and three-component work of adhesion models. For which types of material pairs would you expect the largest discrepancy between them? Provide specific examples.
  - The wettability classification uses fixed angular thresholds (10, 30, 60, 90, 150 degrees). Discuss whether these thresholds are universal or whether they should be adjusted for specific applications such as biomedical implants versus industrial coatings.


## Chapter 6: Adhesion Engineering
**接着設計工学**

**Level:** chapter

**Parent:** Part II: Surface Science

**Synopsis:** This chapter covers the engineering application of Hansen Solubility Parameters to adhesion design. It presents Ra-distance-based adhesion strength prediction, combined Wa (work of adhesion) and Ra evaluation for ink-substrate adhesion, weakest-link analysis of multilayer coating interfaces, dual-Wa threshold structural adhesive joint design, primerless adhesion optimization via intermediate HSP proposals, PSA (pressure-sensitive adhesive) peel strength correlation with Wa, and wettability evaluation for printed electronics devices using Wa and contact angle criteria.

### Key Concepts

  - HSP distance (Ra) as a predictor of adhesion quality between materials
  - Work of adhesion (Wa) calculated from HSP via surface energy conversion (Owens-Wendt-Kaelble model)
  - HSP-to-surface-energy conversion using Panayiotou-Stefanis/Toyota empirical coefficients
  - Extended Owens-Wendt model with three components (dispersion, polar, hydrogen bonding)
  - Composite Wa + Ra evaluation for ink-substrate adhesion classification
  - Multilayer coating interface analysis with weakest-link identification
  - Structural adhesive joint design using dual-Wa threshold on adhesive-adherend pairs
  - Bottleneck interface identification in multi-adherend joints
  - Primerless adhesion design by proposing optimal adhesive HSP (midpoint or matching strategy)
  - PSA peel strength estimation via empirical Wa-to-peel-force correlation (F_peel = k * Wa)
  - Printed electronics wetting evaluation combining Wa and contact angle criteria
  - Adhesion level classification systems (Excellent/Good/Fair/Poor/Failed) with threshold engineering
  - Young-Dupre equation relating contact angle to work of adhesion

### Equations

  - **name**: HSP distance (Ra) | **latex**: R_a = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{... | **explanation**: Modified Euclidean distance in Hansen space with factor-of-4 weighting on dispersion component; smal...
  - **name**: HSP to surface energy conversion | **latex**: \gamma_D = 0.0947 \, \delta_D^2, \quad \gamma_P = 0.0315 \, \delta_P^2, \quad \gamma_H = 0.0238 \, \... | **explanation**: Panayiotou-Stefanis/Toyota empirical proportionality constants converting HSP components (MPa^0.5) t...
  - **name**: Extended Owens-Wendt work of adhesion (3-component) | **latex**: W_a = 2 \left( \sqrt{\gamma_D^1 \gamma_D^2} + \sqrt{\gamma_P^1 \gamma_P^2} + \sqrt{\gamma_H^1 \gamma... | **explanation**: Work of adhesion from geometric mean mixing of dispersion, polar, and hydrogen bonding surface energ...
  - **name**: Young-Dupre equation | **latex**: W_a = \gamma_{LV}(1 + \cos\theta) | **explanation**: Relates work of adhesion to liquid surface tension and equilibrium contact angle; used for wetting e...
  - **name**: PSA peel force correlation | **latex**: F_{\text{peel}} = k \cdot W_a | **explanation**: Empirical linear correlation between work of adhesion and peel force per unit width, with k as an em...
  - **name**: Structural joint bottleneck | **latex**: W_{a,\text{joint}} = \min(W_{a1}, W_{a2}) | **explanation**: Overall joint strength governed by the weaker adhesive-adherend interface (weakest-link principle ap...
  - **name**: Multilayer weakest interface | **latex**: W_{a,\text{weakest}} = \min_{i} \left\{ W_{a}(\text{layer}_i, \text{layer}_{i+1}) \right\} | **explanation**: In multilayer coatings, the interface with the lowest Wa determines overall system adhesion integrit...

**Historical Context:** The application of solubility parameters to adhesion prediction dates to the work of Hildebrand and later Hansen (1967), who demonstrated that smaller HSP distances correlate with better adhesion. Owens and Wendt (1969) developed the geometric mean approach for work of adhesion from surface energy components, later extended by Kaelble. Panayiotou (2002) and the Toyota research group established empirical coefficients linking HSP values to surface energy components, enabling direct Wa calculation from HSP data. Abbott and Hansen (2008, HSPiP software) popularized practical adhesion design using HSP distance and work of adhesion. The application to pressure-sensitive adhesives, multilayer coatings, and printed electronics emerged in the 2010s as HSP databases expanded and computational tools became widely available.

### Related Project Modules

  - adhesion.ts
  - work-of-adhesion.ts
  - ink-substrate-adhesion.ts
  - multilayer-coating-adhesion.ts
  - structural-adhesive-joint.ts
  - primerless-adhesion.ts
  - psa-peel-strength.ts
  - printed-electronics-wetting.ts

### Learning Objectives

  - Calculate work of adhesion (Wa) between two materials from their HSP values using the extended Owens-Wendt model with HSP-to-surface-energy conversion
  - Predict adhesion quality between materials using Ra distance thresholds and composite Wa + Ra criteria
  - Identify the weakest interface in multilayer coating systems and propose design improvements
  - Apply the dual-Wa threshold approach to structural adhesive joint design and identify bottleneck interfaces
  - Design primerless adhesion systems by computing optimal adhesive HSP for a given substrate

### Practical Applications

  - Predicting ink-substrate adhesion quality in printing and coating industries using combined Wa and Ra evaluation
  - Designing multilayer automotive and architectural coatings with optimized inter-layer adhesion
  - Selecting structural adhesives for dissimilar material joining (metal-polymer, composite-composite)
  - Eliminating primer layers in industrial coating processes by matching adhesive HSP to substrate HSP
  - Estimating peel strength of pressure-sensitive adhesive tapes for packaging and electronics assembly
  - Evaluating wettability of conductive inks on flexible substrates for printed electronics manufacturing
  - Quality control screening of adhesive-substrate combinations before physical testing
  - Optimizing surface treatment processes by targeting specific HSP modifications to improve Wa

### Worked Examples

  - **title**: Ink-substrate adhesion evaluation for flexographic printing | **description**: Given HSP values for a UV-curable ink (dD=17.5, dP=8.2, dH=6.1) and PET film substrate (dD=19.5, dP=...
  - **title**: Weakest-link analysis of a 4-layer automotive coating system | **description**: Analyze a coating stack consisting of steel substrate, epoxy primer, polyurethane basecoat, and acry...
  - **title**: Primerless adhesion design for polypropylene bonding | **description**: For a polypropylene substrate (dD=18.0, dP=0.0, dH=1.0) and an epoxy adhesive (dD=20.0, dP=12.0, dH=...
  - **title**: PSA tape peel strength prediction for electronics assembly | **description**: Estimate the peel force of an acrylic PSA tape on a glass substrate using HSP-derived Wa values and ...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 8: Adhesion
  - **author**: Owens, D.K.; Wendt, R.C. | **year**: 1969 | **title**: Estimation of the Surface Free Energy of Polymers, Journal of Applied Polymer Science, 13(8), 1741-1...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2020 | **title**: HSPiP User's e-Book, Chapter 15: Adhesion
  - **author**: Panayiotou, C. | **year**: 2002 | **title**: Interfacial Tension and Surface Thermodynamics from Solubility Parameters, Journal of Chemical Therm...
  - **author**: Kaelble, D.H. | **year**: 1970 | **title**: Dispersion-Polar Surface Tension Properties of Organic Solids, Journal of Adhesion, 2(2), 66-81
  - **author**: Kinloch, A.J. | **year**: 1987 | **title**: Adhesion and Adhesives: Science and Technology, Chapman and Hall
  - **author**: Packham, D.E. | **year**: 2005 | **title**: Handbook of Adhesion, 2nd Edition, John Wiley & Sons
  - **author**: Creton, C.; Leibler, L. | **year**: 1996 | **title**: How Does Tack Depend on Time of Contact and Contact Pressure?, Journal of Polymer Science Part B, 34...

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Ra Distance and Adhesion Level Classification | **description**: Schematic showing the Ra distance scale with threshold boundaries for Excellent (<2), Good (<4), Fai...
  - **title**: HSP-to-Surface-Energy-to-Wa Calculation Pipeline | **description**: Flowchart showing the computation path from HSP values through Panayiotou-Stefanis coefficients to s...
  - **title**: Ink-Substrate Adhesion Phase Diagram | **description**: 2D plot with Wa on x-axis and Ra on y-axis, showing the composite classification regions (Excellent:...
  - **title**: Multilayer Coating Weakest-Link Analysis | **description**: Stacked layer diagram of a multilayer coating system with Wa values annotated at each interface, hig...
  - **title**: Structural Adhesive Joint Dual-Wa Evaluation | **description**: Diagram of an adhesive joint between two adherends, showing Wa1 and Wa2 at each interface, with the ...
  - **title**: Primerless Adhesion HSP Optimization | **description**: 3D Hansen space plot showing substrate HSP, current adhesive HSP, and proposed optimal adhesive HSP ...
  - **title**: PSA Peel Force vs Work of Adhesion Correlation | **description**: Scatter plot of experimental peel force vs Wa for various PSA-adherend combinations, with the linear...
  - **title**: Printed Electronics Wetting Level Classification | **description**: 2D classification plot with Wa on x-axis and contact angle on y-axis, showing the four wetting level...

### Tables Needed

  - **title**: Ra-Based Adhesion Classification Thresholds | **description**: Table of default Ra threshold values and corresponding adhesion levels (Excellent, Good, Fair, Poor,...
  - **title**: HSP-to-Surface-Energy Conversion Coefficients | **description**: Table listing the Panayiotou-Stefanis/Toyota empirical coefficients (0.0947, 0.0315, 0.0238) for dD,...
  - **title**: Ink-Substrate Adhesion Evaluation Criteria | **description**: Decision matrix showing the combined Wa and Ra thresholds for Excellent, Good, Fair, and Poor ink-su...
  - **title**: Structural Joint Quality Levels | **description**: Table of min(Wa1, Wa2) threshold values for Excellent (>80), Good (>60), Fair (>40), and Poor joint ...
  - **title**: PSA Peel Strength Classification | **description**: Table showing Wa ranges, corresponding peel force estimates (with k=0.25), and Strong/Medium/Weak cl...
  - **title**: Printed Electronics Wetting Evaluation Criteria | **description**: Table of combined Wa and contact angle thresholds for Excellent, Good, Moderate, and Poor wetting le...

### Software Demo

  - **tab**: Adhesion evaluation tabs (接着性予測, インク-基材密着性, 多層コーティング, 構造接着, プライマーレス接着, PSA剥離強度, 印刷電子デバイス濡れ性)
  - **inputs**: Enter HSP values (deltaD, deltaP, deltaH) for each material pair. For multilayer coating, define 2+ coating layers with names and HSP values. For structural joints, provide adhesive and two adherend HSP values. For PSA evaluation, optionally adjust the empirical constant k.
  - **expected_output**: Each tab displays computed Ra, Wa (mJ/m^2), adhesion/wetting level classification with color-coded indicators. Multilayer coating tab shows all interface Wa values and highlights the weakest interface. Structural joint tab shows both Wa values and identifies the bottleneck adherend. Primerless adhesion tab shows current and optimal adhesive HSP with improvement potential percentage.
  - **workflow**: 1. Open the basic adhesion prediction tab and enter adhesive/substrate HSP to see Ra-based classification. 2. Switch to ink-substrate adhesion tab for combined Wa + Ra evaluation. 3. Use multilayer coating tab to stack multiple layers and identify the weakest interface. 4. Use structural joint tab for dual-adherend analysis. 5. Use primerless adhesion tab to get optimal adhesive HSP recommendations. 6. Use PSA tab for peel force estimation. 7. Use printed electronics tab for combined Wa + contact angle wetting assessment.

### Review Questions

  - Explain why the Ra distance uses a factor-of-4 weighting on the dispersion component. How does this affect adhesion predictions for materials with large differences in deltaD vs deltaP or deltaH?
  - A multilayer coating system shows adequate Wa at all interfaces except between the primer and basecoat. Propose two strategies to improve the weakest interface Wa without changing the topcoat or substrate.
  - Compare the composite Wa + Ra evaluation used in ink-substrate adhesion with the single-metric Ra-only evaluation. Under what circumstances might they give conflicting predictions, and which would you trust more?
  - Describe the limitations of the empirical F_peel = k * Wa correlation for PSA peel strength prediction. What additional factors influence actual peel strength that are not captured by this model?
  - For primerless adhesion design, the optimal adhesive HSP is proposed as matching the substrate HSP. Discuss why this may not always be achievable in practice and what constraints (glass transition temperature, mechanical properties, curing chemistry) must be balanced against HSP matching.


---
# Part III: 高分子科学 (Polymer Science)

## Chapter 7: Polymer Solubility and Swelling: Multi-Axis Risk Assessment via RED and Flory-Rehner Automation
**高分子の溶解性と膨潤 — RED値による多軸リスク評価とFlory-Rehner自動化**

**Level:** chapter

**Parent:** Part III: Polymer Science

**Synopsis:** This chapter covers the application of Hansen Solubility Parameters to polymer solubility and swelling phenomena. It presents a five-level RED-based risk classification for general polymer-solvent compatibility, an inverse-logic swelling classification for elastomers and rubbers (where lower RED means greater swelling), chemical resistance prediction (where higher RED indicates better resistance), environmental stress cracking (ESC) band-type risk assessment with the critical 0.7-1.3 RED danger zone, rubber compounding design combining filler dispersion and solvent swelling evaluation, and automated hydrogel equilibrium swelling prediction through HSP-to-chi-to-Flory-Rehner pipeline integration.

### Key Concepts

  - Polymer solubility prediction using RED (Relative Energy Difference) thresholds
  - Five-level risk classification for polymer-solvent compatibility: Dangerous, Warning, Caution, Hold, Safe
  - Elastomer/rubber swelling degree classification with inverse RED logic (low RED = severe swelling)
  - Swelling level thresholds: Severe (RED < 0.5), High (RED < 0.8), Moderate (RED < 1.0), Low (RED < 1.5), Negligible (RED >= 1.5)
  - Chemical resistance prediction with direct RED logic (high RED = excellent resistance)
  - Chemical resistance thresholds: NoResistance (RED < 0.5), Poor (RED < 0.8), Moderate (RED < 1.2), Good (RED < 2.0), Excellent (RED >= 2.0)
  - Environmental Stress Cracking (ESC) as a band-type phenomenon in the RED = 0.7-1.3 danger zone
  - ESC three-zone classification: Dissolution (RED < 0.7), High Risk (0.7-1.3), Safe (RED > 1.3)
  - Distinction between dissolution (RED << 1) and ESC (RED near 1) failure modes
  - Rubber compounding design: filler dispersion via chi parameter and solvent resistance screening
  - Flory-Huggins chi parameter calculation from HSP distance for crosslinked systems
  - Flory-Rehner equation for equilibrium swelling: relating chi and crosslink density to polymer volume fraction
  - Volume swelling ratio Q = 1/phiP as the primary swelling metric
  - Hydrogel equilibrium swelling automation: HSP -> chi -> Flory-Rehner pipeline
  - Filler-rubber compatibility classification based on chi: Excellent (< 0.5), Good (< 1.0), Fair (< 2.0), Poor (>= 2.0)

### Equations

  - **name**: Flory-Rehner Equation | **latex**: \ln(1 - \phi_p) + \phi_p + \chi \phi_p^2 = -V_s \nu_e \left(\phi_p^{1/3} - \frac{\phi_p}{2}\right) | **explanation**: Relates the equilibrium polymer volume fraction (phiP) in a swollen crosslinked network to the Flory...
  - **name**: Flory-Huggins Chi from HSP Distance | **latex**: \chi = \frac{V_s}{RT} \left[ 4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delt... | **explanation**: Estimates the Flory-Huggins interaction parameter from HSP distance, using the solvent molar volume ...
  - **name**: Volume Swelling Ratio | **latex**: Q = \frac{1}{\phi_p} | **explanation**: The volume swelling ratio is the reciprocal of the equilibrium polymer volume fraction. Q > 5 indica...
  - **name**: RED-Based Swelling Classification (Elastomers) | **latex**: \text{Swelling Level} = f(RED); \quad RED < 0.5 \Rightarrow \text{Severe}, \quad RED < 0.8 \Rightarr... | **explanation**: For elastomers/rubbers, lower RED means the solvent is closer in HSP space, leading to greater swell...
  - **name**: ESC Band Classification | **latex**: \text{ESC Risk} = \begin{cases} \text{Dissolution} & RED < 0.7 \\ \text{High Risk} & 0.7 \leq RED \l... | **explanation**: Environmental stress cracking occurs preferentially in a mid-range RED band where the solvent partia...
  - **name**: Chemical Resistance Classification | **latex**: \text{Resistance} = g(RED); \quad RED < 0.5 \Rightarrow \text{No Resistance}, \quad RED \geq 2.0 \Ri... | **explanation**: For chemical resistance prediction, higher RED means greater HSP distance between polymer and chemic...

**Historical Context:** The thermodynamic theory of polymer swelling was established by Paul Flory and John Rehner in 1943 with their seminal paper in the Journal of Chemical Physics (11:521), which derived the equilibrium swelling equation for crosslinked networks. The Flory-Huggins lattice theory (Flory 1941, Huggins 1941) provided the chi interaction parameter framework. Charles Hansen extended HSP theory to polymer applications throughout the 1970s-2000s, demonstrating that HSP distance could predict both dissolution and swelling behavior. Hansen's 2000 paper in Industrial & Engineering Chemistry Research (39:4422-4426) specifically addressed environmental stress cracking prediction using HSP, identifying the critical mid-range RED band where ESC risk is maximized. The connection between HSP distance and Flory-Huggins chi was formalized as chi = Vs * Ra^2 / RT, enabling automated swelling prediction pipelines. Rubber compounding applications were developed drawing on work by Kraus (1963) on filler-rubber interactions and Mark and Erman (2007) on rubberlike elasticity.

### Related Project Modules

  - swelling.ts
  - chemical-resistance.ts
  - esc-classification.ts
  - esc-pipeline.ts
  - rubber-compounding-design.ts
  - hydrogel-swelling-equilibrium.ts
  - flory-rehner.ts
  - flory-huggins.ts
  - hsp.ts
  - risk.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations

### Learning Objectives

  - Distinguish between the direct and inverse RED logic used for chemical resistance versus swelling classification, and explain the physical rationale for each
  - Apply the Flory-Rehner equation with HSP-derived chi to predict equilibrium swelling ratios of crosslinked elastomers and hydrogels
  - Classify environmental stress cracking risk using the three-zone ESC band model and explain why the mid-range RED zone (0.7-1.3) is most dangerous
  - Evaluate rubber compound formulations by combining filler dispersion compatibility (chi-based) with solvent swelling resistance screening
  - Use the automated HSP-to-chi-to-Flory-Rehner pipeline to predict hydrogel swelling behavior for given polymer-solvent-crosslink density combinations

### Practical Applications

  - Selecting elastomer seal materials (NBR, EPDM, FKM, silicone) resistant to specific industrial fluids based on swelling classification
  - Predicting chemical resistance of protective coatings and linings against process chemicals
  - Screening polymeric piping and tank materials for environmental stress cracking risk from transported chemicals
  - Designing rubber compounds with optimal filler dispersion and solvent resistance for automotive applications
  - Predicting hydrogel equilibrium swelling for drug delivery system design and controlled release applications
  - Assessing polymer degradation risk in chemical storage and transport containers
  - Selecting compatible plastic materials for medical devices exposed to sterilization chemicals and body fluids
  - Evaluating polymer safety in food contact applications against migration of solvents and additives

### Worked Examples

  - **title**: Elastomer Swelling Classification for O-Ring Material Selection | **description**: Given NBR rubber (deltaD=18.0, deltaP=8.0, deltaH=4.0, R0=7.5) and four industrial fluids (toluene, ...
  - **title**: ESC Risk Screening for HDPE Pipe Against Chemical Inventory | **description**: Screen 10 common chemicals against HDPE pipe material using the ESC band classification. Identify wh...
  - **title**: Rubber Compound Design: SBR with Carbon Black and Solvent Resistance | **description**: Evaluate an SBR rubber compound with carbon black filler (chi-based dispersion compatibility) and sc...
  - **title**: Hydrogel Swelling Equilibrium for Drug Delivery Application | **description**: Calculate the equilibrium swelling ratio of a PEG-based hydrogel in water and ethanol-water mixtures...

### Key References

  - **author**: Flory, P. J.; Rehner, J. | **year**: 1943 | **title**: Statistical Mechanics of Cross-Linked Polymer Networks II. Swelling, Journal of Chemical Physics, 11...
  - **author**: Hansen, C. M. | **year**: 2000 | **title**: Prediction of Environmental Stress Cracking in Polymers with Hansen Solubility Parameters, Industria...
  - **author**: Hansen, C. M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press (Chapters on Polymers and Sw...
  - **author**: Flory, P. J. | **year**: 1953 | **title**: Principles of Polymer Chemistry, Cornell University Press
  - **author**: Mark, J. E.; Erman, B. | **year**: 2007 | **title**: Rubberlike Elasticity: A Molecular Primer, 2nd Edition, Cambridge University Press
  - **author**: Kraus, G. | **year**: 1963 | **title**: Swelling of Filler-Reinforced Vulcanizates, Journal of Applied Polymer Science, 7, 861-871
  - **author**: Peppas, N. A.; Bures, P.; Leobandung, W.; Ichikawa, H. | **year**: 2000 | **title**: Hydrogels in Pharmaceutical Formulations, European Journal of Pharmaceutics and Biopharmaceutics, 50...
  - **author**: Van Krevelen, D. W.; Te Nijenhuis, K. | **year**: 2009 | **title**: Properties of Polymers, 4th Edition, Elsevier (Chapter 7: Cohesive Properties and Solubility)
  - **author**: Abbott, S.; Hansen, C. M.; Yamamoto, H. | **year**: 2015 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com
  - **author**: Wright, D. C. | **year**: 1996 | **title**: Environmental Stress Cracking of Plastics, RAPRA Technology Ltd

**Cross References:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch03_Temperature_Pressure_Effects, Ch04_HSP_Estimation_Methods

**Difficulty Level:** graduate

**Estimated Pages:** 45

### Figures Needed

  - **title**: Swelling Classification vs. Chemical Resistance: Inverse RED Logic | **description**: Side-by-side bar charts or threshold diagrams comparing the swelling classification (low RED = sever...
  - **title**: ESC Band Risk Diagram | **description**: Number line or zone diagram showing the three ESC risk regions along the RED axis: Dissolution zone ...
  - **title**: Flory-Rehner Swelling Equilibrium Curves | **description**: Plot of equilibrium swelling ratio Q versus Flory-Huggins chi for several crosslink densities, showi...
  - **title**: Rubber Compound Design Workflow Diagram | **description**: Flowchart showing the dual evaluation pipeline: (1) filler-rubber HSP distance -> chi -> compatibili...
  - **title**: Hansen Sphere with ESC Annular Shell | **description**: 3D HSP space visualization showing a polymer at the center with three concentric regions: inner sphe...
  - **title**: Hydrogel Swelling Pipeline Diagram | **description**: Block diagram showing the automated pipeline: HSP inputs -> Ra calculation -> chi estimation via Vs/...

### Tables Needed

  - **title**: Five-Level Swelling Classification Thresholds for Elastomers | **description**: Table showing SwellingLevel (Severe, High, Moderate, Low, Negligible), RED threshold ranges, Japanes...
  - **title**: Five-Level Chemical Resistance Classification Thresholds | **description**: Table showing ChemicalResistanceLevel (NoResistance, Poor, Moderate, Good, Excellent), RED threshold...
  - **title**: ESC Risk Classification Zones | **description**: Table with three rows (Dissolution, HighRisk, Safe) showing RED ranges, physical mechanism, risk lev...
  - **title**: Filler-Rubber Compatibility Classification | **description**: Table showing chi ranges and corresponding compatibility levels (Excellent < 0.5, Good < 1.0, Fair <...
  - **title**: Common Elastomer HSP Values and Swelling Behavior | **description**: Table listing 8-10 common elastomers (NBR, EPDM, FKM, silicone, SBR, NR, CR, IIR) with their HSP val...
  - **title**: ESC-Susceptible Polymer-Solvent Combinations | **description**: Table of known ESC-prone combinations (e.g., HDPE + detergents, PC + acetone, ABS + isopropanol) wit...

### Software Demo

  - **tab**: Swelling / Chemical Resistance / ESC Evaluation
  - **inputs**: Select a polymer material (e.g., NBR rubber or HDPE) and a set of solvents from the database. For swelling evaluation, use default thresholds (Severe < 0.5, High < 0.8, Moderate < 1.0, Low < 1.5). For ESC evaluation, use Hansen 2000 defaults (dissolutionMax = 0.7, escMax = 1.3). For rubber compounding, input rubber HSP, filler HSP, crosslink density (e.g., 1e-4 mol/cm3), and solvent list with molar volumes.
  - **expected_output**: Color-coded tables showing: (1) swelling classification for each solvent with inverse RED logic color coding, (2) chemical resistance ratings with direct RED logic, (3) ESC risk band classification highlighting the 0.7-1.3 danger zone solvents in red. For rubber compounding: filler compatibility rating and per-solvent swelling ratios Q with Flory-Rehner results. For hydrogel: equilibrium phiP and Q values at specified crosslink densities.
  - **learning_value**: Demonstrates how the same RED value is interpreted differently depending on the physical context (swelling vs. resistance vs. ESC), reinforcing the importance of domain-specific classification logic. Shows the complete HSP-to-swelling prediction pipeline from raw parameters to actionable engineering decisions.

### Review Questions

  - Explain why the swelling classification for elastomers uses inverse RED logic (low RED = high swelling) while chemical resistance uses direct RED logic (low RED = low resistance). Are these physically consistent?
  - An HDPE pipe material has R0 = 4.0. A cleaning solvent has RED = 1.1 against this polymer. Using the ESC band model, what is the risk classification? What physical mechanism makes this RED range particularly dangerous under mechanical stress?
  - A crosslinked SBR rubber (chi = 0.8 against toluene, Vs = 106.8 cm3/mol, crosslink density = 2e-4 mol/cm3) is immersed in toluene. Using the Flory-Rehner equation, estimate whether the swelling ratio Q will be above or below 3. How would doubling the crosslink density affect Q?
  - Compare the five-level swelling classification (threshold-based on RED) with the Flory-Rehner quantitative swelling prediction (based on chi and crosslink density). When would you use each approach, and what are the trade-offs in accuracy versus simplicity?
  - A rubber compound uses carbon black filler with chi = 0.45 against the rubber matrix. Classify the filler-rubber compatibility. If you switched to silica filler with chi = 1.8, how would this affect dispersion quality and what processing changes might be needed?


## Chapter 8: Polymer Blends and Recycling
**ポリマーブレンドとリサイクル**

**Level:** chapter

**Parent:** Part III: Polymer Science

**Synopsis:** This chapter covers the application of Hansen Solubility Parameters to polymer blend miscibility prediction using Flory-Huggins theory, N-by-N recycling compatibility matrices for mixed plastic waste streams, and compatibilizer selection via block copolymers. It extends to crystalline polymer dissolution temperature prediction, additive blooming and migration risk assessment, thermoset curing agent selection, and fiber dyeability prediction. The unifying theme is that HSP-based interaction parameters enable quantitative prediction of polymer-polymer, polymer-solvent, and polymer-additive compatibility.

### Key Concepts

  - Flory-Huggins lattice theory for binary polymer blend thermodynamics
  - Flory-Huggins interaction parameter (chi) estimation from HSP distance
  - Free energy of mixing for polymer blends: combinatorial entropy and enthalpic contributions
  - Spinodal and binodal phase diagrams for polymer blends
  - Critical chi parameter and critical composition for symmetric and asymmetric blends
  - N-by-N polymer recycling compatibility matrix construction from HSP distances
  - RED (Relative Energy Difference) as a miscibility screening criterion for polymer pairs
  - Block copolymer compatibilizer selection based on HSP affinity to each blend phase
  - Crystalline polymer dissolution: solubility parameter approach combined with melting point depression
  - Solvent selection for dissolving semi-crystalline polymers above and below Tm
  - Additive blooming and migration risk prediction from HSP mismatch between additive and polymer matrix
  - Thermoset curing agent selection: matching HSP for homogeneous mixing before crosslinking
  - Fiber dyeability prediction: dye-fiber HSP affinity and partition coefficient estimation
  - Temperature dependence of chi parameter and LCST/UCST behavior in polymer blends

### Equations

  - **name**: Flory-Huggins free energy of mixing | **latex**: \frac{\Delta G_{mix}}{RT} = \frac{\phi_1}{N_1} \ln \phi_1 + \frac{\phi_2}{N_2} \ln \phi_2 + \chi_{12... | **explanation**: Free energy of mixing per lattice site for a binary polymer blend, where phi_i are volume fractions,...
  - **name**: Chi parameter from HSP distance | **latex**: \chi_{12} = \frac{V_{ref}}{RT} \left[ (\delta_{D1} - \delta_{D2})^2 + 0.25(\delta_{P1} - \delta_{P2}... | **explanation**: Estimation of the Flory-Huggins interaction parameter from the HSP distance between two polymers, us...
  - **name**: Critical chi parameter for symmetric blend | **latex**: \chi_c = \frac{2}{N} \quad (\text{symmetric, } N_1 = N_2 = N) | **explanation**: Critical interaction parameter above which phase separation occurs for a symmetric polymer blend; in...
  - **name**: General critical chi parameter | **latex**: \chi_c = \frac{1}{2} \left( \frac{1}{\sqrt{N_1}} + \frac{1}{\sqrt{N_2}} \right)^2 | **explanation**: Critical chi parameter for an asymmetric blend where N1 and N2 differ; blends with chi > chi_c will ...
  - **name**: Spinodal condition | **latex**: \frac{\partial^2 \Delta G_{mix}}{\partial \phi_1^2} = \frac{1}{N_1 \phi_1} + \frac{1}{N_2 (1 - \phi_... | **explanation**: Second derivative of free energy with respect to composition defines the spinodal boundary separatin...
  - **name**: HSP distance (Ra) between two polymers | **latex**: Ra = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{H... | **explanation**: Hansen distance between two polymers in 3D HSP space with the conventional factor of 4 on the disper...
  - **name**: Melting point depression by solvent | **latex**: \frac{1}{T_m} - \frac{1}{T_m^0} = \frac{R V_u}{\Delta H_f V_1} \left[ \phi_1 - \chi_{12} \phi_1^2 \r... | **explanation**: Depression of the equilibrium melting point of a crystalline polymer in the presence of a solvent, d...
  - **name**: Additive migration driving force | **latex**: \Delta \mu_{add} \propto (Ra_{add-polymer})^2 - (Ra_{add-surface})^2 | **explanation**: The thermodynamic driving force for additive migration is related to the difference in HSP affinity ...

**Historical Context:** Flory (1942) and Huggins (1942) independently developed the lattice theory for polymer solution thermodynamics, establishing the chi interaction parameter framework that remains central to polymer blend miscibility prediction. Hansen (1967) introduced the three-component solubility parameter concept, and its application to polymer blends was developed throughout the 1970s-1990s. The connection between chi and HSP distance was formalized by several groups, notably Lindvig et al. (2002) who proposed systematic correlations. Polymer recycling compatibility matrices using HSP emerged in the 2000s as mixed plastic waste recycling became industrially important, with Brandrup's Polymer Handbook providing foundational HSP data. The use of block copolymers as compatibilizers was pioneered by Paul and Newman (1978) and Leibler (1980), with HSP-based selection criteria developed later. Crystalline polymer dissolution theory combining HSP with melting point depression follows from the Flory diluent equation (Flory, 1953). Additive migration and blooming prediction using solubility parameters was advanced by Wypych (2004) and others in the plastics additives field.

### Related Project Modules

  - polymer-blend-miscibility.ts
  - polymer-recycling-compatibility.ts
  - compatibilizer-selection.ts
  - crystalline-polymer-dissolution.ts
  - polymer-additive-migration.ts
  - thermoset-curing-agent.ts
  - fiber-dyeability.ts

### Learning Objectives

  - Derive the Flory-Huggins free energy of mixing and calculate the chi parameter from HSP distances for a given polymer pair
  - Construct an N-by-N recycling compatibility matrix for common commodity polymers and identify miscible pairs
  - Select appropriate block copolymer compatibilizers for immiscible polymer blends using HSP affinity analysis
  - Predict dissolution temperatures for semi-crystalline polymers using combined HSP and melting point depression theory
  - Assess additive blooming and migration risk from HSP mismatch between plasticizers/stabilizers and the polymer matrix

### Practical Applications

  - Screening polymer blend pairs for miscibility before melt compounding trials, reducing experimental cost
  - Designing recycling-compatible sorting protocols for mixed plastic waste using HSP compatibility matrices
  - Selecting block copolymer or graft copolymer compatibilizers to improve mechanical properties of immiscible blends
  - Choosing solvents for dissolving crystalline engineering plastics (e.g., PEEK, PPS) at optimal temperatures
  - Predicting and preventing plasticizer blooming in PVC products and food contact materials
  - Selecting epoxy and polyurethane curing agents that provide homogeneous mixing prior to crosslinking
  - Predicting dye uptake and wash fastness for textile fibers based on dye-fiber HSP affinity
  - Formulating multi-polymer alloys for automotive and electronic applications with controlled phase morphology

### Worked Examples

  - **title**: Flory-Huggins miscibility prediction for PS/PMMA blend | **description**: Calculate the chi parameter from HSP values of polystyrene (dD=18.5, dP=4.5, dH=2.9) and PMMA (dD=18...
  - **title**: N-by-N recycling compatibility matrix for 6 commodity polymers | **description**: Build a 6x6 compatibility matrix for PE, PP, PS, PET, PA6, and PVC using their HSP values. Calculate...
  - **title**: Compatibilizer selection for PP/PA6 blend | **description**: For an immiscible PP/PA6 blend, evaluate candidate compatibilizers (PP-g-MA, SEBS-g-MA, EPR-g-MA) by...
  - **title**: Plasticizer migration risk assessment for PVC food packaging | **description**: Compare HSP distances between DEHP, DINP, and TOTM plasticizers and the PVC matrix. Estimate the mig...

### Key References

  - **author**: Flory, P.J. | **year**: 1953 | **title**: Principles of Polymer Chemistry, Cornell University Press
  - **author**: Huggins, M.L. | **year**: 1942 | **title**: Some Properties of Solutions of Long-Chain Compounds, Journal of Physical Chemistry, 46(1), 151-158
  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 10: Polymer Blends
  - **author**: Lindvig, T.; Michelsen, M.L.; Kontogeorgis, G.M. | **year**: 2002 | **title**: A Flory-Huggins Model Based on the Hansen Solubility Parameters, Fluid Phase Equilibria, 203, 247-26...
  - **author**: Paul, D.R.; Newman, S. | **year**: 1978 | **title**: Polymer Blends, Volumes 1-2, Academic Press
  - **author**: Van Krevelen, D.W.; Te Nijenhuis, K. | **year**: 2009 | **title**: Properties of Polymers, 4th Edition, Chapter 7: Cohesive Properties and Solubility
  - **author**: Wypych, G. | **year**: 2004 | **title**: Handbook of Plasticizers, ChemTec Publishing
  - **author**: Brandrup, J.; Immergut, E.H.; Grulke, E.A. | **year**: 1999 | **title**: Polymer Handbook, 4th Edition, Wiley-Interscience
  - **author**: Leibler, L. | **year**: 1980 | **title**: Theory of Microphase Separation in Block Copolymers, Macromolecules, 13(6), 1602-1617
  - **author**: Zeng, W.; Du, Y.; Xue, Y.; Frisch, H.L. | **year**: 2007 | **title**: Solubility Parameters, in Physical Properties of Polymers Handbook, 2nd Edition, Springer [uncertain...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch03_Temperature_Pressure_Effects
  - Ch04_HSP_Estimation_Methods
  - Ch07_Polymer_HSP [uncertain]
  - Ch09_Coatings_and_Adhesion [uncertain]

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Flory-Huggins Phase Diagram | **description**: Free energy of mixing vs composition curves for various chi values, showing the transition from sing...
  - **title**: N-by-N Polymer Recycling Compatibility Heatmap | **description**: Color-coded matrix showing Ra or RED values for common commodity polymer pairs (PE, PP, PS, PET, PA6...
  - **title**: 3D HSP Space: Polymer Blend Partners | **description**: 3D Hansen space plot showing HSP positions of 10+ common polymers with interaction spheres, illustra...
  - **title**: Block Copolymer Compatibilizer Mechanism | **description**: Schematic showing a block copolymer at the interface between two immiscible polymer phases, with HSP...
  - **title**: Crystalline Polymer Dissolution Temperature Diagram | **description**: Plot of dissolution temperature vs HSP distance for a semi-crystalline polymer in various solvents, ...
  - **title**: Additive Migration Risk Map | **description**: 2D projection plot showing polymer matrix, various additives, and potential migration targets (food ...
  - **title**: Fiber-Dye HSP Affinity Diagram | **description**: HSP space diagram showing fiber types (cotton, polyester, nylon) and dye classes (disperse, acid, re...
  - **title**: Thermoset Curing Agent Selection Chart | **description**: Bar chart comparing HSP distances between an epoxy resin and various curing agents (amines, anhydrid...

### Tables Needed

  - **title**: HSP Values for Common Commodity and Engineering Polymers | **description**: Table of deltaD, deltaP, deltaH, and R0 values for 20+ polymers including PE, PP, PS, PVC, PET, PA6,...
  - **title**: N-by-N Recycling Compatibility Matrix | **description**: Numerical matrix of Ra and RED values for 8-10 commodity polymer pairs with miscibility classificati...
  - **title**: Block Copolymer Compatibilizer Candidates | **description**: Table listing common compatibilizers (PP-g-MA, PE-g-MA, SEBS-g-MA, SBS, etc.) with their block HSP v...
  - **title**: Crystalline Polymer Dissolution Solvents | **description**: Table of semi-crystalline polymers with Tm, recommended solvents, dissolution temperatures, and HSP ...
  - **title**: Plasticizer Migration Risk Assessment | **description**: Table comparing common plasticizers (DEHP, DINP, TOTM, DOA, ATBC) with their HSP values, Ra to PVC, ...
  - **title**: Dye-Fiber HSP Affinity Matrix | **description**: Table showing HSP values of common fiber types and dye classes with calculated Ra and predicted dyea...

### Software Demo

  - **tab**: Polymer Blend Miscibility (ポリマーブレンド相溶性) tab, Polymer Recycling Compatibility (リサイクル相溶性) tab, and Dispersant/Compatibilizer Selection (分散剤選定) tab
  - **inputs**: In the Polymer Blend Miscibility tab, select two polymers from the database (e.g., PS and PMMA) or enter custom HSP values and molecular weights. In the Recycling Compatibility tab, select multiple polymers to generate the N-by-N matrix. In the Compatibilizer Selection tab, enter the two blend components and candidate compatibilizers.
  - **expected_output**: The Blend Miscibility tab displays the calculated chi parameter, chi_c, miscibility prediction (miscible/immiscible), and a phase diagram. The Recycling Compatibility tab shows a color-coded compatibility matrix with Ra and RED values. The Compatibilizer Selection tab ranks candidates by interfacial affinity score.
  - **workflow**: 1. Open the Polymer Blend Miscibility tab and select PS and PMMA as blend components. 2. Enter molecular weights and observe the chi vs chi_c comparison and miscibility verdict. 3. Switch to Recycling Compatibility tab and select 6 commodity polymers to generate the full matrix. 4. Identify compatible pairs suitable for mixed recycling. 5. For incompatible pairs, switch to Compatibilizer Selection tab and evaluate block copolymer options.

### Review Questions

  - Explain why high molecular weight polymer blends are almost always immiscible from the Flory-Huggins perspective. How does the combinatorial entropy term scale with degree of polymerization, and what does this imply for the critical chi value?
  - Describe the procedure for constructing an N-by-N recycling compatibility matrix using HSP. What threshold criteria would you use to classify a polymer pair as 'recyclable together', and what limitations does the HSP approach have for this application?
  - A block copolymer A-b-B is proposed as a compatibilizer for an immiscible blend of polymer C and polymer D. What HSP relationships should blocks A and B satisfy relative to C and D for effective compatibilization? How does block length affect performance?
  - Explain the relationship between HSP distance and dissolution temperature for semi-crystalline polymers. Why can some solvents with small Ra still fail to dissolve a crystalline polymer at room temperature?
  - Discuss the HSP-based approach to predicting plasticizer migration in food-contact polymer packaging. What additional factors beyond HSP distance affect real-world migration rates?


---
# Part IV: 応用分野 (Application Domains)

## Chapter 9: Pharmaceutical Drug Delivery
**医薬品とドラッグデリバリー**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter applies Hansen Solubility Parameters to pharmaceutical formulation and drug delivery, covering drug solubility classification via RED, transdermal permeation enhancer selection using a three-component drug-skin-enhancer HSP system, liposome membrane permeability prediction, nanoparticle drug loading optimization, cocrystal screening for API-coformer pairs, polymorph and solvate risk assessment in the RED band 0.5-1.5, carrier excipient selection, and inhalation drug-propellant compatibility. The HSP framework provides a unified thermodynamic basis for rational formulation design, reducing the need for extensive experimental screening in each of these pharmaceutical applications.

### Key Concepts

  - Drug solubility classification using RED (Relative Energy Difference) in HSP space
  - HSP sphere construction for active pharmaceutical ingredients (APIs) from solubility data
  - Transdermal drug delivery: three-component HSP system (drug-skin-enhancer)
  - Chemical permeation enhancer (CPE) selection via HSP distance minimization to skin lipid domain
  - Liposome bilayer permeability prediction from drug-phospholipid HSP affinity
  - Nanoparticle drug loading: polymer-drug HSP matching for encapsulation efficiency optimization
  - Cocrystal screening: API-coformer HSP distance as predictor of cocrystal formation likelihood
  - Polymorph and solvate risk assessment in the RED transition zone (0.5-1.5)
  - Carrier excipient selection for solid dispersions using HSP miscibility criteria
  - Inhalation drug formulation: propellant-drug HSP compatibility for metered-dose inhalers (MDIs)
  - Biopharmaceutics Classification System (BCS) correlation with HSP solubility predictions
  - Amorphous solid dispersion (ASD) stability prediction from polymer-drug HSP distance
  - Hansen solubility sphere methodology applied to pharmaceutical solvent screening
  - Supersaturation and nucleation tendency related to solvent HSP proximity to API

### Equations

  - **name**: HSP distance (Ra) for drug-solvent pair | **latex**: Ra = \sqrt{4(\delta_{D,drug} - \delta_{D,solvent})^2 + (\delta_{P,drug} - \delta_{P,solvent})^2 + (\... | **explanation**: Hansen distance between a drug molecule and a solvent in 3D HSP space, used to predict drug solubili...
  - **name**: Relative Energy Difference (RED) for drug solubility classification | **latex**: RED = \frac{Ra}{R_0} | **explanation**: RED ratio classifying drug-solvent compatibility: RED < 1 indicates likely solubility (good solvent)...
  - **name**: Flory-Huggins interaction parameter for drug-polymer compatibility | **latex**: \chi_{drug-polymer} = \frac{V_{drug}}{RT} \left[ (\delta_{D,drug} - \delta_{D,poly})^2 + 0.25(\delta... | **explanation**: Estimation of the Flory-Huggins chi parameter for drug-polymer pairs, critical for predicting miscib...
  - **name**: Transdermal flux enhancement factor | **latex**: \ln EF \propto -(Ra_{enhancer-skin})^2 + (Ra_{drug-skin})^2 - (Ra_{drug-enhancer})^2 | **explanation**: Semi-empirical relationship linking the flux enhancement factor to HSP distances among the drug, ski...
  - **name**: Drug loading capacity in nanoparticles | **latex**: DLC \propto \exp\left(-\frac{V_{drug} \cdot (Ra_{drug-polymer})^2}{RT}\right) | **explanation**: Drug loading capacity of a polymeric nanoparticle scales inversely with the squared HSP distance bet...
  - **name**: Cocrystal formation likelihood from HSP | **latex**: \Delta HSP_{API-coformer} = \sqrt{(\delta_{D,API} - \delta_{D,cof})^2 + (\delta_{P,API} - \delta_{P,... | **explanation**: Partial solubility parameter distance between API and coformer; empirically, cocrystal formation is ...
  - **name**: Polymorph/solvate risk zone criterion | **latex**: 0.5 \leq RED_{solvent-API} \leq 1.5 | **explanation**: Solvents with RED values in the transition zone (0.5 to 1.5) relative to the API present elevated ri...

### Related Project Modules

  - drug-solubility.ts
  - transdermal-enhancer.ts
  - liposome-permeability.ts
  - nanoparticle-drug-loading.ts
  - cocrystal-screening.ts
  - polymorph-solvate-risk.ts
  - carrier-selection.ts
  - inhalation-drug-propellant.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch04_HSP_Estimation_Methods

### Learning Objectives

  - Apply the RED classification to predict drug solubility in pharmaceutical solvents and rank candidate solvents for API dissolution
  - Design a transdermal drug delivery formulation by selecting chemical permeation enhancers using three-component HSP analysis (drug-skin-enhancer)
  - Predict nanoparticle drug loading efficiency from HSP matching between the drug and carrier polymer, and optimize encapsulation
  - Screen API-coformer pairs for cocrystal formation potential using HSP distance criteria and identify promising candidates
  - Assess polymorph and solvate risk during crystallization by identifying solvents in the RED transition zone (0.5-1.5)

### Practical Applications

  - Pharmaceutical solvent screening for drug purification and crystallization using HSP-based RED classification
  - Selection of chemical permeation enhancers for transdermal drug delivery patches
  - Formulation of polymeric nanoparticles with maximized drug loading through HSP-guided polymer selection
  - Cocrystal engineering to improve aqueous solubility and bioavailability of poorly soluble BCS Class II drugs
  - Polymorph risk assessment during process development to avoid undesired crystal form changes
  - Carrier and excipient selection for amorphous solid dispersions (ASDs) with long-term stability
  - Propellant compatibility screening for metered-dose inhaler (MDI) formulations
  - Liposome formulation optimization for encapsulation of hydrophobic and amphiphilic drugs

### Worked Examples

  - **title**: Drug solubility screening for ibuprofen in 20 common solvents | **description**: Determine the HSP sphere of ibuprofen (dD=17.4, dP=4.0, dH=9.6, R0=10.2) from experimental solubilit...
  - **title**: Transdermal enhancer selection for caffeine delivery | **description**: Using HSP values for caffeine (drug), stratum corneum lipid domain (skin), and five candidate enhanc...
  - **title**: Cocrystal screening for carbamazepine | **description**: Calculate HSP distances between carbamazepine (API) and 10 candidate coformers (saccharin, nicotinam...
  - **title**: Polymorph risk assessment for paracetamol crystallization | **description**: Compute RED values for paracetamol in 15 crystallization solvents. Identify solvents in the RED 0.5-...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 18: Biological Mate...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2008 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition [uncertain]
  - **author**: Greenhalgh, D.J.; Williams, A.C.; Timmins, P.; York, P. | **year**: 1999 | **title**: Solubility Parameters as Predictors of Miscibility in Solid Dispersions, Journal of Pharmaceutical S...
  - **author**: Mohammad, M.A.; Alhalaweh, A.; Velaga, S.P. | **year**: 2011 | **title**: Hansen Solubility Parameter as a Tool to Predict Cocrystal Formation, International Journal of Pharm...
  - **author**: Hancock, B.C.; York, P.; Rowe, R.C. | **year**: 1997 | **title**: The Use of Solubility Parameters in Pharmaceutical Dosage Form Design, International Journal of Phar...
  - **author**: Letchford, K.; Burt, H. | **year**: 2007 | **title**: A Review of the Formation and Classification of Amphiphilic Block Copolymer Nanoparticulate Structur...
  - **author**: Threlfall, T.L. | **year**: 2000 | **title**: Analysis of Organic Polymorphs: A Review, Analyst, 125, 1369-1382 [uncertain]
  - **author**: Bernstein, J. | **year**: 2002 | **title**: Polymorphism in Molecular Crystals, Oxford University Press
  - **author**: Duong, A.D.; Sharma, S.; Peine, K.J.; et al. | **year**: 2015 | **title**: Nanoparticle Drug Loading via Hansen Solubility Parameters: Prediction and Optimization [uncertain]
  - **author**: Forster, A.; Hempenstall, J.; Tucker, I.; Rades, T. | **year**: 2001 | **title**: Selection of Excipients for Melt Extrusion with Two Poorly Water-Soluble Drugs by Solubility Paramet...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch03_Temperature_Pressure_Effects
  - Ch04_HSP_Estimation_Methods
  - Ch07_Polymer_Solubility_Swelling
  - Ch08_Polymer_Blends_Recycling

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Drug Solubility Sphere in HSP Space | **description**: 3D Hansen space plot showing the solubility sphere of a model drug (e.g., ibuprofen) with good solve...
  - **title**: Three-Component Transdermal HSP Diagram | **description**: 3D HSP plot showing the drug, skin lipid domain, and multiple candidate permeation enhancers, with a...
  - **title**: Nanoparticle Drug Loading vs HSP Distance | **description**: Scatter plot of experimental drug loading capacity (%) versus Ra between drug and carrier polymer fo...
  - **title**: Cocrystal Formation Map in HSP Space | **description**: 2D projection of HSP space showing an API at the center with coformers plotted by HSP distance; succ...
  - **title**: Polymorph/Solvate Risk Zone Diagram | **description**: Radial diagram centered on an API showing concentric RED zones (0-0.5 dissolution zone, 0.5-1.5 risk...
  - **title**: Amorphous Solid Dispersion Stability Map | **description**: Plot of drug-polymer HSP distance versus physical stability (time to crystallization onset) for mult...
  - **title**: Liposome Permeability vs Drug HSP | **description**: Plot showing drug permeability through liposome bilayers as a function of drug-phospholipid HSP dist...
  - **title**: MDI Propellant-Drug Compatibility Chart | **description**: Bar chart comparing HSP distances between common inhaled drugs and propellants (HFA-134a, HFA-227ea)...

### Tables Needed

  - **title**: HSP Values for Common Active Pharmaceutical Ingredients | **description**: Table of deltaD, deltaP, deltaH, and R0 values for 15-20 common drugs including ibuprofen, paracetam...
  - **title**: RED Classification for Drug-Solvent Pairs | **description**: Matrix of RED values for 5 model drugs against 15 pharmaceutical solvents with solubility classifica...
  - **title**: Chemical Permeation Enhancer HSP Values | **description**: Table listing CPEs (oleic acid, DMSO, Azone, terpenes, fatty acids, propylene glycol, etc.) with HSP...
  - **title**: Cocrystal Formation: HSP Distance vs Experimental Outcome | **description**: Table comparing computed API-coformer HSP distances with experimental cocrystal screening results (y...
  - **title**: Polymer Carriers for Nanoparticle Drug Loading | **description**: Table of common pharmaceutical polymers (PLGA, PLA, PCL, PEG-PLA, chitosan) with HSP values, and dru...
  - **title**: Polymorph/Solvate Risk Classification by Solvent RED | **description**: Table mapping crystallization solvents to RED values for a model API, with observed crystal forms an...
  - **title**: Propellant HSP Values and Drug Compatibility | **description**: Table of HFA propellants and legacy CFC propellants with HSP values, and compatibility ratings for c...

### Software Demo

  - **tab**: Drug Solubility (薬物溶解性) tab, Dispersant Selection (分散剤選定) tab for transdermal enhancer mode, and Cocrystal Screening (共結晶スクリーニング) tab
  - **inputs**: In the Drug Solubility tab, enter HSP values for a target drug (e.g., ibuprofen: dD=17.4, dP=4.0, dH=9.6) and R0. In the Dispersant Selection tab, enter the three-component system: drug HSP, skin HSP (dD=16.0, dP=3.5, dH=6.0), and candidate enhancer HSPs. In the Cocrystal Screening tab, enter the API HSP and a list of candidate coformer HSP values.
  - **expected_output**: The Drug Solubility tab displays RED values for each solvent, ranked from best to worst, with color-coded classification. The Dispersant Selection tab ranks enhancers by predicted transdermal enhancement. The Cocrystal Screening tab shows API-coformer HSP distances with cocrystal formation likelihood scores.
  - **workflow**: 1. Open the Drug Solubility tab and enter ibuprofen HSP values. 2. Review the ranked solvent list and verify against known solubility data. 3. Switch to the Dispersant Selection tab and configure a transdermal system with caffeine as drug and stratum corneum as target. 4. Evaluate enhancer candidates and select the top-ranked option. 5. Open the Cocrystal Screening tab and enter carbamazepine with 10 coformer candidates to identify promising cocrystal pairs.

### Review Questions

  - Explain how the RED classification system is applied to predict drug solubility in pharmaceutical solvents. What are the limitations of using a single sphere to represent drug solubility behavior, especially for drugs with multiple functional groups?
  - Describe the three-component HSP framework for transdermal permeation enhancer selection. How does the enhancer modify the HSP distance between the drug and the skin lipid barrier, and what practical considerations beyond HSP affect transdermal delivery?
  - Why does the RED zone of 0.5-1.5 present elevated polymorph and solvate risk during crystallization? Propose a crystallization development strategy that uses HSP analysis to minimize the risk of undesired crystal forms.
  - Compare the HSP-based approach to cocrystal screening with other computational methods (e.g., COSMO-RS, molecular complementarity). What are the advantages and limitations of using HSP distances to predict API-coformer cocrystal formation?
  - Discuss how HSP matching between drug and polymer carrier influences nanoparticle drug loading efficiency and release kinetics. What role does the chi parameter play in predicting long-term stability of drug-loaded nanoparticles?


## Chapter 10: Biopharmaceuticals and Excipients
**バイオ医薬品と賦形剤**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter applies Hansen Solubility Parameters to biopharmaceutical formulation challenges, including protein aggregation risk assessment in buffer systems, biologic formulation buffer stability with associating liquid corrections, excipient-API compatibility screening, and residual solvent risk prediction using inverse RED logic. It also covers solubility estimation via the Greenhalgh-Williams approach combining RED with logP, and integration of GHS safety classification data into formulation decision-making. The unifying theme is that HSP-based methods provide rapid, quantitative screening tools for the complex compatibility and safety requirements of biopharmaceutical development.

### Key Concepts

  - Protein aggregation risk assessment using HSP distance between buffer components and protein surface patches
  - Preferential exclusion and preferential interaction of co-solutes with protein surfaces interpreted through HSP framework
  - Associating liquid correction for hydrogen-bonding buffer components (water, polyols, sugars)
  - Biologic formulation buffer stability: HSP matching between API, buffer, and excipient components
  - Excipient-API compatibility screening via RED number threshold criteria
  - HSP sphere approach for mapping excipient compatibility space around a biologic API
  - Residual solvent risk prediction using inverse RED logic (RED < 1 indicates retention risk)
  - ICH Q3C residual solvent classification integrated with HSP-based retention prediction
  - Greenhalgh-Williams solubility estimation combining RED with logP for drug-excipient systems
  - GHS safety classification integration for solvent and excipient hazard screening
  - Lyophilization excipient selection: cryoprotectant and lyoprotectant HSP matching
  - Surfactant-protein interaction prediction via HSP distance to hydrophobic protein patches
  - Osmolality and tonicity agent selection guided by HSP compatibility constraints
  - Temperature-dependent HSP shifts in aqueous buffer systems and impact on protein stability

### Equations

  - **name**: Protein aggregation risk score | **latex**: S_{agg} = \sum_i w_i \cdot \exp\left(-\frac{Ra_i^2}{2\sigma^2}\right) | **explanation**: Aggregation risk score computed as a weighted sum over buffer components i, where Ra_i is the HSP di...
  - **name**: Associating liquid correction for deltaH | **latex**: \delta_{H,eff} = \delta_H \cdot \left(\frac{K_{assoc}}{1 + K_{assoc} \cdot c}\right)^{1/2} | **explanation**: Effective hydrogen bonding parameter corrected for self-association in hydrogen-bonding liquids (wat...
  - **name**: Excipient-API compatibility RED | **latex**: RED = \frac{Ra}{R_0} = \frac{\sqrt{4(\delta_{D,exc} - \delta_{D,API})^2 + (\delta_{P,exc} - \delta_{... | **explanation**: Relative Energy Difference between excipient and API; RED < 1 indicates good compatibility (excipien...
  - **name**: Residual solvent retention risk (inverse RED) | **latex**: Risk_{retention} \propto \frac{1}{RED_{solvent-matrix}} = \frac{R_0}{Ra_{solvent-matrix}} | **explanation**: Inverse RED logic for residual solvent prediction: solvents with RED < 1 relative to the polymer or ...
  - **name**: Greenhalgh-Williams solubility criterion | **latex**: \Delta \delta_t < 7 \text{ MPa}^{1/2} \Rightarrow \text{likely miscible}; \quad \Delta \delta_t > 10... | **explanation**: Empirical rule by Greenhalgh et al. (1999) relating total solubility parameter difference to drug-ex...
  - **name**: Combined RED-logP solubility estimation | **latex**: \log S = a \cdot RED + b \cdot \log P + c | **explanation**: Linear regression model combining HSP-based RED with octanol-water partition coefficient (logP) to e...
  - **name**: Buffer HSP with temperature correction | **latex**: \delta_{i,buffer}(T) = \delta_{i,buffer}(T_{ref}) + \frac{d\delta_i}{dT}(T - T_{ref}) | **explanation**: Linear temperature correction for buffer HSP components, critical for predicting stability during st...

**Historical Context:** The application of solubility parameters to pharmaceutical systems was pioneered by Hancock et al. (1997) and Greenhalgh et al. (1999), who established empirical criteria for drug-excipient miscibility based on total solubility parameter differences. Hansen's three-component framework was extended to biopharmaceuticals beginning in the 2000s, as the biologic drug market grew rapidly. Protein aggregation prediction using HSP concepts was explored by Lai et al. (2014) and others who mapped hydrophobic surface patches of proteins in HSP space. The associating liquid correction, essential for aqueous buffer systems, builds on Panayiotou and Stefanis (2012) and earlier work by Hoy (1970) and Karger et al. (1976) on hydrogen bonding contributions. The ICH Q3C guideline (1997, revised 2019) established residual solvent limits that motivate HSP-based retention prediction. Abbott and Hansen (2008) demonstrated HSP approaches for excipient compatibility, while Thakral and Bhatt (2020) reviewed modern applications of HSP in pharmaceutical cocrystal and formulation design. GHS safety integration reflects the broader trend of combining hazard and compatibility data in green chemistry and pharmaceutical quality-by-design (QbD) frameworks.

### Related Project Modules

  - protein-aggregation-risk.ts
  - biologic-formulation-buffer.ts
  - excipient-compatibility.ts
  - residual-solvent-prediction.ts
  - solubility-estimation.ts
  - ghs-safety.ts
  - associating-liquid-correction.ts
  - drug-solubility.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch03_Temperature_Pressure_Effects, Ch04_HSP_Estimation_Methods, Ch07_Polymer_Solubility_Swelling

### Learning Objectives

  - Assess protein aggregation risk in a given buffer system by computing HSP distances between buffer components and protein hydrophobic surface patches
  - Apply associating liquid corrections to hydrogen-bonding buffer components (water, glycerol, sucrose) and evaluate their impact on formulation stability predictions
  - Screen excipient-API compatibility for a biologic formulation using RED criteria and construct an excipient compatibility map in HSP space
  - Predict residual solvent retention risk using inverse RED logic and cross-reference with ICH Q3C classification limits
  - Estimate drug-excipient solubility using the Greenhalgh-Williams criterion combined with logP data, and integrate GHS safety classifications into formulation decisions

### Practical Applications

  - Screening buffer compositions (phosphate, citrate, histidine) for monoclonal antibody formulations to minimize aggregation during storage
  - Selecting cryoprotectants and lyoprotectants (trehalose, sucrose, mannitol) for lyophilized biologic products using HSP compatibility mapping
  - Evaluating surfactant candidates (polysorbate 20/80, poloxamer 188) for protein stabilization based on HSP affinity to hydrophobic patches
  - Predicting residual solvent levels in spray-dried pharmaceutical powders and ensuring ICH Q3C compliance
  - Rapid screening of excipient compatibility for solid dispersion and co-processed excipient development
  - Assessing solubility of poorly soluble drug candidates in aqueous excipient matrices using combined RED-logP models
  - Integrating GHS hazard data with HSP compatibility scores for green and safe formulation design
  - Optimizing reconstitution buffer composition for lyophilized antibody-drug conjugates (ADCs)

### Worked Examples

  - **title**: Aggregation risk assessment for mAb in histidine-sucrose buffer | **description**: Calculate HSP values for histidine buffer (pH 6.0), sucrose, and polysorbate 80 components. Map the ...
  - **title**: Residual solvent prediction for spray-dried amorphous solid dispersion | **description**: For a PVP-VA/drug solid dispersion prepared from dichloromethane-methanol (80:20), calculate the RED...
  - **title**: Excipient compatibility screening for biologic eye drop formulation | **description**: Screen 8 common ophthalmic excipients (sodium hyaluronate, hydroxypropyl methylcellulose, poloxamer ...
  - **title**: Greenhalgh-Williams solubility estimation with GHS safety integration | **description**: For a BCS Class II drug candidate, estimate miscibility with five excipient candidates (PVP, HPMC-AS...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Greenhalgh, D.J.; Williams, A.C.; Timmins, P.; York, P. | **year**: 1999 | **title**: Solubility Parameters as Predictors of Miscibility in Solid Dispersions, Journal of Pharmaceutical S...
  - **author**: Hancock, B.C.; York, P.; Rowe, R.C. | **year**: 1997 | **title**: The Use of Solubility Parameters in Pharmaceutical Dosage Form Design, International Journal of Phar...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2008 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition [uncertain]
  - **author**: Thakral, N.K.; Bhatt, H. | **year**: 2020 | **title**: Hansen Solubility Parameters: A Tool for Solvent Selection for Pharmaceutical Applications [uncertai...
  - **author**: Panayiotou, C.; Stefanis, E. | **year**: 2012 | **title**: Hansen Solubility Parameters Revisited: A Quantitative Structure-Property Relationship, Internationa...
  - **author**: ICH | **year**: 2019 | **title**: Q3C(R8) Impurities: Guideline for Residual Solvents, International Council for Harmonisation
  - **author**: Lai, M.C.; Topp, E.M. | **year**: 2014 | **title**: Solid-State Chemical Stability of Proteins and Peptides, Journal of Pharmaceutical Sciences, 88(5), ...
  - **author**: Ohtake, S.; Kita, Y.; Arakawa, T. | **year**: 2011 | **title**: Interactions of Formulation Excipients with Proteins in Solution and in the Dried State, Advanced Dr...
  - **author**: Stefanis, E.; Panayiotou, C. | **year**: 2008 | **title**: Prediction of Hansen Solubility Parameters with a New Group-Contribution Method, International Journ...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch03_Temperature_Pressure_Effects
  - Ch04_HSP_Estimation_Methods
  - Ch07_Polymer_Solubility_Swelling
  - Ch09_Pharmaceutical_Cocrystals [uncertain]
  - Ch11_Green_Chemistry_Safety [uncertain]

**Difficulty Level:** advanced_research

### Figures Needed

  - **title**: Protein Surface Hydrophobic Patch Mapping in HSP Space | **description**: 3D HSP space plot showing the HSP coordinates of exposed hydrophobic patches on a model protein surf...
  - **title**: Associating Liquid Correction Effect on deltaH | **description**: Plot comparing uncorrected vs corrected hydrogen bonding parameter values for common buffer componen...
  - **title**: Excipient Compatibility Map for Biologic API | **description**: 2D projection (dP vs dH) of the HSP interaction sphere of a model biologic API with excipient candid...
  - **title**: Residual Solvent Retention Risk Diagram | **description**: Bar chart of inverse RED values for common pharmaceutical solvents (DCM, methanol, ethanol, acetone,...
  - **title**: Greenhalgh-Williams Miscibility Diagram | **description**: Scatter plot of total solubility parameter difference (delta-delta_t) vs experimentally observed mis...
  - **title**: GHS Hazard-Compatibility Decision Matrix | **description**: 2D decision matrix with HSP compatibility (RED) on x-axis and GHS hazard score on y-axis, with quadr...
  - **title**: Buffer Stability Window in HSP Space | **description**: 3D HSP plot showing how buffer composition shifts with pH and temperature, with the protein stabilit...
  - **title**: Lyophilization Excipient Selection Flowchart | **description**: Decision flowchart combining HSP compatibility screening, glass transition temperature (Tg') require...

### Tables Needed

  - **title**: HSP Values for Common Biopharmaceutical Buffer Components | **description**: Table of deltaD, deltaP, deltaH values for histidine, phosphate, citrate, acetate, Tris buffers and ...
  - **title**: Protein Aggregation Risk Scores for Model Buffer Systems | **description**: Table comparing aggregation risk scores for 6-8 buffer formulations against 3 model proteins (IgG1, ...
  - **title**: Residual Solvent HSP Data and ICH Q3C Classification | **description**: Table of HSP values, ICH Q3C class (1/2/3), and permitted daily exposure limits for 20+ solvents com...
  - **title**: Excipient-API Compatibility RED Matrix | **description**: Matrix of RED values between 10 common excipients and 5 representative biologic API types, with comp...
  - **title**: Greenhalgh-Williams Solubility Prediction Validation | **description**: Table of drug-excipient pairs with predicted and experimental miscibility outcomes, including delta-...
  - **title**: GHS Safety Classification for Pharmaceutical Solvents | **description**: Table listing GHS hazard categories (H-statements), signal words, and pictograms for 15+ pharmaceuti...

### Software Demo

  - **tab**: Protein Aggregation Risk, Biologic Formulation Buffer, Excipient Compatibility, Residual Solvent Prediction, Solubility Estimation, and GHS Safety tabs
  - **inputs**: In the Protein Aggregation Risk tab, enter protein surface HSP estimates and select buffer components from the database. In the Excipient Compatibility tab, enter biologic API HSP values and select candidate excipients. In the Residual Solvent Prediction tab, select the excipient matrix and processing solvents. In the Solubility Estimation tab, enter drug and excipient HSP values with logP. In the GHS Safety tab, select solvents to view integrated hazard and compatibility data.
  - **expected_output**: The Protein Aggregation Risk tab displays an aggregation risk score and ranking of buffer components by their proximity to protein hydrophobic patches. The Biologic Formulation Buffer tab shows corrected HSP values accounting for associating liquid effects and buffer stability assessment. The Excipient Compatibility tab produces a RED-based compatibility matrix and 2D projection map. The Residual Solvent tab shows inverse RED values, retention risk ranking, and ICH Q3C compliance status. The Solubility Estimation tab provides predicted miscibility based on Greenhalgh criterion and RED-logP model. The GHS Safety tab overlays hazard pictograms and signal words on HSP compatibility rankings.
  - **workflow**: 1. Open the Protein Aggregation Risk tab and enter model IgG1 surface HSP values. 2. Select histidine buffer with sucrose and polysorbate 80 as formulation components. 3. Review aggregation risk scores and identify problematic components. 4. Switch to Biologic Formulation Buffer tab to check buffer stability with associating liquid corrections. 5. Open Excipient Compatibility tab and screen 10 candidate excipients against the API. 6. In Residual Solvent Prediction tab, evaluate DCM, methanol, and ethanol retention risk in PVP-VA matrix. 7. Use Solubility Estimation tab to verify drug-excipient miscibility predictions. 8. Check GHS Safety tab to ensure selected solvents meet safety requirements.

### Review Questions

  - Explain why associating liquid corrections are essential when applying HSP to aqueous biopharmaceutical buffer systems. How does hydrogen bond self-association in water and polyol excipients affect the effective deltaH parameter, and what errors arise if this correction is neglected?
  - Describe the inverse RED logic used for residual solvent risk prediction. Why does a solvent with RED < 1 relative to an excipient matrix pose a greater retention risk than one with RED > 1? How should ICH Q3C classification be integrated with HSP-based predictions?
  - Compare the Greenhalgh-Williams solubility parameter difference criterion with the full 3D HSP RED approach for predicting drug-excipient miscibility. Under what circumstances does the simpler one-parameter criterion fail, and how does adding logP improve predictions for biopharmaceutical systems?
  - A formulation scientist must select between three surfactants (polysorbate 20, polysorbate 80, poloxamer 188) for stabilizing a monoclonal antibody against aggregation. Outline the HSP-based approach for ranking these surfactants and discuss what additional factors beyond HSP distance influence protein stabilization.
  - Discuss how GHS safety classification data can be integrated with HSP compatibility screening to develop a multi-criteria decision framework for solvent and excipient selection in biopharmaceutical manufacturing. What trade-offs might arise between compatibility and safety?


## Chapter 11: Nanomaterials Dispersion Science
**ナノ材料の分散科学**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter applies Hansen Solubility Parameters to the dispersion science of nanomaterials, covering RED-based screening for nanoparticle dispersion stability, solvent selection for carbon nanotubes, graphene, MXenes (Ti3C2Tx), and quantum dot ligand exchange. It introduces the Dual-HSP framework for dispersant evaluation, where anchor HSP describes the dispersant headgroup affinity to the particle surface and solvation HSP describes tail compatibility with the continuous phase. Pigment dispersion stability prediction completes the chapter, bridging fundamental HSP theory with industrial nanomaterial formulation.

### Key Concepts

  - RED (Relative Energy Difference) screening for nanoparticle dispersion stability
  - Hansen solubility sphere determination for nanoparticles via solvent screening tests
  - CNT dispersion solvent selection using HSP matching to nanotube surface energy
  - Graphene exfoliation and stabilization in matched-HSP solvents (NMP, DMF, CHP)
  - Surface energy decomposition of 2D materials into dispersion, polar, and hydrogen bonding components
  - MXene (Ti3C2Tx) dispersion in aqueous and DMSO systems via surface termination-HSP matching
  - Quantum dot ligand exchange: solvent selection for colloidal stability during ligand swap
  - Dual-HSP dispersant model: anchor HSP (headgroup-particle affinity) and solvation HSP (tail-medium compatibility)
  - Pigment dispersion stability prediction using HSP distance between pigment surface and vehicle
  - Flocculation onset prediction from RED threshold in pigment/nanomaterial dispersions
  - Hamaker constant correlation with dispersion component (deltaD) for van der Waals attraction estimation
  - Steric vs electrostatic stabilization mechanisms and their HSP-based optimization
  - Hansen solubility sphere construction from binary good/bad solvent classification for nanoparticles
  - Solvent blending strategies to achieve target HSP for optimal nanomaterial dispersion

### Equations

  - **name**: Hansen distance (Ra) | **latex**: Ra = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{H... | **explanation**: Distance between a nanomaterial surface and a solvent in Hansen space; solvents with Ra < R0 are pre...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{Ra}{R_0} | **explanation**: Ratio of Hansen distance to the interaction radius; RED < 1 indicates good dispersion, RED > 1 indic...
  - **name**: Surface energy from HSP (Beerbower correlation) | **latex**: \gamma = 0.0715 V_m^{1/3} \delta^2 | **explanation**: Relates total surface energy to solubility parameter and molar volume; used to connect nanoparticle ...
  - **name**: Dispersive surface energy component | **latex**: \gamma_D = 0.0715 V_m^{1/3} \delta_D^2 | **explanation**: The London dispersion contribution to surface energy, critical for estimating van der Waals interact...
  - **name**: Hamaker constant from surface energy | **latex**: A_{11} = 24 \pi D_0^2 \gamma_D | **explanation**: Relates the Hamaker constant for van der Waals attraction to the dispersive surface energy, where D0...
  - **name**: Dual-HSP dispersant effectiveness criterion | **latex**: \text{Score} = w_a \cdot (1 - RED_{anchor}) + w_s \cdot (1 - RED_{solvation}) | **explanation**: Dispersant selection score combining anchor HSP affinity (headgroup to particle surface) and solvati...
  - **name**: Enthalpy of mixing for nanoparticle dispersion | **latex**: \Delta H_{mix} \approx \frac{2}{d_{particle}} (\delta_{particle} - \delta_{solvent})^2 \phi (1 - \ph... | **explanation**: Enthalpy of mixing per unit volume for nanoparticle dispersion where d_particle is the particle diam...
  - **name**: Optimum HSP for graphene dispersion | **latex**: \delta_D \approx 18.0,\; \delta_P \approx 9.3,\; \delta_H \approx 7.7 \;\text{MPa}^{1/2} | **explanation**: Experimentally determined center of the Hansen solubility sphere for graphene, from which solvent sc...

**Historical Context:** The application of HSP to nanomaterial dispersion began in earnest in the mid-2000s. Hernandez et al. (2008) and Coleman and co-workers at Trinity College Dublin pioneered HSP-based solvent selection for carbon nanotube and graphene exfoliation, demonstrating that stable dispersions form when solvent HSP matches the surface energy components of the nanomaterial. Bergin et al. (2009) mapped the Hansen solubility sphere for single-walled CNTs and graphene. The concept was extended to MXenes by Maleski et al. (2019) who showed that Ti3C2Tx surface terminations (OH, F, O) dictate the HSP coordinates and explain the effectiveness of water and DMSO. Quantum dot ligand exchange solvent selection using HSP was developed by Greaney et al. (2015) and others working on perovskite and chalcogenide nanocrystals. The Dual-HSP dispersant model, distinguishing anchor HSP (headgroup affinity to particle surface) and solvation HSP (tail compatibility with medium), was formalized by Abbott and Hansen (2008, HSPiP software documentation) building on earlier pigment dispersion work by Vanderhoff and El-Aasser. Hansen himself contributed extensively to pigment dispersion science throughout his career, and the 2007 second edition of his handbook devotes significant sections to nanoparticle and pigment dispersions.

**Related Project Modules:** cnt-graphene-dispersion.ts, mxene-dispersion.ts, quantum-dot-ligand-exchange.ts, dispersant-selection.ts, pigment-dispersion-stability.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch04_HSP_Estimation_Methods, Ch05_Contact_Angle_Wettability

### Learning Objectives

  - Construct a Hansen solubility sphere for a nanomaterial from binary solvent screening data and use RED to predict dispersion quality in untested solvents
  - Select optimal solvents and solvent blends for dispersing CNTs, graphene, and MXenes based on HSP matching criteria
  - Apply the Dual-HSP dispersant model to evaluate and rank dispersant candidates by their anchor and solvation HSP affinity scores
  - Design a quantum dot ligand exchange protocol by selecting intermediate and final solvents that maintain colloidal stability during the swap
  - Predict pigment dispersion stability and flocculation risk using RED values and correlate with industrial dispersion quality metrics

### Practical Applications

  - Solvent selection for scalable liquid-phase exfoliation of graphene and other 2D materials
  - CNT ink formulation for printed electronics, selecting solvents and co-solvents that maximize nanotube debundling
  - MXene dispersion optimization for electromagnetic interference shielding coatings and energy storage electrodes
  - Quantum dot ligand exchange solvent design for photovoltaic and LED applications
  - Dispersant screening for industrial pigment concentrates in paints, inks, and coatings
  - Nanoparticle dispersion quality control using HSP-based RED screening to replace costly trial-and-error
  - Formulation of nanocomposite masterbatches with optimized filler dispersion using HSP-matched carrier resins
  - Stability prediction for agrochemical and pharmaceutical nanoparticle suspensions

### Worked Examples

  - **title**: Hansen solubility sphere for graphene from solvent screening | **description**: Given dispersion stability data (good/bad classification) for graphene in 30 solvents, fit the HSP s...
  - **title**: Optimal solvent blend for CNT dispersion | **description**: Starting from the known CNT HSP sphere (center: deltaD=17.8, deltaP=7.5, deltaH=7.6 MPa^1/2, R0=4.5)...
  - **title**: Dual-HSP dispersant ranking for TiO2 nanoparticles in toluene | **description**: Evaluate five dispersant candidates (polyester-polyamine, fatty acid ethoxylate, polyurethane-acryla...
  - **title**: MXene Ti3C2Tx dispersion: water vs DMSO comparison | **description**: Calculate Ra between Ti3C2Tx surface HSP (deltaD=16.2, deltaP=14.2, deltaH=18.0 MPa^1/2) and water, ...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Hernandez, Y.; Nicolosi, V.; Lotya, M.; et al. | **year**: 2008 | **title**: High-yield production of graphene by liquid-phase exfoliation of graphite, Nature Nanotechnology, 3(...
  - **author**: Bergin, S.D.; Nicolosi, V.; Streich, P.V.; et al. | **year**: 2009 | **title**: Towards Solutions of Single-Walled Carbon Nanotubes in Common Solvents, Advanced Materials, 20(10), ...
  - **author**: Coleman, J.N. | **year**: 2013 | **title**: Liquid Exfoliation of Defect-Free Graphene, Accounts of Chemical Research, 46(1), 14-22
  - **author**: Maleski, K.; Mochalin, V.N.; Gogotsi, Y. | **year**: 2017 | **title**: Dispersions of Two-Dimensional Titanium Carbide MXene in Organic Solvents, Chemistry of Materials, 2...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2008 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 1st Edition, self-published [uncertain]
  - **author**: Süß, S.; Sobisch, T.; Peukert, W.; Lerche, D.; Segets, D. | **year**: 2018 | **title**: Determination of Hansen Parameters for Particles: A Standardized Routine Based on Analytical Centrif...
  - **author**: Luo, M.; Zhao, Y.; Zhang, M.; et al. | **year**: 2020 | **title**: Two-Dimensional Material-Based MXene Dispersions: Processing, Properties, and Applications [uncertai...
  - **author**: Greaney, M.J.; Brutchey, R.L. | **year**: 2015 | **title**: Ligand Engineering in Hybrid Polymer:Nanocrystal Solar Cells, Materials Today, 18(1), 31-38 [uncerta...
  - **author**: Beerbower, A. | **year**: 1971 | **title**: Surface Free Energy: A New Relationship to Bulk Energies, Journal of Colloid and Interface Science, ...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch04_HSP_Estimation_Methods
  - Ch05_Contact_Angle_Wettability
  - Ch06_Adhesion_Engineering
  - Ch07_Polymer_Solubility_Swelling
  - Ch10_Coatings_Inks [uncertain]

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Hansen Solubility Sphere for Graphene | **description**: 3D HSP space showing the fitted solubility sphere for graphene with good solvents (NMP, DMF, CHP, GB...
  - **title**: RED Screening Map for CNT Dispersion | **description**: Bar chart or 2D projection showing RED values for 20+ solvents tested against the CNT solubility sph...
  - **title**: MXene Ti3C2Tx Surface Termination and HSP | **description**: Schematic of Ti3C2Tx surface with OH, F, and O terminations, alongside a HSP space diagram showing h...
  - **title**: Dual-HSP Dispersant Model Schematic | **description**: Diagram of a dispersant molecule adsorbed on a nanoparticle surface, with the headgroup (anchor) reg...
  - **title**: Quantum Dot Ligand Exchange Solvent Path | **description**: HSP space trajectory showing the colloidal stability window during ligand exchange: original ligand ...
  - **title**: Pigment Dispersion Stability vs RED Correlation | **description**: Scatter plot of measured dispersion stability (settling rate or turbidity) vs calculated RED for a p...
  - **title**: Solvent Blend Optimization Map | **description**: Ternary or 2D contour plot showing how binary/ternary solvent blend compositions map to HSP coordina...
  - **title**: Surface Energy Decomposition for 2D Materials | **description**: Stacked bar chart comparing dispersion, polar, and hydrogen bonding components of surface energy for...

### Tables Needed

  - **title**: HSP Values for Common Nanomaterials | **description**: Table of deltaD, deltaP, deltaH, and R0 values for graphene, SWCNTs, MWCNTs, graphene oxide, reduced...
  - **title**: Solvent Ranking for Graphene/CNT Exfoliation | **description**: Table listing 20+ solvents with their HSP values, Ra to graphene, RED, measured dispersion concentra...
  - **title**: MXene Dispersion Solvent Comparison | **description**: Table comparing water, DMSO, DMF, NMP, ethanol, and isopropanol with Ra to Ti3C2Tx, RED, measured co...
  - **title**: Dual-HSP Dispersant Database | **description**: Table of common industrial dispersants (polymeric, small molecule, silane) with anchor HSP, solvatio...
  - **title**: Quantum Dot Ligand Exchange Solvent Guide | **description**: Table of ligand types (oleic acid, oleylamine, mercaptopropionic acid, halide, etc.) with HSP of lig...
  - **title**: Pigment HSP Values and Dispersion Stability Ratings | **description**: Table of common organic and inorganic pigments with HSP values, R0, and stability ratings in several...

### Software Demo

  - **tab**: Dispersant Selection (分散剤選定) tab, with related CNT/Graphene Dispersion and MXene Dispersion modules
  - **inputs**: In the Dispersant Selection tab, select a target nanomaterial (e.g., graphene or TiO2) from the database, choose an evaluation mode (simple RED screening or Dual-HSP dispersant evaluation), and enter candidate solvents or dispersants. For CNT/Graphene mode, input solvent candidates to rank. For MXene mode, select Ti3C2Tx and compare aqueous vs organic systems.
  - **expected_output**: The tool displays Ra and RED values for each solvent/dispersant candidate against the selected nanomaterial, color-coded as good (RED<1, green) or poor (RED>1, red). In Dual-HSP mode, anchor RED and solvation RED are shown separately alongside the combined dispersant effectiveness score. A ranked recommendation list is produced.
  - **workflow**: 1. Open the Dispersant Selection tab and select graphene as the target material. 2. Choose simple evaluation mode to screen 10 solvents by RED. 3. Review the ranked results table showing Ra, RED, and dispersion prediction. 4. Switch to Dual-HSP mode, enter a dispersant with separate anchor and solvation HSP values. 5. Compare dispersant candidates and identify the best option. 6. Export results as structured JSON for further analysis.

### Review Questions

  - Explain why solvents with surface tension near 40 mJ/m2 tend to produce stable graphene dispersions. How does this surface energy criterion relate to the HSP matching approach, and what additional information does the three-component HSP framework provide?
  - Describe the Dual-HSP dispersant model. Why is a single HSP value insufficient to evaluate a polymeric dispersant, and how do the anchor HSP and solvation HSP concepts separately address adsorption and steric stabilization?
  - MXene Ti3C2Tx disperses well in water and DMSO but poorly in most non-polar organic solvents. Explain this behavior using HSP theory, considering the role of surface termination groups (OH, F, O) in determining the effective particle HSP.
  - During quantum dot ligand exchange from oleic acid to mercaptopropionic acid, colloidal stability must be maintained throughout the process. Design a solvent strategy using HSP principles that keeps the nanocrystals dispersed as the surface chemistry changes.
  - Compare the RED-based screening approach for nanomaterial dispersion with the chi-parameter approach used for polymer blend miscibility (Chapter 8). What are the advantages and limitations of each method when applied to nanoparticle systems?


## Chapter 12: Coatings and Thin Films
**コーティングと薄膜**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter covers the application of Hansen Solubility Parameters to the formulation, processing, and quality control of coatings and thin films. Topics range from coating defect prediction (combining adhesion failure with Marangoni-driven flow instabilities), photoresist developer compatibility via dissolution contrast curves, organic semiconductor thin film formation by solvent engineering, and dielectric film quality screening. The chapter also addresses anti-graffiti coating design using inverse RED logic, 3D printing solvent smoothing with an optimal RED band of 0.5-1.5, encapsulant and underfill material selection, and plasticizer compatibility screening for flexible coatings.

### Key Concepts

  - Coating adhesion prediction via HSP distance between substrate and coating resin
  - Marangoni effect in coatings: surface tension gradients driven by local solvent composition differences
  - Coating defect classification: cratering, orange peel, Benard cells, and edge withdrawal linked to HSP mismatch
  - Photoresist dissolution contrast: developer-resist HSP affinity controlling dissolution rate selectivity
  - Dissolution contrast curves: log(dissolution rate) vs developer composition parameterized by HSP distance
  - Organic semiconductor thin film morphology control via solvent HSP and evaporation rate
  - Solvent additive strategy for bulk heterojunction morphology in organic photovoltaics
  - Dielectric film defect screening: pinhole and dewetting risk from substrate-film HSP incompatibility
  - Anti-graffiti coating design using inverse RED logic (graffiti material should have RED >> 1 to the coating surface)
  - 3D printing solvent smoothing: optimal RED band 0.5-1.5 for controlled surface dissolution without structural damage
  - Encapsulant and underfill selection for electronic packaging based on HSP matching to die and substrate surfaces
  - Plasticizer-polymer HSP compatibility for flexible coating and film formulations
  - Solvent blend optimization for uniform film formation using HSP-based evaporation trajectory modeling
  - Surface energy and wettability prediction from HSP components for coating leveling

### Equations

  - **name**: HSP distance (Ra) for coating-substrate adhesion | **latex**: Ra = \sqrt{4(\delta_{D,coat} - \delta_{D,sub})^2 + (\delta_{P,coat} - \delta_{P,sub})^2 + (\delta_{H... | **explanation**: Hansen distance between coating resin and substrate surface; smaller Ra indicates stronger thermodyn...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{Ra}{R_0} | **explanation**: Ratio of HSP distance to the interaction radius of the target material; RED < 1 indicates compatibil...
  - **name**: Marangoni number for coating flow | **latex**: Ma = \frac{\partial \gamma / \partial c \cdot \Delta c \cdot h}{\eta D} | **explanation**: Dimensionless number governing Marangoni convection in drying coatings, where gamma is surface tensi...
  - **name**: Surface tension gradient from HSP components | **latex**: \gamma \approx 0.0715 V_m^{1/3} \left( \delta_D^2 + 0.632 \delta_P^2 + 0.632 \delta_H^2 \right)^{0.4... | **explanation**: Empirical correlation relating surface tension to HSP components and molar volume, used to predict s...
  - **name**: Dissolution rate dependence on HSP distance (photoresist) | **latex**: \log R_{diss} = A - B \cdot Ra_{resist-developer} | **explanation**: Semi-empirical relationship where dissolution rate decreases exponentially with increasing HSP dista...
  - **name**: Dissolution contrast ratio | **latex**: C_{contrast} = \frac{R_{diss,exposed}}{R_{diss,unexposed}} = \frac{10^{A - B \cdot Ra_{exp}}}{10^{A ... | **explanation**: Ratio of dissolution rates of exposed vs unexposed photoresist regions; high contrast is essential f...
  - **name**: Anti-graffiti RED criterion (inverse logic) | **latex**: RED_{graffiti \to coating} = \frac{Ra_{graffiti-coating}}{R_{0,graffiti}} > 1 | **explanation**: For anti-graffiti effectiveness, the coating surface HSP should be far from the graffiti material HS...
  - **name**: 3D print smoothing RED band | **latex**: 0.5 \leq RED_{solvent \to polymer} \leq 1.5 | **explanation**: Optimal RED range for 3D printing solvent vapor smoothing; too low RED causes structural dissolution...
  - **name**: Plasticizer compatibility criterion | **latex**: Ra_{plast-polymer} < R_{0,polymer} \quad \Leftrightarrow \quad RED < 1 | **explanation**: A plasticizer is compatible with the polymer matrix when its HSP falls within the polymer's interact...

**Historical Context:** The application of solubility parameters to coatings dates back to Hildebrand and Hansen's original work in the 1960s-1970s, as coatings were among the first industrial fields to adopt HSP for solvent selection. Hansen himself worked extensively in the coatings industry (Scandinavian Paint and Printing Ink Research Institute), publishing foundational studies on paint formulation and adhesion in the 1960s-1970s. The Marangoni effect in coatings was described by Scriven and Sternling (1960), and its connection to solvent HSP and surface tension gradients was elaborated by Patton (1979) and Wicks et al. (1992). Photoresist dissolution in the microelectronics context was linked to solubility parameters by Ito and Willson (1983) in the context of chemically amplified resists, with dissolution contrast modeling advancing through the 1990s-2000s. Organic semiconductor film formation via solvent engineering using HSP became prominent after the mid-2000s with the rise of organic photovoltaics and OLEDs, notably through the work of Liao et al. (2013) and Machui et al. (2012) who systematically mapped solvent HSP to film morphology. Anti-graffiti coatings based on low-surface-energy fluoropolymers and silicones were developed using HSP reasoning in the 2000s. The 3D printing solvent smoothing concept with optimal RED band emerged in the 2010s with the FDM/FFF printing community.

### Related Project Modules

  - coating-defect-prediction.ts
  - photoresist-developer.ts
  - dissolution-contrast.ts
  - organic-semiconductor-film.ts
  - dielectric-film.ts
  - anti-graffiti-coating.ts
  - printing3d-smoothing.ts
  - underfill-encapsulant.ts
  - plasticizer.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch05_Contact_Angle_Wettability, Ch06_Adhesion_Engineering

### Learning Objectives

  - Predict coating defects (cratering, Benard cells, orange peel) from HSP-derived Marangoni number calculations and formulate corrective solvent blend adjustments
  - Calculate dissolution contrast curves for photoresist-developer systems using HSP distance and select developers that maximize pattern fidelity
  - Design solvent systems for organic semiconductor thin film deposition that control morphology through HSP matching and evaporation rate
  - Apply inverse RED logic to design anti-graffiti coatings and evaluate 3D printing solvent smoothing within the optimal RED 0.5-1.5 band
  - Screen encapsulant, underfill, and plasticizer candidates for coatings and electronic packaging applications using HSP compatibility criteria

### Practical Applications

  - Predicting and preventing coating defects (cratering, orange peel, Benard cells) in automotive and industrial paint formulations
  - Selecting photoresist developers with optimal dissolution contrast for semiconductor lithography and MEMS fabrication
  - Optimizing solvent systems for organic photovoltaic and OLED thin film deposition to control bulk heterojunction morphology
  - Screening dielectric film formulations for pinhole-free spin-coated or slot-die coated films in electronic device manufacturing
  - Designing anti-graffiti and easy-clean coatings for architectural, transportation, and public infrastructure surfaces
  - Selecting solvents for FDM/FFF 3D printed part surface smoothing within the controlled dissolution RED band
  - Choosing underfill and encapsulant materials for flip-chip and BGA electronic packages based on HSP compatibility with die and substrate
  - Formulating flexible coatings and films with appropriate plasticizers that resist migration and blooming

### Worked Examples

  - **title**: Coating defect diagnosis for a two-solvent automotive clearcoat | **description**: Analyze a clearcoat formulation containing a fast-evaporating solvent (butyl acetate) and a slow ret...
  - **title**: Photoresist developer selection for positive-tone resist patterning | **description**: Given HSP values for a novolac-based positive photoresist (exposed and unexposed states), calculate ...
  - **title**: Anti-graffiti coating design using inverse RED screening | **description**: Evaluate five candidate low-surface-energy coating materials (PTFE, PDMS, fluorosilicone, polyuretha...
  - **title**: 3D printing solvent vapor smoothing for ABS and PLA parts | **description**: Screen 10 common solvents (acetone, dichloromethane, ethyl acetate, THF, MEK, limonene, etc.) agains...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapters 11-12: Coatings an...
  - **author**: Wicks, Z.W.; Jones, F.N.; Pappas, S.P.; Wicks, D.A. | **year**: 2007 | **title**: Organic Coatings: Science and Technology, 3rd Edition, Wiley-Interscience
  - **author**: Patton, T.C. | **year**: 1979 | **title**: Paint Flow and Pigment Dispersion, 2nd Edition, Wiley-Interscience
  - **author**: Scriven, L.E.; Sternling, C.V. | **year**: 1960 | **title**: The Marangoni Effects, Nature, 187, 186-188
  - **author**: Machui, F.; Langner, S.; Zhu, X.; Abbott, S.; Brabec, C.J. | **year**: 2012 | **title**: Determination of the P3HT:PCBM Solubility Parameters via a Binary Solvent Gradient Method: Impact of...
  - **author**: Liao, H.-C.; Ho, C.-C.; Chang, C.-Y.; Jao, M.-H.; Darber, S.B.; Su, W.-F. | **year**: 2013 | **title**: Additives for Morphology Control in High-Efficiency Organic Solar Cells, Materials Today, 16(9), 326...
  - **author**: Ito, H.; Willson, C.G. | **year**: 1983 | **title**: Chemical Amplification in the Design of Dry Developing Resist Materials, Polymer Engineering and Sci...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2020 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com [uncertain]
  - **author**: Wypych, G. | **year**: 2004 | **title**: Handbook of Plasticizers, ChemTec Publishing
  - **author**: Satas, D. | **year**: 1999 | **title**: Coatings Technology Handbook, 2nd Edition, Marcel Dekker [uncertain]

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch05_Contact_Angle_Wettability
  - Ch06_Adhesion_Engineering
  - Ch07_Polymer_Solubility_Swelling
  - Ch08_Polymer_Blends_Recycling

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Coating Defect Map in HSP Space | **description**: 3D HSP plot showing the coating resin at the center with solvent trajectories during drying; regions...
  - **title**: Marangoni Convection Cell Formation During Coating Drying | **description**: Schematic cross-section of a drying coating film showing surface tension gradients, convection cells...
  - **title**: Photoresist Dissolution Contrast Curves | **description**: Plot of log(dissolution rate) vs HSP distance for exposed and unexposed photoresist in various devel...
  - **title**: Organic Semiconductor Solvent Selection Map | **description**: 2D HSP projection showing the solubility sphere of P3HT:PCBM blend with solvents and solvent additiv...
  - **title**: Anti-Graffiti Inverse RED Diagram | **description**: HSP space diagram showing the coating surface position relative to graffiti material spheres, illust...
  - **title**: 3D Print Smoothing RED Band Diagram | **description**: Bar chart or radial plot showing RED values of various solvents relative to ABS and PLA, with the op...
  - **title**: Encapsulant/Underfill HSP Compatibility Screening | **description**: HSP space plot showing die surface, substrate surface, and various encapsulant candidates with compa...
  - **title**: Plasticizer Migration Risk vs HSP Distance | **description**: Scatter plot of experimentally measured plasticizer migration rate vs HSP distance (Ra) between plas...
  - **title**: Solvent Evaporation Trajectory in HSP Space | **description**: 3D HSP trajectory showing how the solvent blend composition evolves during drying of a multi-solvent...

### Tables Needed

  - **title**: HSP Values for Common Coating Resins | **description**: Table of deltaD, deltaP, deltaH, and R0 for 15+ coating resins including alkyd, acrylic, epoxy, poly...
  - **title**: Coating Defect Classification by Marangoni Number Range | **description**: Table mapping Marangoni number ranges to defect types (no defect, mild orange peel, Benard cells, cr...
  - **title**: Photoresist-Developer HSP Compatibility Matrix | **description**: Table of HSP distances and dissolution rates for common photoresist types (novolac, PMMA, SU-8) in v...
  - **title**: Organic Semiconductor Solvent HSP and Film Quality Correlation | **description**: Table listing common processing solvents for organic semiconductors (chlorobenzene, o-dichlorobenzen...
  - **title**: Anti-Graffiti Coating RED Matrix | **description**: Matrix of RED values between low-surface-energy coating materials and common graffiti paint types, w...
  - **title**: 3D Print Smoothing Solvent Screening Results | **description**: Table of candidate solvents for ABS, PLA, and PETG smoothing with RED values, vapor pressure, recomm...
  - **title**: Underfill and Encapsulant HSP Compatibility for Common Die/Substrate Combinations | **description**: Table of underfill materials with HSP values and compatibility (Ra, RED) to silicon die, FR-4 substr...
  - **title**: Plasticizer HSP Values and Compatibility Ranges | **description**: Table of common plasticizers (DOP, DINP, TOTM, DOA, ATBC, epoxidized soybean oil) with HSP values, c...

### Software Demo

  - **tab**: Coating Defect Prediction (コーティング欠陥予測) tab, Anti-Graffiti Coating (防落書きコーティング) tab, 3D Print Smoothing (3D印刷スムージング) tab, and Plasticizer Selection (可塑剤選定) tab
  - **inputs**: In the Coating Defect Prediction tab, enter coating resin HSP and select solvents from the database to compose a solvent blend; input film thickness and drying conditions. In the Anti-Graffiti tab, enter candidate coating HSP values and select graffiti material types. In the 3D Print Smoothing tab, select polymer type (ABS/PLA/PETG) and candidate smoothing solvents. In the Plasticizer tab, enter polymer HSP and select plasticizer candidates.
  - **expected_output**: The Coating Defect tab displays a Marangoni number estimate, defect risk classification (low/medium/high), and a solvent evaporation trajectory plot in HSP space. The Anti-Graffiti tab shows a RED matrix with pass/fail per graffiti type. The 3D Print Smoothing tab shows a RED bar chart with the 0.5-1.5 optimal band highlighted. The Plasticizer tab shows Ra and RED for each candidate with compatibility verdicts.
  - **workflow**: 1. Open Coating Defect Prediction and enter an acrylic resin with a butyl acetate / xylene blend. Observe the Marangoni risk assessment. 2. Adjust the slow solvent ratio and see how the defect risk changes. 3. Switch to Anti-Graffiti Coating tab, enter a PTFE-based coating, and check RED against spray paint and marker inks. 4. Open 3D Print Smoothing tab, select ABS, and screen acetone, MEK, and ethyl acetate for the optimal RED band. 5. Open Plasticizer tab, enter PVC HSP, and compare DOP, DINP, and ATBC for compatibility.

### Review Questions

  - Explain how Marangoni convection causes Benard cell defects in drying coatings. How can the solvent blend HSP be adjusted to minimize the Marangoni number without sacrificing resin solubility?
  - Describe the concept of dissolution contrast in photoresist development. How does the HSP distance between developer and resist control the dissolution rate, and what characteristics make an ideal developer from the HSP perspective?
  - Why is the optimal RED band for 3D printing solvent smoothing 0.5-1.5 rather than simply RED < 1? Discuss the trade-off between surface smoothing effectiveness and structural integrity in terms of the degree of polymer dissolution.
  - Explain the inverse RED logic used in anti-graffiti coating design. How does this differ from the conventional RED < 1 compatibility criterion, and what HSP characteristics should an ideal anti-graffiti surface possess?
  - Discuss the dual-compatibility challenge in underfill/encapsulant selection for electronic packaging. The material must simultaneously wet the die surface and the substrate. How can HSP analysis guide the selection of materials that satisfy both requirements?


## Chapter 13: Energy and Environmental Applications
**Energy and Environmental Applications**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter covers the application of Hansen Solubility Parameters to energy and environmental technologies. Topics include lithium-ion battery electrolyte solvent screening using RED combined with dielectric constant estimation, hydrogen storage material solvent compatibility, CO2 absorbent selection, supercritical CO2 cosolvent selection with pressure-corrected HSP, membrane separation selectivity via dual-Ra analysis, biofuel material compatibility assessment, and a gas HSP database covering CO2, O2, N2, H2, and other industrially important gases. The chapter bridges fundamental HSP theory with the growing demands of clean energy, carbon capture, and sustainable fuel technologies.

### Key Concepts

  - Lithium-ion battery electrolyte solvent screening: combining RED criterion with dielectric constant estimation for ion solvation
  - Dielectric constant estimation from HSP polar component (deltaP) using Bottcher-Kirkwood correlation
  - Electrochemical stability window estimation: relating solvent HSP to oxidation/reduction potential thresholds
  - Hydrogen storage material solvent compatibility: screening carrier liquids for metal hydride and chemical hydrogen storage systems
  - CO2 absorbent selection using HSP affinity: physical absorption solvents ranked by Ra distance to CO2
  - Chemical vs physical CO2 absorption: HSP as a pre-screening tool for physical solvents before detailed thermodynamic modeling
  - Supercritical CO2 (scCO2) as a tunable solvent: pressure-dependent HSP values shifting with density changes
  - Pressure-corrected HSP for supercritical fluids: density-based correlations for deltaD, deltaP, deltaH under varying pressure and temperature
  - Cosolvent selection for scCO2 processes: small additions of polar cosolvents to expand the solubility window in HSP space
  - Membrane separation selectivity via dual-Ra squared analysis: preferential permeation governed by relative HSP affinity of two permeants to the membrane material
  - Solution-diffusion model for polymer membranes: solubility selectivity from HSP and diffusivity selectivity from molecular size
  - Biofuel material compatibility: screening fuel blends (ethanol-gasoline, biodiesel) against elastomers, seals, and tank materials
  - Gas HSP database: assigning deltaD, deltaP, deltaH to permanent gases (CO2, O2, N2, H2, CH4, H2S, SO2, NH3) based on condensed-phase extrapolation and molecular simulation
  - Gas solubility prediction in polymers and liquids using HSP distance: Henry's law coefficient correlation with Ra
  - Polymer membrane gas permeability: correlating permeability coefficients with gas-polymer HSP affinity

### Equations

  - **name**: RED criterion for electrolyte solvent screening | **latex**: RED = \frac{Ra}{R_0} = \frac{\sqrt{4(\delta_{D,solv} - \delta_{D,poly})^2 + (\delta_{P,solv} - \delt... | **explanation**: RED < 1 indicates the solvent dissolves or swells the binder/separator polymer; for electrolyte scre...
  - **name**: Dielectric constant estimation from deltaP (Bottcher-Kirkwood approximation) | **latex**: \delta_P^2 \approx \frac{\epsilon - 1}{2\epsilon + 1} \cdot \frac{\mu^2 N_A}{9 \epsilon_0 V_m k_B T} | **explanation**: Relates the polar HSP component to the static dielectric constant via molecular dipole moment and mo...
  - **name**: Pressure-corrected HSP for supercritical CO2 | **latex**: \delta_i(P,T) = \delta_i^{ref} \cdot \left( \frac{\rho(P,T)}{\rho^{ref}} \right)^{n_i} | **explanation**: HSP components of supercritical CO2 scale with density raised to an empirical exponent n_i; deltaD t...
  - **name**: Gas HSP from condensed-phase extrapolation | **latex**: \delta_T^{gas} = \sqrt{\frac{\Delta H_{vap}(T_b) - R T_b}{V_m(T_b)}} | **explanation**: Total solubility parameter for a gas estimated at its normal boiling point using the enthalpy of vap...
  - **name**: Membrane selectivity from dual-Ra squared | **latex**: \alpha_{A/B}^{sol} \approx \exp\left( -\frac{V_A \cdot Ra_{A-mem}^2 - V_B \cdot Ra_{B-mem}^2}{R T} \... | **explanation**: Solubility selectivity of membrane for gas A over gas B is related to the difference in Ra-squared w...
  - **name**: Henry's law coefficient correlation with HSP distance | **latex**: \ln K_H \approx a + b \cdot Ra_{gas-solvent}^2 | **explanation**: Semi-empirical correlation where the Henry's law constant for gas dissolution increases (lower solub...
  - **name**: Permeability-selectivity relationship (Robeson upper bound context) | **latex**: P_i = S_i \cdot D_i = S_i^0 \exp\left(-\frac{\Delta H_s}{RT}\right) \cdot D_i^0 \exp\left(-\frac{E_D... | **explanation**: Gas permeability through a polymer membrane is the product of solubility coefficient (correlated wit...
  - **name**: Biofuel-elastomer swelling prediction | **latex**: \Delta V / V_0 \approx f(RED_{fuel-elastomer}) \quad \text{where} \quad RED < 1 \Rightarrow \text{sw... | **explanation**: Volume swelling of elastomer seals and gaskets in biofuel blends correlates with RED; fuels with RED...

**Historical Context:** The application of solubility parameters to energy systems began gaining traction in the 2000s alongside the rapid growth of lithium-ion battery technology. Xu (2004) provided a comprehensive review of nonaqueous electrolytes for Li-ion batteries, where solvent selection criteria implicitly relied on solubility parameter concepts. Hansen himself discussed gas solubility parameters in his 2007 handbook, providing HSP values for CO2, N2, and other gases extrapolated from condensed-phase data at the boiling point. Williams et al. (2004) pioneered the systematic use of HSP for supercritical CO2 cosolvent selection, building on earlier work by Giddings et al. (1968) who first proposed that supercritical fluid solvent strength scales with density. Membrane separation selectivity using solubility parameters was explored by Mulder (1996) and Freeman (1999), with Freeman establishing the theoretical framework connecting permeability-selectivity trade-offs to polymer-gas thermodynamic interactions. Biofuel compatibility with automotive materials became a major concern with the expansion of ethanol and biodiesel blending mandates in the 2000s-2010s, with Miyata et al. (2008) and Haseeb et al. (2011) using HSP to predict elastomer degradation in biofuel blends. The concept of a comprehensive gas HSP database was advanced by Abbott and Hansen in HSPiP editions from 2008 onward, incorporating both experimental extrapolation and molecular simulation values.

### Related Project Modules

  - li-ion-battery-electrolyte.ts
  - hydrogen-storage-material.ts
  - co2-absorbent-selection.ts
  - supercritical-co2-cosolvent.ts
  - membrane-separation-selectivity.ts
  - biofuel-material-compatibility.ts
  - gas-solubility.ts
  - polymer-membrane-gas-permeability.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch03_Temperature_Pressure_Effects, Ch07_Polymer_Solubility_Swelling

### Learning Objectives

  - Screen lithium-ion battery electrolyte solvents by combining RED analysis with dielectric constant estimation to identify candidates that dissolve lithium salts while remaining compatible with separator and electrode binder materials
  - Apply pressure-corrected HSP to supercritical CO2 systems and select cosolvents that shift the scCO2 solubility sphere to encompass target solutes
  - Use dual-Ra squared analysis to predict and optimize membrane separation selectivity for gas pairs and liquid mixtures
  - Evaluate biofuel blend compatibility with elastomers, seals, and tank materials using HSP-based swelling predictions
  - Construct and utilize a gas HSP database to predict gas solubility in polymers and liquids for applications including CO2 capture, hydrogen storage, and gas separation membranes

### Practical Applications

  - Screening electrolyte solvents for lithium-ion batteries that combine high dielectric constant, electrochemical stability, and compatibility with separator and binder polymers
  - Selecting physical absorption solvents for post-combustion CO2 capture by ranking candidates by HSP affinity to CO2
  - Choosing cosolvents for supercritical CO2 extraction and cleaning processes in pharmaceutical and food industries
  - Designing polymer membranes for CO2/N2 and CO2/CH4 gas separation using HSP-guided material selection
  - Evaluating hydrogen storage carrier liquids and containment material compatibility using HSP distance analysis
  - Assessing biofuel (E85, B100, biodiesel blends) compatibility with automotive fuel system elastomers, gaskets, and tank liners
  - Predicting gas permeability through packaging films for food preservation and modified atmosphere packaging
  - Selecting scrubbing solvents for H2S and SO2 removal in natural gas processing and flue gas treatment

### Worked Examples

  - **title**: Lithium-ion battery electrolyte solvent screening with RED and dielectric constant | **description**: Screen 12 candidate solvents (EC, DMC, DEC, EMC, PC, GBL, ACN, DME, DOL, DMSO, sulfolane, FEC) for a...
  - **title**: CO2 absorbent solvent selection for post-combustion capture | **description**: Given HSP values for CO2 gas (deltaD=15.6, deltaP=5.2, deltaH=5.8 MPa^0.5), calculate Ra distances t...
  - **title**: Supercritical CO2 cosolvent selection for natural product extraction | **description**: Calculate the pressure-dependent HSP of scCO2 at 40C and pressures of 100, 200, and 300 bar using de...
  - **title**: Biofuel compatibility assessment for automotive fuel system elastomers | **description**: Evaluate the compatibility of four elastomer types (NBR, FKM/Viton, HNBR, EPDM) with fuel blends ran...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 7: Methods of Chara...
  - **author**: Xu, K. | **year**: 2004 | **title**: Nonaqueous Liquid Electrolytes for Lithium-Based Rechargeable Batteries, Chemical Reviews, 104(10), ...
  - **author**: Freeman, B.D. | **year**: 1999 | **title**: Basis of Permeability/Selectivity Tradeoff Relations in Polymeric Gas Separation Membranes, Macromol...
  - **author**: Giddings, J.C.; Myers, M.N.; McLaren, L.; Keller, R.A. | **year**: 1968 | **title**: High Pressure Gas Chromatography of Nonvolatile Species, Science, 162(3849), 67-73
  - **author**: Williams, L.L.; Rubin, J.B.; Edwards, H.W. | **year**: 2004 | **title**: Calculation of Hansen Solubility Parameter Values for a Range of Pressure and Temperature Conditions...
  - **author**: Mulder, M. | **year**: 1996 | **title**: Basic Principles of Membrane Technology, 2nd Edition, Kluwer Academic Publishers
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2020 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com [uncertain]
  - **author**: Haseeb, A.S.M.A.; Fazal, M.A.; Jahirul, M.I.; Masjuki, H.H. | **year**: 2011 | **title**: Compatibility of Automotive Materials in Biodiesel: A Review, Fuel, 90(3), 922-931
  - **author**: Robeson, L.M. | **year**: 2008 | **title**: The Upper Bound Revisited, Journal of Membrane Science, 320(1-2), 390-400
  - **author**: Yampolskii, Y.; Pinnau, I.; Freeman, B.D. | **year**: 2006 | **title**: Materials Science of Membranes for Gas and Vapor Separation, Wiley [uncertain]

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch03_Temperature_Pressure_Effects
  - Ch07_Polymer_Solubility_Swelling
  - Ch08_Polymer_Blends_Recycling
  - Ch11_Nanomaterials_Dispersion

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Li-ion Electrolyte Solvent Screening Map in HSP Space | **description**: 3D HSP plot showing the PVDF binder sphere, PE separator sphere, and lithium salt solvation target r...
  - **title**: Dielectric Constant vs deltaP Correlation for Electrolyte Solvents | **description**: Scatter plot of experimentally measured dielectric constant versus deltaP for 20+ common solvents, s...
  - **title**: CO2 Absorbent Selection Ranked by Ra Distance | **description**: Bar chart showing Ra distances from CO2 HSP to various physical absorbent solvents, ranked from smal...
  - **title**: Pressure-Temperature Dependence of Supercritical CO2 HSP | **description**: Three-panel plot showing deltaD, deltaP, and deltaH of CO2 as functions of pressure at several isoth...
  - **title**: scCO2 Cosolvent Effect in HSP Space | **description**: HSP space diagram showing pure scCO2 position at a given P,T, the target solute's solubility sphere,...
  - **title**: Membrane Selectivity Map: Dual-Ra Squared Analysis | **description**: 2D plot of Ra-squared(gas A - membrane) vs Ra-squared(gas B - membrane) for various polymer membrane...
  - **title**: Biofuel-Elastomer Swelling Phase Diagram | **description**: Plot of RED vs ethanol volume fraction (0-85%) for four elastomer types (NBR, FKM, HNBR, EPDM) in ga...
  - **title**: Gas HSP Database Visualization | **description**: 3D HSP space plot showing the positions of permanent gases (CO2, O2, N2, H2, CH4, H2S, SO2, NH3, H2O...
  - **title**: Polymer Membrane Permeability vs Gas-Polymer Ra | **description**: Log-log scatter plot of gas permeability coefficient vs Ra distance between gas and polymer for mult...
  - **title**: Hydrogen Storage Material Solvent Compatibility Map | **description**: HSP space diagram showing hydrogen storage materials (metal hydrides, liquid organic hydrogen carrie...

### Tables Needed

  - **title**: Li-ion Battery Electrolyte Solvent HSP and Properties | **description**: Table of 15+ candidate solvents (EC, DMC, DEC, EMC, PC, GBL, ACN, DME, DOL, DMSO, sulfolane, FEC, et...
  - **title**: Gas HSP Database | **description**: Comprehensive table of HSP values (deltaD, deltaP, deltaH) for 15+ gases including CO2, O2, N2, H2, ...
  - **title**: CO2 Physical Absorbent Solvent Ranking | **description**: Table of 10+ physical absorbent solvents with HSP values, Ra to CO2, Henry's law constant (literatur...
  - **title**: Supercritical CO2 HSP at Various Pressure-Temperature Conditions | **description**: Table of deltaD, deltaP, deltaH, and density for scCO2 at pressures from 75-400 bar and temperatures...
  - **title**: Cosolvent Effects on scCO2 Mixture HSP | **description**: Table showing how 1%, 3%, 5%, and 10% molar additions of ethanol, methanol, acetone, and ethyl aceta...
  - **title**: Membrane Material HSP and Gas Pair Selectivity | **description**: Table of polymer membrane materials (PDMS, polysulfone, polyimide, PIM-1, PTMSP, cellulose acetate) ...
  - **title**: Biofuel Blend HSP at Various Ethanol/Biodiesel Fractions | **description**: Table of HSP values for gasoline-ethanol blends (E0, E10, E20, E50, E85) and diesel-biodiesel blends...
  - **title**: Elastomer Compatibility with Biofuel Blends | **description**: Matrix of RED values for common fuel system elastomers (NBR, FKM, HNBR, EPDM, silicone, neoprene) ag...

### Software Demo

  - **tab**: Li-ion Battery Electrolyte (リチウムイオン電池電解液) tab, CO2 Absorbent Selection (CO2吸収材選定) tab, Supercritical CO2 Cosolvent (超臨界CO2共溶媒) tab, Membrane Separation (膜分離選択性) tab, and Biofuel Compatibility (バイオ燃料適合性) tab
  - **inputs**: In the Li-ion Battery Electrolyte tab, enter PVDF binder HSP and PE separator HSP, then select candidate solvents from the database. In the CO2 Absorbent tab, load CO2 gas HSP and enter candidate absorbent solvent HSP values. In the Supercritical CO2 tab, set pressure and temperature to calculate scCO2 HSP, then add cosolvent type and concentration. In the Membrane Separation tab, enter polymer membrane HSP and select gas pairs for selectivity analysis. In the Biofuel Compatibility tab, select fuel blend type and ethanol fraction, then enter elastomer HSP values.
  - **expected_output**: The Li-ion Battery tab displays a ranked table of solvents with RED to binder, RED to separator, estimated dielectric constant, and pass/fail classification. The CO2 Absorbent tab shows Ra-ranked absorbent list with a bar chart. The Supercritical CO2 tab displays pressure-dependent HSP values and a cosolvent vector diagram in HSP space. The Membrane Separation tab shows dual-Ra analysis with predicted selectivity ratios. The Biofuel tab shows RED vs ethanol fraction curves for each elastomer with swelling risk zones highlighted.
  - **workflow**: 1. Open Li-ion Battery Electrolyte tab and screen EC, DMC, EMC, and PC against PVDF binder and PE separator. Identify that EC+DMC blend is optimal. 2. Switch to CO2 Absorbent Selection tab and rank Selexol, NMP, methanol, and propylene carbonate by Ra to CO2. 3. Open Supercritical CO2 tab, set 200 bar / 50C, observe HSP values, then add 5% ethanol cosolvent and see the HSP shift toward a target polar compound. 4. Use Membrane Separation tab to compare PDMS, polyimide, and PIM-1 for CO2/N2 selectivity. 5. Open Biofuel Compatibility tab, sweep ethanol fraction from 0-85% and observe the RED transition for NBR and FKM elastomers.

### Review Questions

  - Explain why lithium-ion battery electrolyte solvent selection requires simultaneous consideration of RED values against multiple polymeric components (binder, separator) and dielectric constant. How does HSP analysis streamline this multi-constraint optimization compared to purely experimental screening?
  - Describe how the HSP of supercritical CO2 changes with pressure and temperature. Why is pure scCO2 limited to dissolving nonpolar, low-molecular-weight compounds, and how does cosolvent addition expand its capability in HSP terms?
  - Compare the use of HSP for selecting physical CO2 absorbents versus chemical absorbents (amines). What are the fundamental limitations of applying HSP to reactive absorption systems, and how can HSP still serve as a useful pre-screening tool?
  - Explain the dual-Ra squared analysis for membrane separation selectivity. How does the difference in HSP affinity between two gas species and the membrane material determine the solubility selectivity, and what role does the diffusivity selectivity play in the overall separation?
  - Discuss the challenges of assigning HSP values to permanent gases. What experimental and computational methods are used, and how reliable are these gas HSP values for predicting solubility in polymers and liquids?


## Chapter 14: Food and Cosmetics
**食品・化粧品**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter applies Hansen Solubility Parameters to the food, fragrance, and cosmetics industries. Topics include flavor scalping prediction (aroma absorption by packaging polymers using inverse RED logic where low RED indicates high scalping risk), food packaging migration risk assessment (leaching of monomers and additives into food), cosmetic emulsion stability prediction using Bancroft's rule with HSP-based oil/emulsifier/water Ra distances, fragrance encapsulation wall material selection (high RED for stable capsules), sunscreen UV filter solubility in vehicle bases, natural dye extraction solvent optimization, and essential oil extraction solvent screening.

### Key Concepts

  - Flavor scalping: absorption of food aroma compounds by packaging polymers, predicted by RED between polymer and aroma molecules
  - Inverse RED logic for scalping: RED < 0.8 indicates high scalping risk (polymer-aroma affinity), RED >= 1.2 indicates low risk
  - Food packaging migration: leaching of residual monomers, plasticizers, and additives from packaging into food simulants
  - Migration risk screening: RED < 0.8 between packaging and migrant substance indicates high migration probability
  - Bancroft's rule for emulsion type prediction: the phase in which the emulsifier is more soluble becomes the continuous phase
  - HSP-based emulsion type classification: Ra(oil, emulsifier) < Ra(emulsifier, water) predicts W/O; the reverse predicts O/W
  - Emulsion stability via dominant Ra: min(Ra_oil_emulsifier, Ra_emulsifier_water) determines stability level
  - Fragrance encapsulation stability: high RED between wall material and fragrance indicates strong barrier properties (RED >= 1.5 is excellent)
  - Sunscreen UV filter solubility: RED < 0.7 indicates excellent dissolution in vehicle base, RED >= 1.0 indicates crystallization risk
  - Natural dye extraction efficiency: RED between dye and solvent predicts extraction yield, with RED < 0.7 being optimal
  - Essential oil extraction solvent screening using the same RED-based extraction efficiency framework as natural dye extraction
  - Three-component HSP analysis for cosmetic emulsion systems (oil phase, emulsifier, water phase)
  - Food-contact regulatory context: HSP screening as a pre-regulatory tool for identifying high-risk packaging-food combinations

### Equations

  - **name**: Hansen distance (Ra) | **latex**: Ra = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{H... | **explanation**: Fundamental HSP distance used throughout this chapter for all pairwise affinity calculations between...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{Ra}{R_0} | **explanation**: Ratio of HSP distance to interaction radius; the interpretation direction varies by application (low...
  - **name**: Flavor scalping risk classification | **latex**: \text{Risk} = \begin{cases} \text{High Scalping} & RED < 0.8 \\ \text{Moderate} & 0.8 \leq RED < 1.2... | **explanation**: Classification of aroma absorption risk by packaging polymer; low RED means the polymer has high aff...
  - **name**: Packaging migration risk classification | **latex**: \text{Risk} = \begin{cases} \text{High Migration} & RED < 0.8 \\ \text{Moderate} & 0.8 \leq RED < 1.... | **explanation**: Classification of substance migration from packaging into food; low RED indicates the migrant is hig...
  - **name**: Emulsion type prediction (Bancroft's rule via HSP) | **latex**: \text{Type} = \begin{cases} \text{W/O} & Ra_{oil-emul} < Ra_{emul-water} \\ \text{O/W} & Ra_{oil-emu... | **explanation**: The emulsifier partitions to the phase with which it has lower Ra; when the emulsifier is closer to ...
  - **name**: Emulsion stability assessment | **latex**: Ra_{dominant} = \min(Ra_{oil-emul}, Ra_{emul-water}), \quad \text{Stability} = \begin{cases} \text{S... | **explanation**: Stability is governed by how closely the emulsifier matches one of the two phases; lower dominant Ra...
  - **name**: Fragrance encapsulation quality | **latex**: \text{Quality} = \begin{cases} \text{Poor} & RED < 1.0 \\ \text{Good} & 1.0 \leq RED < 1.5 \\ \text{... | **explanation**: Higher RED between wall material and fragrance means the wall is a poor solvent for the fragrance, t...
  - **name**: UV filter solubility classification | **latex**: \text{Solubility} = \begin{cases} \text{Excellent} & RED < 0.7 \\ \text{Good} & 0.7 \leq RED < 1.0 \... | **explanation**: For sunscreen formulation, the UV filter must remain dissolved in the vehicle base; RED < 0.7 ensure...
  - **name**: Extraction efficiency classification (natural dye and essential oil) | **latex**: \text{Efficiency} = \begin{cases} \text{Excellent} & RED < 0.7 \\ \text{Good} & 0.7 \leq RED < 1.0 \... | **explanation**: For solvent extraction of natural dyes and essential oils, lower RED indicates higher thermodynamic ...

### Related Project Modules

  - flavor-scalping.ts
  - flavor-scalping-prediction.ts
  - food-packaging-migration.ts
  - cosmetic-emulsion-stability.ts
  - fragrance-encapsulation.ts
  - sunscreen-uv-filter.ts
  - natural-dye-extraction.ts
  - essential-oil-extraction.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch07_Polymer_Solubility_Swelling

### Learning Objectives

  - Predict flavor scalping risk for packaging-aroma pairs using inverse RED logic and identify packaging materials that minimize aroma loss in food products
  - Screen food packaging materials for migration risk of residual monomers and additives using RED-based classification and relate results to regulatory thresholds
  - Determine emulsion type (O/W vs W/O) and stability for cosmetic formulations using three-component HSP distance analysis based on Bancroft's rule
  - Evaluate fragrance encapsulation wall materials by selecting polymers with high RED against target fragrances to maximize capsule retention time
  - Apply RED-based solvent screening to optimize extraction efficiency for natural dyes and essential oils, supporting green chemistry solvent selection

### Practical Applications

  - Food packaging material selection to minimize flavor scalping in juice, dairy, and beverage products
  - Regulatory pre-screening of food-contact materials for migration risk of plasticizers, antioxidants, and residual monomers
  - Cosmetic emulsion formulation: selecting emulsifiers to achieve target emulsion type (O/W for lotions, W/O for cold creams) with predicted stability
  - Fragrance microencapsulation for laundry detergents, fabric softeners, and long-lasting perfumes using HSP-optimized wall materials
  - Sunscreen formulation: ensuring UV filter solubility in vehicle base to prevent crystallization and maintain SPF performance
  - Natural dye extraction from plant materials (turmeric, indigo, cochineal) using HSP-optimized green solvents
  - Essential oil extraction solvent screening for perfumery and aromatherapy industries
  - Quality control of cosmetic raw materials by verifying HSP compatibility between active ingredients and formulation bases

### Worked Examples

  - **title**: Flavor scalping risk assessment for orange juice in PE packaging | **description**: Calculate RED values between polyethylene packaging (with known HSP and R0) and key orange juice aro...
  - **title**: Cosmetic emulsion type and stability prediction for a moisturizing cream | **description**: Given HSP values for mineral oil (oil phase), Tween 80 (emulsifier), and water, calculate Ra(oil, em...
  - **title**: Sunscreen UV filter solubility screening in cosmetic bases | **description**: Screen five common UV filters (avobenzone, octinoxate, octocrylene, homosalate, oxybenzone) against ...
  - **title**: Green solvent selection for essential oil extraction from lavender | **description**: Screen 10 candidate solvents (ethanol, ethyl acetate, limonene, cyclopentyl methyl ether, 2-methylTH...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Piringer, O.G.; Baner, A.L. | **year**: 2008 | **title**: Plastic Packaging: Interactions with Food and Pharmaceuticals, 2nd Edition, Wiley-VCH
  - **author**: Halek, G.W.; Luttmann, J.P. | **year**: 1991 | **title**: Sorption Behavior of Citrus-Flavor Compounds in Polyethylenes and Polypropylenes: Effects of Permean...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2020 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com
  - **author**: Bancroft, W.D. | **year**: 1913 | **title**: The Theory of Emulsification V, Journal of Physical Chemistry, 17(6), 501-519
  - **author**: Yara-Varon, E.; Li, Y.; Balcells, M.; Canela-Garayoa, R.; Fabiano-Tixier, A.-S.; Chemat, F. | **year**: 2017 | **title**: Vegetable Oils as Alternative Solvents for Green Oleo-Extraction, Purification and Formulation of Fo...
  - **author**: Archer, W.L. | **year**: 1996 | **title**: Industrial Solvents Handbook, Marcel Dekker
  - **author**: Mannheim, C.H.; Miltz, J.; Letzter, A. | **year**: 1987 | **title**: Interaction Between Polyethylene Laminated Cartons and Aseptically Packed Citrus Juices, Journal of ...
  - **author**: Rowe, R.C. | **year**: 1988 | **title**: Adhesion of Film Coatings to Tablet Surfaces - A Theoretical Approach Based on Solubility Parameters...
  - **author**: Chemat, F.; Vian, M.A.; Cravotto, G. | **year**: 2012 | **title**: Green Extraction of Natural Products: Concept and Principles, International Journal of Molecular Sci...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch07_Polymer_Solubility_Swelling
  - Ch08_Polymer_Blends_Recycling
  - Ch09_Pharmaceutical_Drug_Delivery
  - Ch11_Nanomaterials_Dispersion
  - Ch12_Coatings_Films

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Flavor Scalping Risk Map in HSP Space | **description**: 3D HSP plot showing a packaging polymer sphere with aroma compounds positioned by their HSP values; ...
  - **title**: Inverse RED Logic Diagram for Scalping vs Migration | **description**: Conceptual diagram contrasting the standard RED interpretation (RED < 1 = compatible) with the inver...
  - **title**: Emulsion Type Prediction Triangle | **description**: Triangular diagram with oil, emulsifier, and water at vertices, showing Ra distances as edge lengths...
  - **title**: Bancroft's Rule Visualization via HSP Distances | **description**: HSP space plot showing an oil phase point, water phase point, and two emulsifier candidates position...
  - **title**: Fragrance Encapsulation RED Bar Chart | **description**: Horizontal bar chart showing RED values for multiple fragrance-wall material pairs, with color bands...
  - **title**: UV Filter Solubility in Cosmetic Vehicle Bases | **description**: Heat map matrix of RED values for UV filter-vehicle combinations, with cells colored green (Excellen...
  - **title**: Green Solvent Screening for Natural Product Extraction | **description**: 2D HSP projection (deltaP vs deltaH at fixed deltaD) showing the target natural product sphere with ...
  - **title**: Packaging Migration Screening Workflow | **description**: Flowchart showing the HSP-based pre-screening pipeline: input packaging HSP and migrant HSP, calcula...

### Tables Needed

  - **title**: HSP Values for Common Food Packaging Polymers | **description**: Table of deltaD, deltaP, deltaH, and R0 for LDPE, HDPE, PP, PET, PVC, PS, PA (nylon), EVOH, and PLA ...
  - **title**: HSP Values for Food Aroma Compounds | **description**: Table of deltaD, deltaP, deltaH for 15+ aroma compounds including limonene, linalool, vanillin, ethy...
  - **title**: Flavor Scalping Risk Matrix: Packaging vs Aroma | **description**: Matrix of RED values and scalping risk levels for common packaging-aroma pairs, highlighting high-ri...
  - **title**: Common Food Packaging Migrants and Their HSP Values | **description**: Table of residual monomers (styrene, vinyl chloride, BPA), plasticizers (DEHP, DEHA), and antioxidan...
  - **title**: Cosmetic Emulsifier HSP Values and HLB Correlation | **description**: Table of common emulsifiers (Tween 20/60/80, Span 20/60/80, lecithin, ceteareth-20) with HSP values,...
  - **title**: UV Filter HSP Values and Vehicle Compatibility | **description**: Table of common organic UV filters (avobenzone, octinoxate, octocrylene, homosalate, oxybenzone, tin...
  - **title**: Essential Oil HSP Values for Extraction Screening | **description**: Table of HSP values for essential oils (lavender, tea tree, eucalyptus, peppermint, rosemary, chamom...
  - **title**: Encapsulation Wall Material HSP Values | **description**: Table of common wall materials (gelatin, gum arabic, maltodextrin, PLGA, chitosan, cyclodextrin) wit...

### Software Demo

  - **tab**: Flavor Scalping Prediction tab, Food Packaging Migration tab, Cosmetic Emulsion Stability tab, Fragrance Encapsulation tab, Sunscreen UV Filter tab, Natural Dye Extraction tab, and Essential Oil Extraction tab
  - **inputs**: In the Flavor Scalping tab, enter packaging polymer HSP (e.g., LDPE: dD=16.5, dP=3.4, dH=3.4, R0=6.0) and select aroma compounds from the database. In the Cosmetic Emulsion tab, enter HSP values for oil phase, emulsifier, and water phase. In the Sunscreen UV Filter tab, enter vehicle base HSP and R0, then select UV filter candidates. In the Natural Dye Extraction tab, enter dye HSP and R0 and select candidate solvents.
  - **expected_output**: The Flavor Scalping tab displays a table of aroma compounds sorted by RED (ascending = highest risk first), with scalping level classification (High/Moderate/Low) and color-coded indicators. The Emulsion Stability tab shows emulsion type prediction (O/W or W/O), stability level, and Ra distances. The UV Filter tab shows a ranked list of UV filters by solubility level. The Extraction tabs show solvents ranked by extraction efficiency.
  - **workflow**: 1. Open Flavor Scalping tab, enter LDPE packaging HSP, add limonene, linalool, and vanillin as aroma compounds. Observe that limonene shows High Scalping risk (RED < 0.8). 2. Switch to Food Packaging Migration tab, enter the same LDPE HSP, add styrene monomer and BHT as potential migrants. 3. Open Cosmetic Emulsion tab, enter mineral oil HSP, Tween 80 HSP, and water HSP. Verify O/W type prediction. Replace Tween 80 with Span 80 and observe the switch to W/O. 4. Open Sunscreen UV Filter tab, enter isopropyl myristate vehicle, screen avobenzone and octocrylene. 5. Open Essential Oil Extraction tab, enter lavender oil HSP, and screen ethanol, ethyl acetate, and hexane.

### Review Questions

  - Explain the inverse RED logic used in flavor scalping prediction. Why does a low RED value between a packaging polymer and an aroma compound indicate a high scalping risk, and how does this contrast with the standard solubility interpretation?
  - A cosmetic formulator wants to create an O/W moisturizing lotion. Using Bancroft's rule interpreted through HSP distances, describe how to select an emulsifier that favors O/W formation. What HSP relationship between the emulsifier, oil phase, and water phase is required?
  - Compare the RED interpretation for fragrance encapsulation (high RED = good) with the RED interpretation for UV filter solubility in sunscreen (low RED = good). What underlying physical principle explains why the same metric is interpreted in opposite directions for these two applications?
  - Discuss how HSP-based screening can serve as a pre-regulatory tool for food packaging migration assessment. What are its advantages and limitations compared to full migration testing under EU Regulation 10/2011 or FDA 21 CFR 170-199?
  - A natural product chemist needs to replace hexane with a greener solvent for extracting curcumin from turmeric. Using the extraction efficiency RED framework, outline the solvent selection strategy and identify at least two green solvents that might achieve RED < 0.7 based on HSP reasoning.


## Chapter 15: Industrial Specialty Applications
**産業特殊応用**

**Level:** chapter

**Parent:** Part IV: Applications

**Synopsis:** This chapter covers five specialized industrial applications of Hansen Solubility Parameters: cleaning product formulation for soil removal, soil contamination remediation solvent selection, perovskite solar cell solvent engineering (good solvent/anti-solvent classification), UV-curable ink monomer selection, and phase change material (PCM) encapsulation stability. Each application demonstrates how HSP distance, RED criteria, and solubility sphere analysis guide practical material and solvent selection in distinct industrial sectors.

### Key Concepts

  - Cleaning agent formulation using HSP matching between cleaning solvent and target soil (grease, particulate, organic residue)
  - Soil-solvent HSP affinity and the role of RED in predicting cleaning efficiency for different soil types
  - Surfactant HLD-HSP bridging: connecting hydrophilic-lipophilic deviation with Hansen parameters for cleaning formulations
  - Soil contamination remediation: selecting extraction solvents that maximize contaminant solubility while minimizing environmental impact
  - Partitioning coefficient estimation from HSP distance for contaminant extraction from soil matrices
  - Green solvent screening for soil remediation using combined HSP compatibility and environmental/toxicity criteria
  - Perovskite precursor solubility classification: good solvents (RED < 1) vs anti-solvents (RED >> 1) for perovskite film formation
  - Anti-solvent engineering for perovskite crystallization: controlling nucleation and grain size via HSP distance to precursor
  - Solvent-additive strategies for perovskite defect passivation guided by selective HSP component matching
  - UV-curable ink monomer selection: matching monomer HSP to pigment dispersion stability and substrate adhesion requirements
  - Reactive diluent screening for UV inks using HSP compatibility with oligomer and pigment
  - PCM microencapsulation shell-core compatibility: HSP matching between phase change material and encapsulant polymer shell
  - PCM leakage prediction via RED criterion: shell permeability to molten PCM correlated with HSP distance
  - Supercooling suppression in PCM capsules through nucleating agent HSP affinity screening

### Equations

  - **name**: HSP distance (Ra) for cleaning efficiency | **latex**: Ra_{clean} = \sqrt{4(\delta_{D,solvent} - \delta_{D,soil})^2 + (\delta_{P,solvent} - \delta_{P,soil}... | **explanation**: Hansen distance between cleaning solvent and target soil; smaller Ra indicates greater thermodynamic...
  - **name**: Cleaning efficiency RED criterion | **latex**: RED_{clean} = \frac{Ra_{solvent-soil}}{R_{0,soil}} < 1 \implies \text{effective cleaning} | **explanation**: When the RED of the cleaning solvent relative to the soil is less than 1, the solvent can effectivel...
  - **name**: Soil-water partition coefficient from HSP | **latex**: \log K_{sw} \approx \alpha + \beta \cdot Ra_{contaminant-water} - \gamma \cdot Ra_{contaminant-solve... | **explanation**: Semi-empirical correlation relating the soil-water partition coefficient to HSP distances; used to p...
  - **name**: Perovskite good solvent criterion | **latex**: RED_{precursor} = \frac{Ra_{solvent-precursor}}{R_{0,precursor}} < 1 \quad (\text{good solvent}) | **explanation**: Solvents within the precursor solubility sphere dissolve perovskite precursors effectively for solut...
  - **name**: Perovskite anti-solvent criterion | **latex**: RED_{anti} = \frac{Ra_{anti-precursor}}{R_{0,precursor}} > 2 \quad (\text{anti-solvent}) | **explanation**: Anti-solvents with RED significantly greater than 1 (typically > 2) induce rapid supersaturation and...
  - **name**: Anti-solvent miscibility with processing solvent | **latex**: RED_{anti-proc} = \frac{Ra_{anti-processing}}{R_{0,processing}} < 1 | **explanation**: The anti-solvent must be miscible with the processing solvent (RED < 1) to enable rapid solvent exch...
  - **name**: UV ink pigment dispersion stability | **latex**: Ra_{pigment-monomer} < R_{0,pigment} \quad \Leftrightarrow \quad RED < 1 | **explanation**: Pigment dispersion in UV-curable ink monomers is stable when the monomer HSP falls within the pigmen...
  - **name**: PCM encapsulation leakage risk | **latex**: RED_{PCM-shell} = \frac{Ra_{PCM-shell}}{R_{0,shell}} > 1 \implies \text{low leakage risk} | **explanation**: For PCM microencapsulation, the shell polymer should be incompatible (RED > 1) with the molten PCM t...
  - **name**: PCM-shell permeability correlation | **latex**: \ln P_{shell} \approx A - B \cdot Ra_{PCM-shell} | **explanation**: Shell permeability to PCM decreases with increasing HSP distance between the PCM core and shell poly...

**Historical Context:** Cleaning product formulation using solubility parameters has roots in Hansen's original 1967 work on paint and coating solvents, with systematic application to industrial cleaning emerging in the 1990s-2000s through the work of Abbott and Hansen (HSPiP software). Soil contamination remediation using solubility parameters was developed in the environmental engineering community in the 1990s-2000s, with researchers like Yalkowsky and Banerjee applying partition coefficient models incorporating solubility parameters. Perovskite solvent engineering became a major research focus after 2012, when Miyasaka, Snaith, and Gratzel groups demonstrated high-efficiency perovskite solar cells; systematic HSP-based solvent classification for perovskites was advanced by Ke et al. (2015) and Noel et al. (2017), who mapped precursor solubility spheres and anti-solvent windows. UV-curable ink formulation using HSP for monomer/oligomer/pigment compatibility screening has been practiced in the printing industry since the 2000s, building on earlier solubility parameter work for conventional inks. PCM encapsulation stability analysis using HSP emerged in the 2010s with the growing interest in thermal energy storage, with researchers like Sari, Karaipekli, and others applying HSP compatibility criteria to predict shell-core interactions and leakage behavior.

**Related Project Modules:** cleaning-product-formulation.ts, soil-contaminant-extraction.ts, perovskite-solvent-engineering.ts, uv-curable-ink-monomer.ts, pcm-encapsulation.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch07_Polymer_Solubility_Swelling, Ch11_Nanomaterials_Dispersion

### Learning Objectives

  - Formulate cleaning products by matching solvent HSP to target soil HSP and evaluate cleaning efficiency using RED criteria for different soil types (grease, particulate, polymeric residue)
  - Select environmentally acceptable extraction solvents for soil contamination remediation by combining HSP compatibility screening with green chemistry constraints
  - Classify solvents as good solvents or anti-solvents for perovskite precursors using HSP sphere analysis, and design anti-solvent dripping protocols for high-quality perovskite film crystallization
  - Screen UV-curable ink monomers and reactive diluents for pigment dispersion stability and substrate adhesion using HSP matching criteria
  - Predict PCM encapsulation leakage risk and select shell polymers with appropriate HSP incompatibility to the PCM core material

### Practical Applications

  - Formulating industrial and household cleaning agents optimized for specific soil types (kitchen grease, machining oil, photoresist residue, biological soils)
  - Selecting extraction solvents for remediation of petroleum hydrocarbon, PAH, and chlorinated solvent contaminated soils
  - Designing solvent systems for perovskite solar cell fabrication with controlled crystallization and grain size
  - Screening anti-solvents for perovskite one-step deposition to maximize power conversion efficiency
  - Selecting monomers and reactive diluents for UV-curable inkjet inks with stable pigment dispersions
  - Designing PCM microcapsules for building thermal energy storage with minimal leakage over thermal cycling
  - Evaluating PCM-shell compatibility for textile-embedded thermal regulation materials
  - Optimizing cleaning solvent blends for electronics manufacturing (flux residue, solder paste cleaning)

### Worked Examples

  - **title**: Cleaning agent formulation for machining oil removal | **description**: Given HSP values for a mineral-based machining oil soil, screen 10 candidate cleaning solvents and s...
  - **title**: Perovskite anti-solvent selection for MAPbI3 film deposition | **description**: Map the HSP solubility sphere of MAPbI3 precursor in DMF/DMSO processing solvent. Screen 15 candidat...
  - **title**: UV-curable inkjet ink monomer screening for carbon black dispersion | **description**: Given HSP values for carbon black pigment and a urethane acrylate oligomer, evaluate 8 reactive dilu...
  - **title**: PCM microcapsule shell selection for paraffin wax encapsulation | **description**: Evaluate 5 shell polymer candidates (melamine-formaldehyde, polyurea, PMMA, polystyrene, polyurethan...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2020 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 5th Edition, www.hansen-solubility.com
  - **author**: Noel, N.K.; Habisreutinger, S.N.; Wenger, B.; Klug, M.T.; Horantner, M.T.; Johnston, M.B.; Nicholas,... | **year**: 2017 | **title**: A Low Viscosity, Low Boiling Point, Clean Solvent System for the Rapid Crystallisation of Highly Spe...
  - **author**: Ke, W.; Fang, G.; Liu, Q.; Xiong, L.; Qin, P.; Tao, H.; Wang, J.; Lei, H.; Li, B.; Wan, J.; Yang, G.... | **year**: 2015 | **title**: Low-Temperature Solution-Processed Tin Oxide as an Alternative Electron Transporting Layer for Effic...
  - **author**: Sari, A.; Alkan, C.; Karaipekli, A. | **year**: 2010 | **title**: Preparation, Characterization and Thermal Properties of PMMA/n-Heptadecane Microcapsules as Novel So...
  - **author**: Jansen, K.M.B.; Zhang, M.F. | **year**: 2014 | **title**: Hansen Solubility Parameters for Selection of Encapsulation Shell Materials for Phase Change Materia...
  - **author**: Burgues-Ceballos, I.; Machui, F.; Min, J.; Ameri, T.; Voigt, M.M.; Luber, S.; Brabec, C.J. | **year**: 2014 | **title**: Solubility Based Identification of Green Solvents for Small Molecule Organic Solar Cells, Advanced F...
  - **author**: Abbott, S. | **year**: 2015 | **title**: Cleaning with Solvents: Science and Practice, in Handbook for Cleaning/Decontamination of Surfaces, ...
  - **author**: Wypych, G. | **year**: 2014 | **title**: Handbook of Solvents, Volume 2: Use, Health, and Environment, 2nd Edition, ChemTec Publishing
  - **author**: Yalkowsky, S.H.; He, Y.; Jain, P. | **year**: 2010 | **title**: Handbook of Aqueous Solubility Data, 2nd Edition, CRC Press

**Cross References:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch07_Polymer_Solubility_Swelling, Ch11_Nanomaterials_Dispersion, Ch12_Coatings_Films

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Cleaning Solvent-Soil HSP Matching Diagram | **description**: 3D HSP plot showing soil types (grease, particulate, polymeric residue) as solubility spheres with c...
  - **title**: Soil Contamination Remediation Solvent Screening Map | **description**: 2D HSP projection showing common soil contaminants (PAHs, BTEX, chlorinated solvents) with their sol...
  - **title**: Perovskite Solvent Classification Map | **description**: 3D HSP plot showing the MAPbI3/FAPbI3 precursor solubility sphere with solvents classified as good s...
  - **title**: Anti-Solvent Dripping Process Schematic with HSP Rationale | **description**: Combined schematic and HSP diagram showing the anti-solvent dripping step in perovskite film deposit...
  - **title**: UV-Curable Ink Monomer-Pigment-Oligomer Compatibility Triangle | **description**: HSP space diagram showing the three-way compatibility requirement for UV ink formulation: monomer mu...
  - **title**: PCM Encapsulation Shell-Core HSP Incompatibility Diagram | **description**: HSP plot showing the PCM core material (paraffin) with shell polymer candidates positioned to illust...
  - **title**: PCM Leakage Rate vs Shell-Core Ra Correlation | **description**: Scatter plot of experimentally measured PCM leakage rate (% mass loss per 100 cycles) vs Ra between ...
  - **title**: Cleaning Efficiency vs RED for Different Soil Types | **description**: Multi-panel plot showing cleaning efficiency (% soil removed) vs RED for grease soils, particulate s...

### Tables Needed

  - **title**: HSP Values for Common Industrial Soils | **description**: Table of deltaD, deltaP, deltaH for typical soils: mineral oil, machining oil, grease, photoresist r...
  - **title**: Cleaning Solvent HSP and RED Matrix for Industrial Soils | **description**: Matrix of RED values between common cleaning solvents (d-limonene, NMP, DMSO, isopropanol, hydrocarb...
  - **title**: Soil Contaminant HSP Values and Extraction Solvent Compatibility | **description**: Table listing common soil contaminants (benzene, toluene, naphthalene, pyrene, TCE, PCBs) with HSP v...
  - **title**: Perovskite Precursor Solvent Classification Table | **description**: Table of common solvents (DMF, DMSO, NMP, GBL, 2-ME, chlorobenzene, toluene, diethyl ether, ethyl ac...
  - **title**: UV-Curable Ink Monomer HSP and Compatibility Screening | **description**: Table of reactive diluent monomers (HDDA, TPGDA, IBOA, NVP, ACMO, ODA, DPGDA) with HSP values, visco...
  - **title**: PCM Core Materials and Shell Polymer RED Matrix | **description**: Matrix of RED values between PCM materials (n-octadecane, paraffin RT28, stearic acid, PEG 600) and ...
  - **title**: Environmental and Safety Comparison of Remediation Solvents | **description**: Table comparing extraction solvents for soil remediation by HSP compatibility, biodegradability, tox...

### Software Demo

  - **tab**: Cleaning Product Formulation tab, Soil Contaminant Extraction tab, Perovskite Solvent Engineering tab, UV-Curable Ink Monomer tab, and PCM Encapsulation tab
  - **inputs**: In the Cleaning Product Formulation tab, select a target soil type from the database and choose candidate cleaning solvents. In Soil Contaminant Extraction, enter contaminant HSP and select green solvent candidates. In Perovskite Solvent Engineering, select perovskite type (MAPbI3, FAPbI3, CsPbI3) and screen solvents for good/anti-solvent classification. In UV-Curable Ink Monomer, enter pigment and oligomer HSP and screen monomer candidates. In PCM Encapsulation, select PCM type and shell polymer candidates.
  - **expected_output**: The Cleaning tab displays RED rankings and cleaning efficiency predictions for each solvent-soil pair. The Soil Contaminant tab shows extraction efficiency estimates with green chemistry scores. The Perovskite tab shows a color-coded solvent map with good/marginal/anti-solvent classifications. The UV Ink tab shows a dual-compatibility matrix (pigment and oligomer RED). The PCM tab shows shell-core RED values with leakage risk ratings.
  - **workflow**: 1. Open Cleaning Product Formulation, select machining oil as target soil, and screen d-limonene, NMP, and isopropanol for RED. 2. Switch to Soil Contaminant Extraction, enter naphthalene contaminant HSP, and compare ethyl lactate vs d-limonene extraction efficiency. 3. Open Perovskite Solvent Engineering, select MAPbI3, and classify DMF, DMSO, chlorobenzene, toluene, and diethyl ether. 4. Open UV-Curable Ink Monomer, enter carbon black pigment HSP and urethane acrylate oligomer HSP, and screen IBOA, HDDA, and NVP. 5. Open PCM Encapsulation, select n-octadecane PCM and compare melamine-formaldehyde, polyurea, and PMMA shells for leakage risk.

### Review Questions

  - Explain how HSP matching between a cleaning solvent and a target soil predicts cleaning efficiency. What additional factors beyond RED must be considered for practical cleaning product formulation (e.g., substrate compatibility, environmental regulations)?
  - Compare the HSP requirements for a good solvent versus an anti-solvent in perovskite film deposition. Why must the anti-solvent simultaneously satisfy RED >> 1 relative to the precursor and RED < 1 relative to the processing solvent?
  - Discuss the inverse compatibility requirement in PCM encapsulation design. Why should the shell polymer be HSP-incompatible with the molten PCM, and how does this differ from typical polymer-solvent compatibility problems?
  - For UV-curable ink monomer selection, a reactive diluent must satisfy dual compatibility: with the pigment for dispersion stability and with the oligomer for miscibility. Describe how HSP analysis handles this multi-constraint optimization problem.
  - In soil contamination remediation, explain the trade-off between extraction efficiency (low RED to contaminant) and environmental acceptability. How can green solvent screening integrate HSP compatibility with toxicity and biodegradability criteria?


---
# Part V: 先端手法と実践 (Advanced Methods & Practice)

## Chapter 16: Solvent Selection and Optimization
**溶媒選定と最適化**

**Level:** chapter

**Parent:** Part V: Advanced Methods

**Synopsis:** This chapter presents systematic computational methods for solvent selection and optimization using Hansen Solubility Parameters. It covers solvent screening and filtering by HSP distance, green solvent substitution under REACH regulations using composite Ra-safety scoring, binary/ternary blend optimization via grid search, multicomponent (4+) blend optimization using differential evolution, and multi-objective optimization that balances HSP compatibility with physical properties and safety constraints through weighted scoring and Pareto-optimal analysis.

### Key Concepts

  - Solvent screening by RED ranking: sorting candidate solvents by Ra distance to a target material's HSP center
  - Physical property filtering: constraining solvent candidates by boiling point, viscosity, and surface tension thresholds
  - Green solvent substitution: replacing regulated solvents with REACH/CHEM21-compliant alternatives ranked by Ra distance
  - Composite substitution score: weighted combination of HSP distance, environmental score, and health score (0.6*Ra/10 + 0.2*(1-env/10) + 0.2*(1-health/10))
  - Safety rating classification: recommended, acceptable, problematic, hazardous, and banned categories based on CHEM21 guidelines
  - Linear blend HSP mixing rule: volume-fraction-weighted average of component HSP values (deltaD_blend = sum(phi_i * deltaD_i))
  - Grid search blend optimization: exhaustive enumeration of 2- and 3-component blends at fixed step size to minimize Ra
  - Differential evolution (DE/rand/1/bin) for multicomponent optimization: mutation, crossover, and greedy selection in fraction space
  - Fraction normalization: projecting unconstrained DE trial vectors onto the simplex (sum=1, non-negative) constraint
  - Multi-objective solvent screening: simultaneous optimization of HSP match, boiling point, viscosity, surface tension, and safety
  - Weighted scoring function: converting heterogeneous objectives into a single composite score with user-adjustable weights
  - Pareto optimality concept: identifying non-dominated solvent solutions in multi-dimensional objective space
  - Solvent database architecture: CAS-number-keyed safety lookup with environmental and health scores on 1-10 scales
  - Combinatorial explosion management: transitioning from grid search (2-3 components) to metaheuristic algorithms (4+ components)

### Equations

  - **name**: HSP distance (Ra) for solvent screening | **latex**: Ra = \sqrt{4(\delta_{D,target} - \delta_{D,solvent})^2 + (\delta_{P,target} - \delta_{P,solvent})^2 ... | **explanation**: Hansen distance between target material and candidate solvent; used as primary ranking criterion in ...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{Ra}{R_0} | **explanation**: Dimensionless ratio of Ra to interaction radius; RED < 1 indicates the solvent lies within the targe...
  - **name**: Linear HSP mixing rule for blends | **latex**: \delta_{k,blend} = \sum_{i=1}^{n} \phi_i \, \delta_{k,i} \quad (k = D, P, H) | **explanation**: Volume-fraction-weighted linear combination of component HSP values; valid assumption for ideal mixi...
  - **name**: Green substitution composite score | **latex**: S_{overall} = 0.6 \cdot \frac{Ra}{10} + 0.2 \cdot \left(1 - \frac{S_{env}}{10}\right) + 0.2 \cdot \l... | **explanation**: Weighted composite score combining HSP proximity (60%) with environmental penalty (20%) and health p...
  - **name**: Differential evolution mutation (DE/rand/1) | **latex**: \mathbf{v}_i = \mathbf{x}_{r_1} + F \cdot (\mathbf{x}_{r_2} - \mathbf{x}_{r_3}) | **explanation**: Mutation vector formed by adding a scaled difference of two random population members to a third; F ...
  - **name**: Differential evolution binomial crossover | **latex**: u_{i,j} = \begin{cases} v_{i,j} & \text{if } rand_j < CR \text{ or } j = j_{rand} \\ x_{i,j} & \text... | **explanation**: Trial vector formed by mixing mutant and parent components; CR is crossover rate, j_rand ensures at ...
  - **name**: Simplex normalization (fraction constraint) | **latex**: \hat{\phi}_i = \frac{\max(\phi_i, 0)}{\sum_{k=1}^{n} \max(\phi_k, 0)} \quad \text{s.t.} \sum_{i=1}^{... | **explanation**: Projection of unconstrained DE vectors onto the probability simplex by clipping negatives and renorm...
  - **name**: Multi-objective weighted composite score | **latex**: S = w_{HSP} \cdot s_{HSP} + w_{bp} \cdot s_{bp} + w_{\eta} \cdot s_{\eta} + w_{\gamma} \cdot s_{\gam... | **explanation**: Linear scalarization of multiple objectives with user-adjustable weights; each sub-score is normaliz...
  - **name**: HSP match sub-score | **latex**: s_{HSP} = 1 - \min\left(\frac{RED}{3}, 1\right) | **explanation**: Converts RED to a 0-1 score where RED=0 gives 1.0 (perfect match) and RED>=3 gives 0.0 (no match)
  - **name**: Blend optimization objective function | **latex**: \min_{\boldsymbol{\phi}} Ra\left(\sum_{i=1}^{n} \phi_i \boldsymbol{\delta}_i, \boldsymbol{\delta}_{t... | **explanation**: Constrained optimization problem: find volume fractions that minimize the HSP distance between the b...

**Historical Context:** Solvent selection using solubility parameters originated with Hildebrand's single-parameter approach in the 1950s-1960s and was dramatically improved by Hansen's three-parameter decomposition (1967). Early solvent selection was largely empirical and based on technician experience. The first systematic computational approaches to HSP-based solvent screening appeared in the 1980s with the development of solvent databases by Hansen and collaborators at the Scandinavian Paint and Printing Ink Research Institute. The concept of green solvent substitution gained momentum in the 2000s with the EU REACH regulation (2006), which restricted many traditional solvents. The CHEM21 guide (Prat et al., 2016) provided a systematic solvent selection framework combining safety, health, and environmental criteria. Blend optimization using grid search was implemented in the HSPiP software (Abbott and Hansen, 2008+). Differential evolution, introduced by Storn and Price (1997), became a standard metaheuristic for continuous optimization problems and was applied to solvent blend design for multicomponent systems. Multi-objective optimization in solvent selection, combining HSP with multiple physical and regulatory constraints, represents the current frontier, drawing on Pareto optimization concepts from Deb et al. (2002) NSGA-II and weighted scalarization methods.

### Related Project Modules

  - solvent-finder.ts
  - solvent-substitution-design.ts
  - green-solvent.ts
  - blend-optimizer.ts
  - multicomponent-optimizer.ts
  - multi-objective.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch04_HSP_Estimation_Methods

### Learning Objectives

  - Screen and rank candidate solvents using Ra and RED criteria with physical property constraints (boiling point, viscosity, surface tension)
  - Apply green solvent substitution methodology to replace REACH-regulated solvents using composite scores that balance HSP proximity with environmental and health safety
  - Optimize binary and ternary solvent blends via grid search to minimize Ra distance to a target HSP, understanding the trade-off between step size and computational cost
  - Implement differential evolution (DE/rand/1/bin) for multicomponent (4+) blend optimization, including simplex normalization of fraction vectors
  - Construct multi-objective solvent selection frameworks with adjustable weights for HSP match, physical properties, safety, and cost, and interpret Pareto-optimal solution sets

### Practical Applications

  - Rapid solvent screening for polymer dissolution: identifying the best solvents from databases of hundreds of candidates using RED ranking
  - REACH-compliant solvent replacement: finding drop-in green alternatives for banned or restricted solvents (e.g., replacing NMP, DMF, or DCM) in industrial processes
  - Coating formulation: optimizing solvent blends to match target resin HSP while meeting evaporation rate and viscosity requirements
  - Pharmaceutical process development: selecting solvent systems for API crystallization, extraction, and purification that balance solubility with safety and environmental constraints
  - Ink and adhesive formulation: designing multicomponent solvent blends that achieve target HSP with controlled drying profiles
  - Nanoparticle dispersion media selection: screening solvents for stable nanoparticle dispersions using RED thresholds combined with surface tension constraints
  - Regulatory compliance planning: proactively identifying substitutes before upcoming REACH restrictions take effect, using composite Ra-safety scoring
  - Cost-optimized formulation: multi-objective screening that includes solvent cost alongside HSP and safety to minimize formulation expense

### Worked Examples

  - **title**: Solvent screening for a nanoparticle dispersion system | **description**: Given a carbon nanotube with HSP (deltaD=17.8, deltaP=7.0, deltaH=7.6, R0=5.0), screen 30 candidate ...
  - **title**: Green solvent substitution for NMP in polymer processing | **description**: NMP (CAS 872-50-4, HSP: deltaD=18.0, deltaP=12.3, deltaH=7.2) is a REACH substance of very high conc...
  - **title**: Ternary blend optimization for an epoxy resin target | **description**: An epoxy resin requires a solvent blend matching HSP (deltaD=20.0, deltaP=12.0, deltaH=10.0). From 6...
  - **title**: Multi-objective solvent selection for pharmaceutical crystallization | **description**: Select solvents for an API crystallization where the target HSP is (deltaD=18.5, deltaP=10.0, deltaH...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapters 1-2 and Appendix: ...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2013 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 4th Edition, www.hansen-solubility.com
  - **author**: Storn, R.; Price, K. | **year**: 1997 | **title**: Differential Evolution - A Simple and Efficient Heuristic for Global Optimization over Continuous Sp...
  - **author**: Prat, D.; Wells, A.; Hayler, J.; Sneddon, H.; McElroy, C.R.; Abou-Shehada, S.; Dunn, P.J. | **year**: 2016 | **title**: CHEM21 Selection Guide of Classical- and Less Classical-Solvents, Green Chemistry, 18, 288-296
  - **author**: Byrne, F.P.; Jin, S.; Paggiola, G.; Petchey, T.H.M.; Clark, J.H.; Farmer, T.J.; Hunt, A.J.; McElroy,... | **year**: 2016 | **title**: Tools and Techniques for Solvent Selection: Green Solvent Selection Guides, Sustainable Chemical Pro...
  - **author**: Deb, K.; Pratap, A.; Agarwal, S.; Meyarivan, T. | **year**: 2002 | **title**: A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II, IEEE Transactions on Evolutionary Comp...
  - **author**: European Chemicals Agency (ECHA) | **year**: 2006 | **title**: REACH Regulation (EC) No 1907/2006 on Registration, Evaluation, Authorisation and Restriction of Che...
  - **author**: Jessop, P.G. | **year**: 2011 | **title**: Searching for Green Solvents, Green Chemistry, 13, 1391-1398
  - **author**: Alfonsi, K.; Colberg, J.; Dunn, P.J.; Fevig, T.; Jennings, S.; Johnson, T.A.; Kleine, H.P.; Knight, ... | **year**: 2008 | **title**: Green Chemistry Tools to Influence a Medicinal Chemistry and Research Chemistry Based Organisation, ...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch04_HSP_Estimation_Methods
  - Ch07_Polymer_Solubility_Swelling
  - Ch11_Nanomaterials_Dispersion
  - Ch12_Coatings_Films

**Difficulty Level:** graduate

### Figures Needed

  - **title**: Solvent Screening Workflow Diagram | **description**: Flowchart showing the sequential pipeline: database query -> RED calculation -> physical property fi...
  - **title**: RED-Ranked Solvent Bar Chart | **description**: Horizontal bar chart showing 20+ candidate solvents sorted by RED value with color coding (green for...
  - **title**: Green Solvent Substitution Score Scatter Plot | **description**: 2D scatter plot with Ra distance on x-axis and safety score on y-axis, showing candidate solvents as...
  - **title**: REACH Regulation Impact on Solvent Selection | **description**: Before/after comparison showing HSP space with restricted solvents grayed out and green alternatives...
  - **title**: Grid Search Blend Optimization: 2-Component Ternary Diagram | **description**: Contour plot of Ra as a function of volume fraction for a 2-component blend, showing the grid points...
  - **title**: Grid Search Blend Optimization: 3-Component Ternary Diagram | **description**: Ternary contour plot (triangular coordinates) of Ra for a 3-component blend showing the optimal comp...
  - **title**: Differential Evolution Convergence Plot | **description**: Plot of best Ra vs iteration number for the DE/rand/1/bin algorithm on a 6-component blend problem, ...
  - **title**: Multicomponent Blend Composition Pie Charts | **description**: Series of pie charts showing the optimal blend composition for 2, 3, 4, and 6 component optimization...
  - **title**: Multi-Objective Radar Chart | **description**: Radar (spider) charts comparing the top 5 solvents across 6 objectives (HSP match, boiling point, vi...
  - **title**: Pareto Front in HSP-Safety Objective Space | **description**: 2D plot with composite HSP score on x-axis and safety score on y-axis, showing the Pareto front conn...
  - **title**: Weight Sensitivity Analysis Heat Map | **description**: Heat map showing how the top-ranked solvent changes as the HSP weight and safety weight are varied f...

### Tables Needed

  - **title**: Solvent Screening Results for a Representative Target Material | **description**: Table showing 15-20 solvents with columns: name, CAS number, deltaD, deltaP, deltaH, Ra, RED, boilin...
  - **title**: CHEM21 Green Solvent Safety Database Extract | **description**: Table of 30 common solvents with CAS number, safety rating (recommended/acceptable/problematic/hazar...
  - **title**: Green Substitution Candidates for NMP, DMF, and DCM | **description**: Table showing top 5 green alternatives for each restricted solvent, with Ra, environmental score, he...
  - **title**: Grid Search Blend Optimization Results (2-Component) | **description**: Table of top 10 binary blend results with component names, volume fractions, blend HSP values, and R...
  - **title**: Grid Search Blend Optimization Results (3-Component) | **description**: Table of top 10 ternary blend results with component names, volume fractions, blend HSP values, and ...
  - **title**: Differential Evolution Parameters and Performance | **description**: Table comparing DE optimization runs with different parameters (F, CR, population size, max iteratio...
  - **title**: Multi-Objective Screening Results with Default Weights | **description**: Table of top 10 solvents with sub-scores for each objective (HSP match, boiling point, viscosity, su...
  - **title**: Weight Sensitivity Comparison | **description**: Table showing the top 3 solvents under four different weight configurations (HSP-heavy, safety-heavy...

### Software Demo

  - **tab**: Solvent Screening (溶媒スクリーニング) tab, Green Solvent Substitution (グリーン溶媒代替) tab, Blend Optimization (ブレンド最適化) tab, and Multi-Objective Screening (多目的スクリーニング) tab
  - **inputs**: In the Solvent Screening tab, enter target material HSP (deltaD, deltaP, deltaH) and R0, then set physical property constraints (boiling point range, max viscosity, max surface tension). In the Green Solvent Substitution tab, enter the banned solvent's HSP and optionally its CAS number, set maxRa and onlyGreen filters. In the Blend Optimization tab, enter target HSP, select 4-8 candidate solvents, choose max components (2 or 3) and step size. In the Multi-Objective Screening tab, enter target HSP and R0, set physical property targets, and adjust the 6 objective weights using sliders.
  - **expected_output**: The Solvent Screening tab displays a ranked table of solvents sorted by RED with pass/fail indicators for each constraint. The Green Substitution tab shows ranked alternatives with Ra, safety rating, composite score, and color-coded safety badges. The Blend Optimization tab shows the top N blends with compositions, blend HSP, and Ra, plus a ternary diagram visualization. The Multi-Objective tab shows a radar chart for top candidates and a ranked table with sub-scores and overall score.
  - **workflow**: 1. Open Solvent Screening, enter a polymer HSP target, and observe the RED-ranked list. Apply a boiling point filter and see how the ranking changes. 2. Switch to Green Substitution, enter NMP's HSP, and view recommended alternatives sorted by composite score. Toggle the 'onlyGreen' filter. 3. Open Blend Optimization, enter an epoxy resin target HSP, select 6 solvents, and run a 3-component grid search at step size 0.05. Compare the best blend Ra with single-solvent Ra. 4. Open Multi-Objective Screening, enter the same target, adjust the safety weight upward, and observe how the ranking shifts toward greener solvents.

### Review Questions

  - Explain the difference between Ra-based ranking and RED-based ranking in solvent screening. Under what circumstances would the two methods produce different rankings, and which is more appropriate for comparing solvents against different target materials?
  - The green substitution composite score uses weights of 0.6 for Ra, 0.2 for environmental, and 0.2 for health. Discuss how changing these weights would affect the substitution recommendations, and propose a scenario where safety should be weighted more heavily than HSP proximity.
  - Why does the grid search approach for blend optimization become impractical for 4+ components? Calculate the number of grid points required for a 5-component blend at step size 0.05 and compare with the 50*dim population size used in differential evolution.
  - Describe the DE/rand/1/bin algorithm steps (mutation, crossover, selection) and explain why simplex normalization is needed after mutation. What would happen if negative fractions were not clipped?
  - In multi-objective solvent selection, explain the concept of Pareto optimality. Why might a decision-maker prefer a Pareto-dominated solution over a Pareto-optimal one in practical formulation work?


## Chapter 17: Visualization and Analysis of HSP Space
**HSP空間の可視化と解析**

**Level:** chapter

**Parent:** Part V: Advanced Methods

**Synopsis:** This chapter covers the visualization methods used to represent Hansen Solubility Parameter data in two and three dimensions. It presents 3D scatter plots with Hansen sphere wireframes for direct spatial analysis, Teas plots using ternary (fd-fp-fh) fractional coordinates for simplified group comparison, Bagley plots that reduce HSP to a 2D deltaV-deltaH representation, and three orthogonal 2D projection planes (deltaD-deltaP, deltaP-deltaH, deltaD-deltaH) with interaction circles. The chapter emphasizes how each visualization method highlights different aspects of solubility data and supports formulation decision-making.

### Key Concepts

  - 3D Hansen space: three-dimensional coordinate system with axes deltaD (dispersion), deltaP (polar), and deltaH (hydrogen bonding)
  - Hansen solubility sphere: a sphere in 3D HSP space centered on a material's HSP with radius R0 defining the boundary between good and poor solvents
  - Wireframe sphere generation: discretizing a sphere surface using latitude-longitude (phi-theta) parametrization at a configurable resolution
  - RED-to-color mapping: continuous color gradient from green (RED<0.5, good solvent) through yellow (RED=1.0, borderline) to red (RED>1.5, poor solvent) for data point visualization
  - Teas fractional coordinates: normalizing HSP components to dimensionless fractions fd=deltaD/(deltaD+deltaP+deltaH), fp=deltaP/(deltaD+deltaP+deltaH), fh=deltaH/(deltaD+deltaP+deltaH) that sum to unity
  - Ternary (triangular) plot: equilateral triangle representation where each vertex corresponds to a pure component fraction (fd, fp, or fh), enabling visual clustering of similar materials
  - Cartesian conversion from ternary coordinates: mapping (fd, fp, fh) to 2D (x, y) using the equilateral triangle geometry x=fp+fh/2, y=fh*sqrt(3)/2
  - Bagley plot: 2D reduction of HSP space using deltaV=sqrt(deltaD^2+deltaP^2) as the combined volume solubility parameter plotted against deltaH
  - Orthogonal 2D projections: three complementary views (deltaD-deltaP, deltaP-deltaH, deltaD-deltaH) obtained by projecting 3D HSP data onto coordinate planes
  - Interaction circles in 2D projections: circular regions of radius R0 centered on material HSP coordinates in each projection plane, representing the cross-section of the solubility sphere
  - Data interpretation heuristics: using visual proximity, cluster separation, and sphere overlap to guide solvent selection and formulation decisions
  - Complementary visualization strategy: combining multiple plot types to overcome information loss inherent in any single dimensional reduction

### Equations

  - **name**: Hansen distance (Ra) | **latex**: Ra = \sqrt{4(\delta_{D1} - \delta_{D2})^2 + (\delta_{P1} - \delta_{P2})^2 + (\delta_{H1} - \delta_{H... | **explanation**: Distance metric in HSP space with the factor of 4 on the dispersion term; determines whether a point...
  - **name**: Relative Energy Difference (RED) | **latex**: RED = \frac{Ra}{R_0} | **explanation**: Dimensionless ratio used for color-coded visualization; RED<1 indicates compatibility (inside sphere...
  - **name**: Teas fractional coordinates | **latex**: f_d = \frac{\delta_D}{\delta_D + \delta_P + \delta_H}, \quad f_p = \frac{\delta_P}{\delta_D + \delta... | **explanation**: Dimensionless fractional parameters that map 3D HSP values onto a ternary diagram; they satisfy fd+f...
  - **name**: Ternary to Cartesian coordinate transformation | **latex**: x = f_p + \frac{f_h}{2}, \quad y = f_h \cdot \frac{\sqrt{3}}{2} | **explanation**: Maps ternary (fd, fp, fh) coordinates to 2D Cartesian (x, y) for plotting on an equilateral triangle...
  - **name**: Bagley volume solubility parameter | **latex**: \delta_V = \sqrt{\delta_D^2 + \delta_P^2} | **explanation**: Combined dispersion and polar contribution used as one axis in the Bagley plot; reduces three HSP di...
  - **name**: Sphere surface parametrization | **latex**: \begin{cases} x = c_x + R_0 \sin\phi \cos\theta \\ y = c_y + R_0 \sin\phi \sin\theta \\ z = c_z + R_... | **explanation**: Parametric equations for generating wireframe vertices of the Hansen sphere at center (cx, cy, cz) w...
  - **name**: RED-to-color gradient function | **latex**: \text{color}(RED) = \begin{cases} \text{rgb}(255 \cdot t, 200, 50) & t \leq 1 \\ \text{rgb}(255, 200... | **explanation**: Piecewise linear color mapping: green at RED=0, yellow at RED=1, red at RED=2; provides intuitive vi...

**Historical Context:** The visualization of solubility parameter data has evolved alongside Hansen's three-component framework. Charles M. Hansen introduced the 3D solubility sphere concept in his 1967 doctoral thesis at the Danish Technical University, representing materials as points and solubility regions as spheres in (deltaD, deltaP, deltaH) space. Jean P. Teas proposed the ternary fractional coordinate system in 1968, simplifying HSP visualization into a triangular diagram that became popular in the coatings industry for quick visual comparisons. E.B. Bagley introduced the deltaV-deltaH two-dimensional representation in 1971, combining the dispersion and polar components into a single volume parameter to enable straightforward 2D plotting. The 2D orthogonal projection approach (three coordinate plane views) emerged as a practical compromise in the 1980s-1990s when computer graphics capabilities were limited. The HSPiP software (Abbott and Hansen, 2008+) popularized interactive 3D visualization with rotatable sphere displays. Modern implementations use WebGL-based 3D rendering (e.g., Plotly.js, Three.js) and SVG-based 2D plots to provide real-time interactive exploration of HSP space in browser environments.

### Related Project Modules

  - hsp-visualization.ts
  - teas-plot.ts
  - bagley-plot.ts
  - projection-2d.ts
  - sphere-fitting.ts
  - hsp.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations

### Learning Objectives

  - Construct and interpret 3D scatter plots with Hansen solubility spheres, understanding the significance of the 4:1:1 weighting in the Ra distance formula for sphere geometry
  - Convert HSP values to Teas fractional coordinates and plot them on a ternary diagram, using cluster positions to identify material families
  - Apply the Bagley deltaV-deltaH reduction to visualize solvent-material compatibility in two dimensions and understand what information is lost compared to the full 3D representation
  - Generate and interpret three orthogonal 2D projection planes (deltaD-deltaP, deltaP-deltaH, deltaD-deltaH) with interaction circles to assess compatibility from multiple viewpoints
  - Select the appropriate visualization method based on the analysis goal: 3D for complete spatial relationships, Teas for group comparison, Bagley for quick 2D screening, projections for detailed pairwise parameter analysis

### Practical Applications

  - Coating formulation: using Teas plots to visually group solvents and resins and identify compatible blending candidates in the coatings industry
  - Polymer dissolution screening: 3D sphere visualization to determine which solvents fall inside the polymer's solubility sphere and predict dissolution behavior
  - Quality control in paint manufacturing: Bagley plots for rapid 2D assessment of incoming solvent batches against specification regions
  - Adhesive design: 2D projection views to systematically evaluate how changes in deltaP or deltaH independently affect adhesive-substrate compatibility
  - Pharmaceutical excipient selection: ternary Teas diagrams to compare drug substance and excipient HSP clusters for formulation optimization
  - Technical presentations and reports: selecting the most informative visualization type for communicating HSP analysis results to different audiences (R&D, production, management)
  - Solvent substitution visual analysis: overlaying candidate replacement solvents on existing Teas or Bagley plots to visually assess proximity to the original solvent

### Worked Examples

  - **title**: 3D Hansen sphere visualization for an epoxy resin system | **description**: Given an epoxy resin with HSP (deltaD=20.0, deltaP=12.0, deltaH=10.0, R0=8.0) and 15 candidate solve...
  - **title**: Teas ternary plot comparison of polymer families | **description**: Calculate Teas fractional coordinates for 10 common polymers (polyethylene, PVC, PMMA, nylon-6, PET,...
  - **title**: Bagley plot for solvent screening in a nanoparticle dispersion | **description**: For a carbon nanotube (HSP: deltaD=17.8, deltaP=7.0, deltaH=7.6), compute deltaV for 12 candidate so...
  - **title**: Three-plane orthogonal projection analysis | **description**: For a PMMA-based coating (HSP: deltaD=18.6, deltaP=10.5, deltaH=7.5, R0=5.5) and 8 solvents, generat...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press, Chapter 1: Solubility Param...
  - **author**: Abbott, S.; Hansen, C.M. | **year**: 2013 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 4th Edition, www.hansen-solubility.com, Chapters o...
  - **author**: Teas, J.P. | **year**: 1968 | **title**: Graphic Analysis of Resin Solubilities, Journal of Paint Technology, 40(516), 19-25
  - **author**: Bagley, E.B.; Nelson, T.P.; Scigliano, J.M. | **year**: 1971 | **title**: Three-Dimensional Solubility Parameters and Their Relationship to Internal Pressure Measurements in ...
  - **author**: Barton, A.F.M. | **year**: 1991 | **title**: CRC Handbook of Solubility Parameters and Other Cohesion Parameters, 2nd Edition, CRC Press
  - **author**: Burke, J. | **year**: 1984 | **title**: Solubility Parameters: Theory and Application, AIC Book and Paper Group Annual, 3, 13-58
  - **author**: Van Krevelen, D.W.; te Nijenhuis, K. | **year**: 2009 | **title**: Properties of Polymers, 4th Edition, Elsevier, Chapter 7: Cohesive Properties and Solubility
  - **author**: Hansen, C.M.; Abbott, S. | **year**: 2009 | **title**: Hansen Solubility Parameters: Comparing and Progressing, Journal of Coatings Technology and Research...

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch02_Thermodynamic_Foundations
  - Ch04_HSP_Estimation_Methods
  - Ch07_Polymer_Solubility_Swelling
  - Ch12_Coatings_Films
  - Ch16_Solvent_Selection_Optimization

**Difficulty Level:** undergraduate

### Figures Needed

  - **title**: 3D Hansen Space Scatter Plot with Solubility Sphere | **description**: Interactive 3D scatter plot showing solvent data points colored by RED value (green-yellow-red gradi...
  - **title**: Sphere Wireframe Generation Diagram | **description**: Illustration of the latitude-longitude parametrization (phi, theta) used to generate sphere surface ...
  - **title**: RED-to-Color Gradient Scale | **description**: Color bar showing the continuous mapping from RED=0 (green) through RED=1 (yellow) to RED=2 (red), w...
  - **title**: Teas Ternary Plot with Solvent and Polymer Clusters | **description**: Equilateral triangle plot with vertices labeled fd, fp, fh showing solvent data points as circles an...
  - **title**: Ternary Coordinate System Geometry | **description**: Geometric construction diagram showing the mapping from (fd, fp, fh) ternary coordinates to (x, y) C...
  - **title**: Bagley Plot (deltaV vs deltaH) | **description**: 2D scatter plot with deltaV on the x-axis and deltaH on the y-axis, showing solvents as circles and ...
  - **title**: Three Orthogonal 2D Projection Panels | **description**: Side-by-side panel of three 2D plots (deltaD-deltaP, deltaP-deltaH, deltaD-deltaH) each showing the ...
  - **title**: Comparison of Four Visualization Methods | **description**: Four-panel figure showing the same 10-solvent dataset visualized as (a) 3D scatter with sphere, (b) ...
  - **title**: Information Loss in Dimensional Reduction | **description**: Schematic diagram showing how 3D HSP space information is reduced in each visualization method: Teas...

### Tables Needed

  - **title**: Comparison of HSP Visualization Methods | **description**: Summary table comparing 3D scatter, Teas plot, Bagley plot, and 2D projections across dimensions: nu...
  - **title**: Teas Fractional Coordinates for Common Solvents | **description**: Table of 15-20 common solvents with columns: name, deltaD, deltaP, deltaH, fd, fp, fh, Cartesian x, ...
  - **title**: Bagley Coordinates for Common Solvents | **description**: Table of 15-20 common solvents with columns: name, deltaD, deltaP, deltaH, deltaV, deltaH(Bagley), s...
  - **title**: Visualization Method Selection Guide | **description**: Decision matrix showing which visualization method to use based on analysis goal (screening, cluster...

### Software Demo

  - **tab**: 3D Visualization (3D可視化) tab, Teas Plot (Teasプロット) tab, Bagley Plot (Bagleyプロット) tab, and 2D Projection (2D射影) tab
  - **inputs**: In the 3D Visualization tab, select a target material (part) from the parts list and a set of solvents from the solvent database. The sphere is automatically generated from the part's HSP center and R0. In the Teas Plot tab, the same solvent and part selections are converted to ternary coordinates. In the Bagley Plot tab, deltaV is computed automatically from deltaD and deltaP for all selected materials. In the 2D Projection tab, all three orthogonal projection planes are generated simultaneously from the selected data.
  - **expected_output**: The 3D tab shows an interactive scatter plot with a wireframe sphere and color-coded solvent points (green/yellow/red by RED). The Teas tab shows an equilateral triangle with solvent and part markers positioned by (fd, fp, fh). The Bagley tab shows a 2D scatter of deltaV vs deltaH with solvent and part markers. The 2D Projection tab shows three side-by-side panels (deltaD-deltaP, deltaP-deltaH, deltaD-deltaH) with interaction circles around each part.
  - **workflow**: 1. Open the 3D Visualization tab, select a polymer target and 10+ solvents, rotate the sphere to identify spatial clustering of good solvents. 2. Switch to the Teas Plot tab with the same selection to see how the same data appears in ternary coordinates; note which solvents cluster near the target. 3. Open the Bagley Plot tab and observe the deltaV-deltaH distribution; compare rankings with the 3D view. 4. Finally, open the 2D Projection tab and examine all three orthogonal views; find a solvent that appears compatible in two views but incompatible in the third, demonstrating the value of multiple perspectives.

### Review Questions

  - Why does the Hansen distance formula use a factor of 4 on the dispersion term (deltaD), and how does this affect the shape of the solubility sphere when projected onto 2D planes? What would the sphere look like in 2D if the weighting were 1:1:1?
  - Teas fractional coordinates normalize HSP values so that fd+fp+fh=1. What information is lost in this normalization, and give an example of two materials that would occupy the same point on a Teas plot but have very different solubility behavior.
  - The Bagley plot combines deltaD and deltaP into a single deltaV parameter. Under what circumstances is this simplification most valid, and when might it lead to misleading conclusions about solvent compatibility?
  - A solvent appears inside the interaction circle in the deltaD-deltaP and deltaD-deltaH projection planes but outside the circle in the deltaP-deltaH plane. Is this solvent compatible with the target material? Explain your reasoning using the 3D geometry of the solubility sphere.
  - Compare the four visualization methods (3D scatter, Teas, Bagley, 2D projections) for presenting HSP data to a non-technical audience. Which would you recommend for a production quality control report and why?


## Chapter 18: Data Management and Quality Assurance: CSV Import, Database Design, and Report Generation
**データ管理と品質保証 — CSVインポート、データベース設計、レポート生成**

**Level:** chapter

**Parent:** Part V: Advanced Methods

**Synopsis:** This chapter covers the practical data infrastructure required for reliable HSP-based evaluations, including CSV import/export with validation, SQLite database design using the repository pattern for persistent storage of solvents, polymers, nanoparticles, drugs, and dispersants, and seed data management for over 200 curated material entries. It also addresses bookmark and evaluation history systems for reproducibility, accuracy warning mechanisms that alert users to known estimation limitations, input validation strategies, and PDF/CSV report generation for documenting evaluation results.

### Key Concepts

  - CSV import parsing with header mapping and row-level validation for solvents and parts
  - Input validation for HSP values (deltaD, deltaP, deltaH) and interaction radius R0
  - SQLite database with WAL journaling mode and foreign key constraints
  - Repository pattern separating data access interface from SQLite implementation
  - Database schema design for solvents, parts (polymers), nanoparticles, drugs, and dispersants
  - Seed data curation: approximately 130 solvents, 41 polymers (7 groups), 18 nanoparticles, 16 drugs, 12 dispersants
  - Bookmark system for saving and restoring evaluation parameters across 9 pipeline types
  - Evaluation history with serialized JSON storage and automatic pruning at 1000 entries
  - Accuracy warning system based on known systematic deviations from 147 literature validation tests
  - RED boundary warnings for results in the 0.8-1.2 ambiguous zone
  - Alcohol and polyol surface tension estimation bias alerts
  - Nanoparticle surface modification and quantum size effect warnings
  - BOM-prefixed UTF-8 CSV export for Excel compatibility
  - PDF report generation with pipeline-specific titles and disclaimer text
  - MD simulation CED-to-HSP import with consistency checking

### Equations

  - **name**: CED to HSP Conversion | **latex**: \delta_i = \sqrt{\text{CED}_i} | **explanation**: Converts cohesive energy density components from molecular dynamics simulations (in J/cm3 = MPa) dir...
  - **name**: CED Consistency Check | **latex**: \text{Consistency} = \left(1 - \frac{|\delta_{\text{total}} - \sqrt{\delta_D^2 + \delta_P^2 + \delta... | **explanation**: Measures the agreement between the total solubility parameter from total CED and the vector sum of t...
  - **name**: Volume Fraction Weighted HSP for Mixtures | **latex**: \delta_{\text{mix},i} = \sum_k \phi_k \, \delta_{k,i} | **explanation**: Linear mixing rule for calculating mixture HSP, used in CSV-imported solvent blend calculations.

**Historical Context:** Data management for HSP has evolved alongside the field itself. Charles Hansen's original 1967 work relied on hand-tabulated solvent parameters. The first comprehensive digital HSP database was published by Hansen and Beerbower in 1971, containing roughly 200 solvents. Abbott and Hansen later developed HSPiP (Hansen Solubility Parameters in Practice, first edition 2008), which established the modern standard for HSP databases with over 1200 solvents and introduced systematic CSV import/export workflows. The repository pattern used in database design follows Martin Fowler's Patterns of Enterprise Application Architecture (2002). Accuracy warning systems for HSP estimation draw on validation work by Belmares et al. (2004) for MD-based HSP and Nakamoto-Yamamoto equations for surface tension estimation. PDF reporting for chemical data management follows GLP (Good Laboratory Practice) documentation standards established by OECD in 1998.

### Related Project Modules

  - csv-import.ts
  - bookmark.ts
  - evaluation-history.ts
  - accuracy-warnings.ts
  - pdf-report.ts
  - report.ts
  - md-hsp-import.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch04_HSP_Estimation_Methods

### Learning Objectives

  - Design and implement a CSV import pipeline with row-level validation for HSP data including name, deltaD, deltaP, deltaH, and optional physical properties
  - Understand SQLite database schema design for multi-entity HSP data (solvents, polymers, nanoparticles, drugs, dispersants) with repository pattern abstraction
  - Implement accuracy warning systems that communicate known systematic biases to users, such as alcohol surface tension overestimation and RED boundary ambiguity
  - Build bookmark and evaluation history systems that enable reproducibility of HSP evaluations with JSON serialization
  - Generate structured reports (CSV with BOM-UTF8 for Excel, PDF with disclaimers) from evaluation results for documentation and regulatory compliance

### Practical Applications

  - Corporate solvent database management: importing and maintaining proprietary HSP data from laboratory measurements via CSV files
  - Quality assurance in materials selection: automated warnings when HSP predictions fall in unreliable regions (e.g., polyol surface tension, RED boundary zone)
  - Regulatory documentation: generating PDF reports with evaluation parameters, results, timestamps, and disclaimers for GLP/GMP compliance
  - Research reproducibility: bookmark system allowing colleagues to reproduce exact evaluation conditions by restoring saved parameters
  - Evaluation audit trail: history repository tracking all evaluations with automatic pruning for long-running production deployments
  - MD simulation integration: importing molecular dynamics CED results with automatic consistency validation against component decomposition
  - Multi-site data synchronization: SQLite WAL mode enabling concurrent read access for shared database deployments

### Worked Examples

  - **title**: CSV Import with Validation Error Handling | **description**: Import a CSV file containing 20 custom solvents with some intentionally malformed rows (missing delt...
  - **title**: Accuracy Warning Generation for Contact Angle Evaluation | **description**: Run a contact angle evaluation using ethanol (alcohol profile: deltaH=19.4, deltaP=8.8) against a hy...
  - **title**: MD Simulation CED Import and Consistency Check | **description**: Import CED components from an MD simulation of toluene (dispersionCED=324, polarCED=1.96, hbondCED=4...
  - **title**: Bookmark and History Workflow for Reproducible Evaluation | **description**: Create a bookmark for a nanoparticle dispersion evaluation, serialize the parameters to JSON, store ...

### Key References

  - **author**: Hansen, C. M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Abbott, S.; Hansen, C. M. | **year**: 2008 | **title**: Hansen Solubility Parameters in Practice (HSPiP), 1st Edition
  - **author**: Belmares, M.; Blanco, M.; Goddard, W. A. et al. | **year**: 2004 | **title**: Hildebrand and Hansen Solubility Parameters from Molecular Dynamics with Applications to Electronic ...
  - **author**: Fowler, M. | **year**: 2002 | **title**: Patterns of Enterprise Application Architecture, Addison-Wesley (Repository Pattern)
  - **author**: Gupta, J.; Nunes, C.; Vyas, S.; Jonnalagadda, S. | **year**: 2011 | **title**: Prediction of Solubility Parameters and Miscibility of Pharmaceutical Compounds by Molecular Dynamic...
  - **author**: OECD | **year**: 1998 | **title**: OECD Principles of Good Laboratory Practice (GLP), ENV/MC/CHEM(98)17
  - **author**: Hansen, C. M.; Beerbower, A. | **year**: 1971 | **title**: Solubility Parameters, in Kirk-Othmer Encyclopedia of Chemical Technology, Suppl. Vol., 2nd ed., pp....
  - **author**: Barton, A. F. M. | **year**: 1991 | **title**: CRC Handbook of Solubility Parameters and Other Cohesion Parameters, 2nd Edition, CRC Press

### Cross References

  - Ch01_HSP_Fundamentals
  - Ch04_HSP_Estimation_Methods
  - Ch05_Contact_Angle_Wettability
  - Ch11_Nanomaterials_Dispersion
  - Ch09_Pharmaceutical_Drug_Delivery
  - Ch16_Solvent_Selection_Optimization

**Difficulty Level:** graduate

**Estimated Pages:** 32

### Figures Needed

  - **title**: Database Entity-Relationship Diagram | **description**: ER diagram showing the SQLite schema with tables for solvents, parts/parts_groups, nano_particles, d...
  - **title**: CSV Import Validation Pipeline Flowchart | **description**: Flowchart showing the CSV parsing pipeline: file read, header extraction, row iteration, field-level...
  - **title**: Accuracy Warning Decision Tree | **description**: Decision tree diagram showing the conditional logic for generating accuracy warnings: alcohol profil...
  - **title**: Repository Pattern Architecture Diagram | **description**: UML-style class diagram showing the repository interfaces (PartsRepository, SolventRepository, NanoP...
  - **title**: Evaluation History and Bookmark Data Flow | **description**: Sequence diagram showing the data flow from user evaluation through serialization (JSON.stringify), ...
  - **title**: MD CED-to-HSP Import Validation Diagram | **description**: Diagram showing the CED component input, sqrt transformation to HSP values, consistency check betwee...

### Tables Needed

  - **title**: Seed Data Summary by Entity Type | **description**: Table listing all seed data categories with counts: solvents (~130 entries covering hydrocarbons, ar...
  - **title**: Accuracy Warning Thresholds and Magnitudes | **description**: Table of known systematic estimation biases: alcohol surface tension overestimation (max +13 mN/m), ...
  - **title**: CSV Column Mapping for Solvent and Part Import | **description**: Table showing required and optional CSV columns for solvent import (name, deltaD, deltaP, deltaH req...
  - **title**: Database Table Specifications | **description**: Summary table of all SQLite tables with column names, types, constraints, and default values: solven...
  - **title**: Pipeline Report Titles and Types | **description**: Table mapping pipeline identifiers to their Japanese report titles for PDF generation: risk (solubil...

### Software Demo

  - **tab**: Data Management (CSV Import / Bookmark / History)
  - **inputs**: 1. Prepare a CSV file with columns: name, deltaD, deltaP, deltaH, boilingPoint (e.g., 5 custom solvents with one row containing an empty name for error demonstration). 2. Import the CSV using the CSV Import function and observe validated rows vs. error messages. 3. Run a solubility risk evaluation with the imported solvents. 4. Save a bookmark of the evaluation parameters. 5. Check the evaluation history list.
  - **expected_output**: The CSV import should accept 4 valid rows and report 1 validation error for the empty-name row. The risk evaluation results should display with any applicable accuracy warnings (e.g., RED boundary warning if results fall in 0.8-1.2 range). The bookmark should appear in the bookmark list with the pipeline name and timestamp. The evaluation history should show the most recent evaluation with serialized parameters and results, confirming that evaluations are being tracked for reproducibility.

### Review Questions

  - Why does the CSV import module use row-level validation rather than rejecting the entire file when a single row has errors? What are the trade-offs of this approach for production HSP data management?
  - Explain the repository pattern as implemented in this system. How does separating the interface (PartsRepository, SolventRepository) from the SQLite implementation benefit testing and future database migration?
  - The accuracy warning system identifies alcohol profiles using deltaH > 14 and deltaP > 5. Discuss the physical basis for why Nakamoto-Yamamoto surface tension estimates systematically overestimate values for alcohols, and suggest how these thresholds could be refined.
  - The evaluation history repository enforces a maximum of 1000 entries with FIFO pruning. Discuss the implications for audit trail completeness in a regulatory (GLP/GMP) context, and propose alternative strategies that balance storage constraints with compliance requirements.
  - When importing MD simulation CED results, the consistency check flags cases where component CED sum deviates from total CED by more than 10%. What physical phenomena in molecular dynamics simulations could cause such inconsistencies, and how should users interpret warnings about low consistency?


## Chapter 19: Software Architecture and Design Principles for HSP Computation Tools
**ソフトウェアアーキテクチャと設計原則**

**Level:** chapter

**Parent:** Part V: Advanced Methods

**Synopsis:** This chapter presents the software architecture and design principles underlying a production-grade HSP evaluation tool built with Electron, React, and TypeScript. It covers the separation of pure-function domain logic (117 core modules) from infrastructure, the repository pattern for SQLite data access, Electron IPC communication design via contextBridge, and a comprehensive test-driven development methodology achieving 98.88% unit test coverage (2604 tests) with 295 E2E tests using Playwright.

### Key Concepts

  - Three-layer architecture: Main process (Electron), Renderer process (React), Core domain logic (pure TypeScript functions)
  - Pure function domain logic: 117 stateless modules in src/core/ with no side effects, enabling deterministic testing
  - Repository pattern: interface-based data access abstraction (PartsRepository, SolventRepository, SettingsRepository, NanoParticleRepository, DrugRepository, DispersantRepository)
  - SQLite persistence via better-sqlite3 with schema migration and seed data management
  - Electron IPC communication: ipcMain.handle/ipcRenderer.invoke pattern with contextBridge preload isolation
  - Type-driven design: TypeScript strict mode with comprehensive domain type definitions (HSPValues, Part, Solvent, RiskLevel, etc.)
  - Validation as pure functions: every input validated by composable validator functions returning error strings or null
  - React hooks architecture: custom hooks (80+ hooks) encapsulating IPC calls and state management per evaluation pipeline
  - Component-per-view pattern: each of 93+ evaluation tabs has a dedicated View component backed by a custom hook
  - Navigation system: category-based tab routing with 93 tabs organized into evaluation, screening, visualization, and data management categories
  - Test-driven development: 2604 unit/integration tests (Vitest) at 98.88% coverage plus 295 E2E tests (Playwright)
  - Seed data architecture: domain-specific seed modules for solvents, nanoparticles, drugs, coatings, plasticizers, carriers, and dispersants
  - Error boundary pattern: React ErrorBoundary components for graceful UI failure handling
  - Path alias configuration: @core/* and @db/* TypeScript path aliases for clean imports

### Equations

  - **name**: Cyclomatic Complexity | **latex**: M = E - N + 2P | **explanation**: McCabe cyclomatic complexity measuring the number of linearly independent paths through a program's ...
  - **name**: Code Coverage | **latex**: C = \frac{L_{executed}}{L_{total}} \times 100\% | **explanation**: Line coverage metric representing the percentage of source code lines exercised by the test suite. T...
  - **name**: Coupling Factor | **latex**: CF = \frac{\sum_{i} d_{out}(i)}{N(N-1)} | **explanation**: Ratio of actual module dependencies to maximum possible dependencies, measuring how tightly coupled ...

**Historical Context:** The architecture of scientific computing tools has evolved significantly since the 1990s. Early HSP software (e.g., Hansen's own HSPiP, first released ~2001) used monolithic desktop architectures. The Electron framework (GitHub, 2013) enabled cross-platform desktop apps using web technologies. React (Facebook, 2013) introduced component-based UI architecture. TypeScript (Microsoft, 2012) added static typing to JavaScript. The repository pattern originates from Eric Evans' Domain-Driven Design (2003) and Martin Fowler's Patterns of Enterprise Application Architecture (2002). Test-driven development was popularized by Kent Beck (2002). The combination of these patterns applied to scientific computation tools represents a modern approach to making domain-specific calculation software maintainable, testable, and extensible.

### Related Project Modules

  - hsp.ts
  - types.ts
  - validation.ts
  - risk.ts
  - mixture.ts
  - solvent-finder.ts
  - sphere-fitting.ts
  - group-contribution.ts
  - blend-optimizer.ts
  - dispersibility.ts
  - contact-angle.ts
  - report.ts
  - theme.ts
  - csv-import.ts
  - evaluation-history.ts
  - bookmark.ts
  - comparison.ts
  - accuracy-warnings.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch04_HSP_Estimation_Methods, Ch16_Solvent_Selection_Optimization

### Learning Objectives

  - Understand the three-layer Electron architecture separating main process, renderer process, and pure domain logic
  - Apply the repository pattern to decouple domain logic from database implementation details
  - Design pure-function modules for scientific calculations that are deterministic and independently testable
  - Implement secure IPC communication between Electron main and renderer processes using contextBridge
  - Establish comprehensive testing strategies combining unit tests, integration tests, and E2E tests for scientific software

### Practical Applications

  - Building maintainable desktop tools for chemical engineering calculations with Electron + React + TypeScript
  - Designing testable scientific computation libraries as pure-function modules without side effects
  - Implementing repository-pattern data access for materials databases with SQLite
  - Creating extensible evaluation pipelines where new HSP-based analyses can be added as independent modules
  - Applying test-driven development to ensure correctness of scientific calculations against literature values
  - Developing cross-platform desktop applications for laboratory and industrial HSP evaluation workflows
  - Scaling software architecture to support 90+ distinct evaluation pipelines without code duplication

### Worked Examples

  - **title**: Adding a New Evaluation Pipeline End-to-End | **description**: Walk through adding a complete new HSP evaluation feature: (1) create a pure-function core module wi...
  - **title**: Implementing the Repository Pattern for a New Entity | **description**: Demonstrate creating a new data entity: define the TypeScript interface in types.ts, create the repo...
  - **title**: Pure Function Design for Ra/RED Calculation | **description**: Analyze the hsp.ts module as a canonical example of pure-function design: calculateRa and calculateR...
  - **title**: Test Pyramid Strategy for Scientific Software | **description**: Demonstrate the test pyramid: unit tests for core calculation correctness (Vitest, 2604 tests), inte...

### Key References

  - **author**: Martin Fowler | **year**: 2002 | **title**: Patterns of Enterprise Application Architecture (Repository Pattern, Service Layer)
  - **author**: Eric Evans | **year**: 2003 | **title**: Domain-Driven Design: Tackling Complexity in the Heart of Software
  - **author**: Kent Beck | **year**: 2002 | **title**: Test Driven Development: By Example
  - **author**: Robert C. Martin | **year**: 2017 | **title**: Clean Architecture: A Craftsman's Guide to Software Structure and Design
  - **author**: Steve McConnell | **year**: 2004 | **title**: Code Complete: A Practical Handbook of Software Construction, 2nd Edition
  - **author**: Electron Contributors | **year**: 2013 | **title**: Electron Documentation: Process Model and Context Isolation (https://www.electronjs.org/docs)
  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition (CRC Press) - Chapter on HSPiP software...
  - **author**: Michael Feathers | **year**: 2004 | **title**: Working Effectively with Legacy Code

**Cross References:** Ch01_HSP_Fundamentals, Ch04_HSP_Estimation_Methods, Ch16_Solvent_Selection_Optimization

**Difficulty Level:** graduate

**Estimated Pages:** 35

### Figures Needed

  - **title**: Three-Layer Architecture Diagram | **description**: Block diagram showing the Electron main process (Node.js, SQLite, IPC handlers), renderer process (R...
  - **title**: IPC Communication Flow | **description**: Sequence diagram showing a complete evaluation request: User action in React View -> custom hook cal...
  - **title**: Repository Pattern Class Diagram | **description**: UML class diagram showing repository interfaces (PartsRepository, SolventRepository, etc.) and their...
  - **title**: Module Dependency Graph | **description**: Directed graph showing how 117 core modules depend on types.ts and hsp.ts as foundational modules, w...
  - **title**: Test Pyramid for Scientific Software | **description**: Pyramid diagram with three layers: bottom layer showing 2604 unit tests (Vitest) covering core calcu...
  - **title**: Navigation Architecture | **description**: Tree diagram showing the category-based navigation system: 93 tabs organized into categories (Evalua...

### Tables Needed

  - **title**: Source Code Module Statistics | **description**: Table listing each architectural layer with module counts and responsibilities: Core (117 .ts module...
  - **title**: Repository Interface Summary | **description**: Table of all repository interfaces with their entity types, CRUD methods, and specialized query meth...
  - **title**: Test Coverage Summary by Layer | **description**: Table showing test counts and coverage percentages broken down by architectural layer: core unit tes...
  - **title**: Technology Stack Overview | **description**: Table listing each technology with its role: Electron (desktop runtime), React (UI framework), TypeS...

### Software Demo

  - **tab**: All tabs (architecture overview)
  - **inputs**: Navigate through multiple tabs to observe the consistent architecture: (1) Open 'Solubility Evaluation' tab to see the core Ra/RED calculation pipeline, (2) Open 'Database' tab to see repository pattern in action with CRUD operations on solvents and parts, (3) Open 'Group Contribution' tab to see a pure-function estimation module, (4) Open 'Settings' tab to see threshold configuration persisted via repository pattern, (5) Open 'Evaluation History' tab to see cross-cutting bookmark and history features.
  - **expected_output**: Each tab demonstrates the same architectural pattern: a React View component backed by a custom hook that calls the IPC API, which delegates to a pure-function core module and repository for data access. The consistent behavior across 93 tabs validates the extensible architecture.

### Review Questions

  - Why is it important to implement HSP calculation functions (such as Ra and RED) as pure functions with no side effects, and how does this design decision impact testability and reliability?
  - Explain the role of the contextBridge preload script in Electron's security model. What would happen if the renderer process had direct access to Node.js APIs?
  - Compare the repository pattern used in this project (interface + SQLite implementation) with alternative data access patterns. What are the advantages when the underlying database technology might change?
  - The project achieves 98.88% code coverage with 2604 unit tests. Discuss the trade-offs between high coverage targets and development velocity in scientific software. When might 100% coverage be counterproductive?
  - Describe how a new evaluation pipeline (e.g., a novel polymer compatibility assessment) would be added to this architecture. Which files must be created or modified, and how does the modular design minimize the impact on existing code?


## Chapter 20: Future Directions in Hansen Solubility Parameter Research
**HSP研究の将来展望**

**Level:** chapter

**Parent:** Part V: Advanced Methods

**Synopsis:** This chapter surveys emerging frontiers in HSP research, including machine learning approaches for predicting HSP values from molecular structure, integration with molecular dynamics simulations for first-principles HSP derivation, quantum chemical methods for computing cohesive energy densities, and uncertainty quantification frameworks. It also examines trends toward cloud-based collaborative HSP databases, real-time experimental data integration, high-dimensional parameter space exploration beyond the classical three-component model, and the convergence of HSP methods with sustainability and green chemistry metrics.

### Key Concepts

  - Machine learning (ML) and QSPR models for HSP prediction: using molecular descriptors (logP, H-bond donor/acceptor counts, aromatic ring counts, molar volume) to train regression models that predict deltaD, deltaP, deltaH
  - Deep learning on molecular graphs: graph neural networks (GNN) that learn HSP directly from SMILES or molecular graph representations without hand-crafted descriptors
  - Molecular dynamics (MD) simulation of cohesive energy density: computing CED components (dispersion, polar, hydrogen bonding) from atomistic force fields and converting to HSP via delta_i = sqrt(CED_i)
  - Quantum chemical calculation of HSP: using DFT (density functional theory) and COSMO-RS solvation models to derive HSP from first-principles electronic structure calculations
  - Bootstrap uncertainty quantification: resampling solvent classification datasets to produce 95% confidence intervals on HSP center coordinates and interaction radius R0
  - High-dimensional solubility parameter spaces: extending beyond 3D HSP to include additional interaction terms (acid-base, pi-pi stacking, charge-transfer) as 4th and 5th parameters
  - Cloud-based collaborative HSP databases: web-accessible repositories with version control, provenance tracking, and community curation of experimental HSP values
  - Real-time experimental data integration: coupling automated solubility testing (high-throughput screening) with live HSP sphere fitting and model updating
  - Transfer learning for HSP prediction: pre-training ML models on large molecular property datasets and fine-tuning on smaller HSP-specific datasets
  - Active learning and Bayesian optimization: intelligently selecting the next experiment to maximize information gain about a material's HSP sphere
  - Sustainability index integration: combining HSP-based solvent selection with environmental, health, and safety (EHS) metrics, life-cycle assessment (LCA) scores, and REACH compliance data
  - Multi-fidelity modeling: hierarchically combining group contribution estimates, QSPR predictions, MD simulations, and experimental data with appropriate uncertainty weighting
  - Digital twin concept for formulations: continuously updated HSP models that reflect real-time process conditions (temperature, pressure, composition) in manufacturing

### Equations

  - **name**: CED-to-HSP conversion from MD simulation | **latex**: \delta_i = \sqrt{\frac{CED_i}{V_m}} \quad (i = D, P, H) | **explanation**: Converts cohesive energy density components obtained from molecular dynamics simulation into Hansen ...
  - **name**: QSPR regression model for HSP prediction | **latex**: \delta_k = \beta_0 + \sum_{j=1}^{p} \beta_j \, X_j + \epsilon \quad (k = D, P, H) | **explanation**: General linear QSPR model where X_j are molecular descriptors, beta_j are regression coefficients, a...
  - **name**: Bootstrap 95% confidence interval for HSP center | **latex**: CI_{95} = \left[ \hat{\delta}_{(0.025)}, \; \hat{\delta}_{(0.975)} \right] | **explanation**: The 2.5th and 97.5th percentiles of the bootstrap distribution of fitted HSP center coordinates, pro...
  - **name**: Bayesian model averaging for multi-fidelity HSP | **latex**: \delta_{k}^{BMA} = \sum_{m=1}^{M} w_m \, \delta_{k}^{(m)}, \quad w_m = \frac{\exp(-\frac{1}{2} BIC_m... | **explanation**: Weighted average of HSP estimates from M different methods (group contribution, QSPR, MD, experiment...
  - **name**: COSMO-RS sigma profile to HSP mapping | **latex**: \delta_D = f_D(\bar{\sigma}), \quad \delta_P = f_P(\sigma_{hb}^{+}, \sigma_{hb}^{-}), \quad \delta_H... | **explanation**: Empirical mapping functions that convert COSMO-RS sigma profile statistics (mean charge density, hyd...
  - **name**: Graph neural network HSP prediction | **latex**: \hat{\boldsymbol{\delta}} = \text{MLP}\left( \text{READOUT}\left( \{ \mathbf{h}_v^{(L)} \}_{v \in G}... | **explanation**: A graph neural network processes molecular graph G through L message-passing layers to produce node ...

**Historical Context:** The foundation of computational HSP prediction began with group contribution methods by Van Krevelen and Hoftyzer (1976) and was extended by Stefanis and Panayiotou (2008) to second-order groups. QSPR approaches emerged in the 2000s with work by Gharagheizi et al. (2011) applying neural networks to HSP prediction. MD-based HSP calculation was pioneered by Belmares et al. (2004) and refined by Gupta et al. (2011). The COSMO-RS approach to solubility parameters was developed by Klamt (1995, 2005). Machine learning acceleration of HSP prediction gained momentum in the 2010s-2020s with graph neural networks and transfer learning from large molecular databases. Cloud-based HSP databases emerged from projects like HSPiP (Hansen, Abbott, and Yamamoto) and open-data initiatives. Uncertainty quantification for HSP became formalized through bootstrap and Bayesian methods in the 2010s, driven by the need for reliable confidence intervals in regulatory and industrial applications.

### Related Project Modules

  - ml-hsp-prediction.ts
  - md-hsp-import.ts
  - hsp-uncertainty-quantification.ts
  - group-contribution.ts
  - sphere-fitting.ts
  - green-solvent.ts
  - multi-objective.ts
  - temperature-hsp.ts

**Prerequisites:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch04_HSP_Estimation_Methods, Ch16_Solvent_Selection_Optimization

### Learning Objectives

  - Understand how machine learning models (QSPR, GNN) can predict HSP values from molecular structure and assess their accuracy relative to experimental data
  - Explain how molecular dynamics simulations compute cohesive energy density components and convert them to HSP values
  - Describe the bootstrap uncertainty quantification framework for HSP sphere fitting and interpret 95% confidence intervals
  - Evaluate the potential of quantum chemical methods (DFT, COSMO-RS) for first-principles HSP derivation and their current limitations
  - Identify how sustainability metrics, cloud databases, and real-time data integration are shaping the future of HSP-based formulation design

### Practical Applications

  - Rapid HSP screening of novel drug candidates using ML-predicted HSP values before synthesis, reducing experimental burden in pharmaceutical development
  - Virtual solvent screening for green chemistry: using MD-derived HSP for bio-based solvents not yet in experimental databases
  - Automated formulation optimization with real-time HSP sphere fitting integrated into high-throughput experimentation platforms
  - Regulatory compliance: combining HSP solvent selection with sustainability indices (EHS scores, LCA data) for REACH and GHS compliance
  - Materials informatics: building predictive HSP models for novel polymers, ionic liquids, and deep eutectic solvents using transfer learning
  - Digital twin manufacturing: continuously updating HSP models in coating and ink-jet processes as temperature and composition change in real time
  - Collaborative research: contributing and validating HSP data through cloud-based repositories with provenance tracking

### Worked Examples

  - **title**: ML-based HSP prediction for a novel bio-based solvent | **description**: Given molecular descriptors (molar volume, logP, H-bond donors/acceptors, aromatic rings) for a new ...
  - **title**: MD simulation CED-to-HSP conversion | **description**: Import molecular dynamics simulation output (dispersion, polar, and hydrogen bonding CED components ...
  - **title**: Bootstrap uncertainty analysis of a polymer HSP sphere | **description**: Starting with a dataset of 30 solvents classified as good/bad for a target polymer, perform N=1000 b...
  - **title**: Multi-fidelity HSP estimation combining group contribution and ML | **description**: For a new copolymer, compute HSP estimates from (1) first-order group contribution, (2) second-order...

### Key References

  - **author**: Hansen, C.M. | **year**: 2007 | **title**: Hansen Solubility Parameters: A User's Handbook, 2nd Edition, CRC Press
  - **author**: Gharagheizi, F., Eslamimanesh, A., Mohammadi, A.H., Richon, D. | **year**: 2011 | **title**: Determination of Hansen Solubility Parameters from Molecular Structure Using QSPR. Journal of Chemic...
  - **author**: Belmares, M., Blanco, M., Goddard III, W.A., et al. | **year**: 2004 | **title**: Hildebrand and Hansen Solubility Parameters from Molecular Dynamics with Applications to Electronic ...
  - **author**: Klamt, A. | **year**: 2005 | **title**: COSMO-RS: From Quantum Chemistry to Fluid Phase Thermodynamics and Drug Design. Elsevier
  - **author**: Stefanis, E., Panayiotou, C. | **year**: 2008 | **title**: Prediction of Hansen Solubility Parameters with a New Group-Contribution Method. International Journ...
  - **author**: Gupta, J., Nunes, C., Vyas, S., Jonnalagadda, S. | **year**: 2011 | **title**: Prediction of Solubility Parameters and Miscibility of Pharmaceutical Compounds by Molecular Dynamic...
  - **author**: Jurs, P.C., Bakken, G.A., McClelland, H.E. | **year**: 2000 | **title**: Computational Methods for the Analysis of Chemical Sensor Array Data from Volatile Analytes. Chemica...
  - **author**: Dunn, W.J., Koehler, M.G., Stahura, F.L. | **year**: 2020 | **title**: Machine Learning Approaches for Predicting Hansen Solubility Parameters: A Comparative Study. Molecu...
  - **author**: Sanchez-Lengeling, B., Aspuru-Guzik, A. | **year**: 2018 | **title**: Inverse Molecular Design Using Machine Learning: Generative Models for Matter Engineering. Science, ...

**Cross References:** Ch01_HSP_Fundamentals, Ch02_Thermodynamic_Foundations, Ch04_HSP_Estimation_Methods, Ch13_Energy_Environment, Ch16_Solvent_Selection_Optimization

**Difficulty Level:** advanced_research

**Estimated Pages:** 35

### Figures Needed

  - **title**: ML HSP Prediction Pipeline | **description**: Flowchart showing the workflow from molecular structure (SMILES) through descriptor calculation or g...
  - **title**: MD-to-HSP Conversion Workflow | **description**: Schematic illustrating the molecular dynamics simulation pipeline: force field setup, equilibration,...
  - **title**: Bootstrap Uncertainty Ellipsoid in 3D HSP Space | **description**: 3D scatter plot showing the distribution of bootstrap-resampled HSP center coordinates, with the 95%...
  - **title**: Multi-Fidelity HSP Estimation Hierarchy | **description**: Pyramid diagram showing the hierarchy of HSP estimation methods from low-cost/low-accuracy (group co...
  - **title**: Graph Neural Network Architecture for HSP | **description**: Network diagram showing molecular graph input, message-passing layers, readout aggregation, and MLP ...
  - **title**: Active Learning Loop for HSP Determination | **description**: Cyclic diagram showing the iterative process: current HSP model -> Bayesian optimization selects nex...
  - **title**: Sustainability-HSP Integration Dashboard | **description**: Mock-up of a combined dashboard showing HSP distance ranking alongside EHS scores, LCA impact, REACH...

### Tables Needed

  - **title**: Comparison of HSP Prediction Methods | **description**: Table comparing group contribution, QSPR, MD simulation, COSMO-RS, and experimental methods across d...
  - **title**: ML Model Performance Benchmarks for HSP Prediction | **description**: Table listing published ML models for HSP prediction with their training set size, descriptor type, ...
  - **title**: Cloud HSP Database Feature Comparison | **description**: Comparison of existing and proposed HSP databases (HSPiP, open-source repositories) by number of com...
  - **title**: Sustainability Metrics Integrated with HSP Selection | **description**: Table showing sustainability indices (CHEM21, GSK green solvent guide, EHS scores) and how they map ...

### Software Demo

  - **tab**: ML HSP Prediction tab and MD HSP Import tab
  - **inputs**: For ML prediction: enter molecular descriptors (molar volume=120, logP=1.5, H-bond donors=1, H-bond acceptors=2, aromatic rings=1) for a sample molecule. For MD import: enter CED components (dispersionCED=250, polarCED=40, hbondCED=60 J/cm3) with molar volume=100 cm3/mol. For uncertainty quantification: use the HSP Sphere Fitting tab with a dataset of 25+ solvents and enable bootstrap analysis (N=500).
  - **expected_output**: ML prediction returns predicted deltaD/deltaP/deltaH with confidence level (high/medium/low) and warnings for out-of-domain descriptors. MD import returns HSP values with consistency check (should be >95%). Bootstrap uncertainty returns 95% confidence intervals for all three HSP components and R0, displayed as error bars on the 3D HSP sphere visualization.

### Review Questions

  - What are the main advantages and limitations of using graph neural networks for HSP prediction compared to traditional group contribution methods? Under what circumstances would you prefer each approach?
  - Describe how molecular dynamics simulation can be used to compute HSP values from first principles. What are the key sources of error in this approach, and how do force field selection and simulation length affect the results?
  - Explain the bootstrap uncertainty quantification procedure for HSP sphere fitting. Why is it important to report confidence intervals alongside point estimates of HSP values in industrial applications?
  - How could active learning and Bayesian optimization reduce the number of experiments needed to determine a new material's HSP sphere? Outline the iterative workflow and the criteria for selecting the next solvent to test.
  - Discuss how sustainability metrics (EHS scores, LCA data, REACH compliance) can be formally integrated into HSP-based solvent selection frameworks. What are the challenges of combining incommensurable objectives?


---

## Uncertain Items Summary

以下のフィールドは不確実としてマークされています：

### Thermodynamic Foundations of Hansen Solubility Parameters
  - cross_references
  - estimated_pages

### Temperature and Pressure Effects on Hansen Solubility Parameters
  - cross_references
  - key_references[6]

### HSP Estimation Methods
  - prerequisites
  - cross_references
  - estimated_pages
  - key_references[8]

### Contact Angle and Wettability
  - key_references[5]
  - key_references[8]
  - cross_references
  - estimated_pages

### Adhesion Engineering
  - prerequisites
  - cross_references
  - estimated_pages
  - key_references[3]
  - key_references[7]

### Polymer Blends and Recycling
  - cross_references[4]
  - cross_references[5]
  - estimated_pages
  - key_references[9]
  - prerequisites

### Pharmaceutical Drug Delivery
  - equations[3]
  - equations[4]
  - key_references[1]
  - key_references[6]
  - key_references[8]
  - estimated_pages
  - historical_context

### Biopharmaceuticals and Excipients
  - key_references[3]
  - key_references[4]
  - key_references[5]
  - key_references[7]
  - cross_references[5]
  - cross_references[6]
  - estimated_pages
  - equations[0]
  - equations[1]

### Nanomaterials Dispersion Science
  - key_references[5]
  - key_references[6]
  - key_references[7]
  - key_references[8]
  - cross_references[6]
  - estimated_pages
  - equations[7]

### Coatings and Thin Films
  - equations[3]
  - estimated_pages
  - key_references[7]
  - key_references[9]

### Energy and Environmental Applications
  - equations[1]
  - equations[4]
  - equations[5]
  - estimated_pages
  - key_references[6]
  - key_references[9]

### Food and Cosmetics
  - historical_context
  - estimated_pages
  - key_references[5]
  - key_references[8]

### Industrial Specialty Applications
  - equations[2]
  - equations[8]
  - estimated_pages
  - key_references[3]
  - key_references[4]
  - key_references[5]
  - key_references[7]

### Solvent Selection and Optimization
  - estimated_pages
  - key_references[1]

### Visualization and Analysis of HSP Space
  - estimated_pages

### Future Directions in Hansen Solubility Parameter Research
  - equations[4] (COSMO-RS sigma profile to HSP mapping - exact functional forms are empirical and vary by implementation)
  - key_references[7] (Dunn et al. 2020 ML HSP paper - exact authors, title, and publication details unverified)
