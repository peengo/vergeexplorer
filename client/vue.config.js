const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

let devURL = '/';

if (process.env.VUE_APP_API_DEV_URL) {
  devURL = process.env.VUE_APP_API_DEV_URL;
} else {
  console.log('VUE_APP_API_DEV_URL is missing.');
}

// This is an optional file but needed when serving Vue
// behind a proxy, we need to disable host checks.
module.exports = {
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '^/api': {
        target: devURL,
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