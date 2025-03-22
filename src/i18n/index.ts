import { Language } from "@/consts/enum";
import store from "@/store";
import { languageAtom } from "@/store/language";
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
  lng: store.get(languageAtom),
  fallbackLng: Language.English,
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});
