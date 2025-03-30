import BackgroundContainer from "@/components/BackgroundContainer";
import ImagePreview from "@/components/ImagePreview";
import ImageTypeContainer from "@/components/ImageTypeContainer";
import SearchContainer from "@/components/SearchContainer";
import SettingButton from "@/components/SettingButton";
import SliderContainer from "@/components/SliderContainer";
import {
  ExtensionMessageEnum,
  OperationEnum,
  WebviewMessageEnum,
} from "@/consts/enum";
import {
  CompressImageCallbackMessage,
  ImagePreviewRef,
  ShowImagesMessage,
} from "@/consts/interface";
import { backgroundColorAtom } from "@/store/bgc";
import { filteredCountAtom, totalCountAtom } from "@/store/count";
import {
  currentPreviewImageIndexAtom,
  previewImageListAtom,
} from "@/store/image";
import { imageSizeAtom } from "@/store/imageSize";
import { numsAtom, showTypeAtom } from "@/store/imageType";
import { searchValueAtom } from "@/store/searchValue";
import { getImageBase64, getImageBasicInfo } from "@/utils";
import { Dropdown } from "antd";
import { ReactComponent as ArrowDown } from "assets/svg/arrow_down.svg";
import { ReactComponent as Folder } from "assets/svg/folder.svg";
import { ReactComponent as Loading } from "assets/svg/loading.svg";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { FC, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useImmer } from "use-immer";
import CounterContainer from "../components/CounterContainer";
import EmptyBox from "../components/EmptyBox";
import "./webview.less";

const Webview: FC = () => {
  const { t } = useTranslation();
  const [pageStatus, setPageStatus] = useState<"loading" | "ready">("loading");

  const searchValue = useAtomValue(searchValueAtom);
  const showType = useAtomValue(showTypeAtom);
  const imageSize = useAtomValue(imageSizeAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const setNums = useSetAtom(numsAtom);
  const [filteredCount, setFilteredCount] = useAtom(filteredCountAtom);
  const [totalCount, setTotalCount] = useAtom(totalCountAtom);

  const originDirListRef = useRef<DirInfo[]>([]);
  const [filteredDirList, setFilteredDirList] = useState<DirInfo[]>([]);

  const [imageBasicInfo, setImageBasicInfo] = useImmer<
    Record<ImageInfo["url"], ImageBasicInfo>
  >({});

  const [projectName, setProjectName] = useState<string>("");
  const [dirPath, setDirPath] = useState<string>("");

  const imagePreviewRef = useRef<ImagePreviewRef>(null);
  const setPreviewImageList = useSetAtom(previewImageListAtom);
  const setCurrentPreviewImageIndex = useSetAtom(currentPreviewImageIndexAtom);

  useEffect(() => {
    VsCodeApi.postMessage({
      command: WebviewMessageEnum.RequestImages,
    });

    window.addEventListener("message", (event) => {
      const message: ShowImagesMessage | CompressImageCallbackMessage =
        event.data;
      switch (message.command) {
        case ExtensionMessageEnum.ShowImages: {
          originDirListRef.current = message.dirList;
          setFilteredDirList(message.dirList);
          setProjectName(message.projectName);
          setDirPath(message.dirPath);
          setNums(message.nums);
          const total = Object.values(message.nums).reduce(
            (acc, count) => acc + count,
            0
          );
          setTotalCount(total);
          setFilteredCount(total);
          setPageStatus("ready");
          break;
        }
        case ExtensionMessageEnum.ShowCompressResult: {
          if (message.reducedPercent === 0) {
            toast.info(t("compress_fail"));
          } else {
            // todo 压缩成功后，刷新图片列表
            toast.success(
              t("compress_success", { percent: `${message.reducedPercent}%` })
            );
          }
          break;
        }
      }
    });
  }, []);

  useEffect(() => {
    if (Object.values(showType).every((item) => item) && searchValue === "") {
      setFilteredDirList(originDirListRef.current);
      setFilteredCount(totalCount);
    } else {
      let count = 0;
      const filtered = originDirListRef.current.reduce(
        (acc: DirInfo[], dir) => {
          let list: ImageInfo[] = [];
          dir.imageList.forEach((image) => {
            switch (image.ext) {
              case ".ico":
                showType.ico &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".avif":
                showType.avif &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".jpg":
              case ".jpeg":
                showType.jpg &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".png":
                showType.png &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".gif":
                showType.gif &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".webp":
                showType.webp &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
              case ".svg":
                showType.svg &&
                  image.name.includes(searchValue) &&
                  list.push(image);
                break;
            }
          });
          if (list.length > 0) {
            count += list.length;
            acc.push({
              completePath: dir.completePath,
              shortPath: dir.shortPath,
              imageList: list,
            });
          }
          return acc;
        },
        []
      );
      setFilteredDirList(filtered);
      setFilteredCount(count);
    }
  }, [showType, searchValue]);

  const expandAll = () => {
    document.querySelectorAll(`.imageCard`).forEach((item) => {
      item.setAttribute("data-expanded", "true");
    });
  };

  const collapseAll = () => {
    document.querySelectorAll(`.imageCard`).forEach((item) => {
      item.setAttribute("data-expanded", "false");
    });
  };

  return (
    <div className="container">
      <div className="titleContainer">
        <div className="title">
          <Trans
            i18nKey="preview_title"
            values={{
              dirPath,
              projectName,
            }}
            components={{
              italic: <i />,
            }}
          ></Trans>
        </div>
        <SettingButton />
      </div>

      <div className="actionBar">
        <SearchContainer />
        <ImageTypeContainer />
        <SliderContainer />
        <BackgroundContainer />
        <div className="btnContainer">
          <div className="gradientBtn gradientStatic" onClick={expandAll}>
            {t("expand_all")}
          </div>
          <div className="gradientBtn gradientBorder" onClick={collapseAll}>
            {t("collapse_all")}
          </div>
        </div>
      </div>
      {pageStatus === "loading" ? (
        <div className="loadingBox">
          <Loading className="loadingIcon" />
        </div>
      ) : filteredCount > 0 ? (
        filteredDirList.map((dir, dirIndex) => (
          <div className="imageCard" key={dir.shortPath} data-expanded={true}>
            <div
              className="dirPathContainer"
              onClick={() => {
                const target =
                  document.querySelectorAll(`.imageCard`)[dirIndex];
                target.getAttribute("data-expanded") === "true"
                  ? target.setAttribute("data-expanded", "false")
                  : target.setAttribute("data-expanded", "true");
              }}
            >
              <div className="dirPath">{dir.shortPath}</div>

              <div
                className="folderIconBox"
                onClick={(e) => {
                  e.stopPropagation();
                  VsCodeApi.postMessage({
                    command: WebviewMessageEnum.OpenExternal,
                    completePath: dir.completePath,
                  });
                }}
              >
                <Folder className="folderIcon" />
              </div>
              <ArrowDown className="arrowDown" color="#fff" />
            </div>
            <div className="imageContainer">
              {dir.imageList.map((image, imageIndex) => (
                <Dropdown
                  key={image.name}
                  menu={{
                    className: "customDropdown",
                    items: [
                      {
                        label: t("reveal_in_side_bar"),
                        key: WebviewMessageEnum.RevealInExplorer,
                      },
                      {
                        label: t("open_containing_folder"),
                        key: WebviewMessageEnum.RevealFileInOS,
                      },
                      {
                        type: "divider",
                      },
                      {
                        label: t("copy_image_name"),
                        key: OperationEnum.CopyImageName,
                      },
                      {
                        label: t("copy_base64"),
                        key: OperationEnum.CopyBase64,
                      },
                      {
                        type: "divider",
                      },
                      {
                        label: t("compress_image"),
                        key: WebviewMessageEnum.CompressImage,
                        disabled: image.ext === ".ico",
                      },
                    ],
                    onClick: ({ key }) => {
                      switch (key) {
                        case WebviewMessageEnum.RevealInExplorer:
                          VsCodeApi.postMessage({
                            command: WebviewMessageEnum.RevealInExplorer,
                            completeImagePath:
                              dir.completePath + "/" + image.name,
                          });
                          break;
                        case WebviewMessageEnum.RevealFileInOS:
                          VsCodeApi.postMessage({
                            command: WebviewMessageEnum.RevealFileInOS,
                            completeImagePath:
                              dir.completePath + "/" + image.name,
                          });
                          break;
                        case OperationEnum.CopyImageName:
                          navigator.clipboard.writeText(image.name).then(() => {
                            toast.success(t("copy_image_name_success"));
                          });
                          break;
                        case OperationEnum.CopyBase64:
                          toast.promise(getImageBase64(image), {
                            loading: t("copy_base64_loading"),
                            success: async (data: string) => {
                              await navigator.clipboard.writeText(data);
                              return t("copy_base64_success");
                            },
                            error: t("copy_base64_failed"),
                          });
                          break;
                        case WebviewMessageEnum.CompressImage:
                          if (image.ext === ".svg") {
                            VsCodeApi.postMessage({
                              command: WebviewMessageEnum.CompressSVG,
                              completeSvgPath:
                                dir.completePath + "/" + image.name,
                            });
                          } else {
                            VsCodeApi.postMessage({
                              command: WebviewMessageEnum.CompressImage,
                              completeImagePath:
                                dir.completePath + "/" + image.name,
                            });
                          }
                          break;
                      }
                    },
                  }}
                  trigger={["contextMenu"]}
                >
                  <div
                    className="imageItem"
                    style={{ width: imageSize }}
                    onClick={() => {
                      setPreviewImageList(
                        dir.imageList.map((item) => item.url)
                      );
                      setCurrentPreviewImageIndex(imageIndex);
                      imagePreviewRef.current?.show();
                    }}
                    onMouseEnter={() => {
                      if (Object.keys(imageBasicInfo).includes(image.url)) {
                        return;
                      }
                      getImageBasicInfo(image)
                        .then((basicInfo) => {
                          setImageBasicInfo((draft) => {
                            draft[image.url] = basicInfo;
                          });
                        })
                        .catch((error) => {
                          console.error(
                            "Failed to get image basic info",
                            error
                          );
                        });
                    }}
                  >
                    <div
                      className="imageBox"
                      style={{
                        height: imageSize,
                        backgroundColor:
                          typeof backgroundColor === "string"
                            ? backgroundColor
                            : backgroundColor?.toRgbString(),
                      }}
                    >
                      {/* 图片本体 */}
                      <img
                        className="image"
                        src={image.url}
                        alt={image.name}
                        loading="lazy"
                      />
                      {/* 图片大小和尺寸 */}
                      {imageBasicInfo[image.url] && (
                        <div
                          className="imageBasicInfo"
                          style={{
                            fontSize:
                              imageSize <= 60 ? `${imageSize / 4}px` : "15px",
                            lineHeight:
                              imageSize <= 60
                                ? `${imageSize / 4 + 2}px`
                                : "17px",
                          }}
                        >
                          {imageBasicInfo[image.url].size}
                          <br />
                          {`${imageBasicInfo[image.url].width} x ${
                            imageBasicInfo[image.url].height
                          }`}
                        </div>
                      )}
                    </div>
                    {/* 图片名称 */}
                    <div className="imageName" title={image.name}>
                      {image.name}
                    </div>
                  </div>
                </Dropdown>
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyBox />
      )}

      <CounterContainer />
      <ImagePreview ref={imagePreviewRef} />
    </div>
  );
};

export default Webview;
