import { useStartSimilarDetection } from "@/components/SimilarImagesModal";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const OperateBtnContainer = () => {
  const { t } = useTranslation();
  const startSimilarDetection = useStartSimilarDetection();

  const toggleExpandOrCollapseAll = () => {
    const cards = document.querySelectorAll(`.imageCard`);
    const currentlyAllExpanded = Array.from(cards).every(
      (item) => item.getAttribute("data-expanded") === "true"
    );
    cards.forEach((item) => {
      item.setAttribute(
        "data-expanded",
        currentlyAllExpanded ? "false" : "true"
      );
    });
  };

  return (
    <div className={styles.operateBtnContainer}>
      <div className={styles.actionBtn} onClick={toggleExpandOrCollapseAll}>
        {t("expand_collapse")}
      </div>
      <div className={styles.actionBtn} onClick={startSimilarDetection}>
        {t("find_similar")}
      </div>
    </div>
  );
};

export default OperateBtnContainer;
