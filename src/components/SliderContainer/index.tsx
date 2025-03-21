import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React from "react";
import styles from "./index.module.less";

interface SliderContainerProps {
  value: number;
  onChange: (value: number) => void;
}

const SliderContainer: React.FC<SliderContainerProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className={styles.sliderContainer}>
      <div className="sliderTitle">Image size({value}px):</div>
      <Slider
        className="slider"
        min={30}
        max={200}
        value={value}
        onChange={(value) => onChange(value as number)}
      />
    </div>
  );
};

export default SliderContainer;
