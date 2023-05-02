const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;
const SentryCliPlugin = require("@sentry/webpack-plugin");
const deps = require("./package.json").dependencies;
module.exports = {
  entry: "./src/index",
  cache: false,

  mode: "development",
  devtool: "source-map",

  optimization: {
    minimize: false,
  },

  output: {
    publicPath: "auto",
  },

  resolve: {
    extensions: [".jsx", ".js", ".json", ".mjs"],
  },

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
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        exclude: /node_modules/,
        options: {
          presets: [require.resolve("@babel/preset-react")],
        },
      },
      {
        test: /\.md$/,
        loader: "raw-loader",
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "app_01",
      filename: "remoteEntry.js",
      remotes: {
        app_02: "app_02@http://localhost:3002/remoteEntry.js",
        app_03: "app_03@http://localhost:3003/remoteEntry.js",
        app_05: "app_05@http://localhost:3005/remoteEntry.js",
      },
      exposes: {
        "./SideNav": "./src/SideNav",
        "./Page": "./src/Page",
      },
      shared: {
        ...deps,
        "@material-ui/core": {
          singleton: true,
        },
        "react-router-dom": {
          singleton: true,
        },
        "react-dom": {
          singleton: true,
        },
        react: {
          singleton: true,
        },
      },
    }),
    new SentryCliPlugin({
      include: ".",
      ignoreFile: ".sentrycliignore",
      ignore: ["node_modules", "webpack.config.js"],
      configFile: "sentry.properties",
      release: "app-01@1.0.0",
      org: "sentry-sdks",
      project: "sentry-electron",
      authToken:
        "76b9a52316c6443bb7d2b9c95a1b76c1828357a876184aa6835f1ff9e981c800",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
