import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import { useImmer } from "use-immer";
import { ReactComponent as ArrowDown } from "../../assets/arrow_down.svg";
import "./index.less";

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [imageSize, setImageSize] = React.useState(50);
  const [backgroundColor, setBackgroundColor] = React.useState("#fff");

  const originDirListRef = React.useRef<DirInfo[]>([]);
  const [filteredDirList, setFilteredDirList] = React.useState<DirInfo[]>([]);

  const [searchValue, setSearchValue] = React.useState<string>("");

  const [showType, updateShowType] = useImmer({
    jpg: true,
    png: true,
    gif: true,
    webp: true,
    svg: true,
  });

  const [currentImageUrl, setCurrentImageUrl] = React.useState<string>("");
  const [imageBasicInfo, setImageBasicInfo] = useImmer<
    Record<string, ImageBasicInfo>
  >({});

  const [projectName, setProjectName] = React.useState<string>("");
  const [dirPath, setDirPath] = React.useState<string>("");
  const [nums, setNums] = React.useState<{
    jpgNum: number;
    pngNum: number;
    gifNum: number;
    webpNum: number;
    svgNum: number;
  }>({
    jpgNum: 0,
    pngNum: 0,
    gifNum: 0,
    webpNum: 0,
    svgNum: 0,
  });

  React.useEffect(() => {
    // 向extension发送消息请求当前目录下的所有图片
    vscode.postMessage({
      command: "requestImages",
    });

    // 监听来自extension的消息
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "showImages") {
        originDirListRef.current = message.dirList;
        setFilteredDirList(message.dirList);
        setProjectName(message.projectName);
        setDirPath(message.dirPath);
        setNums(message.nums);
      }
    });
  }, []);

  React.useEffect(() => {
    if (Object.values(showType).every((item) => item) && searchValue === "") {
      setFilteredDirList(originDirListRef.current);
    } else {
      setFilteredDirList(
        originDirListRef.current.reduce((acc: DirInfo[], dir) => {
          let list: ImageInfo[] = [];
          dir.imageList.forEach((image) => {
            switch (image.ext) {
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
            acc.push({
              path: dir.path,
              imageList: list,
            });
          }
          return acc;
        }, [])
      );
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
      basicInfo.width = img.width;
      basicInfo.height = img.height;
      setImageBasicInfo((draft) => {
        draft[image.url] = basicInfo;
      });
    };

    reader.onload = () => {
      basicInfo.base64 = reader.result as string;
      img.src = reader.result as string;
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
      <Toaster
        theme="light"
        visibleToasts={2}
        richColors
        offset={{
          right: 16,
          bottom: 8,
        }}
        mobileOffset={{
          right: 16,
          bottom: 8,
        }}
        toastOptions={{
          duration: 2000,
        }}
      />
      <div className="title">
        You are previewing the images in the <i>{dirPath}</i> directory under
        the <i>{projectName}</i> project!
      </div>
      <div className="actionBar">
        <div className="searchContainer">
          <div className="searchTitle">Search:</div>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Image name"
          />
        </div>
        <div className="numsContainer">
          <div className="numsTitle">
            Image count(
            {nums.jpgNum +
              nums.pngNum +
              nums.gifNum +
              nums.webpNum +
              nums.svgNum}
            ) :
          </div>
          {nums.jpgNum > 0 && (
            <div className="numsItem">
              <input
                id="jpg"
                type="checkbox"
                checked={showType.jpg}
                onChange={() =>
                  updateShowType((draft) => {
                    draft.jpg = !draft.jpg;
                  })
                }
              />
              <label htmlFor="jpg">
                JPG<i>({nums.jpgNum})</i>
              </label>
            </div>
          )}
          {nums.pngNum > 0 && (
            <div className="numsItem">
              <input
                id="png"
                type="checkbox"
                checked={showType.png}
                onChange={() =>
                  updateShowType((draft) => {
                    draft.png = !draft.png;
                  })
                }
              />
              <label htmlFor="png">
                PNG<i>({nums.pngNum})</i>
              </label>
            </div>
          )}
          {nums.gifNum > 0 && (
            <div className="numsItem">
              <input
                id="gif"
                type="checkbox"
                checked={showType.gif}
                onChange={() =>
                  updateShowType((draft) => {
                    draft.gif = !draft.gif;
                  })
                }
              />
              <label htmlFor="gif">
                GIF<i>({nums.gifNum})</i>
              </label>
            </div>
          )}
          {nums.webpNum > 0 && (
            <div className="numsItem">
              <input
                id="webp"
                type="checkbox"
                checked={showType.webp}
                onChange={() =>
                  updateShowType((draft) => {
                    draft.webp = !draft.webp;
                  })
                }
              />
              <label htmlFor="webp">
                WebP<i>({nums.webpNum})</i>
              </label>
            </div>
          )}
          {nums.svgNum > 0 && (
            <div className="numsItem">
              <input
                id="svg"
                type="checkbox"
                checked={showType.svg}
                onChange={() =>
                  updateShowType((draft) => {
                    draft.svg = !draft.svg;
                  })
                }
              />
              <label htmlFor="svg">
                SVG<i>({nums.svgNum})</i>
              </label>
            </div>
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
          <div
            className="backgroundBox"
            onClick={() => setBackgroundColor("#fff")}
          />
          <div
            className="backgroundBox"
            style={{ backgroundColor: "#8eeed8" }}
            onClick={() => setBackgroundColor("#8eeed8")}
          />
          <div
            className="backgroundBox"
            style={{ backgroundColor: "#8ec6ee" }}
            onClick={() => setBackgroundColor("#8ec6ee")}
          />
          <div
            className="backgroundBox"
            style={{ backgroundColor: "#ee8ead" }}
            onClick={() => setBackgroundColor("#ee8ead")}
          />
          <div
            className="backgroundBox"
            style={{ backgroundColor: "#eead8e" }}
            onClick={() => setBackgroundColor("#eead8e")}
          />
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
      {filteredDirList.map((dir, index) => (
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
                  onClick={() => {
                    imageBasicInfo[image.url] &&
                      navigator.clipboard
                        .writeText(imageBasicInfo[image.url].base64)
                        .then(() => {
                          toast.success("copy base64 success!");
                        });
                  }}
                >
                  <img className="image" src={image.url} alt={image.name} />
                  <div
                    className={
                      currentImageUrl === image.url && imageBasicInfo[image.url]
                        ? "imageBasicInfo"
                        : "imageBasicInfo hidden"
                    }
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
                >
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
