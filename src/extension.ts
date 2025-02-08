import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.imagePreview', () => {
    const panel = vscode.window.createWebviewPanel(
      'reactWebview',
      'React Webview',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'out'))]
      }
    );

    // 获取bundle.js的正确路径
    const bundlePath = vscode.Uri.file(
      path.join(context.extensionPath, 'out', 'webview', 'bundle.js')
    );
    const bundleUri = panel.webview.asWebviewUri(bundlePath);

    // 直接设置HTML内容
    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>React Webview</title>
      </head>
      <body>
          <div id="root"></div>
          <script src="${bundleUri}"></script>
      </body>
      </html>
    `;
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
