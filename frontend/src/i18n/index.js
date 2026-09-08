import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ja from "./locales/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ja"],
    // ブラウザのlocaleから自動判定する。ユーザーが手動で切り替えた場合は
    // localStorageに記憶し、次回以降はそちらを優先する
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // Reactは標準でXSS対策済みのため不要
    },
  });

export default i18n;
