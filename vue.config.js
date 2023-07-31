module.exports = {
  configureWebpack: {
    output: {
      libraryExport: 'default'
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 4000,
    open: true
  }
}
