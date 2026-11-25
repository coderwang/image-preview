import { ExtensionMessageEnum, WebviewMessageEnum } from "@/consts/enum";
import store from "@/store";
import { filterCountAtom, totalCountAtom } from "@/store/count";
import { filterDirListAtom, originDirListAtom } from "@/store/image";
import { numsAtom } from "@/store/imageType";
import { importModalDirAtom } from "@/store/modal";
import { Modal } from "antd";
import { ReactComponent as ImportIcon } from "assets/svg/import.svg";
import clsx from "clsx";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import styles from "./index.module.less";

/** 项目支持的8种图片后缀 */
export const SUPPORTED_IMAGE_EXTS = [
  ".avif",
  ".ico",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
];

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
};

const ImportModal = () => {
  const [dir, setDir] = useAtom(importModalDirAtom);
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const uploadFilesRef = useRef<(fileList: FileList | null) => void>(() => {});

  // VSCode/Cursor 的 webview 宿主脚本会监听内容的 dragenter 事件：
  // 若此时 defaultPrevented 为 false 且拖拽的都是文件，workbench 就会接管此次拖放
  // （给 iframe 设置 pointer-events:none），导致文件被编辑器直接打开。
  // 因此弹窗打开期间，必须在 window 捕获阶段对原生事件 preventDefault，
  // 确保宿主脚本检查 defaultPrevented 时已为 true，把 drop 留给 webview 处理。
  useEffect(() => {
    if (!dir) {
      return;
    }
    let dragDepth = 0;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragDepth += 1;
      if (Array.from(e.dataTransfer?.types ?? []).includes("Files")) {
        setDragActive(true);
      }
    };
    const onDragOver = (e: DragEvent) => {
      // 必须 preventDefault，drop 事件才会触发
      e.preventDefault();
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        setDragActive(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepth = 0;
      setDragActive(false);
      uploadFilesRef.current(e.dataTransfer?.files ?? null);
    };

    window.addEventListener("dragenter", onDragEnter, true);
    window.addEventListener("dragover", onDragOver, true);
    window.addEventListener("dragleave", onDragLeave, true);
    window.addEventListener("drop", onDrop, true);
    return () => {
      window.removeEventListener("dragenter", onDragEnter, true);
      window.removeEventListener("dragover", onDragOver, true);
      window.removeEventListener("dragleave", onDragLeave, true);
      window.removeEventListener("drop", onDrop, true);
      setDragActive(false);
    };
  }, [dir]);

  // 接收扩展端返回的导入结果
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command !== ExtensionMessageEnum.ImportImagesResult) {
        return;
      }
      setImporting(false);

      const { dirPath, imageList, failedNames } = message;
      if (imageList.length > 0) {
        // 将导入成功的图片插入对应目录，并保持按名称排序
        [originDirListAtom, filterDirListAtom].forEach((targetAtom) => {
          store.set(targetAtom, (draft) => {
            const target = draft.find((item) => item.completePath === dirPath);
            if (target) {
              target.imageList = [...target.imageList, ...imageList].sort(
                (a, b) => a.name.localeCompare(b.name)
              );
            }
          });
        });
        store.set(totalCountAtom, (prev) => prev + imageList.length);
        store.set(filterCountAtom, (prev) => prev + imageList.length);
        store.set(numsAtom, (draft) => {
          imageList.forEach((image: ImageInfo) => {
            // jpeg归入jpg统计
            const type = image.ext === ".jpeg" ? "jpg" : image.ext.slice(1);
            draft[type as ImageType] += 1;
          });
        });
        toast.success(t("import_success", { count: imageList.length }));
        setDir(null);
      }
      if (failedNames.length > 0) {
        toast.error(t("import_failed", { names: failedNames.join(", ") }));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setDir, t]);

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !dir || importing) {
      return;
    }

    // 只保留支持的8种后缀
    const validFiles: File[] = [];
    const invalidNames: string[] = [];
    Array.from(fileList).forEach((file) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (SUPPORTED_IMAGE_EXTS.includes(ext)) {
        validFiles.push(file);
      } else {
        invalidNames.push(file.name);
      }
    });

    if (invalidNames.length > 0) {
      toast.warning(
        t("import_unsupported", { names: invalidNames.join(", ") })
      );
    }
    if (validFiles.length === 0) {
      return;
    }

    setImporting(true);
    try {
      const payload = await Promise.all(
        validFiles.map(async (file) => ({
          name: file.name,
          data: await readFileAsBase64(file),
        }))
      );
      VsCodeApi.postMessage({
        command: WebviewMessageEnum.ImportImages,
        targetDirPath: dir.completePath,
        files: payload,
      });
    } catch {
      setImporting(false);
      toast.error(t("import_read_failed"));
    }
  };
  uploadFilesRef.current = uploadFiles;

  return (
    <Modal
      wrapClassName={styles.importModalWrapper}
      className={styles.importModal}
      open={!!dir}
      title={t("import_image")}
      footer={null}
      onCancel={() => {
        if (!importing) {
          setDir(null);
        }
      }}
      centered
    >
      <div
        className={clsx(styles.dropzone, {
          [styles.dropzoneActive]: dragActive,
          [styles.dropzoneImporting]: importing,
        })}
        onClick={() => {
          if (!importing) {
            inputRef.current?.click();
          }
        }}
      >
        <ImportIcon className={styles.dropzoneIcon} />
        <div className={styles.dropzoneText}>
          {importing ? t("import_uploading") : t("import_upload_text")}
        </div>
        <div className={styles.dropzoneHint}>{t("import_upload_hint")}</div>
        <div className={styles.dropzoneHint}>
          {t("import_upload_hint_shift")}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={SUPPORTED_IMAGE_EXTS.join(",")}
        style={{ display: "none" }}
        onChange={(e) => {
          uploadFiles(e.target.files);
          // 置空以便连续选择同一文件也能触发change
          e.target.value = "";
        }}
      />
    </Modal>
  );
};

export default ImportModal;
