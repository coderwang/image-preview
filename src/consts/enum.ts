export const enum Theme {
  Light = "light",
  Dark = "dark",
}

export const enum Language {
  English = "en",
  Chinese = "zh",
}

export const enum OperationEnum {
  /** 请求图片，初始化页面 */
  RequestImages = "requestImages",
  /** 更新语言 */
  UpdateLanguageConfig = "updateLanguageConfig",
  /** 更新主题 */
  UpdateThemeConfig = "updateThemeConfig",
  /** 打开外部链接 */
  OpenExternal = "openExternal",
  /** 在侧边栏中显示文件 */
  RevealInExplorer = "revealInExplorer",
  /** 在操作系统中显示文件 */
  RevealFileInOS = "revealFileInOS",
  /** 复制图片名称 */
  CopyImageName = "copyImageName",
  /** 复制图片 base64 */
  CopyBase64 = "copyBase64",
}
