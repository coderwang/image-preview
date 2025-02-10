const path = require("path");

module.exports = {
  entry: "./src/webview/index.tsx",
  output: {
    path: path.resolve(__dirname, "out", "webview"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
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
              importLoaders: 2,
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
              importLoaders: 2,
            },
          },
          "less-loader",
        ],
      },
    ],
  },
  optimization: {
    minimize: false, // 禁用压缩
  },
};
