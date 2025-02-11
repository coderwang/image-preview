import * as React from "react";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";
import { ReactComponent as ArrowDown } from "../../assets/arrow_down.svg";
import "./index.less";

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [projectName, setProjectName] = React.useState<string>("");
  const [dirPath, setDirPath] = React.useState<string>("");
  const [images, setImages] = React.useState<
    { path: string; images: ImageInfo[] }[]
  >([]);

  React.useEffect(() => {
    // 向extension发送消息请求当前目录下的所有图片
    vscode.postMessage({
      command: "requestImages",
    });

    // 监听来自extension的消息
    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log(message.images);
      if (message.command === "showImages") {
        setImages(message.images);
        setProjectName(message.projectName);
        setDirPath(message.dirPath);
      }
    });
  }, []);

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
      {images.map((item, index) => (
        <div className="imageCard" key={index}>
          <div className="imageTitleContainer">
            <div className="imageTitle">{item.path}</div>
            <ArrowDown className="arrowDown" color="#fff" />
          </div>
          <div className="imageContainer">
            {item.images.map((image, index) => (
              <div className="imageItem" key={index}>
                <div className="imageBox">
                  <img className="image" src={image.url} alt={image.name} />
                </div>
                <div
                  className="imageName"
                  onClick={() => {
                    navigator.clipboard.writeText(image.name).then(() => {
                      toast.success("copy to clipboard success!");
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
