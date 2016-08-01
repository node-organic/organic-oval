var webpack = require('webpack')

module.exports = {
  'resolve': {
    'extensions': ['', '.tag', '.js']
  },
  'plugins': [
    new webpack.ProvidePlugin({
      'oval': 'organic-oval'
    })
  ],
  'module': {
    'preLoaders': [
      {
        test: /\.tag$/,
        exclude: /node_modules/,
        loaders: [
          'organic-oval/webpack/oval-loader'
        ]
      }
    ],
    'loaders': [
      {
        test: /\.js|.tag$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            'transform-es2015-arrow-functions',
            ['transform-react-jsx', { pragma: 'createElement' }]
          ],
          presets: ['es2015']
        }
      }
    ]
  }
}
