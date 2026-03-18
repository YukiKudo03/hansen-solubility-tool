import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
import type { PartsGroup, Solvent } from '../../core/types';
import { buildScatterData, buildSphereData, redToColor } from '../../core/hsp-visualization';
import { calculateRed } from '../../core/hsp';
import PartsGroupSelector from './PartsGroupSelector';

export default function HSPVisualizationView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [showSpheres, setShowSpheres] = useState(true);
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    window.api.getAllSolvents()
      .then(setSolvents)
      .catch((e) => setLoadError(e instanceof Error ? e.message : '溶媒の読み込みに失敗しました'));
  }, []);

  // 溶媒の散布点データ
  const solventScatter = useMemo(() => buildScatterData(solvents), [solvents]);

  // 部品のHSP球データ + 溶媒の色分け
  const plotData = useMemo(() => {
    const traces: any[] = [];

    // 溶媒散布点（部品が選択されている場合はRED値で色分け）
    if (selectedGroup && selectedGroup.parts.length > 0) {
      const firstPart = selectedGroup.parts[0];
      const colors = solvents.map((s) => {
        const red = calculateRed(firstPart.hsp, s.hsp, firstPart.r0);
        return redToColor(red);
      });

      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        name: '溶媒',
        x: solventScatter.x,
        y: solventScatter.y,
        z: solventScatter.z,
        text: solventScatter.names,
        hovertemplate: '%{text}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<extra></extra>',
        marker: { size: 4, color: colors, opacity: 0.8 },
      });

      // HSP球
      if (showSpheres) {
        for (const part of selectedGroup.parts) {
          const sphere = buildSphereData(part);
          traces.push({
            type: 'mesh3d',
            name: part.name,
            x: sphere.vertices.x,
            y: sphere.vertices.y,
            z: sphere.vertices.z,
            alphahull: 0,
            opacity: 0.15,
            color: '#3B82F6',
            hoverinfo: 'name',
          });
          // 中心点
          traces.push({
            type: 'scatter3d',
            mode: 'markers+text',
            name: `${part.name} (中心)`,
            x: [sphere.center.x],
            y: [sphere.center.y],
            z: [sphere.center.z],
            text: [part.name],
            textposition: 'top center',
            marker: { size: 6, color: '#1D4ED8', symbol: 'diamond' },
            hovertemplate: `${part.name}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<br>R₀=${part.r0.toFixed(1)}<extra></extra>`,
          });
        }
      }
    } else {
      // 部品未選択時は溶媒のみ表示
      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        name: '溶媒',
        x: solventScatter.x,
        y: solventScatter.y,
        z: solventScatter.z,
        text: solventScatter.names,
        hovertemplate: '%{text}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<extra></extra>',
        marker: { size: 4, color: '#6B7280', opacity: 0.6 },
      });
    }

    return traces;
  }, [selectedGroup, solvents, solventScatter, showSpheres]);

  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 30, b: 0 },
    scene: {
      xaxis: { title: 'δD (MPa½)' },
      yaxis: { title: 'δP (MPa½)' },
      zaxis: { title: 'δH (MPa½)' },
    },
    showlegend: true,
    legend: { x: 0, y: 1 },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">HSP 3D可視化</h2>
        <p className="text-xs text-gray-500 mb-4">
          δD-δP-δH空間に溶媒と材料のHSP球をプロットします。HSP球内の溶媒は溶解リスクが高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => setSelectedGroup(g)}
            selected={selectedGroup}
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSpheres}
                onChange={(e) => setShowSpheres(e.target.checked)}
                className="rounded border-gray-300"
              />
              HSP球を表示
            </label>
          </div>
        </div>

        {selectedGroup && (
          <div className="text-xs text-gray-500 mb-2">
            溶媒: {solvents.length}種 / 材料: {selectedGroup.parts.length}種
            {selectedGroup.parts.length > 0 && (
              <span className="ml-2">
                （色: 緑=安全 → 黄=注意 → 赤=危険、{selectedGroup.parts[0].name} 基準）
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3Dプロット */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 600 }}>
        <Plot
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
