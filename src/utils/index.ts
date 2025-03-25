import { Language } from "@/consts/enum";
import store from "@/store";
import { languageAtom } from "@/store/language";

export const isChinese = () => {
  return store.get(languageAtom) === Language.Chinese;
};

export const getImageBasicInfo = (
  image: ImageInfo
): Promise<ImageBasicInfo> => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    let basicInfo: ImageBasicInfo = {
      width: 0,
      height: 0,
      size: "",
    };

    img.onload = () => {
      basicInfo.width = img.width;
      basicInfo.height = img.height;
      resolve(basicInfo);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
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

        if (image.ext === ".svg") {
          return blob.text();
        } else {
          img.src = image.url;
        }
      })
      .then((svgContent) => {
        if (!svgContent) {
          return;
        }
        // svg 没有明确设置高宽时，浏览器会使用默认值 150x150，所以需特殊处理
        const svgDoc = new DOMParser().parseFromString(
          svgContent,
          "image/svg+xml"
        );
        const svgElement = svgDoc.documentElement;

        const width = svgElement.getAttribute("width");
        const height = svgElement.getAttribute("height");
        const viewBox = svgElement
          .getAttribute("viewBox")
          ?.split(" ")
          .map((n) => parseInt(n));

        if (width && height) {
          basicInfo.width = parseInt(width);
          basicInfo.height = parseInt(height);
        } else if (
          viewBox &&
          viewBox.length === 4 &&
          viewBox[2] &&
          viewBox[3]
        ) {
          if (width && !height) {
            basicInfo.width = parseInt(width);
            basicInfo.height = Math.floor(
              (parseInt(width) / viewBox[2]) * viewBox[3]
            );
          } else if (!width && height) {
            basicInfo.height = parseInt(height);
            basicInfo.width = Math.floor(
              (parseInt(height) / viewBox[3]) * viewBox[2]
            );
          } else {
            basicInfo.width = viewBox[2];
            basicInfo.height = viewBox[3];
          }
        } else {
          basicInfo.width = width ? parseInt(width) : 300;
          basicInfo.height = height ? parseInt(height) : 150;
        }

        resolve(basicInfo);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getImageBase64 = (image: ImageInfo): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      let base64String = reader.result as string;

      // FileReader 无法正确读取 avif 文件类型，会变成 application/unknown，所以需要特殊处理
      if (image.ext === ".avif") {
        const base64Data = base64String.split(",")[1];
        base64String = `data:image/avif;base64,${base64Data}`;
      }

      resolve(base64String);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image"));
    };

    fetch(image.url)
      .then((res) => res.blob())
      .then((blob) => {
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
