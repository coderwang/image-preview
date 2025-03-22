import { Language } from "@/consts/enum";
import i18n from "i18next";
import { atom } from "jotai";

const baseLanguageAtom = atom<Language>(
  document.documentElement.getAttribute("lang") as Language
);

const languageAtom = atom(
  (get) => get(baseLanguageAtom),
  (get, set, update: Language | ((prev: Language) => Language)) => {
    const newLanguage =
      typeof update === "function" ? update(get(baseLanguageAtom)) : update;

    set(baseLanguageAtom, newLanguage);
    document.documentElement.setAttribute("lang", newLanguage);
    i18n.changeLanguage(newLanguage);
    VsCodeApi.postMessage({
      command: "updateLanguageConfig",
      language: newLanguage,
    });
  }
);

export { languageAtom };
