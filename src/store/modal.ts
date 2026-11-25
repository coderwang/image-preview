import { atom } from "jotai";

export const isSettingModalOpenAtom = atom(false);

export const needAskForDeleteImageAtom = atom(true);

/** 导入图片弹窗的目标目录，为null时弹窗关闭 */
export const importModalDirAtom = atom<DirInfo | null>(null);
