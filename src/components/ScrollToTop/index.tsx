import { ReactComponent as TopIcon } from "assets/svg/top.svg";
import React, { useEffect, useState } from "react";
import styles from "./index.module.less";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    window.addEventListener(
      "scroll",
      () => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        if (scrollPosition > 1000) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    visible && (
      <div
        className={styles.scrollToTop}
        onClick={() => {
          scrollTo({
            top: 0,
            behavior: "smooth", // 可选，平滑滚动
          });
        }}
      >
        <TopIcon className={styles.scrollToTopIcon} color="#ccc" />
      </div>
    )
  );
};

export default ScrollToTop;
