const path = require("path");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const mode = process.env.NODE_ENV || "development";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SentryModuleDataPlugin } = require("sentry-module-federation/plugin");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: "tsconfig.json",
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".mjs"],
  },
  output: {
    path: __dirname + "/public",
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
    publicPath: "auto",
  },
  mode,
  plugins: [
    new ModuleFederationPlugin({
      name: "app_05",
      filename: "remoteEntry.js",
      exposes: {
        "./ActionButton": "./src/components/action-button.ts",
        "./AlertBox": "./src/components/alert-box.ts",
        "./components": "./src/index.ts",
      },
      shared: {},
    }),
    new SentryModuleDataPlugin({
      team: "team-components",
    }),
    new HtmlWebpackPlugin({
      title: "LitHTML Typescript Example",
      filename: "index.html",
      template: "src/index.html",
    }),
  ],
};
