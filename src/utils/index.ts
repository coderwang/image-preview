import { Language } from "@/consts/enum";
import i18n from "i18next";

export const isChinese = () => {
  return i18n.language === Language.Chinese;
};
