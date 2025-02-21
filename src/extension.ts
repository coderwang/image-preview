import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "extension.imagePreview",
    (uri) => {
      const panel = vscode.window.createWebviewPanel(
        "imagePreview",
        "Image Preview",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, "out")),
            vscode.Uri.file(path.dirname(uri.path)),
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

      // 直接设置HTML内容
      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en" data-theme="${theme}">
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
          case "requestImages":
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
                  path: dirPath.replace(uri.path, "") || "/",
                  imageList: currentDirImages,
                });
              }

              return result;
            };

            vscode.workspace.workspaceFolders?.forEach((folder) => {
              if (uri.path.startsWith(folder.uri.fsPath)) {
                // 获取当前目录及其子目录下的所有图片
                getImagesInDirectory(uri.path).then((results) => {
                  panel.webview.postMessage({
                    command: "showImages",
                    projectName: folder.name,
                    dirPath: uri.path.replace(folder.uri.fsPath, ""),
                    nums,
                    dirList: results,
                  } as ShowImagesMessage);
                });
              }
            });

            break;
          case "updateThemeConfig":
            vscode.workspace
              .getConfiguration("superImagePreview")
              .update(
                "theme",
                message.theme,
                vscode.ConfigurationTarget.Global
              );
            break;
          case "openFolder":
            vscode.env.openExternal(vscode.Uri.file(message.completePath));
            break;
          case "revealInSideBar":
            vscode.commands.executeCommand(
              "revealInExplorer",
              vscode.Uri.file(message.completeImagePath)
            );
            break;
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
