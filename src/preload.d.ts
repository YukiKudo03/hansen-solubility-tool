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

  // 汎用 IPC invoke (可視化パイプライン等)
  invoke(channel: string, ...args: unknown[]): Promise<any>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
