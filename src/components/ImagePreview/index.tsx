import { ReactComponent as RotateOutlined } from "@/assets/svg/rotate.svg";
import { ReactComponent as SwapOutlined } from "@/assets/svg/swap.svg";
import { ReactComponent as UndoOutlined } from "@/assets/svg/undo.svg";
import { ReactComponent as ZoomInOutlined } from "@/assets/svg/zoom-in.svg";
import { ReactComponent as ZoomOutOutlined } from "@/assets/svg/zoom-out.svg";
import { ImagePreviewRef } from "@/consts/interface";
import {
  currentPreviewImageIndexAtom,
  previewImageListAtom,
} from "@/store/image";
import { getCompleteImagePath } from "@/utils";
import { Image, Space, Tag } from "antd";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import styles from "./index.module.less";

interface ImagePreviewProps {}

const ImagePreview = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  (props, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const previewImageList = useAtomValue(previewImageListAtom);
    const [currentPreviewImageIndex, setCurrentPreviewImageIndex] = useAtom(
      currentPreviewImageIndexAtom
    );

    useImperativeHandle(ref, () => ({
      show: () => {
        setVisible(true);
      },
      hide: () => {
        setVisible(false);
      },
    }));

    const imageName = useMemo(() => {
      return visible ? previewImageList[currentPreviewImageIndex]?.name : "";
    }, [visible, previewImageList, currentPreviewImageIndex]);

    const imagePath = useMemo(() => {
      return visible
        ? getCompleteImagePath(
            previewImageList[currentPreviewImageIndex]?.path,
            previewImageList[currentPreviewImageIndex]?.name
          )
        : "";
    }, [visible, previewImageList, currentPreviewImageIndex]);

    const previewImageListItems = useMemo(() => {
      return previewImageList.map((item) => item.url);
    }, [previewImageList]);

    return (
      <div className={styles.imagePreview}>
        <Image.PreviewGroup
          preview={{
            rootClassName: styles.rootPreviewWrapper,
            visible,
            maskClosable: false,
            scaleStep: 1,
            minScale: 0.5,
            maxScale: 16,
            current: currentPreviewImageIndex,
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: {
                  onFlipY,
                  onFlipX,
                  onRotateLeft,
                  onRotateRight,
                  onZoomOut,
                  onZoomIn,
                  onReset,
                },
              }
            ) => (
              <Space
                size={12}
                className={styles.toolbarWrapper}
                style={{ gap: 24 }}
              >
                <SwapOutlined
                  className={styles.toolbarIcon}
                  style={{ transform: "rotate(90deg)" }}
                  onClick={onFlipY}
                />
                <SwapOutlined
                  className={styles.toolbarIcon}
                  onClick={onFlipX}
                />
                <RotateOutlined
                  className={styles.toolbarIcon}
                  onClick={onRotateLeft}
                />
                <RotateOutlined
                  className={styles.toolbarIcon}
                  style={{ transform: "rotateY(180deg)" }}
                  onClick={onRotateRight}
                />
                <ZoomOutOutlined
                  className={clsx(
                    styles.toolbarIcon,
                    scale === 0.5 && styles.disabled
                  )}
                  onClick={onZoomOut}
                />
                <ZoomInOutlined
                  className={clsx(
                    styles.toolbarIcon,
                    scale === 16 && styles.disabled
                  )}
                  onClick={onZoomIn}
                />
                <UndoOutlined
                  className={styles.toolbarIcon}
                  onClick={onReset}
                />
              </Space>
            ),
            onVisibleChange: (v) => {
              setVisible(v);
            },
            onChange: (current) => {
              setCurrentPreviewImageIndex(current);
            },
            // onTransform: ({ transform, action }) => {
            //   if (["wheel", "zoomIn", "zoomOut"].includes(action)) {
            //     const scalePercent = (transform.scale * 100).toFixed(2);
            //     console.log(`当前缩放比例: ${scalePercent}%`);
            //   }
            // },
          }}
          items={previewImageListItems}
        />
        {visible && (
          <div className={styles.imageNameContainer}>
            <div
              className={styles.imageName}
              title={t("copy_image_name")}
              onClick={() => {
                imageName &&
                  navigator.clipboard.writeText(imageName).then(() => {
                    toast.success(t("copy_image_name_success"));
                  });
              }}
            >
              {imageName}
            </div>
            <Tag
              className={styles.imagePathTag}
              title={t("copy_path")}
              color="green"
              onClick={() => {
                imagePath &&
                  navigator.clipboard.writeText(imagePath).then(() => {
                    toast.success(t("copy_path_success"));
                  });
              }}
            >
              {t("path")}
            </Tag>
          </div>
        )}
      </div>
    );
  }
);

export default ImagePreview;
