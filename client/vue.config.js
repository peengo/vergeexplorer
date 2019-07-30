// This is an optional file but needed when serving Vue
// behind a proxy, we need to disable host checks.
module.exports = {
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    // port: 8080,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    }
  }
};
