[中文文档](./COMPRESS_ZH.md)

## Compress Overview

Of the eight currently supported image types, only the `ico` type does not support compression.

`svg` uses [SVGO](https://svgo.dev/) for compression, and fully adopts its preset configuration. For details, please refer to the official documentation. The compression rate is very impressive, basically reaching more than **50%**, and it has no effect on the SVG quality. SVGO is integrated into the extension and works out of the box.

`avif`, `jpg`, `jpeg`, `png`, `gif` and `webp` use [sharp](https://sharp.pixelplumbing.com/) for compression. Currently, its preset configuration is fully adopted. Custom compression configuration will be opened in the future. The current compression capabilities are as follows:

| Image Format | Compression Type                                                        | Default Parameters                   |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------ |
| avif         | Although lossless is technically supported, it is mainly used for lossy | lossless: false,<br>quality: 50      |
| jpg / jpeg   | lossy                                                                   | quality: 80                          |
| png          | lossless                                                                | compressionLevel: 6,<br>quality: 100 |
| gif          | lossless                                                                | colors: 256                          |
| webp         | Lossy by default, can be adjusted to lossless                           | lossless: false,<br>quality: 80      |

In most scenarios, compression can be performed without worrying about image quality.

## Automatically Install Sharp

When the extension is installed or enabled, you will see the following prompt, indicating that it is being automatically installed:

![sharp_install](./src/assets/readme/sharp_install.png)

The installation process will not affect the normal use of other functions of the extension except compression. After successful installation, the compression function will be automatically started without refreshing.

If the installation fails, you will see the following prompt:

![sharp_install_failed](./src/assets/readme/sharp_install_failed.png)

You can try to install it manually.

## Manually Install Sharp

**Preparation before installation:**

`Node.js ^18.17.0 or >=20.3.0.`

### 1、Mac Installation Guide

First go to the extension installation directory:

```bash
# VSCode extension directory, please replace x.x.x with the installed version
cd ~/.vscode/extensions/coderwsh.image-preview-x.x.x

# Cursor extension directory
cd ~/.cursor/extensions/coderwsh.image-preview-x.x.x
```

To ensure stability, please install version 0.33.5 of sharp:

```bash
# Create a temporary directory
mkdir temp_install && cd temp_install

# Create a temporary package.json file
echo '{"name":"sharp-temp","version":"1.0.0","description":"Temporary package for installing sharp","private":true}' > package.json

# Install
npm install sharp@0.33.5
```

After successful installation:

```bash
# Return to the extension installation directory
cd ..

# Make sure the node_modules directory exists
mkdir node_modules

# Copy all files in the node_modules in the temporary directory to the node_modules in the extension directory
cp -Rf temp_install/node_modules/* node_modules

# Clean up the temporary directory
rm -rf temp_install
```

Now, sharp has been successfully integrated into the extension. Since there may be cache, please execute the following steps again for the extension: `Disable` -> `Restart Extensions` -> `Enable`.

### 2、Windows Installation Guide

The following operations are performed using `PowerShell`.

First, find the installation directory of the extension. The installation location of the extension in Windows may be different, so please find it yourself.

```powershell
# VSCode extension directory, please replace x.x.x with the installed version
cd C:\Users\admin\.vscode\extensions\coderwsh.image-preview-x.x.x
```

To ensure stability, please install version 0.33.5 of sharp:

```powershell
# Create a temporary directory
mkdir temp_install
cd temp_install

# Create a temporary package.json file
'{"name":"sharp-temp","version":"1.0.0","description":"Temporary package for installing sharp","private":true}' | Set-Content -Path package.json

# Install
npm install sharp@0.33.5
```

After successful installation:

```powershell
# Return to the extension installation directory
cd ..

# Make sure the node_modules directory exists
mkdir node_modules

# Copy all files in the node_modules in the temporary directory to the node_modules in the extension directory
Copy-Item -Path temp_install/node_modules/* -Destination node_modules -Recurse -Force

# Clean up the temporary directory
Remove-Item -Path temp_install -Recurse -Force
```

Now, sharp has been successfully integrated into the extension. Since there may be cache, please execute the following steps again for the extension: `Disable` -> `Restart Extensions` -> `Enable`.

## Q&A

### 1、Why use sharp instead of TinyPNG?

First, read the following articles:

- [nestjs sharp compressed image](https://medium.com/@ggluopeihai/every-full-stack-needs-to-understand-picture-compression-05961c897882)
- [Switch to Sharp: Why It Outperforms TinyPNG for Image Compression](https://medium.com/@pravishanth/switch-to-sharp-why-it-outperforms-tinypng-for-image-compression-6a5b130e89e6)

After reading this we can summarize:

1. Fast speed. Thanks to the use of the [libvips](https://github.com/libvips/libvips) library written in C language at the bottom.
2. The compression rate is as good as TinyPNG, or even higher.
3. More controllable, with more adjustable parameters.
4. There is no upload limit. For example, TinyPNG has a maximum size of 5MB for a single image, and a maximum of 20 images can be uploaded at a time.
5. Free. TinyPNG requires payment if you upload more than 500 images per month.

### 2. Why not integrate sharp into the extension?

This is because sharp depends on libvips, and libvips has different binary file packages on different platforms. If the binary files of all platforms are packaged into the extension, the size will be too large, so it will be automatically installed when the extension is installed or enabled. If the installation fails, it needs to be installed manually.

### 3. Why create a temporary directory?

This is to avoid polluting the original extension directory.

### 4. Can I install other versions of sharp?

Actually, it is possible. However, compatibility issues may occur, so it is not recommended.

### 5. What should I do if the installation fails?

If neither the automatic installation nor the manual installation works, please contact me: [coderwsh@gmail.com](mailto:coderwsh@gmail.com)
