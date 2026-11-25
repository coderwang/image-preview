import { ExtensionMessageEnum, WebviewMessageEnum } from "@/consts/enum";
import {
  ExtensionMessage,
  SimilarImageHashItem,
} from "@/consts/interface";
import { backgroundColorAtom } from "@/store/bgc";
import { originDirListAtom } from "@/store/image";
import {
  similarImagesModalOpenAtom,
  similarImagesScanningAtom,
} from "@/store/modal";
import { deleteImage, getCompleteImagePath } from "@/utils";
import { groupSimilarImages } from "@/utils/similar-group";
import { App, Modal, Slider } from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import styles from "./index.module.less";

/** 默认汉明距离阈值（64 位 aHash 下 3 更严，减少误报） */
const DEFAULT_THRESHOLD = 3;

const SIMILAR_SCAN_TOAST_ID = "similar-scan";

const SimilarImagesModal = () => {
  const { modal } = App.useApp();
  const { t } = useTranslation();

  const [open, setOpen] = useAtom(similarImagesModalOpenAtom);
  const setScanning = useSetAtom(similarImagesScanningAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);

  const [items, setItems] = useState<SimilarImageHashItem[]>([]);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const thumbBg =
    typeof backgroundColor === "string"
      ? backgroundColor
      : backgroundColor?.toRgbString?.() ?? "#f5f5f5";

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message: ExtensionMessage = event.data;
      switch (message.command) {
        case ExtensionMessageEnum.ShowSimilarImagesResult: {
          setScanning(false);
          toast.dismiss(SIMILAR_SCAN_TOAST_ID);
          setItems(message.items);
          setThreshold(DEFAULT_THRESHOLD);
          setOpen(true);
          if (message.failedCount > 0) {
            toast.info(
              t("similar_partial_failed", { count: message.failedCount })
            );
          }
          break;
        }
        case ExtensionMessageEnum.TipSharpNotReady: {
          setScanning(false);
          toast.dismiss(SIMILAR_SCAN_TOAST_ID);
          toast.warning(t("sharp_not_ready"));
          break;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setOpen, setScanning, t]);

  const groups = useMemo(
    () => groupSimilarImages(items, threshold),
    [items, threshold]
  );

  const similarImageCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.members.length, 0),
    [groups]
  );

  const handleDelete = (item: SimilarImageHashItem) => {
    modal.confirm({
      centered: true,
      className: "deleteImageModal",
      title: t("delete_image_title"),
      content: t("delete_image_content"),
      cancelText: t("cancel"),
      okText: t("confirm"),
      onOk: () => {
        const separatorLength = 1;
        const dirPath = item.completePath.slice(
          0,
          item.completePath.length - item.name.length - separatorLength
        );
        deleteImage(dirPath, {
          url: item.url,
          name: item.name,
          ext: item.ext,
        });
        setItems((prev) =>
          prev.filter((x) => x.completePath !== item.completePath)
        );
      },
    });
  };

  const handleReveal = (item: SimilarImageHashItem) => {
    VsCodeApi.postMessage({
      command: WebviewMessageEnum.RevealInExplorer,
      completeImagePath: item.completePath,
    });
  };

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      wrapClassName={styles.similarModalWrapper}
      className={styles.similarModal}
      title={t("similar_title")}
      footer={null}
      onCancel={() => setOpen(false)}
    >
      <div className={styles.toolbar}>
        <div className={styles.summary}>
          {t("similar_summary", {
            groups: groups.length,
            images: similarImageCount,
          })}
        </div>
        <div className={styles.thresholdBox}>
          <span className={styles.thresholdLabel}>{t("similar_threshold")}</span>
          <Slider
            className={styles.slider}
            min={0}
            max={16}
            value={threshold}
            onChange={setThreshold}
            tooltip={{ formatter: (v) => String(v) }}
          />
          <span className={styles.thresholdValue}>{threshold}</span>
        </div>
      </div>

      <div className={styles.body}>
        {groups.length === 0 ? (
          <div className={styles.empty}>{t("similar_empty")}</div>
        ) : (
          groups.map((group, groupIndex) => (
            <div
              className={styles.group}
              key={group.members[0].item.completePath}
            >
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  {t("similar_group_title", { index: groupIndex + 1 })}
                </span>
                <span>
                  {t("similar_group_count", { count: group.members.length })}
                </span>
              </div>
              <div className={styles.memberList}>
                {group.members.map(({ item, distance }) => (
                  <div className={styles.member} key={item.completePath}>
                    <div
                      className={styles.thumbBox}
                      style={{ ["--thumb-bg" as string]: thumbBg }}
                      title={t("similar_click_reveal")}
                      onClick={() => handleReveal(item)}
                    >
                      <img
                        className={styles.thumb}
                        src={item.url}
                        alt={item.name}
                        loading="lazy"
                      />
                      <span className={styles.distanceBadge}>d={distance}</span>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        title={t("delete")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.memberName} title={item.name}>
                      {item.name}
                    </div>
                    <div className={styles.memberPath} title={item.shortPath}>
                      {item.shortPath}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default SimilarImagesModal;

/** 从当前已加载图片列表发起相似检测 */
export function useStartSimilarDetection() {
  const { t } = useTranslation();
  const originDirList = useAtomValue(originDirListAtom);
  const [scanning, setScanning] = useAtom(similarImagesScanningAtom);

  return () => {
    if (scanning) {
      return;
    }

    const images = originDirList.flatMap((dir) =>
      dir.imageList.map((image) => ({
        completePath: getCompleteImagePath(dir.completePath, image.name),
        url: image.url,
        name: image.name,
        shortPath: dir.shortPath,
        ext: image.ext,
      }))
    );

    if (images.length < 2) {
      toast.info(t("similar_need_more"));
      return;
    }

    setScanning(true);
    toast.loading(t("similar_scanning"), { id: SIMILAR_SCAN_TOAST_ID });
    VsCodeApi.postMessage({
      command: WebviewMessageEnum.DetectSimilarImages,
      images,
    });
  };
}
