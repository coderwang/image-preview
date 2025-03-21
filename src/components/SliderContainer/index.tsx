import { imageSizeAtom } from "@/store/imageSize";
import { useAtom } from "jotai";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React from "react";
import styles from "./index.module.less";

const SliderContainer: React.FC = () => {
  const [imageSize, setImageSize] = useAtom(imageSizeAtom);

  return (
    <div className={styles.sliderContainer}>
      <div className="sliderTitle">Image size({imageSize}px):</div>
      <Slider
        className="slider"
        min={30}
        max={200}
        value={imageSize}
        onChange={(value) => setImageSize(value as number)}
      />
    </div>
  );
};

export default SliderContainer;
