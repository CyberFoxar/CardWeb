const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: './src/ts/main.ts',
  mode: 'development',
  output: {
    filename: 'bundles/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  },
  devtool: 'eval-cheap-source-map',
  devServer: {
    historyApiFallback: true,
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: path.join(__dirname, 'data-md'),
      }
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
          },],
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'postcss-loader',
          },
          {
            loader: "esbuild-loader",
            options: {
              loader: "ts",
              target: "es2021",
            },
          }],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Cardweb',
      filename: 'index.html',
      template: 'src/index.html',
      favicon: 'src/assets/favicon.png',
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },

    },
  },
};