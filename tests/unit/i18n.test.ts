import { describe, it, expect } from 'vitest';
import { jaTranslations, enTranslations, SUPPORTED_LANGUAGES } from '../../src/i18n/translations';

describe('SUPPORTED_LANGUAGES', () => {
  it('日本語と英語が含まれる', () => {
    expect(SUPPORTED_LANGUAGES).toContain('ja');
    expect(SUPPORTED_LANGUAGES).toContain('en');
  });
});

describe('翻訳キーの整合性', () => {
  it('日本語と英語で同じキーセットを持つ', () => {
    const jaKeys = Object.keys(jaTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();
    expect(jaKeys).toEqual(enKeys);
  });

  it('全キーに空でない値が設定されている', () => {
    for (const [key, value] of Object.entries(jaTranslations)) {
      expect(value, `ja: ${key}`).toBeTruthy();
    }
    for (const [key, value] of Object.entries(enTranslations)) {
      expect(value, `en: ${key}`).toBeTruthy();
    }
  });

  it('主要なUIキーが存在する', () => {
    const requiredKeys = [
      'app.title',
      'nav.evaluation',
      'nav.settings',
      'common.save',
      'common.cancel',
      'common.csvExport',
      'common.evaluate',
      'settings.theme',
      'settings.thresholds',
    ];
    for (const key of requiredKeys) {
      expect(jaTranslations[key], `ja missing: ${key}`).toBeTruthy();
      expect(enTranslations[key], `en missing: ${key}`).toBeTruthy();
    }
  });
});
