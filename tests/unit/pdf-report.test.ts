import { describe, it, expect } from 'vitest';
import {
  buildPdfReportData,
  formatPdfTimestamp,
} from '../../src/core/pdf-report';

describe('formatPdfTimestamp', () => {
  it('Date を日本語フォーマットに変換', () => {
    const date = new Date('2026-03-18T10:30:00Z');
    const result = formatPdfTimestamp(date);
    expect(result).toContain('2026');
    expect(result).toContain('3');
  });
});

describe('buildPdfReportData', () => {
  it('パイプライン名からレポートタイトルを生成', () => {
    const data = buildPdfReportData('risk', { partsGroup: { name: 'テストG' } }, new Date());
    expect(data.title).toContain('溶解性評価');
  });

  it('全パイプラインでタイトルが生成される', () => {
    const pipelines = [
      'risk', 'contactAngle', 'swelling', 'chemicalResistance',
      'nanoDispersion', 'plasticizer', 'carrierSelection',
      'blendOptimizer', 'drugSolubility',
    ];
    for (const p of pipelines) {
      const data = buildPdfReportData(p, {}, new Date());
      expect(data.title, `${p} のタイトル`).toBeTruthy();
      expect(data.pipeline).toBe(p);
    }
  });

  it('評価日時が含まれる', () => {
    const now = new Date();
    const data = buildPdfReportData('risk', {}, now);
    expect(data.evaluatedAt).toBeTruthy();
  });

  it('免責事項テキストが含まれる', () => {
    const data = buildPdfReportData('risk', {}, new Date());
    expect(data.disclaimer).toBeTruthy();
    expect(data.disclaimer.length).toBeGreaterThan(10);
  });
});
