const path = require("path");
const webpack = require("webpack");
const process = require('process')

module.exports = {
    entry: './index.js',
    optimization:{
      minimize:false
    },
    plugins:[
      new webpack.ProvidePlugin({
        // Make a global `process` variable that points to the `process` package,
        // because the `util` package expects there to be a global variable named `process`.
             // Thanks to https://stackoverflow.com/a/65018686/14239942
        process: 'process/browser'
     })
    ],
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
  