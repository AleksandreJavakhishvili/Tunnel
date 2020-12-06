import * as path from 'path';
import * as webpack from 'webpack';
const CopyPlugin = require('copy-webpack-plugin');

const extConfig: webpack.Configuration = {
  target: 'node',
  entry: './ext-src/extension.ts',
  output: {
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'out'),
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: { rules: [{ test: /\.ts$/, loader: 'ts-loader' }] },
  externals: { vscode: 'vscode' },
};

const webviewConfig: webpack.Configuration = {
  target: 'web',
  entry: './src/index.tsx',
  output: {
    filename: '[name].wv.js',
    path: path.resolve(__dirname, 'out'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', 'scss', '.d.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: 'file-loader',
      },
    ],
  },
  externals: { 'react': 'React', 'react-dom': 'ReactDOM' },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'react-source' }],
    }),
  ],
};

export default [webviewConfig, extConfig];
