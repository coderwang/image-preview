import { ReactComponent as SettingIcon } from "@/assets/svg/settings.svg";
import { DropdownItemEnum } from "@/consts/enum";
import { operationPanelExpandAtom } from "@/store/expand";
import { isSettingModalOpenAtom } from "@/store/modal";
import { searchValueAtom } from "@/store/searchValue";
import { refreshPage } from "@/utils";
import { Dropdown } from "antd";
import { ReactComponent as CollapseIcon } from "assets/svg/collapse.svg";
import { ReactComponent as ExpandIcon } from "assets/svg/expand.svg";
import { ReactComponent as MoreIcon } from "assets/svg/more.svg";
import { ReactComponent as RefreshIcon } from "assets/svg/refresh.svg";
import { useAtom, useSetAtom } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

const SearchContainer: React.FC = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const { t } = useTranslation();
  const setIsSettingModalOpen = useSetAtom(isSettingModalOpenAtom);
  const [operationPanelExpand, setOperationPanelExpand] = useAtom(
    operationPanelExpandAtom
  );

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
            items: [
              {
                icon: operationPanelExpand ? <CollapseIcon /> : <ExpandIcon />,
                label: operationPanelExpand ? t("collapse") : t("expand"),
                key: DropdownItemEnum.Expand,
              },
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
                case DropdownItemEnum.Expand:
                  setOperationPanelExpand(!operationPanelExpand);
                  break;
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
