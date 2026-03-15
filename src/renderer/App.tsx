import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
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

type Tab = 'report' | 'database' | 'mixture' | 'nanoDispersion' | 'contactAngle' | 'blendOptimizer' | 'swelling' | 'drugSolubility' | 'chemicalResistance' | 'plasticizer' | 'carrierSelection' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('report');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'report', label: '溶解性評価' },
    { id: 'database', label: 'データベース編集' },
    { id: 'mixture', label: '混合溶媒' },
    { id: 'nanoDispersion', label: 'ナノ粒子分散' },
    { id: 'contactAngle', label: '接触角推定' },
    { id: 'blendOptimizer', label: '溶剤ブレンド最適化' },
    { id: 'swelling', label: '膨潤度予測' },
    { id: 'drugSolubility', label: '薬物溶解性' },
    { id: 'chemicalResistance', label: '耐薬品性予測' },
    { id: 'plasticizer', label: '可塑剤選定' },
    { id: 'carrierSelection', label: 'キャリア選定（DDS）' },
    { id: 'settings', label: '設定' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <h1 className="text-xl font-bold text-gray-800">
          Hansen溶解度パラメータ 溶解性評価ツール
        </h1>
      </header>

      {/* タブナビゲーション */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1 p-6">
        <ErrorBoundary>
          {activeTab === 'report' && <ReportView />}
          {activeTab === 'database' && <DatabaseEditor />}
          {activeTab === 'mixture' && <MixtureLab />}
          {activeTab === 'nanoDispersion' && <NanoDispersionView />}
          {activeTab === 'contactAngle' && <ContactAngleView />}
          {activeTab === 'blendOptimizer' && <BlendOptimizerView />}
          {activeTab === 'swelling' && <SwellingView />}
          {activeTab === 'drugSolubility' && <DrugSolubilityView />}
          {activeTab === 'chemicalResistance' && <ChemicalResistanceView />}
          {activeTab === 'plasticizer' && <PlasticizerView />}
          {activeTab === 'carrierSelection' && <CarrierSelectionView />}
          {activeTab === 'settings' && <SettingsView />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
