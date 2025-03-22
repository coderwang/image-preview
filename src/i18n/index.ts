import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enResource from "./locales/en.json";
import zhResource from "./locales/zh.json";

const resources = {
  en: {
    translation: enResource,
  },
  zh: {
    translation: zhResource,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: navigator.language.substring(0, 2) === "zh" ? "zh" : "en",
  fallbackLng: "en",
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});
