import { Language } from "@/consts/enum";
import store from "@/store";
import { languageAtom } from "@/store/language";

export const isChinese = () => {
  return store.get(languageAtom) === Language.Chinese;
};
