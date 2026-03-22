/**
 * Bagleyプロット — δV-δH 2D散布図
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

/** 散布図の1点 */
interface BagleyPoint {
  name: string;
  deltaV: number;
  deltaH: number;
  type: 'solvent' | 'part';
}

/** visualization:bagleyPlot の戻り値型（core側構造化配列） */
interface BagleyPlotRawData {
  solvents: { names: string[]; deltaV: number[]; deltaH: number[] };
  parts: { names: string[]; deltaV: number[]; deltaH: number[] };
}

/** View内部で使用するデータ型 */
interface BagleyPlotData {
  solvents: BagleyPoint[];
  parts: BagleyPoint[];
}

/** core側 → BagleyPoint[]に変換 */
function convertBagleyRaw(raw: BagleyPlotRawData): BagleyPlotData {
  const solvents: BagleyPoint[] = raw.solvents.names.map((name, i) => ({
    name, deltaV: raw.solvents.deltaV[i], deltaH: raw.solvents.deltaH[i], type: 'solvent' as const,
  }));
  const parts: BagleyPoint[] = raw.parts.names.map((name, i) => ({
    name, deltaV: raw.parts.deltaV[i], deltaH: raw.parts.deltaH[i], type: 'part' as const,
  }));
  return { solvents, parts };
}

/** ツールチップ用の状態 */
interface HoveredPoint {
  name: string;
  deltaV: number;
  deltaH: number;
  x: number;
  y: number;
}

// チャート寸法
const CHART_W = 500;
const CHART_H = 400;
const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };
const PLOT_W = CHART_W - MARGIN.left - MARGIN.right;
const PLOT_H = CHART_H - MARGIN.top - MARGIN.bottom;

/** きりの良い目盛り間隔を算出 */
function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / mag;
  if (normalized < 1.5) return mag;
  if (normalized < 3.5) return 2 * mag;
  if (normalized < 7.5) return 5 * mag;
  return 10 * mag;
}

/** 目盛り配列を生成 */
function generateTicks(min: number, max: number, targetTicks = 6): number[] {
  const step = niceStep(max - min, targetTicks);
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
}

export default function BagleyPlotView() {
  const [data, setData] = useState<BagleyPlotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.api.getBagleyPlotData()
      .then((result: BagleyPlotRawData) => setData(convertBagleyRaw(result)))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Bagleyプロットデータの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  // 軸の範囲を自動算出 (パディング5%)
  const { xMin, xMax, yMin, yMax, xTicks, yTicks } = useMemo(() => {
    if (!data) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1, xTicks: [], yTicks: [] };
    const allPoints = [...data.solvents, ...data.parts];
    if (allPoints.length === 0) return { xMin: 0, xMax: 30, yMin: 0, yMax: 30, xTicks: [], yTicks: [] };

    const xVals = allPoints.map((p) => p.deltaV);
    const yVals = allPoints.map((p) => p.deltaH);

    const rawXMin = Math.min(...xVals);
    const rawXMax = Math.max(...xVals);
    const rawYMin = Math.min(...yVals);
    const rawYMax = Math.max(...yVals);

    const xPad = (rawXMax - rawXMin) * 0.1 || 2;
    const yPad = (rawYMax - rawYMin) * 0.1 || 2;

    const xMin2 = Math.max(0, rawXMin - xPad);
    const xMax2 = rawXMax + xPad;
    const yMin2 = Math.max(0, rawYMin - yPad);
    const yMax2 = rawYMax + yPad;

    return {
      xMin: xMin2,
      xMax: xMax2,
      yMin: yMin2,
      yMax: yMax2,
      xTicks: generateTicks(xMin2, xMax2),
      yTicks: generateTicks(yMin2, yMax2),
    };
  }, [data]);

  /** データ座標 → SVGプロット座標 */
  const toSvg = useCallback(
    (dv: number, dh: number) => ({
      x: MARGIN.left + ((dv - xMin) / (xMax - xMin)) * PLOT_W,
      y: MARGIN.top + (1 - (dh - yMin) / (yMax - yMin)) * PLOT_H,
    }),
    [xMin, xMax, yMin, yMax],
  );

  const handleMouseEnter = useCallback(
    (point: BagleyPoint, e: React.MouseEvent<SVGElement>) => {
      const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
      if (!svgRect) return;
      setHoveredPoint({
        name: point.name,
        deltaV: point.deltaV,
        deltaH: point.deltaH,
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Bagleyプロット
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          δV = √(δD² + δP²) を横軸、δH を縦軸にプロット。Bagley (1971)
        </p>

        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
            データを読み込み中...
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 散布図 */}
        {data && !loading && (
          <div className="flex justify-center">
            <div className="relative">
              <svg width={CHART_W} height={CHART_H} className="border border-gray-200 rounded bg-gray-50">
                {/* プロットエリア背景 */}
                <rect
                  x={MARGIN.left} y={MARGIN.top}
                  width={PLOT_W} height={PLOT_H}
                  fill="white" stroke="#E5E7EB"
                />

                {/* X軸グリッド + 目盛り */}
                {xTicks.map((v) => {
                  const pos = toSvg(v, yMin);
                  return (
                    <g key={`xt-${v}`}>
                      <line
                        x1={pos.x} y1={MARGIN.top}
                        x2={pos.x} y2={MARGIN.top + PLOT_H}
                        stroke="#E5E7EB" strokeWidth={0.5}
                      />
                      <text
                        x={pos.x} y={MARGIN.top + PLOT_H + 16}
                        textAnchor="middle" fontSize={10} fill="#6B7280"
                      >
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Y軸グリッド + 目盛り */}
                {yTicks.map((v) => {
                  const pos = toSvg(xMin, v);
                  return (
                    <g key={`yt-${v}`}>
                      <line
                        x1={MARGIN.left} y1={pos.y}
                        x2={MARGIN.left + PLOT_W} y2={pos.y}
                        stroke="#E5E7EB" strokeWidth={0.5}
                      />
                      <text
                        x={MARGIN.left - 6} y={pos.y + 4}
                        textAnchor="end" fontSize={10} fill="#6B7280"
                      >
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* X軸ラベル */}
                <text
                  x={MARGIN.left + PLOT_W / 2} y={CHART_H - 6}
                  textAnchor="middle" fontSize={12} fill="#374151" fontWeight={500}
                >
                  {'δV (MPa\u00BD)'}
                </text>

                {/* Y軸ラベル */}
                <text
                  x={14} y={MARGIN.top + PLOT_H / 2}
                  textAnchor="middle" fontSize={12} fill="#374151" fontWeight={500}
                  transform={`rotate(-90, 14, ${MARGIN.top + PLOT_H / 2})`}
                >
                  {'δH (MPa\u00BD)'}
                </text>

                {/* 溶媒プロット (青い丸) */}
                {data.solvents.map((s, i) => {
                  const pos = toSvg(s.deltaV, s.deltaH);
                  return (
                    <circle
                      key={`s-${i}`}
                      cx={pos.x} cy={pos.y} r={4}
                      fill="#3B82F6" fillOpacity={0.7}
                      stroke="#1D4ED8" strokeWidth={0.5}
                      className="cursor-pointer"
                      onMouseEnter={(e) => handleMouseEnter(s, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}

                {/* 部品プロット (赤い四角) */}
                {data.parts.map((p, i) => {
                  const pos = toSvg(p.deltaV, p.deltaH);
                  return (
                    <rect
                      key={`p-${i}`}
                      x={pos.x - 5} y={pos.y - 5} width={10} height={10}
                      fill="#EF4444" fillOpacity={0.7}
                      stroke="#B91C1C" strokeWidth={0.5}
                      className="cursor-pointer"
                      onMouseEnter={(e) => handleMouseEnter(p, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </svg>

              {/* ツールチップ */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap"
                  style={{
                    left: hoveredPoint.x + 12,
                    top: hoveredPoint.y - 8,
                  }}
                >
                  <div className="font-medium">{hoveredPoint.name}</div>
                  <div>
                    δV={hoveredPoint.deltaV.toFixed(2)} / δH={hoveredPoint.deltaH.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 凡例 */}
        {data && !loading && (
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-600 justify-center">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> 溶媒
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-500" /> 部品
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
