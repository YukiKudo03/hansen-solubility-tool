import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import NavigationDrawer from './components/NavigationDrawer';
import NavigationRail from './components/NavigationRail';
import BottomNavigation from './components/BottomNavigation';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import type { Tab } from './navigation';

import ReportView from './components/ReportView';
import DatabaseEditor from './components/DatabaseEditor';
import SettingsView from './components/SettingsView';
import MixtureLab from './components/MixtureLab';
import NanoDispersionView from './components/NanoDispersionView';
import ContactAngleView from './components/ContactAngleView';
import SwellingView from './components/SwellingView';
import DrugSolubilityView from './components/DrugSolubilityView';
import BlendOptimizerView from './components/BlendOptimizerView';
import ChemicalResistanceView from './components/ChemicalResistanceView';
import PlasticizerView from './components/PlasticizerView';
import CarrierSelectionView from './components/CarrierSelectionView';
import DispersantSelectionView from './components/DispersantSelectionView';
import EvaluationHistoryView from './components/EvaluationHistoryView';
import ComparisonView from './components/ComparisonView';
import HSPVisualizationView from './components/HSPVisualizationView';
import ESCPipelineView from './components/ESCPipelineView';
import CocrystalScreeningView from './components/CocrystalScreeningView';
import Printing3dSmoothingView from './components/Printing3dSmoothingView';
import DielectricFilmView from './components/DielectricFilmView';
import ExcipientCompatibilityView from './components/ExcipientCompatibilityView';
import PolymerBlendMiscibilityView from './components/PolymerBlendMiscibilityView';
import PolymerRecyclingCompatibilityView from './components/PolymerRecyclingCompatibilityView';
import CompatibilizerSelectionView from './components/CompatibilizerSelectionView';
import CopolymerHspEstimationView from './components/CopolymerHspEstimationView';

const VIEW_MAP: Record<Tab, React.ComponentType> = {
  report: ReportView,
  database: DatabaseEditor,
  mixture: MixtureLab,
  nanoDispersion: NanoDispersionView,
  contactAngle: ContactAngleView,
  blendOptimizer: BlendOptimizerView,
  swelling: SwellingView,
  drugSolubility: DrugSolubilityView,
  chemicalResistance: ChemicalResistanceView,
  plasticizer: PlasticizerView,
  carrierSelection: CarrierSelectionView,
  dispersantSelection: DispersantSelectionView,
  history: EvaluationHistoryView,
  comparison: ComparisonView,
  hspVisualization: HSPVisualizationView,
  escPipeline: ESCPipelineView,
  cocrystalScreening: CocrystalScreeningView,
  printing3dSmoothing: Printing3dSmoothingView,
  dielectricFilm: DielectricFilmView,
  excipientCompatibility: ExcipientCompatibilityView,
  polymerBlendMiscibility: PolymerBlendMiscibilityView,
  polymerRecyclingCompatibility: PolymerRecyclingCompatibilityView,
  compatibilizerSelection: CompatibilizerSelectionView,
  copolymerHspEstimation: CopolymerHspEstimationView,
  settings: SettingsView,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const screenSize = useMediaQuery();
  useTheme(); // テーマの CSS 変数とクラスを適用
  const ActiveView = VIEW_MAP[activeTab];

  return (
    <div className="h-screen bg-md3-surface flex flex-col">
      {/* ヘッダー */}
      <header className="bg-md3-surface-container-low border-b border-md3-outline-variant px-4 py-2 shrink-0">
        <h1 className="text-md3-title-lg text-md3-on-surface">
          Hansen溶解度パラメータ 溶解性評価ツール
        </h1>
      </header>

      {/* メインエリア */}
      <div className="flex-1 flex overflow-hidden">
        {screenSize === 'desktop' && (
          <NavigationDrawer activeTab={activeTab} onSelect={setActiveTab} />
        )}
        {screenSize === 'tablet' && (
          <NavigationRail activeTab={activeTab} onSelect={setActiveTab} />
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <ErrorBoundary>
            <ActiveView />
          </ErrorBoundary>
        </main>
      </div>

      {screenSize === 'mobile' && (
        <BottomNavigation activeTab={activeTab} onSelect={setActiveTab} />
      )}
    </div>
  );
}
