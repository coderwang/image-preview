import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.less";
import store from "./store";
import Webview from "./webview";

window.VsCodeApi = acquireVsCodeApi();

const App: React.FC = () => {
  return (
    <JotaiProvider store={store}>
      <Webview />
    </JotaiProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
