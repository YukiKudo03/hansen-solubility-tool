/**
 * PDFレポートデータ生成
 */

const PIPELINE_TITLES: Record<string, string> = {
  risk: '溶解性評価レポート',
  contactAngle: '接触角推定レポート',
  swelling: '膨潤度予測レポート',
  chemicalResistance: '耐薬品性予測レポート',
  nanoDispersion: 'ナノ粒子分散評価レポート',
  plasticizer: '可塑剤選定レポート',
  carrierSelection: 'キャリア選定レポート',
  blendOptimizer: 'ブレンド最適化レポート',
  drugSolubility: '薬物溶解性評価レポート',
};

export interface PdfReportData {
  title: string;
  pipeline: string;
  evaluatedAt: string;
  result: unknown;
  disclaimer: string;
}

/**
 * 日付をPDF用フォーマットに変換
 */
export function formatPdfTimestamp(date: Date): string {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * PDFレポート用データを構築する
 */
export function buildPdfReportData(
  pipeline: string,
  result: unknown,
  evaluatedAt: Date,
): PdfReportData {
  return {
    title: PIPELINE_TITLES[pipeline] ?? `${pipeline} レポート`,
    pipeline,
    evaluatedAt: formatPdfTimestamp(evaluatedAt),
    result,
    disclaimer: 'このレポートはHansen溶解度パラメータに基づく推定値であり、実験結果を保証するものではありません。実際の使用にあたっては必ず実験による検証を行ってください。',
  };
}
