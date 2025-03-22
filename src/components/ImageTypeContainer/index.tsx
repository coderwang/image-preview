import { numsAtom, showTypeAtom } from "@/store/imageType";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const ImageTypeContainer = () => {
  const [showType, updateShowType] = useAtom(showTypeAtom);
  const nums = useAtomValue(numsAtom);
  const { t } = useTranslation();

  return (
    <div className={styles.imageTypeContainer}>
      <div className="imageTypeTitle">{t("image_type")}:</div>
      <div
        className="imageTypeItemBtn"
        onClick={() => {
          updateShowType((draft) => {
            Object.keys(draft).forEach((key) => {
              draft[key as ImageType] = true;
            });
          });
        }}
      >
        {t("all")}
      </div>
      <div
        className="imageTypeItemBtn"
        onClick={() => {
          updateShowType((draft) => {
            Object.keys(draft).forEach((key) => {
              draft[key as ImageType] = !draft[key as ImageType];
            });
          });
        }}
      >
        {t("reverse")}
      </div>
      {(Object.entries(nums) as [ImageType, number][]).map(([item, count]) => {
        return (
          count > 0 && (
            <div className="imageTypeItem" key={item}>
              <input
                id={item}
                type="checkbox"
                checked={showType[item]}
                onChange={() =>
                  updateShowType((draft) => {
                    draft[item] = !draft[item];
                  })
                }
              />
              <label htmlFor={item}>
                {item.toUpperCase()}
                <i>({count})</i>
              </label>
            </div>
          )
        );
      })}
    </div>
  );
};

export default ImageTypeContainer;
