import { Provider as JotaiProvider } from "jotai";
import React from "react";
import { createRoot } from "react-dom/client";
import store from "../store";
import "./index.less";
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
