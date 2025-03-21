import { filteredCountAtom, totalCountAtom } from "@/webview/store/count";
import { useAtomValue } from "jotai";
import React from "react";
import styles from "./index.module.less";

const CounterContainer = () => {
  const filteredCount = useAtomValue(filteredCountAtom);
  const totalCount = useAtomValue(totalCountAtom);

  return (
    <div className={styles.countContainer}>
      <div>result: {filteredCount}</div>
      <div>total: {totalCount}</div>
    </div>
  );
};

export default CounterContainer;
