import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.less";

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [projectName, setProjectName] = React.useState<string>("");
  const [dirPath, setDirPath] = React.useState<string>("");
  const [images, setImages] = React.useState<
    { path: string; images: string[] }[]
  >([]);

  React.useEffect(() => {
    // 向extension发送消息请求当前目录下的所有图片
    vscode.postMessage({
      command: "requestImages",
    });

    // 监听来自extension的消息
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "showImages") {
        setImages(message.images);
        setProjectName(message.projectName);
        setDirPath(message.dirPath);
      }
    });
  }, []);

  return (
    <div className="container">
      <div className="title">
        You are previewing the images in the <i>{dirPath}</i> directory under
        the <i>{projectName}</i> project!
      </div>
      {images.map((item, index) => (
        <div key={index}>
          <h2>{item.path}</h2>
          {item.images.map((image, index) => (
            <img key={index} src={image} alt={image} />
          ))}
        </div>
      ))}
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
