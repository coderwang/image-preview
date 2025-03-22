import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { Theme } from "@/consts/enum";
import { searchValueAtom } from "@/store/searchValue";
import {
  isSettingIconIntersectingAtom,
  isSettingModalOpenAtom,
} from "@/store/settings";
import { themeAtom } from "@/store/theme";
import { ReactComponent as Top } from "assets/svg/top.svg";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const SearchContainer: React.FC = () => {
  const isSettingIconIntersecting = useAtomValue(isSettingIconIntersectingAtom);
  const theme = useAtomValue(themeAtom);
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const { t } = useTranslation();
  const setIsSettingModalOpen = useSetAtom(isSettingModalOpenAtom);

  return (
    <div className={styles.searchContainer}>
      <div className="searchTitle">{t("search")}:</div>
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        type="text"
        placeholder={t("search_placeholder")}
      />
      <div className="iconContainer">
        {!isSettingIconIntersecting && (
          <div
            className="themeIcon"
            onClick={() => setIsSettingModalOpen(true)}
          >
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
