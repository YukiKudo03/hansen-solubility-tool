/**
 * 2D射影 — Hansen空間の3面図 (δD-δP, δP-δH, δD-δH)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

/** 散布図の1点 */
interface ProjectionPoint {
  name: string;
  x: number;
  y: number;
  r0?: number;
  type: 'solvent' | 'part';
}

/** 1つの射影面データ */
interface ProjectionPane {
  xLabel: string;
  yLabel: string;
  solvents: ProjectionPoint[];
  parts: ProjectionPoint[];
}

/** visualization:projection2d の戻り値型 */
interface Projection2DData {
  projections: ProjectionPane[];
}

/** ツールチップ用の状態 */
interface HoveredPoint {
  name: string;
  xVal: number;
  yVal: number;
  screenX: number;
  screenY: number;
  xLabel: string;
  yLabel: string;
}

// 個別チャートの寸法
const CHART_SIZE = 300;
const MARGIN = { top: 20, right: 20, bottom: 45, left: 50 };
const PLOT_SIZE = CHART_SIZE - MARGIN.left - MARGIN.right;

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

function generateTicks(min: number, max: number, targetTicks = 5): number[] {
  const step = niceStep(max - min, targetTicks);
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }
  return ticks;
}

// ──────────────────────────────
// 再利用可能なサブコンポーネント
// ──────────────────────────────
interface ProjectionChartProps {
  pane: ProjectionPane;
  onHover: (point: HoveredPoint | null) => void;
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ pane, onHover }) => {
  const allPoints = [...pane.solvents, ...pane.parts];

  const { xMin, xMax, yMin, yMax, xTicks, yTicks } = useMemo(() => {
    if (allPoints.length === 0) {
      return { xMin: 0, xMax: 30, yMin: 0, yMax: 30, xTicks: [], yTicks: [] };
    }

    const xVals = allPoints.map((p) => p.x);
    const yVals = allPoints.map((p) => p.y);

    const rawXMin = Math.min(...xVals);
    const rawXMax = Math.max(...xVals);
    const rawYMin = Math.min(...yVals);
    const rawYMax = Math.max(...yVals);

    // r0を考慮してパディングを広げる
    const maxR0 = Math.max(0, ...pane.parts.filter((p) => p.r0).map((p) => p.r0!));
    const xPad = Math.max((rawXMax - rawXMin) * 0.1, maxR0, 2);
    const yPad = Math.max((rawYMax - rawYMin) * 0.1, maxR0, 2);

    const x0 = Math.max(0, rawXMin - xPad);
    const x1 = rawXMax + xPad;
    const y0 = Math.max(0, rawYMin - yPad);
    const y1 = rawYMax + yPad;

    return {
      xMin: x0, xMax: x1, yMin: y0, yMax: y1,
      xTicks: generateTicks(x0, x1),
      yTicks: generateTicks(y0, y1),
    };
  }, [allPoints, pane.parts]);

  const toSvg = useCallback(
    (vx: number, vy: number) => ({
      x: MARGIN.left + ((vx - xMin) / (xMax - xMin)) * PLOT_SIZE,
      y: MARGIN.top + (1 - (vy - yMin) / (yMax - yMin)) * PLOT_SIZE,
    }),
    [xMin, xMax, yMin, yMax],
  );

  /** r0 をピクセルスケールに変換 */
  const r0ToPx = useCallback(
    (r0: number) => (r0 / (xMax - xMin)) * PLOT_SIZE,
    [xMin, xMax],
  );

  const handleMouseEnter = useCallback(
    (point: ProjectionPoint, e: React.MouseEvent<SVGElement>) => {
      const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
      if (!svgRect) return;
      onHover({
        name: point.name,
        xVal: point.x,
        yVal: point.y,
        screenX: e.clientX - svgRect.left + svgRect.left,
        screenY: e.clientY - svgRect.top + svgRect.top,
        xLabel: pane.xLabel,
        yLabel: pane.yLabel,
      });
    },
    [onHover, pane.xLabel, pane.yLabel],
  );

  return (
    <svg
      width={CHART_SIZE} height={CHART_SIZE}
      className="border border-gray-200 rounded bg-gray-50"
    >
      {/* プロット背景 */}
      <rect
        x={MARGIN.left} y={MARGIN.top}
        width={PLOT_SIZE} height={PLOT_SIZE}
        fill="white" stroke="#E5E7EB"
      />

      {/* X軸グリッド + 目盛り */}
      {xTicks.map((v) => {
        const pos = toSvg(v, yMin);
        return (
          <g key={`xt-${v}`}>
            <line
              x1={pos.x} y1={MARGIN.top}
              x2={pos.x} y2={MARGIN.top + PLOT_SIZE}
              stroke="#E5E7EB" strokeWidth={0.5}
            />
            <text
              x={pos.x} y={MARGIN.top + PLOT_SIZE + 14}
              textAnchor="middle" fontSize={9} fill="#6B7280"
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
              x2={MARGIN.left + PLOT_SIZE} y2={pos.y}
              stroke="#E5E7EB" strokeWidth={0.5}
            />
            <text
              x={MARGIN.left - 5} y={pos.y + 3}
              textAnchor="end" fontSize={9} fill="#6B7280"
            >
              {v.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* X軸ラベル */}
      <text
        x={MARGIN.left + PLOT_SIZE / 2} y={CHART_SIZE - 6}
        textAnchor="middle" fontSize={11} fill="#374151" fontWeight={500}
      >
        {pane.xLabel}
      </text>

      {/* Y軸ラベル */}
      <text
        x={12} y={MARGIN.top + PLOT_SIZE / 2}
        textAnchor="middle" fontSize={11} fill="#374151" fontWeight={500}
        transform={`rotate(-90, 12, ${MARGIN.top + PLOT_SIZE / 2})`}
      >
        {pane.yLabel}
      </text>

      {/* 部品の r0 円 (破線) */}
      {pane.parts.map((p, i) => {
        if (!p.r0) return null;
        const center = toSvg(p.x, p.y);
        const rPx = r0ToPx(p.r0);
        return (
          <circle
            key={`r0-${i}`}
            cx={center.x} cy={center.y} r={rPx}
            fill="none" stroke="#EF4444" strokeWidth={1}
            strokeDasharray="4 3" opacity={0.5}
          />
        );
      })}

      {/* 溶媒プロット (青い丸) */}
      {pane.solvents.map((s, i) => {
        const pos = toSvg(s.x, s.y);
        return (
          <circle
            key={`s-${i}`}
            cx={pos.x} cy={pos.y} r={3}
            fill="#3B82F6" fillOpacity={0.7}
            stroke="#1D4ED8" strokeWidth={0.5}
            className="cursor-pointer"
            onMouseEnter={(e) => handleMouseEnter(s, e)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}

      {/* 部品プロット (赤い丸) */}
      {pane.parts.map((p, i) => {
        const pos = toSvg(p.x, p.y);
        return (
          <circle
            key={`p-${i}`}
            cx={pos.x} cy={pos.y} r={4}
            fill="#EF4444" fillOpacity={0.8}
            stroke="#B91C1C" strokeWidth={0.5}
            className="cursor-pointer"
            onMouseEnter={(e) => handleMouseEnter(p, e)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </svg>
  );
};

// ──────────────────────────────
// メインビュー
// ──────────────────────────────
export default function Projection2DView() {
  const [data, setData] = useState<Projection2DData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.api.getProjection2DData()
      .then((result: Projection2DData) => setData(result))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '2D射影データの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          2D射影 (3面図)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Hansen空間をδD-δP, δP-δH, δD-δH平面に射影
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

        {/* 3つの射影チャート */}
        {data && !loading && (
          <>
            <div className="flex flex-wrap gap-4 justify-center relative">
              {data.projections.map((pane, i) => (
                <ProjectionChart
                  key={i}
                  pane={pane}
                  onHover={setHoveredPoint}
                />
              ))}

              {/* ツールチップ (コンテナ外に固定位置で表示) */}
              {hoveredPoint && (
                <div
                  className="fixed pointer-events-none z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap"
                  style={{
                    left: hoveredPoint.screenX + 12,
                    top: hoveredPoint.screenY - 8,
                  }}
                >
                  <div className="font-medium">{hoveredPoint.name}</div>
                  <div>
                    {hoveredPoint.xLabel}={hoveredPoint.xVal.toFixed(2)} / {hoveredPoint.yLabel}={hoveredPoint.yVal.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* 凡例 */}
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-600 justify-center">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" /> 溶媒
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> 部品
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-6 h-0 border-t border-dashed border-red-400" /> r0 (相互作用半径)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
