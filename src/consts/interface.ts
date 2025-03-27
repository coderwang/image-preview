export interface ImagePreviewRef {
  show: () => void;
  hide: () => void;
}

export interface ShowImagesMessage {
  command: "showImages";
  projectName: string;
  dirPath: string;
  nums: Record<ImageType, number>;
  dirList: DirInfo[];
}

interface CompressImageSuccess {
  command: "compressImageCallback";
  status: "success";
  originalSize: number;
  compressedSize: number;
}

interface CompressImageFail {
  command: "compressImageCallback";
  status: "fail";
}

export type CompressImageCallbackMessage =
  | CompressImageSuccess
  | CompressImageFail;
