const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CwJsonManifestPlugin = require("./src/webpack/jsonAssetsPathPlugin");

var baseConfig = {
  mode: 'development',
  devtool: 'eval-cheap-source-map',
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
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      buffer: require.resolve('buffer/'),
    },
  },
  // optimization: {
  //   moduleIds: 'deterministic',
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         chunks: 'all',
  //       },
  //     },

  //   },
  // },
};

var mainConfig = {
  ...baseConfig,
  entry: './src/ts/main.ts',
  output: {
    filename: 'bundles/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: path.join(__dirname, 'data-md'),
      },
      {
        directory: path.join(__dirname, 'sw'),
      }
    ],
    server: 'https',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Cardweb',
      filename: 'index.html',
      template: 'src/index.html',
      favicon: 'src/assets/favicon.png',
    }),
    new CwJsonManifestPlugin()
  ],
};

/**
 * This is a try at multi-compilation
 * to have a fixed, unchanging name for our serviceworker file, but still use a typescript file.
 */
var serviceWorkerConfig = {
  ...baseConfig,
  devtool: false,
  entry: {
    serviceWorker: './src/ts/serviceWorker.ts',
    // sw: {
    //   import: './src/ts/serviceWorker.ts',
    //   runtime: 'serviceWorker',
    // }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};

module.exports = [mainConfig, serviceWorkerConfig];