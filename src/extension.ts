import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as svgo from "svgo";
import * as vscode from "vscode";
import { ExtensionMessageEnum, WebviewMessageEnum } from "./consts/enum";
import { installSharp } from "./utils/sharp-installer";

let panel: vscode.WebviewPanel;

export function activate(context: vscode.ExtensionContext) {
  // 在正常环境下，这里的代码会在插件安装和启用时调用，在命令执行时不会调用
  // 在扩展开发宿主环境下，由于没有安装和启用的过程，所以只会在命令首次执行时调用
  // 所以，在开发环境和生产环境，由于执行时机的不同，表现可能会不同~~

  // 尝试安装sharp，但不阻塞用户使用基本功能
  try {
    installSharp(context);
  } catch (error) {
    // never come here
  }

  const disposable = vscode.commands.registerCommand(
    "extension.imagePreview",
    async (uri: vscode.Uri | undefined) => {
      // uri 为 undefined，代表是点击的命令面板
      // uri 为 {}，代表工作区打开了多个项目时点击了空白处
      if (!uri?.fsPath) {
        // 工作区没有文件夹则什么都不做
        if (!vscode.workspace.workspaceFolders) {
          return;
        }
        // 默认用第一个项目
        uri = vscode.workspace.workspaceFolders[0].uri;
      }

      panel = vscode.window.createWebviewPanel(
        "imagePreview",
        "Image Preview",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "out")),
            vscode.Uri.file(path.dirname(uri.fsPath)),
          ],
        }
      );

      // 获取bundle.js的正确路径
      const bundlePath = vscode.Uri.file(
        path.join(context.extensionPath, "out", "webview", "bundle.js")
      );
      const bundleUri = panel.webview.asWebviewUri(bundlePath);
      const theme = vscode.workspace
        .getConfiguration("superImagePreview")
        .get("theme");
      const language = vscode.workspace
        .getConfiguration("superImagePreview")
        .get("language");

      // 直接设置HTML内容
      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="${language}" data-theme="${theme}">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
          <div id="root"></div>
          <script src="${bundleUri}"></script>
      </body>
      </html>
    `;

      panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case WebviewMessageEnum.RequestImages:
            const suffix = [
              ".avif",
              ".ico",
              ".jpg",
              ".jpeg",
              ".png",
              ".gif",
              ".webp",
              ".svg",
            ];
            const nums: Record<ImageType, number> = {
              avif: 0,
              ico: 0,
              jpg: 0,
              png: 0,
              gif: 0,
              webp: 0,
              svg: 0,
            };

            const getImagesInDirectory = async (
              dirPath: string // 当前目录
            ): Promise<DirInfo[]> => {
              const result: DirInfo[] = [];
              const currentDirImages: ImageInfo[] = [];
              const files = await vscode.workspace.fs.readDirectory(
                vscode.Uri.file(dirPath)
              );

              for (const [name, type] of files) {
                const fullPath = path.join(dirPath, name);

                if (type === vscode.FileType.Directory) {
                  if (
                    (
                      vscode.workspace
                        .getConfiguration("superImagePreview")
                        .get("excludeDirectoryNames") as Array<string>
                    ).some((item) => item === name)
                  ) {
                    continue;
                  }
                  const subResults = await getImagesInDirectory(fullPath);
                  result.push(...subResults);
                } else if (type === vscode.FileType.File) {
                  const ext = path.extname(name).toLowerCase();
                  if (suffix.includes(ext)) {
                    switch (ext) {
                      case ".ico":
                        nums.ico++;
                        break;
                      case ".avif":
                        nums.avif++;
                        break;
                      case ".jpg":
                      case ".jpeg":
                        nums.jpg++;
                        break;
                      case ".png":
                        nums.png++;
                        break;
                      case ".gif":
                        nums.gif++;
                        break;
                      case ".webp":
                        nums.webp++;
                        break;
                      case ".svg":
                        nums.svg++;
                        break;
                    }
                    currentDirImages.push({
                      url: panel.webview
                        .asWebviewUri(vscode.Uri.file(fullPath))
                        .toString(),
                      name: name,
                      ext: ext,
                    });
                  }
                }
              }

              if (currentDirImages.length > 0) {
                result.push({
                  completePath: dirPath,
                  shortPath:
                    dirPath.replace(uri.fsPath, "") ||
                    (process.platform === "win32" ? "\\" : "/"),
                  imageList: currentDirImages,
                });
              }

              return result;
            };

            vscode.workspace.workspaceFolders?.forEach((folder) => {
              if (uri.fsPath.startsWith(folder.uri.fsPath)) {
                // 获取当前目录及其子目录下的所有图片
                getImagesInDirectory(uri.fsPath).then((results) => {
                  panel.webview.postMessage({
                    command: ExtensionMessageEnum.ShowImages,
                    projectName: folder.name,
                    dirPath: uri.fsPath.replace(folder.uri.fsPath, ""),
                    nums,
                    dirList: results,
                  });
                });
              }
            });

            break;
          case WebviewMessageEnum.UpdateThemeConfig:
            vscode.workspace
              .getConfiguration("superImagePreview")
              .update(
                "theme",
                message.theme,
                vscode.ConfigurationTarget.Global
              );
            break;
          case WebviewMessageEnum.UpdateLanguageConfig:
            vscode.workspace
              .getConfiguration("superImagePreview")
              .update(
                "language",
                message.language,
                vscode.ConfigurationTarget.Global
              );
            break;
          case WebviewMessageEnum.OpenExternal:
            // 优先使用系统命令，避免windows在中文路径下打不开文件夹的问题
            childProcess.exec(`start "" "${message.completePath}"`, (error) => {
              if (error) {
                vscode.env.openExternal(vscode.Uri.file(message.completePath));
              }
            });
            break;
          case WebviewMessageEnum.RevealFileInOS:
            vscode.commands.executeCommand(
              "revealFileInOS",
              vscode.Uri.file(message.completeImagePath)
            );
            break;
          case WebviewMessageEnum.RevealInExplorer:
            vscode.commands.executeCommand(
              "revealInExplorer",
              vscode.Uri.file(message.completeImagePath)
            );
            break;
          case WebviewMessageEnum.CompressImage:
            compressImage(message.completeImagePath);
            break;
          case WebviewMessageEnum.CompressSVG:
            compressSVG(message.completeSvgPath);
            break;
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// 图片压缩函数
async function compressImage(imagePath: string) {
  try {
    // 动态导入sharp，确保它已经安装
    const sharp = require("sharp") as typeof import("sharp");

    // 确定输出路径
    const extname = path.extname(imagePath);
    const basename = path.basename(imagePath, extname);
    const dirname = path.dirname(imagePath);
    const outputPath = path.join(dirname, `${basename}-compressed${extname}`);

    if (fs.existsSync(outputPath)) {
      panel.webview.postMessage({
        command: ExtensionMessageEnum.TipCompressedImageExist,
      });
      return;
    }

    // 获取原图信息
    const originalStats = fs.statSync(imagePath);
    const originalSize = originalStats.size;

    // 根据图片类型选择合适的压缩参数
    let compressedBuffer;
    const imageBuffer = fs.readFileSync(imagePath);

    switch (extname.toLowerCase()) {
      case ".jpg":
      case ".jpeg":
        compressedBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        break;
      case ".png":
        compressedBuffer = await sharp(imageBuffer).png().toBuffer();
        break;
      case ".webp":
        compressedBuffer = await sharp(imageBuffer).webp().toBuffer();
        break;
      case ".gif":
        compressedBuffer = await sharp(imageBuffer, {
          animated: true,
          limitInputPixels: false,
        })
          .gif()
          .toBuffer();
        break;
      case ".avif":
        compressedBuffer = await sharp(imageBuffer).avif().toBuffer();
        break;
      default:
        return;
    }
    const compressedSize = compressedBuffer.byteLength;
    const reducedPercent = Number(
      (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
    );

    if (reducedPercent > 0.01) {
      fs.writeFileSync(outputPath, compressedBuffer);
      panel.webview.postMessage({
        command: ExtensionMessageEnum.ShowCompressResult,
        reducedPercent,
      });
    } else {
      panel.webview.postMessage({
        command: ExtensionMessageEnum.ShowCompressResult,
        reducedPercent: 0,
      });
    }
  } catch (error) {
    // sharp还没安装好用户就点了压缩，提示用户等待自动安装或手动安装
    vscode.window
      .showWarningMessage(
        "Sharp is not ready yet. Please wait for the automatic installation to complete or install manually.",
        "Install manually"
      )
      .then((selection) => {
        if (selection === "Install manually") {
          vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/coderwang/image-preview/blob/master/COMPRESS.md"
            )
          );
        }
      });
  }
}

function compressSVG(svgPath: string) {
  try {
    // 确定输出路径
    const extname = path.extname(svgPath);
    const basename = path.basename(svgPath, extname);
    const dirname = path.dirname(svgPath);
    const outputPath = path.join(dirname, `${basename}-compressed${extname}`);

    if (fs.existsSync(outputPath)) {
      panel.webview.postMessage({
        command: ExtensionMessageEnum.TipCompressedImageExist,
      });
      return;
    }

    // 读取SVG文件内容
    const svgContent = fs.readFileSync(svgPath, "utf8");
    // 获取原文件大小
    const originalSize = fs.statSync(svgPath).size;
    // 压缩SVG
    const result = svgo.optimize(svgContent);

    // 如果优化成功，计算压缩后的大小
    if (result.data) {
      // 计算压缩后的数据大小（字节长度）
      const compressedSize = Buffer.byteLength(result.data);
      const reducedPercent = Number(
        (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
      );

      // 只有当压缩后的大小小于原始大小时才写入文件
      if (reducedPercent > 0.01) {
        // 写入压缩后的文件
        fs.writeFileSync(outputPath, result.data);

        // 发送压缩成功消息
        panel.webview.postMessage({
          command: ExtensionMessageEnum.ShowCompressResult,
          reducedPercent,
        });
      } else {
        // 压缩后文件更大或相同大小，发送无法压缩消息
        panel.webview.postMessage({
          command: ExtensionMessageEnum.ShowCompressResult,
          reducedPercent: 0,
        });
      }
    }
  } catch (error) {
    // 走到这儿的通常都是svg文件有问题
    panel.webview.postMessage({
      command: ExtensionMessageEnum.TipSvgFileError,
    });
  }
}

export function deactivate() {}
