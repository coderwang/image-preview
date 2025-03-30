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
  /**
   * @description 生成的 vscode url
   * @example 'https://file%2B.vscode-resource.vscode-cdn.net/Users/xxx/project/src/assets/images/test.png'
   * */
  url: string;
  /**
   * @description 图片名称
   * @example 'test.png'
   * */
  name: string;
  /**
   * @description 图片后缀
   * @example '.png'
   * */
  ext: string;
}

interface DirInfo {
  /**
   * @description 系统完整路径
   * @example '/Users/xxx/project/src/assets/images'
   * */
  completePath: string;
  /**
   * @description 展示在webview的短路径，不具备有效信息
   * @example '/assets/images'
   * */
  shortPath: string;
  /** 该目录下的图片列表 */
  imageList: ImageInfo[];
}

interface ImageBasicInfo {
  width: number;
  height: number;
  size: string;
}
