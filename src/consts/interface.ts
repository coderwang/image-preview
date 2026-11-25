import { ExtensionMessageEnum } from "./enum";

export interface ImagePreviewRef {
  show: () => void;
  hide: () => void;
}

export interface ShowImagesMessage {
  command: ExtensionMessageEnum.ShowImages;
  projectName: string;
  dirPath: string;
  nums: Record<ImageType, number>;
  dirList: DirInfo[];
}

export interface CompressImageCallbackMessage {
  command: ExtensionMessageEnum.ShowCompressResult;
  reducedPercent: number; // 不带%的百分比数值（保留两位小数）
}

export interface TipSvgFileErrorMessage {
  command: ExtensionMessageEnum.TipSvgFileError;
}

export interface TipCompressedImageExistMessage {
  command: ExtensionMessageEnum.TipCompressedImageExist;
}

export interface ImportImagesResultMessage {
  command: ExtensionMessageEnum.ImportImagesResult;
  /** 目标文件夹完整路径 */
  dirPath: string;
  /** 成功导入的图片（与已有图片冲突时已自动追加序号重命名） */
  imageList: ImageInfo[];
  /** 导入失败的原始文件名列表 */
  failedNames: string[];
}

export type ExtensionMessage =
  | ShowImagesMessage
  | CompressImageCallbackMessage
  | TipSvgFileErrorMessage
  | TipCompressedImageExistMessage
  | ImportImagesResultMessage;
