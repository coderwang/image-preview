import { backgroundColorAtom } from "@/store/bgc";
import { ColorPicker } from "antd";
import { useAtom } from "jotai";
import React, { useEffect, useMemo } from "react";
import styles from "./index.module.less";

const BackgroundContainer = () => {
  const [backgroundColor, setBackgroundColor] = useAtom(backgroundColorAtom);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  useEffect(() => {
    if (isPickerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPickerOpen]);

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
      <ColorPicker
        value={backgroundColor}
        onChangeComplete={setBackgroundColor}
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
      />
    </div>
  );
};

export default BackgroundContainer;
