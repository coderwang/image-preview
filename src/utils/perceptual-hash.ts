/**
 * 平均感知哈希（aHash）与汉明距离工具。
 * 仅在 extension 侧使用（依赖 sharp）。
 */

/** 将图片转为 64 位 aHash（16 位十六进制字符串） */
export async function computeAverageHash(imagePath: string): Promise<string> {
  const sharp = require("sharp") as typeof import("sharp");

  // 白底铺平透明通道 → 等比缩放到 8×8 → 灰度 → 原始像素
  const { data, info } = await sharp(imagePath, {
    // SVG 栅格化时提高密度，避免细线图标糊成一团
    density: 128,
    // 动图只取首帧
    pages: 1,
    animated: false,
  })
    .ensureAlpha()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(8, 8, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels || 1;
  const pixelCount = info.width * info.height;
  const pixels: number[] = [];
  for (let i = 0; i < pixelCount; i++) {
    pixels.push(data[i * channels]);
  }

  const avg = pixels.reduce((sum, v) => sum + v, 0) / pixels.length;

  let hash = 0n;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] >= avg) {
      hash |= 1n << BigInt(i);
    }
  }

  return hash.toString(16).padStart(16, "0");
}
