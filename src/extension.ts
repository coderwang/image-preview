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

      // 直接设置HTML内容
      panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
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
            const getImagesInDirectory = async (
              dirPath: string, // 当前目录
              folderPath: string // 当前工作区路径
            ): Promise<{ path: string; images: string[] }[]> => {
              const result: { path: string; images: string[] }[] = [];
              const currentDirImages: string[] = [];
              const files = await vscode.workspace.fs.readDirectory(
                vscode.Uri.file(dirPath)
              );

              for (const [name, type] of files) {
                const fullPath = path.join(dirPath, name);

                if (type === vscode.FileType.Directory) {
                  const subResults = await getImagesInDirectory(
                    fullPath,
                    folderPath
                  );
                  result.push(...subResults);
                } else if (type === vscode.FileType.File) {
                  const ext = path.extname(name).toLowerCase();
                  if (
                    [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(
                      ext
                    )
                  ) {
                    currentDirImages.push(
                      panel.webview
                        .asWebviewUri(vscode.Uri.file(fullPath))
                        .toString()
                    );
                  }
                }
              }

              if (currentDirImages.length > 0) {
                result.push({
                  path: dirPath.replace(folderPath, ""),
                  images: currentDirImages,
                });
              }

              return result;
            };

            vscode.workspace.workspaceFolders?.forEach((folder) => {
              if (uri.path.startsWith(folder.uri.fsPath)) {
                // 获取当前目录及其子目录下的所有图片
                getImagesInDirectory(uri.path, folder.uri.fsPath).then(
                  (results) => {
                    panel.webview.postMessage({
                      command: "showImages",
                      projectName: folder.name,
                      dirPath: uri.path.replace(folder.uri.fsPath, ""),
                      images: results,
                    });
                  }
                );
              }
            });

            break;
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
