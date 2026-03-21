/**
 * Preload API 型定義 — window.api の型
 */
import type { PartsGroup, Solvent, RiskThresholds, GroupEvaluationResult, NanoParticle, NanoParticleCategory, NanoDispersionEvaluationResult, DispersibilityThresholds, SolventConstraints, GroupContactAngleResult, WettabilityThresholds, Drug, GroupSwellingResult, SwellingThresholds, DrugSolubilityScreeningResult, DrugSolubilityThresholds, BlendOptimizationResult, GroupChemicalResistanceResult, ChemicalResistanceThresholds, PlasticizerEvaluationResult, PlasticizerCompatibilityThresholds, CarrierEvaluationResult, CarrierCompatibilityThresholds, Dispersant, DispersantType, DispersantEvaluationResult, DispersantAffinityThresholds, DispersantFallbackResult } from './core/types';
import type { CreatePartsGroupDto, CreatePartDto, CreateSolventDto, CreateNanoParticleDto, CreateDrugDto, CreateDispersantDto } from './db/repository';
import type { SolventForDispersantEvaluationResult } from './core/types';

export interface ElectronAPI {
  // 部品グループ
  getAllGroups(): Promise<PartsGroup[]>;
  getGroupById(id: number): Promise<PartsGroup | null>;
  createGroup(dto: CreatePartsGroupDto): Promise<PartsGroup>;
  updateGroup(id: number, dto: Partial<CreatePartsGroupDto>): Promise<PartsGroup | null>;
  deleteGroup(id: number): Promise<boolean>;

  // 部品
  createPart(dto: CreatePartDto): Promise<import('./core/types').Part>;
  updatePart(id: number, dto: Partial<CreatePartDto>): Promise<import('./core/types').Part | null>;
  deletePart(id: number): Promise<boolean>;

  // 溶媒
  getAllSolvents(): Promise<Solvent[]>;
  getSolventById(id: number): Promise<Solvent | null>;
  searchSolvents(query: string): Promise<Solvent[]>;
  createSolvent(dto: CreateSolventDto): Promise<Solvent>;
  updateSolvent(id: number, dto: Partial<CreateSolventDto>): Promise<Solvent | null>;
  deleteSolvent(id: number): Promise<boolean>;
  createMixtureSolvent(dto: { components: { solventId: number; volumeRatio: number }[]; name: string }): Promise<Solvent>;

  // 評価
  evaluate(partsGroupId: number, solventId: number): Promise<GroupEvaluationResult>;

  // 設定
  getThresholds(): Promise<RiskThresholds>;
  setThresholds(thresholds: RiskThresholds): Promise<void>;

  // CSV保存
  saveCsv(csvContent: string): Promise<{ saved: boolean; filePath?: string }>;

  // ナノ粒子
  getAllNanoParticles(): Promise<NanoParticle[]>;
  getNanoParticleById(id: number): Promise<NanoParticle | null>;
  getNanoParticlesByCategory(category: string): Promise<NanoParticle[]>;
  searchNanoParticles(query: string): Promise<NanoParticle[]>;
  createNanoParticle(dto: CreateNanoParticleDto): Promise<NanoParticle>;
  updateNanoParticle(id: number, dto: Partial<CreateNanoParticleDto>): Promise<NanoParticle | null>;
  deleteNanoParticle(id: number): Promise<boolean>;

  // ナノ粒子分散評価
  evaluateNanoDispersion(particleId: number, solventId: number): Promise<NanoDispersionEvaluationResult>;
  screenAllSolvents(particleId: number): Promise<NanoDispersionEvaluationResult>;
  screenFilteredSolvents(particleId: number, constraints: SolventConstraints): Promise<NanoDispersionEvaluationResult>;

  // 分散性閾値設定
  getDispersibilityThresholds(): Promise<DispersibilityThresholds>;
  setDispersibilityThresholds(thresholds: DispersibilityThresholds): Promise<void>;

  // 接触角推定
  estimateContactAngle(partsGroupId: number, solventId: number): Promise<GroupContactAngleResult>;
  screenContactAngle(partId: number, groupId: number): Promise<GroupContactAngleResult>;

  // 濡れ性閾値設定
  getWettabilityThresholds(): Promise<WettabilityThresholds>;
  setWettabilityThresholds(thresholds: WettabilityThresholds): Promise<void>;

  // 膨潤度予測
  evaluateSwelling(partsGroupId: number, solventId: number): Promise<GroupSwellingResult>;

  // 膨潤度閾値設定
  getSwellingThresholds(): Promise<SwellingThresholds>;
  setSwellingThresholds(thresholds: SwellingThresholds): Promise<void>;

  // 薬物
  getAllDrugs(): Promise<Drug[]>;
  getDrugById(id: number): Promise<Drug | null>;
  getDrugsByCategory(category: string): Promise<Drug[]>;
  searchDrugs(query: string): Promise<Drug[]>;
  createDrug(dto: CreateDrugDto): Promise<Drug>;
  updateDrug(id: number, dto: Partial<CreateDrugDto>): Promise<Drug | null>;
  deleteDrug(id: number): Promise<boolean>;

  // 薬物溶解性評価
  evaluateDrugSolubility(drugId: number, solventId: number): Promise<DrugSolubilityScreeningResult>;
  screenDrugSolvents(drugId: number): Promise<DrugSolubilityScreeningResult>;

  // 薬物溶解性閾値設定
  getDrugSolubilityThresholds(): Promise<DrugSolubilityThresholds>;
  setDrugSolubilityThresholds(thresholds: DrugSolubilityThresholds): Promise<void>;

  // ブレンド最適化
  optimizeBlend(params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }): Promise<BlendOptimizationResult>;

  // 耐薬品性評価
  evaluateChemicalResistance(partsGroupId: number, solventId: number): Promise<GroupChemicalResistanceResult>;

  // 耐薬品性閾値設定
  getChemicalResistanceThresholds(): Promise<ChemicalResistanceThresholds>;
  setChemicalResistanceThresholds(thresholds: ChemicalResistanceThresholds): Promise<void>;

  // 可塑剤選定
  getPlasticizers(): Promise<Solvent[]>;
  screenPlasticizers(partId: number, groupId: number): Promise<PlasticizerEvaluationResult>;

  // 可塑剤閾値設定
  getPlasticizerThresholds(): Promise<PlasticizerCompatibilityThresholds>;
  setPlasticizerThresholds(thresholds: PlasticizerCompatibilityThresholds): Promise<void>;

  // キャリア選定（DDS）
  evaluateCarrier(drugId: number, carrierId: number, carrierGroupId: number): Promise<CarrierEvaluationResult>;
  screenCarriers(drugId: number, carrierGroupId: number): Promise<CarrierEvaluationResult>;

  // キャリア閾値設定
  getCarrierThresholds(): Promise<CarrierCompatibilityThresholds>;
  setCarrierThresholds(thresholds: CarrierCompatibilityThresholds): Promise<void>;

  // ブックマーク
  getAllBookmarks(): Promise<import('./core/types').Bookmark[]>;
  createBookmark(dto: { name: string; pipeline: string; paramsJson: string }): Promise<import('./core/types').Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;

  // CSVインポート
  importOpenFile(): Promise<string | null>;
  importParseSolventCsv(csv: string): Promise<import('./core/csv-import').ImportResult<import('./core/csv-import').SolventImportRow>>;
  importParsePartCsv(csv: string): Promise<import('./core/csv-import').ImportResult<import('./core/csv-import').PartImportRow>>;

  // 評価履歴
  getAllHistory(): Promise<import('./db/history-repository').EvaluationHistoryRow[]>;
  getHistoryByPipeline(pipeline: string): Promise<import('./db/history-repository').EvaluationHistoryRow[]>;
  saveHistory(entry: import('./core/evaluation-history').SerializedHistoryEntry, note?: string): Promise<import('./db/history-repository').EvaluationHistoryRow>;
  deleteHistory(id: number): Promise<boolean>;
  deleteHistoryOlderThan(days: number): Promise<number>;

  // 接着性評価
  evaluateAdhesion(partsGroupId: number, solventId: number): Promise<import('./core/types').GroupAdhesionResult>;
  getAdhesionThresholds(): Promise<import('./core/adhesion').AdhesionThresholds>;
  setAdhesionThresholds(thresholds: import('./core/adhesion').AdhesionThresholds): Promise<void>;

  // HSP球フィッティング
  fitSphere(classifications: Array<{solventId: number; isGood: boolean}>): Promise<import('./core/sphere-fitting').SphereFitResult>;

  // グリーン溶媒
  findGreenAlternatives(targetSolventId: number, maxResults?: number): Promise<import('./core/green-solvent').SubstitutionResult>;

  // 多目的溶媒選定
  screenMultiObjective(params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    r0: number; weights?: import('./core/multi-objective').ObjectiveWeights;
    preferredBoilingPointRange?: { min: number; max: number };
    maxViscosity?: number; maxSurfaceTension?: number;
  }): Promise<import('./core/multi-objective').MultiObjectiveScreeningResult>;

  // 族寄与法
  estimateGroupContribution(input: import('./core/group-contribution').GroupContributionInput): Promise<import('./core/group-contribution').GroupContributionResult>;
  getGroupContributionGroups(): Promise<{ firstOrder: Array<{id: string; name: string}>; secondOrder: Array<{id: string; name: string}> }>;

  // 可視化
  getTeasPlotData(): Promise<import('./core/teas-plot').TeasPlotData>;
  getBagleyPlotData(): Promise<import('./core/bagley-plot').BagleyPlotData>;
  getProjection2DData(): Promise<import('./core/projection-2d').Projection2DData>;

  // 分散剤
  getAllDispersants(): Promise<Dispersant[]>;
  getDispersantById(id: number): Promise<Dispersant | null>;
  getDispersantsByType(type: DispersantType): Promise<Dispersant[]>;
  searchDispersants(query: string): Promise<Dispersant[]>;
  createDispersant(dto: CreateDispersantDto): Promise<Dispersant>;
  updateDispersant(id: number, dto: Partial<CreateDispersantDto>): Promise<Dispersant | null>;
  deleteDispersant(id: number): Promise<boolean>;

  // 分散剤選定
  screenDispersants(particleId: number, solventId: number): Promise<DispersantEvaluationResult>;
  screenSolventsForDispersant(particleId: number, dispersantId: number): Promise<SolventForDispersantEvaluationResult>;
  screenDispersantsFallback(particleId: number): Promise<DispersantFallbackResult[]>;
  getDispersantThresholds(): Promise<DispersantAffinityThresholds>;
  setDispersantThresholds(thresholds: DispersantAffinityThresholds): Promise<DispersantAffinityThresholds>;

  // ESCパイプライン
  screenESCRisk(polymerHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/esc-pipeline').ESCScreeningResult[]>;

  // 共結晶スクリーニング
  screenCocrystals(apiHSP: import('./core/types').HSPValues, r0: number, coformerIds: number[]): Promise<import('./core/cocrystal-screening').CocrystalScreeningResult[]>;

  // 3Dプリント溶剤平滑化
  screen3DPrintingSolvents(filamentHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/printing3d-smoothing').SmoothingScreeningResult[]>;

  // 誘電体薄膜品質
  screenDielectricSolvents(polymerHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/dielectric-film').DielectricScreeningResult[]>;

  // 賦形剤適合性
  evaluateExcipientCompatibility(apiHSP: import('./core/types').HSPValues, r0: number, excipientIds: number[]): Promise<import('./core/excipient-compatibility').ExcipientResult[]>;

  // ポリマーブレンド相溶性
  evaluatePolymerBlend(params: {
    groupId1: number; groupId2: number;
    degreeOfPolymerization: number; referenceVolume: number;
  }): Promise<{
    group1Name: string; group2Name: string;
    results: Array<{
      polymer1Name: string; polymer2Name: string;
      polymer1HSP: import('./core/types').HSPValues; polymer2HSP: import('./core/types').HSPValues;
      ra: number; chiParameter: number; miscibility: string;
    }>;
    evaluatedAt: Date;
  }>;

  // リサイクル相溶性
  evaluatePolymerRecycling(params: {
    groupIds: number[];
    degreeOfPolymerization: number; referenceVolume: number;
  }): Promise<{
    groupNames: string[];
    matrix: Array<{
      polymer1Name: string; polymer2Name: string;
      ra: number; chiParameter: number; miscibility: string;
    }>;
    evaluatedAt: Date;
  }>;

  // 相溶化剤選定
  screenCompatibilizers(params: {
    groupId1: number; groupId2: number;
  }): Promise<{
    polymer1Name: string; polymer2Name: string;
    results: Array<{
      compatibilizerName: string; solventId: number;
      raToPolymer1: number; raToPolymer2: number;
      overallScore: number; compatibility: string;
    }>;
    evaluatedAt: Date;
  }>;

  // コポリマーHSP推定
  estimateCopolymerHsp(params: {
    monomers: Array<{ name: string; deltaD: number; deltaP: number; deltaH: number; fraction: number }>;
  }): Promise<{
    monomers: Array<{ name: string; deltaD: number; deltaP: number; deltaH: number; fraction: number }>;
    estimatedHSP: import('./core/types').HSPValues;
    evaluatedAt: Date;
  }>;

  // 添加剤移行予測
  screenAdditiveMigration(partId: number, groupId: number): Promise<import('./core/additive-migration').AdditiveMigrationEvaluationResult>;

  // フレーバースカルピング
  screenFlavorScalping(partId: number, groupId: number): Promise<import('./core/flavor-scalping').FlavorScalpingEvaluationResult>;

  // 包装材溶出
  screenFoodPackagingMigration(packagingHSP: import('./core/types').HSPValues, r0: number, substanceIds: number[]): Promise<import('./core/food-packaging-migration').PackagingMigrationResult[]>;

  // 香料カプセル化
  screenFragranceEncapsulation(wallHSP: import('./core/types').HSPValues, r0: number, fragranceIds: number[]): Promise<import('./core/fragrance-encapsulation').EncapsulationResult[]>;

  // 経皮吸収促進剤
  screenTransdermalEnhancers(params: {
    drugId: number; skinHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/transdermal-enhancer').TransdermalResult[]>;

  // リポソーム透過性
  screenLiposomePermeability(params: {
    drugId: number; lipidHSP: import('./core/types').HSPValues; lipidR0: number;
  }): Promise<import('./core/liposome-permeability').DrugPermeabilityResult[]>;

  // インク-基材密着
  evaluateInkSubstrateAdhesion(params: {
    inkHSP: import('./core/types').HSPValues;
    substrateHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/types').InkSubstrateAdhesionResult>;

  // 多層コーティング密着
  evaluateMultilayerCoatingAdhesion(params: {
    layers: Array<{ name: string; hsp: import('./core/types').HSPValues }>;
  }): Promise<import('./core/types').MultilayerCoatingResult>;

  // PSA剥離強度
  evaluatePSAPeelStrength(params: {
    psaHSP: import('./core/types').HSPValues;
    adherendHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/types').PSAPeelStrengthResult>;

  // 構造接着設計
  evaluateStructuralAdhesiveJoint(params: {
    adhesiveHSP: import('./core/types').HSPValues;
    adherend1HSP: import('./core/types').HSPValues;
    adherend2HSP: import('./core/types').HSPValues;
  }): Promise<import('./core/types').StructuralAdhesiveJointResult>;

  // 表面処理効果
  evaluateSurfaceTreatmentQuantification(params: {
    beforeHSP: import('./core/types').HSPValues;
    afterHSP: import('./core/types').HSPValues;
    targetHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/types').SurfaceTreatmentResult>;

  // 密着強度閾値
  getAdhesionStrengthThresholds(): Promise<import('./core/types').AdhesionStrengthThresholds>;
  setAdhesionStrengthThresholds(thresholds: import('./core/types').AdhesionStrengthThresholds): Promise<void>;

  // 顔料分散安定性
  screenPigmentDispersion(pigmentHSP: import('./core/types').HSPValues, r0: number, vehicleIds: number[]): Promise<import('./core/pigment-dispersion-stability').PigmentDispersionResult[]>;

  // CNT/グラフェン分散
  screenCNTGrapheneDispersion(nanomaterialHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/cnt-graphene-dispersion').CNTGrapheneDispersionResult[]>;

  // MXene分散
  screenMXeneDispersion(mxeneHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/mxene-dispersion').MXeneDispersionResult[]>;

  // ナノ粒子薬物ローディング
  screenNanoparticleDrugLoading(carrierHSP: import('./core/types').HSPValues, carrierR0: number, drugIds: number[]): Promise<import('./core/nanoparticle-drug-loading').DrugLoadingResult[]>;

  // ガス透過性
  screenGasPermeability(params: {
    polymerHSP: import('./core/types').HSPValues;
    gasNames: string[]; referenceGas?: string;
  }): Promise<import('./core/polymer-membrane-gas-permeability').MembranePermeabilityScreeningResult>;

  // 膜分離選択性
  evaluateMembraneSeparation(params: {
    membraneHSP: import('./core/types').HSPValues;
    targetHSP: import('./core/types').HSPValues;
    targetName: string;
    impurityHSP: import('./core/types').HSPValues;
    impurityName: string;
  }): Promise<import('./core/membrane-separation-selectivity').SeparationSelectivityResult>;

  // CO2吸収材選定
  screenCO2Absorbents(params: {
    absorbents: Array<{ name: string; hsp: import('./core/types').HSPValues; r0: number }>;
  }): Promise<import('./core/co2-absorbent-selection').CO2AbsorbentScreeningResult>;

  // 水素貯蔵材料
  screenHydrogenStorage(params: {
    carrierHSP: import('./core/types').HSPValues;
    r0: number; solventIds: number[];
  }): Promise<import('./core/hydrogen-storage-material').H2StorageScreeningResult>;

  // 洗浄剤配合設計
  screenCleaningFormulation(soilHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/cleaning-product-formulation').CleaningScreeningResult[]>;

  // 天然色素抽出
  screenNaturalDyeExtraction(dyeHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/natural-dye-extraction').DyeExtractionResult[]>;

  // 精油抽出
  screenEssentialOilExtraction(oilHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/essential-oil-extraction').EssentialOilExtractionResult[]>;

  // 土壌汚染物質抽出
  screenSoilRemediation(contaminantHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/soil-contaminant-extraction').RemediationScreeningResult[]>;

  // 残留溶媒予測
  screenResidualSolvent(filmHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/residual-solvent-prediction').ResidualSolventResult[]>;

  // UVフィルター適合性
  screenSunscreenUVFilter(vehicleHSP: import('./core/types').HSPValues, r0: number, uvFilterIds: number[]): Promise<import('./core/sunscreen-uv-filter').UVFilterResult[]>;

  // 吸入薬プロペラント適合性
  evaluateInhalationDrug(params: {
    drugHSP: import('./core/types').HSPValues;
    propellantHSP: import('./core/types').HSPValues;
    propellantR0: number;
  }): Promise<import('./core/inhalation-drug-propellant').InhalationCompatibilityResult>;

  // タンパク質凝集リスク
  evaluateProteinAggregation(params: {
    proteinSurfaceHSP: import('./core/types').HSPValues;
    bufferHSP: import('./core/types').HSPValues;
    bufferR0: number;
  }): Promise<import('./core/protein-aggregation-risk').ProteinAggregationResult>;

  // バイオ製剤バッファー選定
  screenBiologicBuffers(proteinHSP: import('./core/types').HSPValues, r0: number, bufferIds: number[], temperature?: number): Promise<import('./core/biologic-formulation-buffer').BufferScreeningResult[]>;

  // 温度HSP補正
  evaluateTemperatureHSPCorrection(params: {
    hsp: import('./core/types').HSPValues;
    temperature: number;
    referenceTemp?: number;
    alpha: number;
    solventName?: string;
  }): Promise<{
    original: import('./core/types').HSPValues;
    corrected: import('./core/types').HSPValues;
    temperature: number;
    referenceTemp: number;
    alpha: number;
    solventName?: string;
    associatingCorrectionApplied: boolean;
    evaluatedAt: Date;
  }>;

  // 圧力HSP補正
  evaluatePressureHSPCorrection(params: {
    hsp: import('./core/types').HSPValues;
    pressureRef?: number;
    pressureTarget: number;
    temperature: number;
    isothermalCompressibility?: number;
  }): Promise<{
    original: import('./core/types').HSPValues;
    corrected: import('./core/types').HSPValues;
    pressureRef: number;
    pressureTarget: number;
    temperature: number;
    isothermalCompressibility: number;
    evaluatedAt: Date;
  }>;

  // 超臨界CO2共溶媒選定
  screenSupercriticalCO2Cosolvents(params: {
    targetHSP: import('./core/types').HSPValues;
    targetR0: number;
    pressure: number;
    temperature: number;
    cosolvents: Array<{ name: string; hsp: import('./core/types').HSPValues }>;
    fractions?: number[];
  }): Promise<import('./core/supercritical-co2-cosolvent').SCCO2CosolventScreeningResult>;

  // コーティング欠陥予測
  predictCoatingDefects(params: {
    coatingHSP: import('./core/types').HSPValues;
    substrateHSP: import('./core/types').HSPValues;
    solventHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/coating-defect-prediction').CoatingDefectResult>;

  // フォトレジスト現像液適合性
  evaluatePhotoresistDeveloper(params: {
    unexposedHSP: import('./core/types').HSPValues;
    exposedHSP: import('./core/types').HSPValues;
    developerHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/photoresist-developer').PhotoresistDeveloperResult>;

  // ペロブスカイト溶媒設計
  screenPerovskiteSolvents(precursorHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/perovskite-solvent-engineering').PerovskiteSolventResult[]>;

  // 有機半導体薄膜形成
  screenOrganicSemiconductorFilm(oscHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/organic-semiconductor-film').OSCSolventResult[]>;

  // UV硬化インクモノマー選定
  screenUVCurableInkMonomers(oligomerHSP: import('./core/types').HSPValues, r0: number, monomerIds: number[]): Promise<import('./core/uv-curable-ink-monomer').UVInkMonomerResult[]>;

  // 結晶性ポリマー溶解温度
  evaluateCrystallineDissolution(polymerHSP: import('./core/types').HSPValues, solventHSP: import('./core/types').HSPValues, params: import('./core/crystalline-polymer-dissolution').CrystallinePolymerParams): Promise<import('./core/crystalline-polymer-dissolution').CrystallinePolymerDissolutionResult>;

  // ハイドロゲル膨潤平衡
  evaluateHydrogelSwelling(gelHSP: import('./core/types').HSPValues, solventHSP: import('./core/types').HSPValues, crosslinkDensity: number, vs: number): Promise<import('./core/hydrogel-swelling-equilibrium').HydrogelSwellingResult>;

  // ゴム配合設計
  evaluateRubberCompounding(rubberHSP: import('./core/types').HSPValues, filler: import('./core/rubber-compounding-design').FillerInfo, crosslinkDensity: number, solventIds?: number[]): Promise<import('./core/rubber-compounding-design').RubberCompoundResult>;

  // 熱硬化性樹脂硬化剤選定
  evaluateThermosetCuring(resinHSP: import('./core/types').HSPValues, resinR0: number, agents?: import('./core/thermoset-curing-agent').CuringAgent[]): Promise<import('./core/thermoset-curing-agent').CuringAgentResult[]>;

  // 繊維染色性予測
  evaluateFiberDyeability(fiberHSP: import('./core/types').HSPValues, fiberR0: number, dyes?: import('./core/fiber-dyeability').Dye[]): Promise<import('./core/fiber-dyeability').DyeabilityResult[]>;

  // 多成分溶媒最適化
  optimizeMultiComponent(targetHSP: import('./core/types').HSPValues, solventIds: number[], numComponents: number): Promise<import('./core/multicomponent-optimizer').MultiComponentOptimizationResult>;

  // LiB電解液設計
  screenLiBatteryElectrolyte(saltHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/li-ion-battery-electrolyte').ElectrolyteScreeningResult[]>;

  // 溶媒代替設計
  screenSolventSubstitution(bannedHSP: import('./core/types').HSPValues, solventIds: number[]): Promise<import('./core/solvent-substitution-design').SubstitutionDesignResult[]>;

  // 化粧品エマルション安定性
  evaluateCosmeticEmulsion(params: { oilHSP: import('./core/types').HSPValues; emulsifierHSP: import('./core/types').HSPValues; waterHSP: import('./core/types').HSPValues }): Promise<import('./core/cosmetic-emulsion-stability').EmulsionStabilityResult>;

  // ML HSP予測(QSPR)
  estimateHSPFromDescriptors(descriptors: import('./core/ml-hsp-prediction').MolecularDescriptors): Promise<import('./core/ml-hsp-prediction').QSPRPredictionResult>;

  // MD HSPインポート
  importMDResults(ced: import('./core/md-hsp-import').CEDComponents, molarVolume: number): Promise<import('./core/md-hsp-import').MDHSPImportResult>;

  // 族寄与法(拡張)
  getExtendedFirstOrderGroups(): Promise<import('./core/group-contribution-updates').ExtendedGroupDefinition[]>;
  getExtendedSecondOrderGroups(): Promise<import('./core/group-contribution-updates').ExtendedGroupDefinition[]>;
  estimateHSPExtended(input: import('./core/group-contribution').GroupContributionInput): Promise<import('./core/group-contribution-updates').ExtendedGroupContributionResult>;

  // 多形/溶媒和物リスク評価
  evaluatePolymorphRisk(apiHSP: import('./core/types').HSPValues, r0: number, solventIds: number[]): Promise<import('./core/polymorph-solvate-risk').PolymorphRiskResult[]>;

  // 防落書きコーティング設計
  screenAntiGraffitiCoatings(coatingHSP: import('./core/types').HSPValues, r0: number, materials: Array<{ name: string; hsp: import('./core/types').HSPValues }>): Promise<import('./core/anti-graffiti-coating').AntiGraffitiResult[]>;

  // プライマーレス接着設計
  optimizePrimerlessAdhesion(params: { adhesiveHSP: import('./core/types').HSPValues; substrateHSP: import('./core/types').HSPValues }): Promise<import('./core/primerless-adhesion').PrimerlessAdhesionResult>;

  // 印刷電子濡れ性
  evaluatePrintedElectronicsWetting(params: {
    inkHSP: import('./core/types').HSPValues;
    substrateHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/printed-electronics-wetting').PrintedElectronicsWettingResult>;

  // QDリガンド交換
  screenQDLigandExchange(qdHSP: import('./core/types').HSPValues, qdR0: number, solventIds: number[]): Promise<import('./core/quantum-dot-ligand-exchange').LigandExchangeResult[]>;

  // アンダーフィル/封止材
  evaluateUnderfillEncapsulant(params: {
    encapsulantHSP: import('./core/types').HSPValues;
    chipSurfaceHSP: import('./core/types').HSPValues;
    substrateHSP: import('./core/types').HSPValues;
  }): Promise<import('./core/underfill-encapsulant').UnderfillCompatibilityResult>;

  // バイオ燃料適合性
  screenBiofuelCompatibility(fuelHSP: import('./core/types').HSPValues, fuelR0: number, materialIds: number[]): Promise<import('./core/biofuel-material-compatibility').BiofuelCompatibilityResult[]>;

  // PCMカプセル化
  screenPCMEncapsulation(pcmHSP: import('./core/types').HSPValues, pcmR0: number, shellMaterialIds: number[]): Promise<import('./core/pcm-encapsulation').PCMEncapsulationResult[]>;

  // HSP不確かさ定量化
  bootstrapHSPUncertainty(params: {
    classifications: Array<{ solventId: number; isGood: boolean }>;
    numSamples?: number;
  }): Promise<import('./core/hsp-uncertainty-quantification').HSPUncertaintyResult>;

  // 表面HSP決定
  estimateSurfaceHSP(params: {
    testData: Array<{ liquidName: string; liquidHSP: import('./core/types').HSPValues; contactAngleDeg: number }>;
  }): Promise<import('./core/surface-hsp-determination').SurfaceHSPDeterminationResult>;

  // IL/DES HSP推定
  estimateIonicLiquidHSP(params: {
    cationHSP: import('./core/types').HSPValues;
    anionHSP: import('./core/types').HSPValues;
    ratio?: [number, number]; temperature?: number; referenceTemp?: number;
  }): Promise<import('./core/ionic-liquid-des-hsp').ILHSPEstimationResult>;

  // 汎用 IPC invoke (可視化パイプライン等)
  invoke(channel: string, ...args: unknown[]): Promise<any>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
