import empty from "assets/images/empty.png";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const EmptyBox = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyBox}>
      <img className="emptyImg" src={empty} alt="" />
      <div className="emptyText">{t("empty_text")}</div>
    </div>
  );
};

export default EmptyBox;
