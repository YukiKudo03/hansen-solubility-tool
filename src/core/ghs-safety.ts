/**
 * GHS (Globally Harmonized System) 安全情報データベース
 *
 * 主要溶媒のGHS分類・H文言・ピクトグラム情報を提供する。
 * 出典: ECHA C&L Inventory, 日本のGHS分類結果
 */

export interface GHSInfo {
  signalWord: 'danger' | 'warning' | null;
  hStatements: string[];     // H225, H302 等
  pictograms: string[];      // flame, skull, exclamation 等
  flashPoint: number | null; // 引火点 (°C)
  svhc: boolean;             // 高懸念物質
}

const PICTOGRAM_LABELS: Record<string, string> = {
  flame: '炎',
  skull: 'どくろ',
  exclamation: '感嘆符',
  corrosion: '腐食',
  health: '健康有害',
  environment: '環境',
  oxidizer: '酸化',
  gas: 'ガス',
  explode: '爆発',
};

/**
 * 主要溶媒のGHS情報データベース（CAS番号キー）
 */
export const GHS_DATABASE: Record<string, GHSInfo> = {
  // 炭化水素
  '109-66-0': { signalWord: 'danger', hStatements: ['H225', 'H304', 'H336'], pictograms: ['flame', 'health'], flashPoint: -49, svhc: false },
  '110-54-3': { signalWord: 'danger', hStatements: ['H225', 'H304', 'H336', 'H361f', 'H373'], pictograms: ['flame', 'health', 'exclamation'], flashPoint: -22, svhc: false },
  '110-82-7': { signalWord: 'danger', hStatements: ['H225', 'H304', 'H315', 'H336', 'H410'], pictograms: ['flame', 'health', 'environment'], flashPoint: -20, svhc: false },
  '108-88-3': { signalWord: 'danger', hStatements: ['H225', 'H304', 'H315', 'H336', 'H361d', 'H373'], pictograms: ['flame', 'health', 'exclamation'], flashPoint: 4, svhc: false },
  '71-43-2': { signalWord: 'danger', hStatements: ['H225', 'H304', 'H315', 'H319', 'H340', 'H350', 'H372'], pictograms: ['flame', 'health', 'skull'], flashPoint: -11, svhc: true },

  // ハロゲン化
  '75-09-2': { signalWord: 'warning', hStatements: ['H302', 'H315', 'H319', 'H336', 'H351'], pictograms: ['health', 'exclamation'], flashPoint: null, svhc: true },
  '67-66-3': { signalWord: 'danger', hStatements: ['H302', 'H315', 'H319', 'H331', 'H351', 'H361d', 'H372'], pictograms: ['health', 'skull', 'exclamation'], flashPoint: null, svhc: false },
  '56-23-5': { signalWord: 'danger', hStatements: ['H301', 'H311', 'H331', 'H351', 'H372', 'H412'], pictograms: ['skull', 'health'], flashPoint: null, svhc: false },

  // アルコール
  '67-56-1': { signalWord: 'danger', hStatements: ['H225', 'H301', 'H311', 'H331', 'H370'], pictograms: ['flame', 'skull', 'health'], flashPoint: 11, svhc: false },
  '64-17-5': { signalWord: 'danger', hStatements: ['H225', 'H319'], pictograms: ['flame', 'exclamation'], flashPoint: 13, svhc: false },
  '67-63-0': { signalWord: 'danger', hStatements: ['H225', 'H319', 'H336'], pictograms: ['flame', 'exclamation'], flashPoint: 12, svhc: false },

  // ケトン
  '67-64-1': { signalWord: 'danger', hStatements: ['H225', 'H319', 'H336'], pictograms: ['flame', 'exclamation'], flashPoint: -20, svhc: false },
  '78-93-3': { signalWord: 'danger', hStatements: ['H225', 'H319', 'H336'], pictograms: ['flame', 'exclamation'], flashPoint: -9, svhc: false },

  // エステル
  '141-78-6': { signalWord: 'danger', hStatements: ['H225', 'H319', 'H336'], pictograms: ['flame', 'exclamation'], flashPoint: -4, svhc: false },

  // エーテル
  '60-29-7': { signalWord: 'danger', hStatements: ['H224', 'H302', 'H336'], pictograms: ['flame', 'exclamation'], flashPoint: -45, svhc: false },
  '109-99-9': { signalWord: 'danger', hStatements: ['H225', 'H302', 'H319', 'H335', 'H351'], pictograms: ['flame', 'exclamation', 'health'], flashPoint: -14, svhc: false },

  // アミド系
  '68-12-2': { signalWord: 'danger', hStatements: ['H312', 'H332', 'H360d'], pictograms: ['health', 'exclamation'], flashPoint: 58, svhc: true },
  '872-50-4': { signalWord: 'danger', hStatements: ['H315', 'H319', 'H360d'], pictograms: ['health', 'exclamation'], flashPoint: 91, svhc: true },

  // その他
  '67-68-5': { signalWord: null, hStatements: [], pictograms: [], flashPoint: 89, svhc: false },
  '7732-18-5': { signalWord: null, hStatements: [], pictograms: [], flashPoint: null, svhc: false },
};

/**
 * CAS番号からGHS情報を取得
 */
export function getGHSInfo(casNumber: string | null): GHSInfo | null {
  if (!casNumber) return null;
  return GHS_DATABASE[casNumber] ?? null;
}

/**
 * ピクトグラムIDから日本語ラベルを取得
 */
export function getGHSPictogramLabel(pictogram: string): string {
  return PICTOGRAM_LABELS[pictogram] ?? pictogram;
}

/**
 * 高懸念物質 (SVHC) かどうかを判定
 */
export function isHighConcernSubstance(casNumber: string): boolean {
  const info = GHS_DATABASE[casNumber];
  return info?.svhc ?? false;
}
