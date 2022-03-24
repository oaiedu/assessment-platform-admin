// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  assetsDir: "assets/",

  // configureWebpack: {
  //     plugins: [
  //         new BundleAnalyzerPlugin()
  //     ]
  // },
  chainWebpack: config => {
    config.plugin("VuetifyLoaderPlugin").tap(args => [
      {
        match(originalTag, { kebabTag, camelTag, path, component }) {
          if (kebabTag.startsWith("core-")) {
            return [
              camelTag,
              `import ${camelTag} from '@/components/core/${camelTag.substring(
                4
              )}.vue'`
            ];
          }
        }
      }
    ]);
  },

  transpileDependencies: ["vuetify"],
  lintOnSave: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
      enableBridge: false
    }
  }
};
