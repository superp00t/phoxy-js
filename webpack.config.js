const webpack = require("webpack");
const path    = require("path");

module.exports = {
  mode: "production",
  entry: [
    "./bundler.js"
  ],
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    path:     path.join(__dirname, "dist"),
    filename: "bundle.js",
    libraryTarget: 'var',
    library: "Phoxy"
  }
}
