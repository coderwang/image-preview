import { Theme } from "@/consts/enum";
import { themeAtom } from "@/store/theme";
import { App, Radio } from "antd";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const useSettingModal = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const showSettingModal = () => {
    modal.info({
      className: styles.settingsModal,
      title: "Settings",
      content: (
        <div className={styles.settingsContent}>
          <div className={styles.themeContainer}>
            <div className={styles.themeTitle}>Theme:</div>
            <Radio.Group
              className={styles.themeRadioGroup}
              block
              options={[
                { label: "☀️ Light", value: Theme.Light },
                { label: "🌙 Dark", value: Theme.Dark },
              ]}
              defaultValue={theme}
              optionType="button"
              buttonStyle="solid"
              onChange={(e) => {
                setTheme(e.target.value);
              }}
            />
          </div>
        </div>
      ),
      icon: null,
      okText: t("ok"),
    });
  };

  return {
    showSettingModal,
  };
};

export default useSettingModal;
