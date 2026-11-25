import { atom } from "jotai";

export const isSettingModalOpenAtom = atom(false);

export const needAskForDeleteImageAtom = atom(true);

/** 导入图片弹窗的目标目录，为null时弹窗关闭 */
export const importModalDirAtom = atom<DirInfo | null>(null);

export interface SvgEditorTarget {
  /** 图片的 vscode url，用于读取SVG源码 */
  url: string;
  /** 文件名 */
  name: string;
  /** 所在目录的完整路径 */
  completePath: string;
}

/** SVG编辑器弹窗的目标文件，为null时弹窗关闭 */
export const svgEditorTargetAtom = atom<SvgEditorTarget | null>(null);
