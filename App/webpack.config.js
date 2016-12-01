module.exports = {
  entry: ["./src/app.js", "./src/utils/utils.js"],
  output: {
    filename: "../bundle.js"
  },
  module: {
    /*
   preLoaders: [
     {
       test: /\.js$/,
       exclude: /node_modules/,
       loader: 'jshint-loader'
     }
  ], */
  loaders: [
    {
      test: [/\.js$/,/\.es6$/],
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      }
    }
  ]
  },
  devtool: 'eval',
  resolve: {
    extensions: ['', '.js', '.es6']
  },
  plugins: [
    function() {
      this.plugin('watch-run', function(watching, callback) {
        console.log('\n--> Begin compile at ' + new Date());
        callback();
      })
    }
  ],
  watch: true
}
