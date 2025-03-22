import { Language, Theme } from "@/consts/enum";
import { languageAtom } from "@/store/language";
import { themeAtom } from "@/store/theme";
import { App, Radio } from "antd";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const useSettingModal = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const showSettingModal = () => {
    modal.info({
      className: styles.settingsModal,
      title: t("settings"),
      content: (
        <div className={styles.settingsContent}>
          <div className={styles.themeContainer}>
            <div className={styles.title}>{t("theme")}</div>
            <Radio.Group
              className={styles.radioGroup}
              block
              options={[
                { label: `☀️ ${t("light")}`, value: Theme.Light },
                { label: `🌙 ${t("dark")}`, value: Theme.Dark },
              ]}
              defaultValue={theme}
              optionType="button"
              buttonStyle="solid"
              onChange={(e) => {
                setTheme(e.target.value);
              }}
            />
          </div>
          <div className={styles.languageContainer}>
            <div className={styles.title}>{t("language")}</div>
            <Radio.Group
              className={styles.radioGroup}
              block
              options={[
                { label: "🇨🇳 简体中文", value: Language.Chinese },
                { label: "🇺🇸 English", value: Language.English },
              ]}
              defaultValue={language}
              optionType="button"
              buttonStyle="solid"
              onChange={(e) => {
                setLanguage(e.target.value);
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
