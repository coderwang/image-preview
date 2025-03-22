import { Language, Theme } from "@/consts/enum";
import { languageAtom } from "@/store/language";
import { isSettingModalOpenAtom } from "@/store/settings";
import { themeAtom } from "@/store/theme";
import { Modal, Radio } from "antd";
import { useAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const SettingModal = () => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useAtom(
    isSettingModalOpenAtom
  );
  const [theme, setTheme] = useAtom(themeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const { t } = useTranslation();

  return (
    <Modal
      className={styles.settingsModal}
      open={isSettingModalOpen}
      title={t("settings")}
      closable={false}
      cancelButtonProps={{
        style: {
          display: "none",
        },
      }}
      okText={t("ok")}
      onOk={() => {
        setIsSettingModalOpen(false);
      }}
    >
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
    </Modal>
  );
};

export default SettingModal;
