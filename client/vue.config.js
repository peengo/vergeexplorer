const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

// This is an optional file but needed when serving Vue
// behind a proxy, we need to disable host checks.
module.exports = {
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '^/api': {
        target: 'http://192.168.0.104:5000/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api/': '/'
        },
      },
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    }
  },
  configureWebpack: {
    plugins: [
      new VuetifyLoaderPlugin()
    ]
  }
};