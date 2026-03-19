/**
 * Teasプロット — HSP分率座標の三角図表示
 */
import React, { useState, useEffect, useCallback } from 'react';

/** Teas座標の1点 */
interface TeasPoint {
  name: string;
  fd: number;
  fp: number;
  fh: number;
  type: 'solvent' | 'part';
}

/** visualization:teasPlot の戻り値型 */
interface TeasPlotData {
  solvents: TeasPoint[];
  parts: TeasPoint[];
}

/** ツールチップ表示用の状態 */
interface HoveredPoint {
  name: string;
  fd: number;
  fp: number;
  fh: number;
  x: number;
  y: number;
}

// 三角図の寸法
const W = 400;
const H = 350;
const margin = 40;

// 三角形の頂点 (正三角形、中央配置)
const A = { x: margin, y: H - margin };          // 左下 (fd=1)
const B = { x: W - margin, y: H - margin };      // 右下 (fp=1)
const C = { x: W / 2, y: margin };               // 上 (fh=1)

/** Teas分率座標をSVG座標に変換 */
function teasToSvg(fd: number, fp: number, fh: number) {
  return {
    x: A.x * fd + B.x * fp + C.x * fh,
    y: A.y * fd + B.y * fp + C.y * fh,
  };
}

/** グリッド線の比率 (0.2刻み) */
const GRID_FRACTIONS = [0.2, 0.4, 0.6, 0.8];

export default function TeasPlotView() {
  const [data, setData] = useState<TeasPlotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.api.getTeasPlotData()
      .then((result: TeasPlotData) => setData(result))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Teasプロットデータの取得に失敗しました');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMouseEnter = useCallback(
    (point: TeasPoint, e: React.MouseEvent<SVGElement>) => {
      const svgRect = (e.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect();
      if (!svgRect) return;
      const clientX = e.clientX - svgRect.left;
      const clientY = e.clientY - svgRect.top;
      setHoveredPoint({
        name: point.name,
        fd: point.fd,
        fp: point.fp,
        fh: point.fh,
        x: clientX,
        y: clientY,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  /** グリッド線を描画する */
  const renderGridLines = () => {
    const lines: React.ReactNode[] = [];

    for (const f of GRID_FRACTIONS) {
      // fd=f の線 (A側から B-C辺に平行)
      const fdStart = teasToSvg(f, 1 - f, 0);
      const fdEnd = teasToSvg(f, 0, 1 - f);
      lines.push(
        <line
          key={`fd-${f}`}
          x1={fdStart.x} y1={fdStart.y}
          x2={fdEnd.x} y2={fdEnd.y}
          stroke="#D1D5DB" strokeWidth={0.5}
        />,
      );

      // fp=f の線 (B側から A-C辺に平行)
      const fpStart = teasToSvg(1 - f, f, 0);
      const fpEnd = teasToSvg(0, f, 1 - f);
      lines.push(
        <line
          key={`fp-${f}`}
          x1={fpStart.x} y1={fpStart.y}
          x2={fpEnd.x} y2={fpEnd.y}
          stroke="#D1D5DB" strokeWidth={0.5}
        />,
      );

      // fh=f の線 (C側から A-B辺に平行)
      const fhStart = teasToSvg(1 - f, 0, f);
      const fhEnd = teasToSvg(0, 1 - f, f);
      lines.push(
        <line
          key={`fh-${f}`}
          x1={fhStart.x} y1={fhStart.y}
          x2={fhEnd.x} y2={fhEnd.y}
          stroke="#D1D5DB" strokeWidth={0.5}
        />,
      );
    }

    return lines;
  };

  /** 目盛りラベルを描画する */
  const renderTickLabels = () => {
    const labels: React.ReactNode[] = [];
    const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

    for (const t of ticks) {
      // 底辺 (fd) 目盛り
      const fdPos = teasToSvg(t, 1 - t, 0);
      labels.push(
        <text
          key={`fd-label-${t}`}
          x={fdPos.x} y={fdPos.y + 14}
          textAnchor="middle" fontSize={9} fill="#6B7280"
        >
          {(t * 100).toFixed(0)}
        </text>,
      );
    }

    return labels;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Teasプロット (三角図)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          δD, δP, δH の分率座標を三角図にプロット。Teas (1968)
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

        {/* 三角図 */}
        {data && !loading && (
          <div className="flex justify-center">
            <div className="relative">
              <svg width={W} height={H} className="border border-gray-200 rounded bg-gray-50">
                {/* グリッド線 */}
                {renderGridLines()}

                {/* 三角形の外枠 */}
                <polygon
                  points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                  fill="none" stroke="#374151" strokeWidth={1.5}
                />

                {/* 頂点ラベル */}
                <text x={A.x - 4} y={A.y + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1F2937">
                  fd (δD分率)
                </text>
                <text x={B.x + 4} y={B.y + 18} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1F2937">
                  fp (δP分率)
                </text>
                <text x={C.x} y={C.y - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#1F2937">
                  fh (δH分率)
                </text>

                {/* 目盛りラベル */}
                {renderTickLabels()}

                {/* 溶媒プロット (青い丸) */}
                {data.solvents.map((s, i) => {
                  const pos = teasToSvg(s.fd, s.fp, s.fh);
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
                  const pos = teasToSvg(p.fd, p.fp, p.fh);
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
                    fd={hoveredPoint.fd.toFixed(3)} / fp={hoveredPoint.fp.toFixed(3)} / fh={hoveredPoint.fh.toFixed(3)}
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
