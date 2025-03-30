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
