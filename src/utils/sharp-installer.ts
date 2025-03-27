import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";

const exec = promisify(childProcess.exec);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

export async function installSharp(
  context: vscode.ExtensionContext
): Promise<void> {
  const extensionPath = context.extensionPath;

  try {
    try {
      // 尝试加载前先删除缓存
      delete require.cache[require.resolve("sharp")];
      // 尝试加载sharp以确认它工作正常
      require("sharp");
      return;
    } catch (error) {
      // 加载失败了再清理一次缓存，避免安装好之后也无法正常使用
      delete require.cache[require.resolve("sharp")];
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Super Image Preview",
        cancellable: false,
      },
      async (progress) => {
        // 创建一个临时目录，防止污染插件以及避免没有写入权限
        const tempDir = path.join(extensionPath, "temp_install");
        if (!(await exists(tempDir))) {
          await mkdir(tempDir);
        }

        // 创建临时package.json文件
        const packageJsonPath = path.join(tempDir, "package.json");
        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify({
            name: "sharp-temp",
            version: "1.0.0",
            description: "Temporary package for installing sharp",
            private: true,
          })
        );

        // 运行npm install命令
        progress.report({ message: "Installing sharp" });
        const { stdout, stderr } = await exec("npm install sharp@0.33.5", {
          cwd: tempDir,
        });

        if (stderr && !stderr.includes("npm WARN")) {
          throw new Error(stderr);
        }

        // sharp涉及的所有模块
        const sourceModulesPath = path.join(tempDir, "node_modules");
        if (!(await exists(sourceModulesPath))) {
          throw new Error("Install sharp failed, can't find installed modules");
        }

        // 确保扩展的node_modules目录存在
        const extNodeModules = path.join(extensionPath, "node_modules");
        if (!(await exists(extNodeModules))) {
          await mkdir(extNodeModules);
        }

        // 复制sharp所有模块到扩展的node_modules（包括sharp和依赖的二进制包等）
        if (process.platform === "win32") {
          /**
           * 使用xcopy复制
           * /E 复制所有子目录（包括空目录）
           * /I 目标路径extNodeModules不存在时自动创建，当然这里是一定存在的
           * /H 包含隐藏文件和系统文件
           * /Y 静默覆盖已有文件（不提示确认）
           */
          await exec(
            `xcopy "${sourceModulesPath}\\*" "${extNodeModules}" /E /I /H /Y`
          );
        } else {
          /**
           * 使用cp复制
           * -R 递归复制
           * -f 强制覆盖已有文件
           */
          await exec(`cp -Rf "${sourceModulesPath}/"* "${extNodeModules}/"`);
        }

        // 清理临时目录
        if (process.platform === "win32") {
          await exec(`rmdir /S /Q "${tempDir}"`);
        } else {
          await exec(`rm -rf "${tempDir}"`);
        }
      }
    );
  } catch (error) {
    // 安装sharp出错，提示用户
    vscode.window
      .showErrorMessage(
        "Installation of sharp failed, compression function is not available.",
        "How to install manually?"
      )
      .then((selection) => {
        if (selection === "How to install manually?") {
          // todo 文档
          vscode.env.openExternal(vscode.Uri.parse("https://www.baidu.com"));
        }
      });
  }
}
