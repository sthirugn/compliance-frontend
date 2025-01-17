/* global module, __dirname */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./webpack.common.js');
const { resolve } = require('path');
const pkg = require('../package.json');

const webpackConfig = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: false,
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
        splitChunks: {
            cacheGroups: {
                vendors: false,
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial'
                }
            }
        }
    },
    entry: {
        App: config.paths.entry
    },
    output: {
        filename: process.env.NODE_ENV === 'production' ? 'js/[name]-[contenthash].js' : 'js/[name].js',
        path: config.paths.public,
        publicPath: config.paths.publicPath,
        chunkFilename: process.env.NODE_ENV === 'production' ? 'js/[name]-[contenthash].js' : 'js/[name].js'
    },
    resolve: {
        alias: {
            customReact: 'react',
            react: resolve(__dirname, '../node_modules/react'),
            'react-intl': resolve(__dirname, '../node_modules/react-intl'),
            PFReactCore: '@patternfly/react-core',
            PFReactTable: '@patternfly/react-table',
            PresentationalComponents: path.join(__dirname, '../src/PresentationalComponents'),
            SmartComponents: path.join(__dirname, '../src/SmartComponents'),
            Utilities: path.join(__dirname, '../src/Utilities'),
            Store: path.join(__dirname, '../src/store'),
            '@': path.join(__dirname, '..', 'src')
        }
    },
    module: {
        rules: [{
            test: /src\/.*\.js$/,
            exclude: /(node_modules|bower_components)/i,
            use: [{ loader: 'source-map-loader' }, { loader: 'babel-loader' }, { loader: 'eslint-loader' }]
        }, {
            test: /\.s?[ac]ss$/,
            use: [
                process.env.NODE_ENV === 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            ...Object.values(pkg.sassIncludes).map(includePath =>
                                resolve(__dirname, `../${includePath}`)
                            )
                        ]
                    }
                }
            ]
        }, {
            test: /\.(woff(2)?|ttf|jpg|png|eot|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: process.env.NODE_ENV === 'production' ? '[name]-[contenthash].[ext]' : '[name].[ext]',
                    outputPath: 'fonts/'
                }
            }]
        }]
    }
};

module.exports = webpackConfig;
