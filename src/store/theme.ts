import { OperationEnum, Theme } from "@/consts/enum";
import { atom } from "jotai";

const baseThemeAtom = atom<Theme>(
  document.documentElement.getAttribute("data-theme") as Theme
);

const themeAtom = atom(
  (get) => get(baseThemeAtom),
  (get, set, update: Theme | ((prev: Theme) => Theme)) => {
    const newTheme =
      typeof update === "function" ? update(get(baseThemeAtom)) : update;

    set(baseThemeAtom, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    VsCodeApi.postMessage({
      command: OperationEnum.UpdateThemeConfig,
      theme: newTheme,
    });
  }
);

export { themeAtom };
