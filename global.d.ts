declare module "*.bmp" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import type * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;

  const src: string;
  export default src;
}

declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.scss" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare module "*.module.scss" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module "*.module.less" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare namespace VsCodeApi {
  export const postMessage: (message: any) => void;
  export const getState: () => any;
  export const setState: (state: any) => void;
}

type ImageType = "avif" | "ico" | "jpg" | "png" | "gif" | "webp" | "svg";

interface ImageInfo {
  url: string;
  name: string;
  ext: string;
}

interface DirInfo {
  completePath: string;
  path: string;
  imageList: ImageInfo[];
}

interface ImageBasicInfo {
  width: number;
  height: number;
  size: string;
}

interface ShowImagesMessage {
  command: "showImages";
  projectName: string;
  dirPath: string;
  nums: Record<ImageType, number>;
  dirList: DirInfo[];
}
