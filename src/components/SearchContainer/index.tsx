import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { Theme } from "@/consts/enum";
import useSettingModal from "@/hooks/useSettingModal";
import { searchValueAtom } from "@/store/searchValue";
import { isSettingIconIntersectingAtom, themeAtom } from "@/store/theme";
import { ReactComponent as Top } from "assets/svg/top.svg";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import styles from "./index.module.less";

const SearchContainer: React.FC = () => {
  const isSettingIconIntersecting = useAtomValue(isSettingIconIntersectingAtom);
  const theme = useAtomValue(themeAtom);
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const { showSettingModal } = useSettingModal();

  return (
    <div className={styles.searchContainer}>
      <div className="searchTitle">Search:</div>
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        type="text"
        placeholder="Image name"
      />
      <div className="iconContainer">
        {!isSettingIconIntersecting && (
          <div className="themeIcon" onClick={showSettingModal}>
            <SettingIcon
              className="settingIcon"
              color={theme === Theme.Light ? "#4CB6EC" : "#999"}
            />
          </div>
        )}
        <Top
          className="backTop"
          color={theme === Theme.Light ? "#4CB6EC" : "#999"}
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        />
      </div>
    </div>
  );
};

export default SearchContainer;
