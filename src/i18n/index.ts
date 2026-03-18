import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { jaTranslations, enTranslations } from './translations';

const savedLanguage = typeof localStorage !== 'undefined'
  ? localStorage.getItem('language')
  : null;

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: jaTranslations },
    en: { translation: enTranslations },
  },
  lng: savedLanguage ?? 'ja',
  fallbackLng: 'ja',
  // escapeValue: false はReact環境で推奨（React自体がエスケープするため）
  interpolation: { escapeValue: false },
});

export default i18n;
