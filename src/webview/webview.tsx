import CustomToaster from "@/components/CustomToaster";
import SearchContainer from "@/components/SearchContainer";
import ThemeToggle from "@/components/ThemeToggle";
import { filteredCountAtom, totalCountAtom } from "@/store/count";
import { ReactComponent as ArrowDown } from "assets/svg/arrow_down.svg";
import { ReactComponent as Folder } from "assets/svg/folder.svg";
import { ReactComponent as Loading } from "assets/svg/loading.svg";
import { useAtom } from "jotai";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import * as React from "react";
import { toast } from "sonner";
import { useImmer } from "use-immer";
import CounterContainer from "../components/CounterContainer";
import EmptyBox from "../components/EmptyBox";
import "./webview.less";

const Webview: React.FC = () => {
  const [pageStatus, setPageStatus] = React.useState<"loading" | "ready">(
    "loading"
  );

  const [imageSize, setImageSize] = React.useState(50);
  const [backgroundColor, setBackgroundColor] = React.useState("#fff");

  const originDirListRef = React.useRef<DirInfo[]>([]);
  const [filteredDirList, setFilteredDirList] = React.useState<DirInfo[]>([]);

  const [searchValue, setSearchValue] = React.useState<string>("");

  const [showType, updateShowType] = useImmer<Record<ImageType, boolean>>({
    avif: true,
    ico: true,
    jpg: true,
    png: true,
    gif: true,
    webp: true,
    svg: true,
  });

  const [currentImageUrl, setCurrentImageUrl] = React.useState<string>("");
  const [imageBasicInfo, setImageBasicInfo] = useImmer<
    Record<ImageInfo["url"], ImageBasicInfo>
  >({});

  const [projectName, setProjectName] = React.useState<string>("");
  const [dirPath, setDirPath] = React.useState<string>("");
  const [nums, setNums] = React.useState<Record<ImageType, number>>({
    avif: 0,
    ico: 0,
    jpg: 0,
    png: 0,
    gif: 0,
    webp: 0,
    svg: 0,
  });
  const [filteredCount, setFilteredCount] = useAtom(filteredCountAtom);
  const [totalCount, setTotalCount] = useAtom(totalCountAtom);

  const timer = React.useRef<number>(Infinity);

  const backgroundList = React.useMemo(() => {
    return ["#fff", "#8eeed8", "#8ec6ee", "#ee8ead", "#eead8e"];
  }, []);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
      <CustomToaster />
      <div className="titleContainer">
        <div className="title">
          Previewing <i>{dirPath}</i> directory under <i>{projectName}</i>{" "}
          project!
        </div>
        <ThemeToggle />
      </div>

      <div className="actionBar">
        <SearchContainer
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
        />
        <div className="numsContainer">
          <div className="numsTitle">Image type:</div>
          <div
            className="btn"
            onClick={() => {
              updateShowType((draft) => {
                Object.keys(draft).forEach((key) => {
                  draft[key as ImageType] = true;
                });
              });
            }}
          >
            All
          </div>
          <div
            className="btn"
            onClick={() => {
              updateShowType((draft) => {
                Object.keys(draft).forEach((key) => {
                  draft[key as ImageType] = !draft[key as ImageType];
                });
              });
            }}
          >
            Reversed
          </div>
          {(Object.entries(nums) as [ImageType, number][]).map(
            ([item, count]) => {
              return (
                count > 0 && (
                  <div className="numsItem" key={item}>
                    <input
                      id={item}
                      type="checkbox"
                      checked={showType[item]}
                      onChange={() =>
                        updateShowType((draft) => {
                          draft[item] = !draft[item];
                        })
                      }
                    />
                    <label htmlFor={item}>
                      {item.toUpperCase()}
                      <i>({count})</i>
                    </label>
                  </div>
                )
              );
            }
          )}
        </div>
        <div className="sliderContainer">
          <div className="sliderTitle">Image size({imageSize}px):</div>
          <Slider
            className="slider"
            min={30}
            max={200}
            value={imageSize}
            onChange={(value) => setImageSize(value as number)}
          />
        </div>
        <div className="backgroundContainer">
          <div className="backgroundTitle">Background color: </div>
          {backgroundList.map((item) => {
            return (
              <div
                className="backgroundBox"
                style={{
                  backgroundColor: item,
                  transform:
                    backgroundColor === item ? "scale(1.2)" : "scale(1)",
                }}
                onClick={() => setBackgroundColor(item)}
              />
            );
          })}
        </div>
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
                    style={{ height: imageSize, backgroundColor }}
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
