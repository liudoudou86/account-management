const path = require("path");
const fs = require("fs");

// Generate pages object
const pages = {};

function getEntryFile(entryPath) {
  let files = fs.readdirSync(entryPath);
  return files;
}

const chromeName = getEntryFile(path.resolve(`src/entry`));

function getFileExtension(filename) {
  return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined;
}
chromeName.forEach((name) => {
  const fileExtension = getFileExtension(name);
  const fileName = name.replace("." + fileExtension, "");
  pages[fileName] = {
    entry: `src/entry/${name}`,
    filename: `html/${fileName}.html`,
  };
});

const isDevMode = process.env.NODE_ENV === "production";

// 按需求自动导入
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

module.exports = {
  pages,
  filenameHashing: false,
  chainWebpack: (config) => {
    config.plugin("copy").use(require("copy-webpack-plugin"), [
      {
        patterns: [
          {
            from: path.resolve(`src/manifest.${process.env.NODE_ENV}.json`),
            to: `${path.resolve("dist")}/manifest.json`,
          },
          {
            from: path.resolve(`src/assets/`),
            to: `${path.resolve("dist")}/imgs/`,
          },
        ],
      },
    ]);
  },
  configureWebpack: {
    output: {
      filename: `js/[name].js`,
      chunkFilename: `js/[name].js`,
    },
    devtool: isDevMode ? "inline-source-map" : false,
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
  css: {
    extract: false, // Make sure the css is the same
  },
};
