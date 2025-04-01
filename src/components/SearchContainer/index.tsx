import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { Theme } from "@/consts/enum";
import { searchValueAtom } from "@/store/searchValue";
import {
  isSettingIconIntersectingAtom,
  isSettingModalOpenAtom,
} from "@/store/settings";
import { themeAtom } from "@/store/theme";
import { refreshPage } from "@/utils";
import { ReactComponent as RefreshIcon } from "assets/svg/refresh.svg";
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
        <RefreshIcon
          className="refresh"
          color={theme === Theme.Light ? "#4CB6EC" : "#999"}
          onClick={() => {
            refreshPage();
          }}
        />
      </div>
    </div>
  );
};

export default SearchContainer;
