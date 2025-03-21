import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { Theme } from "@/consts/enum";
import { isSettingIconIntersectingAtom, themeAtom } from "@/store/theme";
import { App } from "antd";
import { useAtom, useSetAtom } from "jotai";
import React from "react";
import styles from "./index.module.less";

const Settings = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const setIsSettingIconIntersecting = useSetAtom(
    isSettingIconIntersectingAtom
  );

  const settingRef = React.useCallback((node: HTMLDivElement) => {
    if (node) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSettingIconIntersecting(true);
          } else {
            setIsSettingIconIntersecting(false);
          }
        });
      });
      observer.observe(node);
    }
  }, []);

  const { modal } = App.useApp();

  const handleSettingClick = () => {
    modal.info({
      title: "Settings",
      content: <div>Settings</div>,
    });
  };

  return (
    <div
      ref={settingRef}
      className={styles.settings}
      onClick={handleSettingClick}
    >
      <SettingIcon
        className="settingIcon"
        color={theme === Theme.Light ? "#4CB6EC" : "#999"}
      />
    </div>
  );
};

export default Settings;
