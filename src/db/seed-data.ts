/**
 * 初期シードデータ
 * 溶媒: AccuDyneテーブル + 文献値から約85種
 * ポリマー: リサーチレポート6種 + 主要ポリマー追加
 */
import Database from 'better-sqlite3';
import type { CreateSolventDto, CreatePartDto, CreatePartsGroupDto } from './repository';

/** 溶媒シードデータ (δD, δP, δH は MPa^(1/2)) */
export const SOLVENT_SEEDS: CreateSolventDto[] = [
  // --- 炭化水素系 ---
  { name: 'n-ペンタン', nameEn: 'n-Pentane', casNumber: '109-66-0', deltaD: 14.5, deltaP: 0.0, deltaH: 0.0, molWeight: 72.15, molarVolume: 116.2 },
  { name: 'n-ヘキサン', nameEn: 'n-Hexane', casNumber: '110-54-3', deltaD: 14.9, deltaP: 0.0, deltaH: 0.0, molWeight: 86.18, molarVolume: 131.6 },
  { name: 'n-ヘプタン', nameEn: 'n-Heptane', casNumber: '142-82-5', deltaD: 15.3, deltaP: 0.0, deltaH: 0.0, molWeight: 100.20, molarVolume: 147.4 },
  { name: 'n-オクタン', nameEn: 'n-Octane', casNumber: '111-65-9', deltaD: 15.5, deltaP: 0.0, deltaH: 0.0, molWeight: 114.23, molarVolume: 163.5 },
  { name: 'n-デカン', nameEn: 'n-Decane', casNumber: '124-18-5', deltaD: 15.7, deltaP: 0.0, deltaH: 0.0, molWeight: 142.28, molarVolume: 195.9 },
  { name: 'n-ドデカン', nameEn: 'n-Dodecane', casNumber: '112-40-3', deltaD: 16.0, deltaP: 0.0, deltaH: 0.0, molWeight: 170.34, molarVolume: 228.6 },
  { name: 'シクロヘキサン', nameEn: 'Cyclohexane', casNumber: '110-82-7', deltaD: 16.8, deltaP: 0.0, deltaH: 0.2, molWeight: 84.16, molarVolume: 108.7 },
  { name: 'メチルシクロヘキサン', nameEn: 'Methylcyclohexane', casNumber: '108-87-2', deltaD: 16.0, deltaP: 0.0, deltaH: 1.0, molWeight: 98.19, molarVolume: 128.3 },
  { name: 'イソオクタン', nameEn: 'Isooctane', casNumber: '540-84-1', deltaD: 14.3, deltaP: 0.0, deltaH: 0.0, molWeight: 114.23, molarVolume: 166.1 },

  // --- 芳香族炭化水素 ---
  { name: 'ベンゼン', nameEn: 'Benzene', casNumber: '71-43-2', deltaD: 18.4, deltaP: 0.0, deltaH: 2.0, molWeight: 78.11, molarVolume: 89.4 },
  { name: 'トルエン', nameEn: 'Toluene', casNumber: '108-88-3', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0, molWeight: 92.14, molarVolume: 106.8 },
  { name: 'エチルベンゼン', nameEn: 'Ethylbenzene', casNumber: '100-41-4', deltaD: 17.8, deltaP: 0.6, deltaH: 1.4, molWeight: 106.17, molarVolume: 123.1 },
  { name: 'o-キシレン', nameEn: 'o-Xylene', casNumber: '95-47-6', deltaD: 17.8, deltaP: 1.0, deltaH: 3.1, molWeight: 106.17, molarVolume: 121.2 },
  { name: 'p-キシレン', nameEn: 'p-Xylene', casNumber: '106-42-3', deltaD: 17.6, deltaP: 1.0, deltaH: 3.1, molWeight: 106.17, molarVolume: 123.9 },
  { name: 'スチレン', nameEn: 'Styrene', casNumber: '100-42-5', deltaD: 18.6, deltaP: 1.0, deltaH: 4.1, molWeight: 104.15, molarVolume: 115.6 },
  { name: 'テトラリン', nameEn: 'Tetralin', casNumber: '119-64-2', deltaD: 19.6, deltaP: 2.0, deltaH: 2.9, molWeight: 132.21, molarVolume: 136.8 },

  // --- ハロゲン化炭化水素 ---
  { name: 'ジクロロメタン', nameEn: 'Dichloromethane', casNumber: '75-09-2', deltaD: 18.2, deltaP: 6.3, deltaH: 6.1, molWeight: 84.93, molarVolume: 63.9 },
  { name: 'クロロホルム', nameEn: 'Chloroform', casNumber: '67-66-3', deltaD: 17.8, deltaP: 3.1, deltaH: 5.7, molWeight: 119.38, molarVolume: 80.7 },
  { name: '四塩化炭素', nameEn: 'Carbon tetrachloride', casNumber: '56-23-5', deltaD: 17.8, deltaP: 0.0, deltaH: 0.6, molWeight: 153.82, molarVolume: 97.1 },
  { name: '1,2-ジクロロエタン', nameEn: '1,2-Dichloroethane', casNumber: '107-06-2', deltaD: 19.0, deltaP: 7.4, deltaH: 4.1, molWeight: 98.96, molarVolume: 79.4 },
  { name: 'トリクロロエチレン', nameEn: 'Trichloroethylene', casNumber: '79-01-6', deltaD: 18.0, deltaP: 3.1, deltaH: 5.3, molWeight: 131.39, molarVolume: 90.2 },
  { name: 'テトラクロロエチレン', nameEn: 'Tetrachloroethylene', casNumber: '127-18-4', deltaD: 19.0, deltaP: 6.5, deltaH: 2.9, molWeight: 165.83, molarVolume: 101.1 },
  { name: '1,1,1-トリクロロエタン', nameEn: '1,1,1-Trichloroethane', casNumber: '71-55-6', deltaD: 17.0, deltaP: 4.3, deltaH: 2.0, molWeight: 133.40, molarVolume: 100.0 },
  { name: 'クロロベンゼン', nameEn: 'Chlorobenzene', casNumber: '108-90-7', deltaD: 19.0, deltaP: 4.3, deltaH: 2.0, molWeight: 112.56, molarVolume: 102.1 },
  { name: 'o-ジクロロベンゼン', nameEn: 'o-Dichlorobenzene', casNumber: '95-50-1', deltaD: 19.2, deltaP: 6.3, deltaH: 3.3, molWeight: 147.01, molarVolume: 112.8 },

  // --- アルコール系 ---
  { name: 'メタノール', nameEn: 'Methanol', casNumber: '67-56-1', deltaD: 15.1, deltaP: 12.3, deltaH: 22.3, molWeight: 32.04, molarVolume: 40.7 },
  { name: 'エタノール', nameEn: 'Ethanol', casNumber: '64-17-5', deltaD: 15.8, deltaP: 8.8, deltaH: 19.4, molWeight: 46.07, molarVolume: 58.5 },
  { name: 'n-プロパノール', nameEn: 'n-Propanol', casNumber: '71-23-8', deltaD: 16.0, deltaP: 6.8, deltaH: 17.4, molWeight: 60.10, molarVolume: 75.2 },
  { name: 'イソプロパノール', nameEn: 'Isopropanol', casNumber: '67-63-0', deltaD: 15.8, deltaP: 6.1, deltaH: 16.4, molWeight: 60.10, molarVolume: 76.8 },
  { name: 'n-ブタノール', nameEn: 'n-Butanol', casNumber: '71-36-3', deltaD: 16.0, deltaP: 5.7, deltaH: 15.8, molWeight: 74.12, molarVolume: 91.5 },
  { name: 'イソブタノール', nameEn: 'Isobutanol', casNumber: '78-83-1', deltaD: 15.1, deltaP: 5.7, deltaH: 15.9, molWeight: 74.12, molarVolume: 92.8 },
  { name: 'tert-ブタノール', nameEn: 'tert-Butanol', casNumber: '75-65-0', deltaD: 15.2, deltaP: 5.1, deltaH: 14.7, molWeight: 74.12, molarVolume: 94.3 },
  { name: 'エチレングリコール', nameEn: 'Ethylene glycol', casNumber: '107-21-1', deltaD: 17.0, deltaP: 11.0, deltaH: 26.0, molWeight: 62.07, molarVolume: 55.8 },
  { name: 'プロピレングリコール', nameEn: 'Propylene glycol', casNumber: '57-55-6', deltaD: 16.8, deltaP: 9.4, deltaH: 23.3, molWeight: 76.09, molarVolume: 73.6 },
  { name: 'グリセリン', nameEn: 'Glycerol', casNumber: '56-81-5', deltaD: 17.4, deltaP: 12.1, deltaH: 29.3, molWeight: 92.09, molarVolume: 73.3 },
  { name: 'ベンジルアルコール', nameEn: 'Benzyl alcohol', casNumber: '100-51-6', deltaD: 18.4, deltaP: 6.3, deltaH: 13.7, molWeight: 108.14, molarVolume: 103.6 },
  { name: 'シクロヘキサノール', nameEn: 'Cyclohexanol', casNumber: '108-93-0', deltaD: 17.4, deltaP: 4.1, deltaH: 13.5, molWeight: 100.16, molarVolume: 106.0 },
  { name: '2-エチルヘキサノール', nameEn: '2-Ethylhexanol', casNumber: '104-76-7', deltaD: 15.9, deltaP: 3.3, deltaH: 11.8, molWeight: 130.23, molarVolume: 157.0 },

  // --- ケトン系 ---
  { name: 'アセトン', nameEn: 'Acetone', casNumber: '67-64-1', deltaD: 15.5, deltaP: 10.4, deltaH: 7.0, molWeight: 58.08, molarVolume: 74.0 },
  { name: 'メチルエチルケトン (MEK)', nameEn: 'Methyl ethyl ketone', casNumber: '78-93-3', deltaD: 16.0, deltaP: 9.0, deltaH: 5.1, molWeight: 72.11, molarVolume: 90.1 },
  { name: 'メチルイソブチルケトン (MIBK)', nameEn: 'Methyl isobutyl ketone', casNumber: '108-10-1', deltaD: 15.3, deltaP: 6.1, deltaH: 4.1, molWeight: 100.16, molarVolume: 125.8 },
  { name: 'シクロヘキサノン', nameEn: 'Cyclohexanone', casNumber: '108-94-1', deltaD: 17.8, deltaP: 6.3, deltaH: 5.1, molWeight: 98.14, molarVolume: 104.0 },
  { name: 'メシチルオキシド', nameEn: 'Mesityl oxide', casNumber: '141-79-7', deltaD: 16.4, deltaP: 7.2, deltaH: 4.1, molWeight: 98.14, molarVolume: 115.6 },
  { name: 'ジアセトンアルコール', nameEn: 'Diacetone alcohol', casNumber: '123-42-2', deltaD: 15.8, deltaP: 8.2, deltaH: 10.8, molWeight: 116.16, molarVolume: 124.2 },
  { name: 'イソホロン', nameEn: 'Isophorone', casNumber: '78-59-1', deltaD: 16.6, deltaP: 8.2, deltaH: 7.4, molWeight: 138.21, molarVolume: 150.5 },

  // --- エステル系 ---
  { name: '酢酸メチル', nameEn: 'Methyl acetate', casNumber: '79-20-9', deltaD: 15.5, deltaP: 7.2, deltaH: 7.6, molWeight: 74.08, molarVolume: 79.7 },
  { name: '酢酸エチル', nameEn: 'Ethyl acetate', casNumber: '141-78-6', deltaD: 15.8, deltaP: 5.3, deltaH: 7.2, molWeight: 88.11, molarVolume: 98.5 },
  { name: '酢酸n-ブチル', nameEn: 'n-Butyl acetate', casNumber: '123-86-4', deltaD: 15.8, deltaP: 3.7, deltaH: 6.3, molWeight: 116.16, molarVolume: 132.5 },
  { name: '酢酸イソブチル', nameEn: 'Isobutyl acetate', casNumber: '110-19-0', deltaD: 15.1, deltaP: 3.7, deltaH: 6.3, molWeight: 116.16, molarVolume: 133.5 },
  { name: '酢酸セロソルブ', nameEn: 'Cellosolve acetate', casNumber: '111-15-9', deltaD: 15.9, deltaP: 4.7, deltaH: 10.6, molWeight: 132.16, molarVolume: 136.1 },
  { name: '乳酸エチル', nameEn: 'Ethyl lactate', casNumber: '97-64-3', deltaD: 16.0, deltaP: 7.6, deltaH: 12.5, molWeight: 118.13, molarVolume: 115.0 },

  // --- エーテル系 ---
  { name: 'ジエチルエーテル', nameEn: 'Diethyl ether', casNumber: '60-29-7', deltaD: 14.5, deltaP: 2.9, deltaH: 5.1, molWeight: 74.12, molarVolume: 104.8 },
  { name: 'テトラヒドロフラン (THF)', nameEn: 'Tetrahydrofuran', casNumber: '109-99-9', deltaD: 16.8, deltaP: 5.7, deltaH: 8.0, molWeight: 72.11, molarVolume: 81.7 },
  { name: '1,4-ジオキサン', nameEn: '1,4-Dioxane', casNumber: '123-91-1', deltaD: 19.0, deltaP: 1.8, deltaH: 7.4, molWeight: 88.11, molarVolume: 85.7 },
  { name: 'ジイソプロピルエーテル', nameEn: 'Diisopropyl ether', casNumber: '108-20-3', deltaD: 14.1, deltaP: 2.8, deltaH: 4.0, molWeight: 102.17, molarVolume: 142.0 },
  { name: 'メチルtert-ブチルエーテル (MTBE)', nameEn: 'Methyl tert-butyl ether', casNumber: '1634-04-4', deltaD: 14.8, deltaP: 4.3, deltaH: 5.0, molWeight: 88.15, molarVolume: 119.9 },
  { name: 'エチレングリコールモノメチルエーテル', nameEn: 'Ethylene glycol monomethyl ether', casNumber: '109-86-4', deltaD: 16.2, deltaP: 9.2, deltaH: 16.4, molWeight: 76.09, molarVolume: 79.1 },
  { name: 'エチレングリコールモノエチルエーテル', nameEn: 'Ethylene glycol monoethyl ether', casNumber: '110-80-5', deltaD: 16.2, deltaP: 9.2, deltaH: 14.3, molWeight: 90.12, molarVolume: 97.8 },
  { name: 'エチレングリコールモノブチルエーテル', nameEn: 'Ethylene glycol monobutyl ether', casNumber: '111-76-2', deltaD: 16.0, deltaP: 5.1, deltaH: 12.3, molWeight: 118.17, molarVolume: 131.6 },
  { name: 'プロピレングリコールモノメチルエーテル (PGM)', nameEn: 'Propylene glycol monomethyl ether', casNumber: '107-98-2', deltaD: 15.6, deltaP: 6.3, deltaH: 11.6, molWeight: 90.12, molarVolume: 93.8 },

  // --- アミド・含窒素系 ---
  { name: 'N,N-ジメチルホルムアミド (DMF)', nameEn: 'N,N-Dimethylformamide', casNumber: '68-12-2', deltaD: 17.4, deltaP: 13.7, deltaH: 11.3, molWeight: 73.09, molarVolume: 77.0 },
  { name: 'N,N-ジメチルアセトアミド (DMAc)', nameEn: 'N,N-Dimethylacetamide', casNumber: '127-19-5', deltaD: 16.8, deltaP: 11.5, deltaH: 10.2, molWeight: 87.12, molarVolume: 92.5 },
  { name: 'N-メチル-2-ピロリドン (NMP)', nameEn: 'N-Methyl-2-pyrrolidone', casNumber: '872-50-4', deltaD: 18.0, deltaP: 12.3, deltaH: 7.2, molWeight: 99.13, molarVolume: 96.5 },
  { name: 'ホルムアミド', nameEn: 'Formamide', casNumber: '75-12-7', deltaD: 17.2, deltaP: 26.2, deltaH: 19.0, molWeight: 45.04, molarVolume: 39.8 },
  { name: 'ピリジン', nameEn: 'Pyridine', casNumber: '110-86-1', deltaD: 19.0, deltaP: 8.8, deltaH: 5.9, molWeight: 79.10, molarVolume: 80.9 },
  { name: 'アニリン', nameEn: 'Aniline', casNumber: '62-53-3', deltaD: 19.4, deltaP: 5.1, deltaH: 10.2, molWeight: 93.13, molarVolume: 91.5 },
  { name: 'モルホリン', nameEn: 'Morpholine', casNumber: '110-91-8', deltaD: 18.8, deltaP: 4.9, deltaH: 9.2, molWeight: 87.12, molarVolume: 87.1 },
  { name: 'アセトニトリル', nameEn: 'Acetonitrile', casNumber: '75-05-8', deltaD: 15.3, deltaP: 18.0, deltaH: 6.1, molWeight: 41.05, molarVolume: 52.9 },
  { name: 'ニトロメタン', nameEn: 'Nitromethane', casNumber: '75-52-5', deltaD: 15.8, deltaP: 18.8, deltaH: 5.1, molWeight: 61.04, molarVolume: 54.3 },

  // --- スルホキシド系 ---
  { name: 'ジメチルスルホキシド (DMSO)', nameEn: 'Dimethyl sulfoxide', casNumber: '67-68-5', deltaD: 18.4, deltaP: 16.4, deltaH: 10.2, molWeight: 78.13, molarVolume: 71.3 },
  { name: 'スルホラン', nameEn: 'Sulfolane', casNumber: '126-33-0', deltaD: 20.3, deltaP: 18.2, deltaH: 10.9, molWeight: 120.17, molarVolume: 95.3 },

  // --- カルボン酸 ---
  { name: 'ギ酸', nameEn: 'Formic acid', casNumber: '64-18-6', deltaD: 14.3, deltaP: 11.9, deltaH: 16.6, molWeight: 46.03, molarVolume: 37.8 },
  { name: '酢酸', nameEn: 'Acetic acid', casNumber: '64-19-7', deltaD: 14.5, deltaP: 8.0, deltaH: 13.5, molWeight: 60.05, molarVolume: 57.1 },

  // --- その他 ---
  { name: '水', nameEn: 'Water', casNumber: '7732-18-5', deltaD: 15.6, deltaP: 16.0, deltaH: 42.3, molWeight: 18.02, molarVolume: 18.0 },
  { name: '二硫化炭素', nameEn: 'Carbon disulfide', casNumber: '75-15-0', deltaD: 20.5, deltaP: 0.0, deltaH: 0.6, molWeight: 76.14, molarVolume: 60.0 },
  { name: 'γ-ブチロラクトン', nameEn: 'gamma-Butyrolactone', casNumber: '96-48-0', deltaD: 19.0, deltaP: 16.6, deltaH: 7.4, molWeight: 86.09, molarVolume: 76.8 },
  { name: 'エチレンカーボネート', nameEn: 'Ethylene carbonate', casNumber: '96-49-1', deltaD: 19.4, deltaP: 21.7, deltaH: 5.1, molWeight: 88.06, molarVolume: 66.0 },
  { name: 'プロピレンカーボネート', nameEn: 'Propylene carbonate', casNumber: '108-32-7', deltaD: 20.0, deltaP: 18.0, deltaH: 4.1, molWeight: 102.09, molarVolume: 85.0 },
  { name: 'テトラメチル尿素', nameEn: 'Tetramethylurea', casNumber: '632-22-4', deltaD: 16.8, deltaP: 8.2, deltaH: 11.0, molWeight: 116.16, molarVolume: 120.4 },
  { name: 'フルフラール', nameEn: 'Furfural', casNumber: '98-01-1', deltaD: 18.6, deltaP: 14.9, deltaH: 5.1, molWeight: 96.08, molarVolume: 83.2 },

  // --- グリコールエーテルアセテート系 ---
  { name: 'プロピレングリコールモノメチルエーテルアセテート (PGMEA)', nameEn: 'Propylene glycol monomethyl ether acetate', casNumber: '108-65-6', deltaD: 15.6, deltaP: 5.6, deltaH: 9.8, molWeight: 132.16, molarVolume: 132.0 },
  { name: 'ジエチレングリコールモノエチルエーテル', nameEn: 'Diethylene glycol monoethyl ether', casNumber: '111-90-0', deltaD: 16.2, deltaP: 9.2, deltaH: 12.2, molWeight: 134.17, molarVolume: 130.9 },
  { name: 'ジエチレングリコールモノブチルエーテル', nameEn: 'Diethylene glycol monobutyl ether', casNumber: '112-34-5', deltaD: 16.0, deltaP: 7.0, deltaH: 10.6, molWeight: 162.23, molarVolume: 170.6 },

  // --- 追加の一般的な溶媒 ---
  { name: 'ジメチルカーボネート', nameEn: 'Dimethyl carbonate', casNumber: '616-38-6', deltaD: 15.5, deltaP: 3.9, deltaH: 9.7, molWeight: 90.08, molarVolume: 84.7 },
  { name: 'ジエチルカーボネート', nameEn: 'Diethyl carbonate', casNumber: '105-58-8', deltaD: 15.1, deltaP: 3.1, deltaH: 6.1, molWeight: 118.13, molarVolume: 121.0 },
  { name: 'トリエチルアミン', nameEn: 'Triethylamine', casNumber: '121-44-8', deltaD: 15.5, deltaP: 0.4, deltaH: 1.0, molWeight: 101.19, molarVolume: 139.6 },
  { name: '2-ブタノン', nameEn: '2-Butanone', casNumber: '78-93-3', deltaD: 16.0, deltaP: 9.0, deltaH: 5.1, molWeight: 72.11, molarVolume: 90.1, notes: 'MEKの別名' },
];

/** ポリマー（部品グループ＋部品）シードデータ */
export interface PolymerGroupSeed {
  group: CreatePartsGroupDto;
  parts: Omit<CreatePartDto, 'groupId'>[];
}

export const POLYMER_GROUP_SEEDS: PolymerGroupSeed[] = [
  {
    group: { name: '汎用プラスチック', description: '一般的な汎用プラスチック材料' },
    parts: [
      { name: 'ポリスチレン (PS)', materialType: 'PS', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 5.3 },
      { name: 'ポリエチレン (PE)', materialType: 'PE', deltaD: 18.0, deltaP: 3.0, deltaH: 2.0, r0: 4.0 },
      { name: 'ポリプロピレン (PP)', materialType: 'PP', deltaD: 18.0, deltaP: 0.0, deltaH: 1.0, r0: 6.0 },
      { name: 'ポリ塩化ビニル (PVC)', materialType: 'PVC', deltaD: 18.2, deltaP: 7.5, deltaH: 8.3, r0: 3.5 },
      { name: 'ポリメタクリル酸メチル (PMMA)', materialType: 'PMMA', deltaD: 18.6, deltaP: 10.5, deltaH: 7.5, r0: 8.6 },
      { name: 'ABS樹脂', materialType: 'ABS', deltaD: 18.0, deltaP: 8.8, deltaH: 6.4, r0: 5.0 },
    ],
  },
  {
    group: { name: 'エンジニアリングプラスチック', description: '高性能エンジニアリングプラスチック' },
    parts: [
      { name: 'ナイロン6,6 (PA66)', materialType: 'PA66', deltaD: 18.6, deltaP: 5.1, deltaH: 12.3, r0: 4.7 },
      { name: 'ナイロン6 (PA6)', materialType: 'PA6', deltaD: 17.0, deltaP: 3.4, deltaH: 10.6, r0: 5.1 },
      { name: 'ポリカーボネート (PC)', materialType: 'PC', deltaD: 18.6, deltaP: 10.5, deltaH: 6.0, r0: 10.0 },
      { name: 'ポリエチレンテレフタレート (PET)', materialType: 'PET', deltaD: 18.2, deltaP: 6.2, deltaH: 6.2, r0: 5.1 },
      { name: 'ポリブチレンテレフタレート (PBT)', materialType: 'PBT', deltaD: 18.0, deltaP: 5.5, deltaH: 8.5, r0: 5.3 },
      { name: 'ポリオキシメチレン (POM)', materialType: 'POM', deltaD: 17.2, deltaP: 9.2, deltaH: 9.8, r0: 4.0 },
      { name: 'ポリフェニレンオキシド (PPO)', materialType: 'PPO', deltaD: 17.8, deltaP: 5.7, deltaH: 6.3, r0: 5.5 },
    ],
  },
  {
    group: { name: 'スーパーエンプラ', description: 'スーパーエンジニアリングプラスチック' },
    parts: [
      { name: 'ポリエーテルエーテルケトン (PEEK)', materialType: 'PEEK', deltaD: 19.0, deltaP: 7.0, deltaH: 5.0, r0: 6.0 },
      { name: 'ポリイミド (PI)', materialType: 'PI', deltaD: 18.0, deltaP: 13.0, deltaH: 8.0, r0: 7.0 },
      { name: 'ポリフェニレンスルフィド (PPS)', materialType: 'PPS', deltaD: 19.4, deltaP: 4.2, deltaH: 3.4, r0: 5.8 },
      { name: 'ポリスルホン (PSU)', materialType: 'PSU', deltaD: 19.7, deltaP: 8.3, deltaH: 8.3, r0: 8.0 },
      { name: 'ポリエーテルスルホン (PES)', materialType: 'PES', deltaD: 19.6, deltaP: 10.8, deltaH: 9.2, r0: 6.2 },
    ],
  },
  {
    group: { name: '熱硬化性樹脂', description: '代表的な熱硬化性樹脂' },
    parts: [
      { name: 'エポキシ樹脂', materialType: 'Epoxy', deltaD: 20.0, deltaP: 12.0, deltaH: 11.5, r0: 12.7 },
      { name: 'フェノール樹脂', materialType: 'PF', deltaD: 20.0, deltaP: 8.0, deltaH: 8.0, r0: 7.0 },
      { name: 'メラミン樹脂', materialType: 'MF', deltaD: 19.0, deltaP: 10.0, deltaH: 10.0, r0: 6.0 },
      { name: '不飽和ポリエステル樹脂', materialType: 'UP', deltaD: 18.0, deltaP: 10.0, deltaH: 8.0, r0: 8.0 },
    ],
  },
  {
    group: { name: 'ゴム・エラストマー', description: '代表的なゴム・エラストマー材料' },
    parts: [
      { name: '天然ゴム (NR)', materialType: 'NR', deltaD: 17.4, deltaP: 3.1, deltaH: 4.1, r0: 8.1 },
      { name: 'ニトリルゴム (NBR)', materialType: 'NBR', deltaD: 18.0, deltaP: 10.0, deltaH: 4.0, r0: 6.5 },
      { name: 'シリコーンゴム', materialType: 'Silicone', deltaD: 15.9, deltaP: 5.0, deltaH: 4.7, r0: 10.0 },
      { name: 'フッ素ゴム (FKM)', materialType: 'FKM', deltaD: 17.2, deltaP: 10.6, deltaH: 5.3, r0: 5.0 },
      { name: 'EPDM', materialType: 'EPDM', deltaD: 17.2, deltaP: 2.0, deltaH: 2.4, r0: 6.5 },
      { name: 'クロロプレンゴム (CR)', materialType: 'CR', deltaD: 17.6, deltaP: 3.2, deltaH: 4.4, r0: 4.8 },
    ],
  },
  {
    group: { name: 'フッ素樹脂', description: 'フッ素系高分子材料' },
    parts: [
      { name: 'PTFE', materialType: 'PTFE', deltaD: 16.2, deltaP: 1.8, deltaH: 3.4, r0: 4.0 },
      { name: 'PVDF', materialType: 'PVDF', deltaD: 17.0, deltaP: 12.5, deltaH: 9.2, r0: 5.5 },
      { name: 'PFA', materialType: 'PFA', deltaD: 16.0, deltaP: 1.5, deltaH: 3.0, r0: 4.5 },
    ],
  },
];

/**
 * シードデータを投入する
 */
export function seedDatabase(db: Database.Database): void {
  const insertSolvent = db.prepare(
    'INSERT INTO solvents (name, name_en, cas_number, delta_d, delta_p, delta_h, molar_volume, mol_weight, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const insertGroup = db.prepare('INSERT INTO parts_groups (name, description) VALUES (?, ?)');

  const insertPart = db.prepare(
    'INSERT INTO parts (group_id, name, material_type, delta_d, delta_p, delta_h, r0, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );

  const seedAll = db.transaction(() => {
    // 溶媒の投入
    for (const s of SOLVENT_SEEDS) {
      insertSolvent.run(
        s.name,
        s.nameEn ?? null,
        s.casNumber ?? null,
        s.deltaD,
        s.deltaP,
        s.deltaH,
        s.molarVolume ?? null,
        s.molWeight ?? null,
        s.notes ?? null,
      );
    }

    // ポリマーグループと部品の投入
    for (const pg of POLYMER_GROUP_SEEDS) {
      const result = insertGroup.run(pg.group.name, pg.group.description ?? null);
      const groupId = Number(result.lastInsertRowid);
      for (const p of pg.parts) {
        insertPart.run(groupId, p.name, p.materialType ?? null, p.deltaD, p.deltaP, p.deltaH, p.r0, p.notes ?? null);
      }
    }
  });

  seedAll();
}
