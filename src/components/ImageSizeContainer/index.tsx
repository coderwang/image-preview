import { imageSizeAtom } from "@/store/imageSize";
import { useAtom } from "jotai";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const ImageSizeContainer: React.FC = () => {
  const [imageSize, setImageSize] = useAtom(imageSizeAtom);
  const { t } = useTranslation();

  return (
    <div className={styles.imageSizeContainer}>
      <div className="imageSizeTitle">
        {t("image_size")}(<i>{imageSize}px</i>):
      </div>
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

export default ImageSizeContainer;
