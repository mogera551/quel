var path = require('path');

module.exports = {
  entry : './src/export.js',
  output : {
    filename    : 'quel.min.js',
    path        : path.resolve(__dirname, 'dist')
  },
  mode : "production",
};
