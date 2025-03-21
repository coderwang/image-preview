import { Theme } from "@/consts/enum";
import { isThemeToggleIntersectingAtom, themeAtom } from "@/store/theme";
import { useAtom, useSetAtom } from "jotai";
import React from "react";
import styles from "./index.module.less";

const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const setIsThemeToggleIntersecting = useSetAtom(
    isThemeToggleIntersectingAtom
  );

  const themeToggleRef = React.useCallback((node: HTMLDivElement) => {
    if (node) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsThemeToggleIntersecting(true);
          } else {
            setIsThemeToggleIntersecting(false);
          }
        });
      });
      observer.observe(node);
    }
  }, []);

  return (
    <div
      ref={themeToggleRef}
      className={styles.themeToggle}
      onClick={() =>
        setTheme((prev) => (prev === Theme.Light ? Theme.Dark : Theme.Light))
      }
    >
      {theme === Theme.Light ? "🌙" : "☀️"}
    </div>
  );
};

export default ThemeToggle;
