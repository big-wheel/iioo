
module.exports = {
  entry: './src/client/entry.js',
  plugins: [
    require('iioo-plugin-react'),
    [
      require('iioo-plugin-forward'),
      {
        '^/api/(.*)$': 'http://localhost:8000/api/$1',
        '^/socket.io/(.*)$': 'http://localhost:8000/socket.io/$1'
      }
    ]
  ],
  lifeCycle: {
    // 'on#this-io': [
    //   io => {
    //     require('./src/server/ws')(io)
    //   }
    // ],
    'on#this-options': [function() {}],
    'on#each-webpackConfig': [
      (config, webpack) => {
        const rule = config.module.rules.find(
          rule => rule.use && rule.use.loader === 'babel-loader'
        )
        rule.use.options.plugins.push([
          require.resolve('babel-plugin-import'),
          {
            libraryName: 'antd',
            style: true // or 'css'
          }
        ])

        config.plugins.push(
          new webpack.ProvidePlugin({
            fetch: require.resolve('./src/client/lib/fetch')
          })
        )
      }
    ]
  }
}
