/**
 * Preloadスクリプト — contextBridgeでRendererにAPIを公開
 */
import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  // 部品グループ
  getAllGroups: () => ipcRenderer.invoke('parts:getAllGroups'),
  getGroupById: (id: number) => ipcRenderer.invoke('parts:getGroupById', id),
  createGroup: (dto: { name: string; description?: string }) =>
    ipcRenderer.invoke('parts:createGroup', dto),
  updateGroup: (id: number, dto: { name?: string; description?: string }) =>
    ipcRenderer.invoke('parts:updateGroup', id, dto),
  deleteGroup: (id: number) => ipcRenderer.invoke('parts:deleteGroup', id),

  // 部品
  createPart: (dto: {
    groupId: number;
    name: string;
    materialType?: string;
    deltaD: number;
    deltaP: number;
    deltaH: number;
    r0: number;
    notes?: string;
  }) => ipcRenderer.invoke('parts:createPart', dto),
  updatePart: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('parts:updatePart', id, dto),
  deletePart: (id: number) => ipcRenderer.invoke('parts:deletePart', id),

  // 溶媒
  getAllSolvents: () => ipcRenderer.invoke('solvents:getAll'),
  getSolventById: (id: number) => ipcRenderer.invoke('solvents:getById', id),
  searchSolvents: (query: string) => ipcRenderer.invoke('solvents:search', query),
  createSolvent: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('solvents:create', dto),
  updateSolvent: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('solvents:update', id, dto),
  deleteSolvent: (id: number) => ipcRenderer.invoke('solvents:delete', id),
  createMixtureSolvent: (dto: { components: { solventId: number; volumeRatio: number }[]; name: string }) =>
    ipcRenderer.invoke('solvents:createMixture', dto),

  // 評価
  evaluate: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('evaluate', partsGroupId, solventId),

  // 設定
  getThresholds: () => ipcRenderer.invoke('settings:getThresholds'),
  setThresholds: (thresholds: {
    dangerousMax: number;
    warningMax: number;
    cautionMax: number;
    holdMax: number;
  }) => ipcRenderer.invoke('settings:setThresholds', thresholds),

  // CSV保存
  saveCsv: (csvContent: string) => ipcRenderer.invoke('csv:save', csvContent),

  // ナノ粒子
  getAllNanoParticles: () => ipcRenderer.invoke('nanoParticles:getAll'),
  getNanoParticleById: (id: number) => ipcRenderer.invoke('nanoParticles:getById', id),
  getNanoParticlesByCategory: (category: string) => ipcRenderer.invoke('nanoParticles:getByCategory', category),
  searchNanoParticles: (query: string) => ipcRenderer.invoke('nanoParticles:search', query),
  createNanoParticle: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoParticles:create', dto),
  updateNanoParticle: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoParticles:update', id, dto),
  deleteNanoParticle: (id: number) => ipcRenderer.invoke('nanoParticles:delete', id),

  // ナノ粒子分散評価
  evaluateNanoDispersion: (particleId: number, solventId: number) =>
    ipcRenderer.invoke('nanoDispersion:evaluate', particleId, solventId),
  screenAllSolvents: (particleId: number) =>
    ipcRenderer.invoke('nanoDispersion:screenAll', particleId),
  screenFilteredSolvents: (particleId: number, constraints: Record<string, unknown>) =>
    ipcRenderer.invoke('nanoDispersion:screenFiltered', particleId, constraints),

  // 分散性閾値設定
  getDispersibilityThresholds: () => ipcRenderer.invoke('settings:getDispersibilityThresholds'),
  setDispersibilityThresholds: (thresholds: {
    excellentMax: number;
    goodMax: number;
    fairMax: number;
    poorMax: number;
  }) => ipcRenderer.invoke('settings:setDispersibilityThresholds', thresholds),

  // 接触角推定
  estimateContactAngle: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('contactAngle:evaluate', partsGroupId, solventId),
  screenContactAngle: (partId: number, groupId: number) =>
    ipcRenderer.invoke('contactAngle:screenSolvents', partId, groupId),

  // 濡れ性閾値設定
  getWettabilityThresholds: () => ipcRenderer.invoke('settings:getWettabilityThresholds'),
  setWettabilityThresholds: (thresholds: {
    superHydrophilicMax: number;
    hydrophilicMax: number;
    wettableMax: number;
    moderateMax: number;
    hydrophobicMax: number;
  }) => ipcRenderer.invoke('settings:setWettabilityThresholds', thresholds),

  // 膨潤度予測
  evaluateSwelling: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('swelling:evaluate', partsGroupId, solventId),

  // 膨潤度閾値設定
  getSwellingThresholds: () => ipcRenderer.invoke('settings:getSwellingThresholds'),
  setSwellingThresholds: (thresholds: {
    severeMax: number; highMax: number; moderateMax: number; lowMax: number;
  }) => ipcRenderer.invoke('settings:setSwellingThresholds', thresholds),

  // 薬物
  getAllDrugs: () => ipcRenderer.invoke('drugs:getAll'),
  getDrugById: (id: number) => ipcRenderer.invoke('drugs:getById', id),
  getDrugsByCategory: (category: string) => ipcRenderer.invoke('drugs:getByCategory', category),
  searchDrugs: (query: string) => ipcRenderer.invoke('drugs:search', query),
  createDrug: (dto: Record<string, unknown>) =>
    ipcRenderer.invoke('drugs:create', dto),
  updateDrug: (id: number, dto: Record<string, unknown>) =>
    ipcRenderer.invoke('drugs:update', id, dto),
  deleteDrug: (id: number) => ipcRenderer.invoke('drugs:delete', id),

  // 薬物溶解性評価
  evaluateDrugSolubility: (drugId: number, solventId: number) =>
    ipcRenderer.invoke('drugSolubility:evaluate', drugId, solventId),
  screenDrugSolvents: (drugId: number) =>
    ipcRenderer.invoke('drugSolubility:screenAll', drugId),

  // 薬物溶解性閾値設定
  getDrugSolubilityThresholds: () => ipcRenderer.invoke('settings:getDrugSolubilityThresholds'),
  setDrugSolubilityThresholds: (thresholds: {
    excellentMax: number; goodMax: number; partialMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setDrugSolubilityThresholds', thresholds),

  // ブレンド最適化
  optimizeBlend: (params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }) => ipcRenderer.invoke('blend:optimize', params),

  // 耐薬品性評価
  evaluateChemicalResistance: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('chemicalResistance:evaluate', partsGroupId, solventId),

  // 耐薬品性閾値設定
  getChemicalResistanceThresholds: () => ipcRenderer.invoke('settings:getChemicalResistanceThresholds'),
  setChemicalResistanceThresholds: (thresholds: {
    noResistanceMax: number; poorMax: number; moderateMax: number; goodMax: number;
  }) => ipcRenderer.invoke('settings:setChemicalResistanceThresholds', thresholds),

  // 可塑剤選定
  getPlasticizers: () => ipcRenderer.invoke('solvents:getPlasticizers'),
  screenPlasticizers: (partId: number, groupId: number) =>
    ipcRenderer.invoke('plasticizer:screen', partId, groupId),

  // 可塑剤閾値設定
  getPlasticizerThresholds: () => ipcRenderer.invoke('settings:getPlasticizerThresholds'),
  setPlasticizerThresholds: (thresholds: {
    excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setPlasticizerThresholds', thresholds),

  // キャリア選定（DDS）
  evaluateCarrier: (drugId: number, carrierId: number, carrierGroupId: number) =>
    ipcRenderer.invoke('carrier:evaluate', drugId, carrierId, carrierGroupId),
  screenCarriers: (drugId: number, carrierGroupId: number) =>
    ipcRenderer.invoke('carrier:screenAll', drugId, carrierGroupId),

  // キャリア閾値設定
  getCarrierThresholds: () => ipcRenderer.invoke('settings:getCarrierThresholds'),
  setCarrierThresholds: (thresholds: {
    excellentMax: number; goodMax: number; fairMax: number; poorMax: number;
  }) => ipcRenderer.invoke('settings:setCarrierThresholds', thresholds),

  // CSVインポート
  importOpenFile: () => ipcRenderer.invoke('import:openFile'),
  importParseSolventCsv: (csv: string) => ipcRenderer.invoke('import:parseSolventCsv', csv),
  importParsePartCsv: (csv: string) => ipcRenderer.invoke('import:parsePartCsv', csv),

  // ブックマーク
  getAllBookmarks: () => ipcRenderer.invoke('bookmarks:getAll'),
  createBookmark: (dto: { name: string; pipeline: string; paramsJson: string }) =>
    ipcRenderer.invoke('bookmarks:create', dto),
  deleteBookmark: (id: number) => ipcRenderer.invoke('bookmarks:delete', id),

  // 評価履歴
  getAllHistory: () => ipcRenderer.invoke('history:getAll'),
  getHistoryByPipeline: (pipeline: string) => ipcRenderer.invoke('history:getByPipeline', pipeline),
  saveHistory: (entry: { pipeline: string; paramsJson: string; resultJson: string; thresholdsJson: string }, note?: string) =>
    ipcRenderer.invoke('history:save', entry, note),
  deleteHistory: (id: number) => ipcRenderer.invoke('history:delete', id),
  deleteHistoryOlderThan: (days: number) => ipcRenderer.invoke('history:deleteOlderThan', days),

  // 接着性評価
  evaluateAdhesion: (partsGroupId: number, solventId: number) =>
    ipcRenderer.invoke('adhesion:evaluate', partsGroupId, solventId),
  getAdhesionThresholds: () => ipcRenderer.invoke('settings:getAdhesionThresholds'),
  setAdhesionThresholds: (thresholds: { excellentMax: number; goodMax: number; fairMax: number; poorMax: number }) =>
    ipcRenderer.invoke('settings:setAdhesionThresholds', thresholds),

  // HSP球フィッティング
  fitSphere: (classifications: Array<{solventId: number; isGood: boolean}>) =>
    ipcRenderer.invoke('sphereFitting:fit', classifications),

  // グリーン溶媒
  findGreenAlternatives: (targetSolventId: number, maxResults?: number) =>
    ipcRenderer.invoke('greenSolvent:find', targetSolventId, maxResults),

  // 多目的溶媒選定
  screenMultiObjective: (params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    r0: number; weights?: Record<string, number>;
    preferredBoilingPointRange?: { min: number; max: number };
    maxViscosity?: number; maxSurfaceTension?: number;
  }) => ipcRenderer.invoke('multiObjective:screen', params),

  // 族寄与法
  estimateGroupContribution: (input: { firstOrderGroups: Array<{groupId: string; count: number}>; secondOrderGroups?: Array<{groupId: string; count: number}> }) =>
    ipcRenderer.invoke('groupContribution:estimate', input),
  getGroupContributionGroups: () => ipcRenderer.invoke('groupContribution:getGroups'),

  // 可視化
  getTeasPlotData: () => ipcRenderer.invoke('visualization:teasPlot'),
  getBagleyPlotData: () => ipcRenderer.invoke('visualization:bagleyPlot'),
  getProjection2DData: () => ipcRenderer.invoke('visualization:projection2d'),

  // 分散剤
  getAllDispersants: () => ipcRenderer.invoke('dispersants:getAll'),
  getDispersantById: (id: number) => ipcRenderer.invoke('dispersants:getById', id),
  getDispersantsByType: (type: string) => ipcRenderer.invoke('dispersants:getByType', type),
  searchDispersants: (query: string) => ipcRenderer.invoke('dispersants:search', query),
  createDispersant: (dto: Record<string, unknown>) => ipcRenderer.invoke('dispersants:create', dto),
  updateDispersant: (id: number, dto: Record<string, unknown>) => ipcRenderer.invoke('dispersants:update', id, dto),
  deleteDispersant: (id: number) => ipcRenderer.invoke('dispersants:delete', id),

  // 分散剤選定
  screenDispersants: (particleId: number, solventId: number) =>
    ipcRenderer.invoke('dispersantSelection:screen', particleId, solventId),
  screenSolventsForDispersant: (particleId: number, dispersantId: number) =>
    ipcRenderer.invoke('dispersantSelection:screenSolvents', particleId, dispersantId),
  screenDispersantsFallback: (particleId: number) =>
    ipcRenderer.invoke('dispersantSelection:screenFallback', particleId),
  getDispersantThresholds: () => ipcRenderer.invoke('settings:getDispersantThresholds'),
  setDispersantThresholds: (thresholds: { excellentMax: number; goodMax: number; fairMax: number; poorMax: number }) =>
    ipcRenderer.invoke('settings:setDispersantThresholds', thresholds),

  // ESCパイプライン
  screenESCRisk: (groupId: number) =>
    ipcRenderer.invoke('esc:screen', groupId),

  // 共結晶スクリーニング
  screenCocrystals: (drugId: number) =>
    ipcRenderer.invoke('cocrystal:screen', drugId),

  // 3Dプリント溶剤平滑化
  screen3DPrintingSolvents: (groupId: number) =>
    ipcRenderer.invoke('printing3d:screen', groupId),

  // 誘電体薄膜品質
  screenDielectricSolvents: (groupId: number) =>
    ipcRenderer.invoke('dielectric:screen', groupId),

  // 賦形剤適合性
  evaluateExcipientCompatibility: (drugId: number) =>
    ipcRenderer.invoke('excipient:evaluate', drugId),

  // ポリマーブレンド相溶性
  evaluatePolymerBlend: (params: {
    groupId1: number; groupId2: number;
    degreeOfPolymerization: number; referenceVolume: number;
  }) => ipcRenderer.invoke('polymerBlend:evaluate', params),

  // リサイクル相溶性
  evaluatePolymerRecycling: (params: {
    groupIds: number[];
    degreeOfPolymerization: number; referenceVolume: number;
  }) => ipcRenderer.invoke('polymerRecycling:evaluate', params),

  // 相溶化剤選定
  screenCompatibilizers: (params: {
    groupId1: number; groupId2: number;
  }) => ipcRenderer.invoke('compatibilizer:screen', params),

  // コポリマーHSP推定
  estimateCopolymerHsp: (params: {
    monomers: Array<{ name: string; deltaD: number; deltaP: number; deltaH: number; fraction: number }>;
  }) => ipcRenderer.invoke('copolymerHsp:estimate', params),

  // 添加剤移行予測
  screenAdditiveMigration: (partId: number, groupId: number) =>
    ipcRenderer.invoke('additiveMigration:screen', partId, groupId),

  // フレーバースカルピング
  screenFlavorScalping: (partId: number, groupId: number) =>
    ipcRenderer.invoke('flavorScalping:screen', partId, groupId),

  // 包装材溶出
  screenFoodPackagingMigration: (packagingHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, substanceIds: number[]) =>
    ipcRenderer.invoke('foodPackagingMigration:screen', packagingHSP, r0, substanceIds),

  // 香料カプセル化
  screenFragranceEncapsulation: (wallHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, fragranceIds: number[]) =>
    ipcRenderer.invoke('fragranceEncapsulation:screen', wallHSP, r0, fragranceIds),

  // 経皮吸収促進剤
  screenTransdermalEnhancers: (params: {
    drugId: number; skinHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('transdermalEnhancer:screen', params),

  // リポソーム透過性
  screenLiposomePermeability: (params: {
    drugId: number; lipidHSP: { deltaD: number; deltaP: number; deltaH: number }; lipidR0: number;
  }) => ipcRenderer.invoke('liposomePermeability:screen', params),

  // インク-基材密着
  evaluateInkSubstrateAdhesion: (params: {
    inkHSP: { deltaD: number; deltaP: number; deltaH: number };
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('inkSubstrateAdhesion:evaluate', params),

  // 多層コーティング密着
  evaluateMultilayerCoatingAdhesion: (params: {
    layers: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }>;
  }) => ipcRenderer.invoke('multilayerCoatingAdhesion:evaluate', params),

  // PSA剥離強度
  evaluatePSAPeelStrength: (params: {
    psaHSP: { deltaD: number; deltaP: number; deltaH: number };
    adherendHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('psaPeelStrength:evaluate', params),

  // 構造接着設計
  evaluateStructuralAdhesiveJoint: (params: {
    adhesiveHSP: { deltaD: number; deltaP: number; deltaH: number };
    adherend1HSP: { deltaD: number; deltaP: number; deltaH: number };
    adherend2HSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('structuralAdhesiveJoint:evaluate', params),

  // 表面処理効果
  evaluateSurfaceTreatmentQuantification: (params: {
    beforeHSP: { deltaD: number; deltaP: number; deltaH: number };
    afterHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('surfaceTreatmentQuantification:evaluate', params),

  // 密着強度閾値
  getAdhesionStrengthThresholds: () => ipcRenderer.invoke('settings:getAdhesionStrengthThresholds'),
  setAdhesionStrengthThresholds: (thresholds: { excellentMin: number; goodMin: number; fairMin: number }) =>
    ipcRenderer.invoke('settings:setAdhesionStrengthThresholds', thresholds),

  // 顔料分散安定性
  screenPigmentDispersion: (pigmentHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, vehicleIds: number[]) =>
    ipcRenderer.invoke('pigmentDispersion:screen', pigmentHSP, r0, vehicleIds),

  // CNT/グラフェン分散
  screenCNTGrapheneDispersion: (nanomaterialHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('cntGrapheneDispersion:screen', nanomaterialHSP, r0, solventIds),

  // MXene分散
  screenMXeneDispersion: (mxeneHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('mxeneDispersion:screen', mxeneHSP, r0, solventIds),

  // ナノ粒子薬物ローディング
  screenNanoparticleDrugLoading: (carrierHSP: { deltaD: number; deltaP: number; deltaH: number }, carrierR0: number, drugIds: number[]) =>
    ipcRenderer.invoke('nanoparticleDrugLoading:screen', carrierHSP, carrierR0, drugIds),

  // ガス透過性
  screenGasPermeability: (params: {
    polymerHSP: { deltaD: number; deltaP: number; deltaH: number };
    gasNames: string[]; referenceGas?: string;
  }) => ipcRenderer.invoke('gasPermeability:screen', params),

  // 膜分離選択性
  evaluateMembraneSeparation: (params: {
    membraneHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetName: string;
    impurityHSP: { deltaD: number; deltaP: number; deltaH: number };
    impurityName: string;
  }) => ipcRenderer.invoke('membraneSeparation:evaluate', params),

  // CO2吸収材選定
  screenCO2Absorbents: (params: {
    absorbents: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number }; r0: number }>;
  }) => ipcRenderer.invoke('co2Absorbent:screen', params),

  // 水素貯蔵材料
  screenHydrogenStorage: (params: {
    carrierHSP: { deltaD: number; deltaP: number; deltaH: number };
    r0: number; solventIds: number[];
  }) => ipcRenderer.invoke('hydrogenStorage:screen', params),

  // 洗浄剤配合設計
  screenCleaningFormulation: (soilHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('cleaningFormulation:screen', soilHSP, r0, solventIds),

  // 天然色素抽出
  screenNaturalDyeExtraction: (dyeHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('naturalDyeExtraction:screen', dyeHSP, r0, solventIds),

  // 精油抽出
  screenEssentialOilExtraction: (oilHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('essentialOilExtraction:screen', oilHSP, r0, solventIds),

  // 土壌汚染物質抽出
  screenSoilRemediation: (contaminantHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('soilRemediation:screen', contaminantHSP, r0, solventIds),

  // 残留溶媒予測
  screenResidualSolvent: (filmHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('residualSolvent:screen', filmHSP, r0, solventIds),

  // UVフィルター適合性
  screenSunscreenUVFilter: (vehicleHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, uvFilterIds: number[]) =>
    ipcRenderer.invoke('sunscreenUVFilter:screen', vehicleHSP, r0, uvFilterIds),

  // 吸入薬プロペラント適合性
  evaluateInhalationDrug: (params: {
    drugHSP: { deltaD: number; deltaP: number; deltaH: number };
    propellantHSP: { deltaD: number; deltaP: number; deltaH: number };
    propellantR0: number;
  }) => ipcRenderer.invoke('inhalationDrug:evaluate', params),

  // タンパク質凝集リスク
  evaluateProteinAggregation: (params: {
    proteinSurfaceHSP: { deltaD: number; deltaP: number; deltaH: number };
    bufferHSP: { deltaD: number; deltaP: number; deltaH: number };
    bufferR0: number;
  }) => ipcRenderer.invoke('proteinAggregation:evaluate', params),

  // バイオ製剤バッファー選定
  screenBiologicBuffers: (proteinHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, bufferIds: number[], temperature?: number) =>
    ipcRenderer.invoke('biologicBuffer:screen', proteinHSP, r0, bufferIds, temperature),

  // 温度HSP補正
  evaluateTemperatureHSPCorrection: (params: {
    hsp: { deltaD: number; deltaP: number; deltaH: number };
    temperature: number;
    referenceTemp?: number;
    alpha: number;
    solventName?: string;
  }) => ipcRenderer.invoke('temperatureHspCorrection:evaluate', params),

  // 圧力HSP補正
  evaluatePressureHSPCorrection: (params: {
    hsp: { deltaD: number; deltaP: number; deltaH: number };
    pressureRef?: number;
    pressureTarget: number;
    temperature: number;
    isothermalCompressibility?: number;
  }) => ipcRenderer.invoke('pressureHspCorrection:evaluate', params),

  // 超臨界CO2共溶媒選定
  screenSupercriticalCO2Cosolvents: (params: {
    targetHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetR0: number;
    pressure: number;
    temperature: number;
    cosolvents: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }>;
    fractions?: number[];
  }) => ipcRenderer.invoke('supercriticalCO2:screen', params),

  // コーティング欠陥予測
  predictCoatingDefects: (params: {
    coatingHSP: { deltaD: number; deltaP: number; deltaH: number };
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
    solventHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('coatingDefect:predict', params),

  // フォトレジスト現像液適合性
  evaluatePhotoresistDeveloper: (params: {
    unexposedHSP: { deltaD: number; deltaP: number; deltaH: number };
    exposedHSP: { deltaD: number; deltaP: number; deltaH: number };
    developerHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('photoresistDeveloper:evaluate', params),

  // ペロブスカイト溶媒設計
  screenPerovskiteSolvents: (precursorHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('perovskiteSolvent:screen', precursorHSP, r0, solventIds),

  // 有機半導体薄膜形成
  screenOrganicSemiconductorFilm: (oscHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('organicSemiconductorFilm:screen', oscHSP, r0, solventIds),

  // UV硬化インクモノマー選定
  screenUVCurableInkMonomers: (oligomerHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, monomerIds: number[]) =>
    ipcRenderer.invoke('uvCurableInk:screen', oligomerHSP, r0, monomerIds),

  // 結晶性ポリマー溶解温度
  evaluateCrystallineDissolution: (polymerHSP: { deltaD: number; deltaP: number; deltaH: number }, solventHSP: { deltaD: number; deltaP: number; deltaH: number }, params: { tm0: number; deltaHu: number; vu: number; v1: number; phi1: number; temperature?: number }) =>
    ipcRenderer.invoke('crystallineDissolution:evaluate', polymerHSP, solventHSP, params),

  // ハイドロゲル膨潤平衡
  evaluateHydrogelSwelling: (gelHSP: { deltaD: number; deltaP: number; deltaH: number }, solventHSP: { deltaD: number; deltaP: number; deltaH: number }, crosslinkDensity: number, vs: number) =>
    ipcRenderer.invoke('hydrogelSwelling:evaluate', gelHSP, solventHSP, crosslinkDensity, vs),

  // ゴム配合設計
  evaluateRubberCompounding: (rubberHSP: { deltaD: number; deltaP: number; deltaH: number }, filler: { name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }, crosslinkDensity: number, solventIds?: number[]) =>
    ipcRenderer.invoke('rubberCompounding:evaluate', rubberHSP, filler, crosslinkDensity, solventIds ?? []),

  // 熱硬化性樹脂硬化剤選定
  evaluateThermosetCuring: (resinHSP: { deltaD: number; deltaP: number; deltaH: number }, resinR0: number, agents?: { name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }[]) =>
    ipcRenderer.invoke('thermosetCuring:screen', resinHSP, resinR0, agents ?? []),

  // 繊維染色性予測
  evaluateFiberDyeability: (fiberHSP: { deltaD: number; deltaP: number; deltaH: number }, fiberR0: number, dyes?: { name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }[]) =>
    ipcRenderer.invoke('fiberDyeability:screen', fiberHSP, fiberR0, dyes ?? []),

  // 多成分溶媒最適化
  optimizeMultiComponent: (targetHSP: { deltaD: number; deltaP: number; deltaH: number }, solventIds: number[], numComponents: number) =>
    ipcRenderer.invoke('multicomponentOptimization:optimize', targetHSP, solventIds, numComponents),

  // LiB電解液設計
  screenLiBatteryElectrolyte: (saltHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('liBatteryElectrolyte:screen', saltHSP, r0, solventIds),

  // 溶媒代替設計
  screenSolventSubstitution: (bannedHSP: { deltaD: number; deltaP: number; deltaH: number }, solventIds: number[]) =>
    ipcRenderer.invoke('solventSubstitution:screen', bannedHSP, solventIds),

  // 化粧品エマルション安定性
  evaluateCosmeticEmulsion: (params: { oilHSP: { deltaD: number; deltaP: number; deltaH: number }; emulsifierHSP: { deltaD: number; deltaP: number; deltaH: number }; waterHSP: { deltaD: number; deltaP: number; deltaH: number } }) =>
    ipcRenderer.invoke('cosmeticEmulsion:evaluate', params),

  // ML HSP予測(QSPR)
  estimateHSPFromDescriptors: (descriptors: { molarVolume: number; logP: number; numHBDonors: number; numHBAcceptors: number; aromaticRings: number }) =>
    ipcRenderer.invoke('mlHspPrediction:estimate', descriptors),

  // MD HSPインポート
  importMDResults: (ced: { totalCED: number; dispersionCED: number; polarCED: number; hbondCED: number }, molarVolume: number) =>
    ipcRenderer.invoke('mdHspImport:import', ced, molarVolume),

  // 族寄与法(拡張)
  getExtendedFirstOrderGroups: () => ipcRenderer.invoke('groupContributionUpdates:getFirstOrderGroups'),
  getExtendedSecondOrderGroups: () => ipcRenderer.invoke('groupContributionUpdates:getSecondOrderGroups'),
  estimateHSPExtended: (input: { firstOrderGroups: { groupId: string; count: number }[]; secondOrderGroups?: { groupId: string; count: number }[] }) =>
    ipcRenderer.invoke('groupContributionUpdates:estimate', input),

  // 多形/溶媒和物リスク評価
  evaluatePolymorphRisk: (apiHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, solventIds: number[]) =>
    ipcRenderer.invoke('polymorphRisk:evaluate', apiHSP, r0, solventIds),

  // 防落書きコーティング設計
  screenAntiGraffitiCoatings: (coatingHSP: { deltaD: number; deltaP: number; deltaH: number }, r0: number, materials: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }>) =>
    ipcRenderer.invoke('antiGraffitiCoating:screen', coatingHSP, r0, materials),

  // プライマーレス接着設計
  optimizePrimerlessAdhesion: (params: { adhesiveHSP: { deltaD: number; deltaP: number; deltaH: number }; substrateHSP: { deltaD: number; deltaP: number; deltaH: number } }) =>
    ipcRenderer.invoke('primerlessAdhesion:optimize', params),

  // 印刷電子濡れ性
  evaluatePrintedElectronicsWetting: (params: {
    inkHSP: { deltaD: number; deltaP: number; deltaH: number };
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('printedElectronics:evaluate', params),

  // QDリガンド交換
  screenQDLigandExchange: (qdHSP: { deltaD: number; deltaP: number; deltaH: number }, qdR0: number, solventIds: number[]) =>
    ipcRenderer.invoke('quantumDotLigand:screen', qdHSP, qdR0, solventIds),

  // アンダーフィル/封止材
  evaluateUnderfillEncapsulant: (params: {
    encapsulantHSP: { deltaD: number; deltaP: number; deltaH: number };
    chipSurfaceHSP: { deltaD: number; deltaP: number; deltaH: number };
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => ipcRenderer.invoke('underfillEncapsulant:evaluate', params),

  // バイオ燃料適合性
  screenBiofuelCompatibility: (fuelHSP: { deltaD: number; deltaP: number; deltaH: number }, fuelR0: number, materialIds: number[]) =>
    ipcRenderer.invoke('biofuelCompatibility:screen', fuelHSP, fuelR0, materialIds),

  // PCMカプセル化
  screenPCMEncapsulation: (pcmHSP: { deltaD: number; deltaP: number; deltaH: number }, pcmR0: number, shellMaterialIds: number[]) =>
    ipcRenderer.invoke('pcmEncapsulation:screen', pcmHSP, pcmR0, shellMaterialIds),

  // HSP不確かさ定量化
  bootstrapHSPUncertainty: (params: {
    classifications: Array<{ solventId: number; isGood: boolean }>;
    numSamples?: number;
  }) => ipcRenderer.invoke('hspUncertainty:bootstrap', params),

  // 表面HSP決定
  estimateSurfaceHSP: (params: {
    testData: Array<{ liquidName: string; liquidHSP: { deltaD: number; deltaP: number; deltaH: number }; contactAngleDeg: number }>;
  }) => ipcRenderer.invoke('surfaceHspDetermination:estimate', params),

  // IL/DES HSP推定
  estimateIonicLiquidHSP: (params: {
    cationHSP: { deltaD: number; deltaP: number; deltaH: number };
    anionHSP: { deltaD: number; deltaP: number; deltaH: number };
    ratio?: [number, number]; temperature?: number; referenceTemp?: number;
  }) => ipcRenderer.invoke('ionicLiquidHsp:estimate', params),

  // 実験データインポート
  experimentalImport: (params: { polymerId: number; treatPartialAs?: 'good' | 'bad' }) =>
    ipcRenderer.invoke('experimental:import', params),
  experimentalSaveImport: (params: {
    polymerId: number;
    rows: Array<{
      solventNameRaw: string;
      solventId: number | null;
      result: 'good' | 'partial' | 'bad';
      quantitativeValue?: number;
      quantitativeUnit?: string;
      temperatureC?: number;
      concentration?: string;
      notes?: string;
    }>;
  }) => ipcRenderer.invoke('experimental:saveImport', params),
  experimentalGetResults: (polymerId: number) =>
    ipcRenderer.invoke('experimental:getResults', polymerId),
  experimentalDeleteByBatch: (batchId: string) =>
    ipcRenderer.invoke('experimental:deleteByBatch', batchId),
  experimentalDeleteByPolymer: (polymerId: number) =>
    ipcRenderer.invoke('experimental:deleteByPolymer', polymerId),
  experimentalModelAccuracy: (params: {
    polymerId: number;
    polymerHSP: { deltaD: number; deltaP: number; deltaH: number };
    r0: number;
    treatPartialAs?: 'good' | 'bad';
  }) => ipcRenderer.invoke('experimental:modelAccuracy', params),
  experimentalRefitSphere: (params: {
    polymerId: number;
    treatPartialAs?: 'good' | 'bad';
  }) => ipcRenderer.invoke('experimental:refitSphere', params),
  experimentalSaveMappings: (mappings: Array<{ rawName: string; solventId: number }>) =>
    ipcRenderer.invoke('experimental:saveMappings', mappings),
  experimentalGetMappings: () =>
    ipcRenderer.invoke('experimental:getMappings'),
  experimentalDeleteMapping: (rawName: string) =>
    ipcRenderer.invoke('experimental:deleteMapping', rawName),

  // 汎用 IPC invoke — 許可チャネルのみ通過
  invoke: (channel: string, ...args: unknown[]) => {
    const ALLOWED_CHANNELS = [
      'visualization:teasPlot', 'visualization:bagleyPlot', 'visualization:projection2d',
    ] as const;
    if (!(ALLOWED_CHANNELS as readonly string[]).includes(channel)) {
      return Promise.reject(new Error(`未許可のIPCチャネル: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },
};

contextBridge.exposeInMainWorld('api', api);
