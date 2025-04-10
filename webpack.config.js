const path = require("path");

module.exports = {
  entry: "./src/webview/index.tsx",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "out", "webview"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      assets: path.resolve(__dirname, "./src/assets"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.module\.(c|le)ss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
                exportLocalsConvention: "as-is",
                localIdentName: "[path][name]__[local]--[hash:base64:5]",
              },
              importLoaders: 1,
            },
          },
          "less-loader",
        ],
      },
      {
        test: /\.(c|le)ss$/,
        exclude: /\.module\.(c|le)ss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
          "less-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: "img/[name].[contenthash][ext]",
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        removeViewBox: false, // 不主动清除ViewBox
                      },
                    },
                  },
                ],
              },
            },
          },
          "url-loader", // 支持url的方式
        ],
      },
    ],
  },
};
