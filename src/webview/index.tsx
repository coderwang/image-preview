import SettingModal from "@/components/SettingModal";
import { Theme } from "@/consts/enum";
import { themeAtom } from "@/store/theme";
import { isChinese } from "@/utils";
import { App as AntdApp, theme as AntdTheme, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { Provider as JotaiProvider, useAtomValue } from "jotai";
import React, { FC, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "../i18n";
import store from "../store";
import "./index.less";
import Webview from "./webview";

window.VsCodeApi = acquireVsCodeApi();

const App: React.FC = () => {
  const theme = useAtomValue(themeAtom);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === Theme.Dark
            ? AntdTheme.darkAlgorithm
            : AntdTheme.defaultAlgorithm,
      }}
      locale={isChinese() ? zhCN : enUS}
    >
      <AntdApp>
        <Toaster
          theme={theme}
          className="toastContainer"
          visibleToasts={2}
          richColors
          offset={{
            right: 16,
            bottom: 8,
          }}
          mobileOffset={{
            right: 16,
            bottom: 8,
          }}
          toastOptions={{
            duration: 2000,
          }}
        />
        <Webview />
        <SettingModal />
      </AntdApp>
    </ConfigProvider>
  );
};

const WrapperApp: FC<{ children: ReactNode }> = ({ children }) => {
  return <JotaiProvider store={store}>{children}</JotaiProvider>;
};

createRoot(document.getElementById("root")!).render(
  <div onContextMenu={(e) => e.preventDefault()}>
    <WrapperApp>
      <App />
    </WrapperApp>
  </div>
);
