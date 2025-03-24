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
import { Image, Space } from "antd";
import clsx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import styles from "./index.module.less";

interface ImagePreviewProps {}

const ImagePreview = forwardRef<ImagePreviewRef, ImagePreviewProps>(
  (props, ref) => {
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

    return (
      <div className={styles.imagePreview}>
        <Image.PreviewGroup
          preview={{
            visible,
            maskClosable: false,
            maskStyle: {
              backgroundColor: "#000",
            },
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
            onTransform: ({ transform, action }) => {
              if (["wheel", "zoomIn", "zoomOut"].includes(action)) {
                const scalePercent = (transform.scale * 100).toFixed(2);
                console.log(`当前缩放比例: ${scalePercent}%`);
              }
            },
          }}
          items={previewImageList}
        />
        {visible && (
          <div className={styles.imageName}>
            {previewImageList[currentPreviewImageIndex].split("/").pop()}
          </div>
        )}
      </div>
    );
  }
);

export default ImagePreview;
