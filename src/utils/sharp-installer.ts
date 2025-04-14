import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";

const exec = promisify(childProcess.exec);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

// Sharp的全局缓存目录名称
const SHARP_GLOBAL_CACHE_DIR = "sharp-cache";
// 确保版本匹配，避免兼容性问题
const SHARP_VERSION = "0.33.5";

export async function installSharp(
  context: vscode.ExtensionContext
): Promise<void> {
  // 使用全局存储路径作为缓存目录
  const globalStoragePath = context.globalStorageUri.fsPath;
  const sharpCachePath = path.join(globalStoragePath, SHARP_GLOBAL_CACHE_DIR);

  try {
    // 在require前设置NODE_PATH环境变量，使Node.js能从缓存目录加载模块
    setupSharpModulePath(sharpCachePath);

    try {
      // 尝试加载前先删除缓存
      delete require.cache[require.resolve("sharp")];
      // 尝试加载sharp以确认它工作正常
      require("sharp");
      return;
    } catch (error) {
      // 加载失败，继续安装流程
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Super Image Preview",
        cancellable: false,
      },
      async (progress) => {
        // 确保全局存储目录存在
        if (!(await exists(globalStoragePath))) {
          await mkdir(globalStoragePath, { recursive: true });
        }

        // 确保sharp缓存目录存在
        if (!(await exists(sharpCachePath))) {
          await mkdir(sharpCachePath, { recursive: true });
        }

        // 创建一个临时目录
        const tempDir = path.join(globalStoragePath, "temp_install");
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
        const { stdout, stderr } = await exec(
          `npm install sharp@${SHARP_VERSION}`,
          {
            cwd: tempDir,
          }
        );

        if (stderr && !stderr.includes("npm WARN")) {
          throw new Error(stderr);
        }

        // sharp涉及的所有模块
        const sourceModulesPath = path.join(tempDir, "node_modules");
        if (!(await exists(sourceModulesPath))) {
          throw new Error("Install sharp failed, can't find installed modules");
        }

        // 复制sharp及其依赖到全局缓存目录
        const targetModulesPath = path.join(sharpCachePath, "node_modules");
        if (!(await exists(targetModulesPath))) {
          await mkdir(targetModulesPath);
        }

        // 复制模块到缓存目录
        if (process.platform === "win32") {
          await exec(
            `xcopy "${sourceModulesPath}\\*" "${targetModulesPath}" /E /I /H /Y`
          );
        } else {
          await exec(`cp -Rf "${sourceModulesPath}/"* "${targetModulesPath}/"`);
        }

        // 清理临时目录
        if (process.platform === "win32") {
          await exec(`rmdir /S /Q "${tempDir}"`);
        } else {
          await exec(`rm -rf "${tempDir}"`);
        }

        // 再清一下缓存
        delete require.cache[require.resolve("sharp")];
      }
    );
  } catch (error) {
    // sharp安装失败，提示用户手动安装
    vscode.window
      .showErrorMessage(
        "Installation of sharp failed, compression function is not available.",
        "How to install manually?"
      )
      .then((selection) => {
        if (selection === "How to install manually?") {
          vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/coderwang/image-preview/blob/master/COMPRESS.md"
            )
          );
        }
      });
  }
}

/**
 * 设置node加载路径
 */
function setupSharpModulePath(sharpCachePath: string): void {
  const modulesPath = path.join(sharpCachePath, "node_modules");

  // 添加缓存路径到当前模块搜索路径
  if (!module.paths.includes(modulesPath)) {
    module.paths.unshift(modulesPath);
  }

  // 设置环境变量 NODE_PATH 作为全局模块加载路径（防止 module.paths 未生效）
  const nodePath = process.env.NODE_PATH
    ? `${modulesPath}${path.delimiter}${process.env.NODE_PATH}`
    : modulesPath;
  process.env.NODE_PATH = nodePath;

  // 获取当前进程的主模块引用
  if (require.main) {
    try {
      // @ts-ignore - 非公开API - 强制刷新模块搜索路径
      require("module").Module._initPaths();
    } catch (e) {
      // 非关键操作
      console.warn("_initPaths error ===>", e);
    }
  }
}
