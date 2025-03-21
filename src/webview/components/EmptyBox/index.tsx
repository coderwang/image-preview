import empty from "assets/images/empty.png";
import React from "react";
import styles from "./index.module.less";

const EmptyBox = () => {
  return (
    <div className={styles.emptyBox}>
      <img className="emptyImg" src={empty} alt="" />
      <div className="emptyText">No images found</div>
    </div>
  );
};

export default EmptyBox;
