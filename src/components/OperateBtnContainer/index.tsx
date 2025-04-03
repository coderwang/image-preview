import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const OperateBtnContainer = () => {
  const { t } = useTranslation();

  const expandAll = () => {
    document.querySelectorAll(`.imageCard`).forEach((item) => {
      item.setAttribute("data-expanded", "true");
    });
  };

  const collapseAll = () => {
    document.querySelectorAll(`.imageCard`).forEach((item) => {
      item.setAttribute("data-expanded", "false");
    });
  };

  return (
    <div className={styles.operateBtnContainer}>
      <div className="gradientBtn gradientStatic" onClick={expandAll}>
        {t("expand_all")}
      </div>
      <div className="gradientBtn gradientBorder" onClick={collapseAll}>
        {t("collapse_all")}
      </div>
    </div>
  );
};

export default OperateBtnContainer;
