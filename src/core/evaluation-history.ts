/**
 * 評価履歴のシリアライズ・ユーティリティ
 */

export const VALID_HISTORY_PIPELINES = [
  'risk', 'contactAngle', 'swelling', 'chemicalResistance',
  'nanoDispersion', 'plasticizer', 'carrierSelection',
  'blendOptimizer', 'drugSolubility', 'dispersantSelection',
  'escPipeline', 'cocrystalScreening', 'printing3dSmoothing',
  'dielectricFilm', 'excipientCompatibility',
  'polymerBlendMiscibility', 'polymerRecyclingCompatibility',
  'compatibilizerSelection', 'copolymerHspEstimation',
  'additiveMigration', 'flavorScalping', 'foodPackagingMigration',
  'fragranceEncapsulation', 'transdermalEnhancer', 'liposomePermeability',
  'inkSubstrateAdhesion', 'multilayerCoatingAdhesion', 'psaPeelStrength',
  'structuralAdhesiveJoint', 'surfaceTreatmentQuantification',
  'pigmentDispersion', 'cntGrapheneDispersion', 'mxeneDispersion', 'nanoparticleDrugLoading',
  'gasPermeability', 'membraneSeparation', 'co2Absorbent', 'hydrogenStorage',
  'sunscreenUVFilter', 'inhalationDrug', 'proteinAggregation', 'biologicBuffer',
  'cleaningFormulation', 'naturalDyeExtraction', 'essentialOilExtraction',
  'soilRemediation', 'residualSolvent',
  'temperatureHspCorrection', 'pressureHspCorrection', 'supercriticalCO2',
  'coatingDefect', 'photoresistDeveloper', 'perovskiteSolvent', 'organicSemiconductorFilm', 'uvCurableInk',
  'multicomponentOptimization', 'liBatteryElectrolyte', 'solventSubstitution', 'cosmeticEmulsion',
] as const;

export type HistoryPipeline = typeof VALID_HISTORY_PIPELINES[number];

export function isValidHistoryPipeline(pipeline: string): pipeline is HistoryPipeline {
  return (VALID_HISTORY_PIPELINES as readonly string[]).includes(pipeline);
}

export interface SerializedHistoryEntry {
  pipeline: string;
  paramsJson: string;
  resultJson: string;
  thresholdsJson: string;
}

export function serializeHistoryEntry(
  pipeline: string,
  params: unknown,
  result: unknown,
  thresholds: unknown,
): SerializedHistoryEntry {
  return {
    pipeline,
    paramsJson: JSON.stringify(params),
    resultJson: JSON.stringify(result),
    thresholdsJson: JSON.stringify(thresholds),
  };
}

export function deserializeHistoryResult(json: string): unknown | null {
  try {
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}
