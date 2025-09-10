import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { DropdownItemEnum } from "@/consts/enum";
import { isSettingModalOpenAtom } from "@/store/modal";
import { searchValueAtom } from "@/store/searchValue";
import { themeAtom } from "@/store/theme";
import { refreshPage } from "@/utils";
import { Dropdown } from "antd";
import { ReactComponent as MoreIcon } from "assets/svg/more.svg";
import { ReactComponent as RefreshIcon } from "assets/svg/refresh.svg";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const SearchContainer: React.FC = () => {
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
        <Dropdown
          menu={{
            className: styles.customDropdown,
            items: [
              {
                icon: <RefreshIcon />,
                label: t("refresh"),
                key: DropdownItemEnum.Refresh,
              },
              {
                icon: <SettingIcon />,
                label: t("settings"),
                key: DropdownItemEnum.Settings,
              },
            ],
            onClick: ({ key }) => {
              switch (key) {
                case DropdownItemEnum.Refresh:
                  refreshPage();
                  break;
                case DropdownItemEnum.Settings:
                  setIsSettingModalOpen(true);
                  break;
              }
            },
          }}
        >
          <MoreIcon className="moreIcon" />
        </Dropdown>
      </div>
    </div>
  );
};

export default SearchContainer;
