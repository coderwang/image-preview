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

interface CompressImageSuccess {
  command: ExtensionMessageEnum.ShowCompressResult;
  status: "success";
  originalSize: number;
  compressedSize: number;
}

interface CompressImageFail {
  command: ExtensionMessageEnum.ShowCompressResult;
  status: "fail";
}

export type CompressImageCallbackMessage =
  | CompressImageSuccess
  | CompressImageFail;
