import { themeAtom } from "@/store/theme";
import { useAtomValue } from "jotai";
import React from "react";
import { Toaster } from "sonner";

const CustomToaster = () => {
  const theme = useAtomValue(themeAtom);

  return (
    <Toaster
      theme={theme}
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
  );
};

export default CustomToaster;
