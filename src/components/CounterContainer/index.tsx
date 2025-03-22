import { filteredCountAtom, totalCountAtom } from "@/store/count";
import { useAtomValue } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const CounterContainer = () => {
  const { t } = useTranslation();
  const filteredCount = useAtomValue(filteredCountAtom);
  const totalCount = useAtomValue(totalCountAtom);

  return (
    <div className={styles.countContainer}>
      <div>
        {t("result")}: {filteredCount}
      </div>
      <div>
        {t("total")}: {totalCount}
      </div>
    </div>
  );
};

export default CounterContainer;
