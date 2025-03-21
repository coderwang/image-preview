import { backgroundColorAtom } from "@/store/bgc";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import styles from "./index.module.less";

const BackgroundContainer = () => {
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);

  const backgroundList = useMemo(() => {
    return ["#fff", "#8eeed8", "#8ec6ee", "#ee8ead", "#eead8e"];
  }, []);

  return (
    <div className={styles.backgroundContainer}>
      <div className="backgroundTitle">Background color: </div>
      {backgroundList.map((item) => {
        return (
          <div
            className="backgroundBox"
            style={{
              backgroundColor: item,
              transform: backgroundColor === item ? "scale(1.2)" : "scale(1)",
            }}
            onClick={() => setBackgroundColor(item)}
          />
        );
      })}
    </div>
  );
};

export default BackgroundContainer;
