import BackgroundContainer from "@/components/BackgroundContainer";
import ImageTypeContainer from "@/components/ImageTypeContainer";
import SearchContainer from "@/components/SearchContainer";
import Settings from "@/components/Settings";
import SliderContainer from "@/components/SliderContainer";
import { backgroundColorAtom } from "@/store/bgc";
import { filteredCountAtom, totalCountAtom } from "@/store/count";
import { imageSizeAtom } from "@/store/imageSize";
import { numsAtom, showTypeAtom } from "@/store/imageType";
import { searchValueAtom } from "@/store/searchValue";
import { ReactComponent as ArrowDown } from "assets/svg/arrow_down.svg";
import { ReactComponent as Folder } from "assets/svg/folder.svg";
import { ReactComponent as Loading } from "assets/svg/loading.svg";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useImmer } from "use-immer";
import CounterContainer from "../components/CounterContainer";
import EmptyBox from "../components/EmptyBox";
import "./webview.less";

const Webview: FC = () => {
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

  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [imageBasicInfo, setImageBasicInfo] = useImmer<
    Record<ImageInfo["url"], ImageBasicInfo>
  >({});

  const [projectName, setProjectName] = useState<string>("");
  const [dirPath, setDirPath] = useState<string>("");

  const timer = useRef<number>(Infinity);

  useEffect(() => {
    VsCodeApi.postMessage({
      command: "requestImages",
    });

    window.addEventListener("message", (event) => {
      const message: ShowImagesMessage = event.data;
      if (message.command === "showImages") {
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
              path: dir.path,
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

  const getImageBasicInfo = (image: ImageInfo) => {
    if (Object.keys(imageBasicInfo).includes(image.url)) {
      return;
    }

    const reader = new FileReader();
    let img = new Image();
    let basicInfo: ImageBasicInfo = {
      width: 0,
      height: 0,
      size: "",
      base64: "",
    };

    img.onload = () => {
      // svg 没有明确设置高宽时，浏览器会使用默认值 150x150，所以需特殊处理
      if (image.ext === ".svg") {
        const svgContent = atob(basicInfo.base64.split(",")[1]);
        const svgDoc = new DOMParser().parseFromString(
          svgContent,
          "image/svg+xml"
        );
        const svgElement = svgDoc.documentElement;

        const width = svgElement.getAttribute("width");
        const height = svgElement.getAttribute("height");

        if (width && height) {
          basicInfo.width = parseInt(width);
          basicInfo.height = parseInt(height);
        } else {
          const viewBox = svgElement
            .getAttribute("viewBox")
            ?.split(" ")
            .map(Number);
          if (viewBox && viewBox.length === 4) {
            basicInfo.width = viewBox[2];
            basicInfo.height = viewBox[3];
          } else {
            basicInfo.width = img.width;
            basicInfo.height = img.height;
          }
        }
      } else {
        basicInfo.width = img.width;
        basicInfo.height = img.height;
      }

      setImageBasicInfo((draft) => {
        draft[image.url] = basicInfo;
      });
    };

    reader.onload = () => {
      let base64String = reader.result as string;

      // FileReader 无法正确读取 avif 文件类型，会变成 application/unknown，所以需要特殊处理
      if (image.ext === ".avif") {
        const base64Data = base64String.split(",")[1];
        base64String = `data:image/avif;base64,${base64Data}`;
      }

      basicInfo.base64 = base64String;
      img.src = base64String;
    };

    fetch(image.url)
      .then((res) => res.blob())
      .then((blob) => {
        if (blob.size < 1024) {
          basicInfo.size = `${blob.size}B`;
        } else if (blob.size < 1024 * 1024) {
          basicInfo.size = `${(blob.size / 1024).toFixed(2)}KB`;
        } else {
          basicInfo.size = `${(blob.size / 1024 / 1024).toFixed(2)}MB`;
        }

        reader.readAsDataURL(blob);
      });
  };

  return (
    <div className="container">
      <div className="titleContainer">
        <div className="title">
          Previewing <i>{dirPath}</i> directory under <i>{projectName}</i>{" "}
          project!
        </div>
        <Settings />
      </div>

      <div className="actionBar">
        <SearchContainer />
        <ImageTypeContainer />
        <SliderContainer />
        <BackgroundContainer />
        <div className="btnContainer">
          <div className="gradientBtn gradientStatic" onClick={expandAll}>
            Expand All
          </div>
          <div className="gradientBtn gradientBorder" onClick={collapseAll}>
            Collapse All
          </div>
        </div>
      </div>
      {pageStatus === "loading" ? (
        <div className="loadingBox">
          <Loading className="loadingIcon" />
        </div>
      ) : filteredCount > 0 ? (
        filteredDirList.map((dir, index) => (
          <div className="imageCard" key={dir.path} data-expanded={true}>
            <div
              className="dirPathContainer"
              onClick={() => {
                const target = document.querySelectorAll(`.imageCard`)[index];
                target.getAttribute("data-expanded") === "true"
                  ? target.setAttribute("data-expanded", "false")
                  : target.setAttribute("data-expanded", "true");
              }}
            >
              <div className="dirPath">{dir.path}</div>

              <div
                className="folderIconBox"
                onClick={(e) => {
                  e.stopPropagation();
                  VsCodeApi.postMessage({
                    command: "openFolder",
                    completePath: dir.completePath,
                  });
                }}
              >
                <Folder className="folderIcon" />
              </div>
              <ArrowDown className="arrowDown" color="#fff" />
            </div>
            <div className="imageContainer">
              {dir.imageList.map((image) => (
                <div
                  className="imageItem"
                  key={image.name}
                  style={{ width: imageSize }}
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
                    onMouseOver={() => {
                      setCurrentImageUrl(image.url);
                      getImageBasicInfo(image);
                    }}
                    onMouseLeave={() => {
                      setCurrentImageUrl("");
                    }}
                    onMouseDown={() => {
                      window.clearTimeout(timer.current);
                      timer.current = window.setTimeout(() => {
                        timer.current = Infinity;
                        VsCodeApi.postMessage({
                          command: "revealInSideBar",
                          completeImagePath:
                            dir.completePath + "/" + image.name,
                        });
                      }, 100);
                    }}
                    onMouseUp={() => {
                      window.clearTimeout(timer.current);
                      if (
                        imageBasicInfo[image.url] &&
                        timer.current !== Infinity
                      ) {
                        navigator.clipboard
                          .writeText(imageBasicInfo[image.url].base64)
                          .then(() => {
                            toast.success("copy base64 success!");
                          });
                      }
                    }}
                  >
                    <img
                      className="image"
                      src={image.url}
                      alt={image.name}
                      loading="lazy"
                    />
                    <div
                      className={
                        currentImageUrl === image.url &&
                        imageBasicInfo[image.url]
                          ? "imageBasicInfo"
                          : "imageBasicInfo hidden"
                      }
                      style={{
                        fontSize:
                          imageSize <= 60 ? `${imageSize / 4}px` : "15px",
                        lineHeight:
                          imageSize <= 60 ? `${imageSize / 4 + 2}px` : "17px",
                      }}
                    >
                      {imageBasicInfo[image.url]?.size}
                      <br />
                      {`${imageBasicInfo[image.url]?.width} x ${
                        imageBasicInfo[image.url]?.height
                      }`}
                    </div>
                  </div>
                  <div
                    className="imageName"
                    onClick={() => {
                      navigator.clipboard.writeText(image.name).then(() => {
                        toast.success("copy image name success!");
                      });
                    }}
                    title={image.name}
                  >
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyBox />
      )}

      <CounterContainer />
    </div>
  );
};

export default Webview;
