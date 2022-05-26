const path = require("path");

module.exports = {
    entry: './index.js',
    optimization:{
      minimize:false
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
  