import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { Theme } from "@/consts/enum";
import useSettingModal from "@/hooks/useSettingModal";
import { isSettingIconIntersectingAtom } from "@/store/settings";
import { themeAtom } from "@/store/theme";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import styles from "./index.module.less";

const SettingButton = () => {
  const theme = useAtomValue(themeAtom);
  const setIsSettingIconIntersecting = useSetAtom(
    isSettingIconIntersectingAtom
  );
  const { showSettingModal } = useSettingModal();

  const settingButtonRef = React.useCallback((node: HTMLDivElement) => {
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

  return (
    <div
      ref={settingButtonRef}
      className={styles.settingButton}
      onClick={showSettingModal}
    >
      <SettingIcon
        className="settingIcon"
        color={theme === Theme.Light ? "#4CB6EC" : "#999"}
      />
    </div>
  );
};

export default SettingButton;
