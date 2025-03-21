import { numsAtom, showTypeAtom } from "@/store/typeAndNums";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import styles from "./index.module.less";

const ImageTypeContainer = () => {
  const [showType, updateShowType] = useAtom(showTypeAtom);
  const nums = useAtomValue(numsAtom);

  return (
    <div className={styles.imageTypeContainer}>
      <div className="imageTypeTitle">Image type:</div>
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
        All
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
        Reversed
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
