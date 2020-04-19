'use strict';

const path = require('path');

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// Paths
const context = __dirname;
const buildFolder = 'build';
const jsBuildFolder = `${buildFolder}/js`; // JS build directory
const cssBuildFolder = `${buildFolder}/css`; // Style build directory
const imagesBuildFolder = `${buildFolder}/img`; // Images build directory
const fontsBuildFolder = `${buildFolder}/fonts`;
const pages = path.resolve(context, './application/assets/js') ;
const vueRoot = pages + '/vue';
const vueApps = vueRoot + '/apps';
const reactRoot = pages + '/react';

// Module list
const vueModule = ['vue', 'vuex'];
const reactModule = ['react-.+', '.+-react-.+', 'react', 'redux', 'redux-.+', 'prop-types'];

module.exports = {
    mode: `${process.env.NODE_ENV}`,
    context: context,
    entry: {
        properties: vueApps + '/properties/index.js',
        loader: reactRoot + '/loader/index.js'
    },
    output: {
        path: path.resolve(context, './webroot'),
        // publicPath: '/js/app/build/',
        filename: `${jsBuildFolder}/[name].js`,
		crossOriginLoading: "anonymous"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/,
                options: {
                    loaders: {
                        js: {
                           loader: 'babel-loader',
                           options: {
                               presets: ['react-app']
                           }
                        },
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                        loader: "babel-loader",
                        options: {
                            presets: ['react-app']
                        }
                }
            },
            {
                test: /\.css$/,
                use: [
                    ExtractCssChunks.loader,
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            sourceMap: true
                        }
                    }, {
                        loader: "postcss-loader"
                    }
                ]
            },
            {
                test: /(node_modules.+\.scss$)|(^(.(?!Module))*\.scss$)/,
                use: [
                    ExtractCssChunks.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            modules: false,
                            importLoaders: 1,
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        }
                    }, {
                        loader: "postcss-loader"
                    },{
                        loader: "resolve-url-loader",
                        options: {
                            sourceMap: true
                        }
                    },{
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            includePaths: [
                                path.resolve(context, "./node_modules/compass-mixins/lib")
                            ]
                        }
                    }
                ]
            },
            {
                test: /Module\.scss$/,
                exclude: /node_modules/,
                use: [
                    ExtractCssChunks.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            modules: true, // turn on modules for scss ONLY!
                            importLoaders: 1,
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        }
                    }, {
                        loader: "postcss-loader"
                    },{
                        loader: "resolve-url-loader",
                        options: {
                            sourceMap: true
                        }
                    },{
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            includePaths: [
                                path.resolve(context, "./node_modules/compass-mixins/lib")
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[hash].[ext]',
                    outputPath: imagesBuildFolder,
                    publicPath: '/build/img'
                }
            },
            {
                test: /\.(eot|ttf|woff(2)?)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: fontsBuildFolder,
                    publicPath: '/build/fonts'
                }
            }
        ]
    },
    externals: {
        jquery: 'jQuery'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.jsx', '.scss'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': vueRoot
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',
    optimization: {
        noEmitOnErrors: true,
        runtimeChunk: 'multiple',
        splitChunks: { // SplitChunksPlugin see https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
            // DEFAULT OPTIONS for cacheGroups
            chunks: 'async', // chunks are generated for async dependencies (requires(), import() etc..)
            minSize: 30000, // min chunk size to be generated
            minChunks: 1, // Minimum number of chunks that must share a module before splitting
            maxAsyncRequests: 5, // Maximum number of parallel requests when on-demand loading.
            maxInitialRequests: 3, // Maximum number of parallel requests at an entrypoint.
            automaticNameDelimiter: '~', // By default webpack will generate names using cacheGroup and module name (e.g. vendors~main.js).
            name: true,
            // CACHE GROUPS - rules that combine modules to chunks
            cacheGroups: {
                vendors: { // this will be default rule for libraries that loaded initially
                    test: /[\\/]node_modules[\\/]|[\\/]webroot[\\/]js[\\/]plugins[\\/]/, // this test every module (file) to check if it could be in the cacheGroup
                    chunks: 'all',
                    minSize: 0,
                    priority: -10,
                    enforce: true,
                    name: 'vendor'
                },
                vue: {
                    test: new RegExp(`[\\\\/]node_modules[\\\\/](${vueModule.join("|")})[\\\\/]`),
                    chunks: 'all',
                    priority: 1,
                    enforce: true,
                    name: 'vue'
                },
                react: {
                    test: function(module, chunks) {
                        const reg = new RegExp(`[\\\\/]node_modules[\\\\/](${reactModule.join("|")})[\\\\/]`);
                        const name = module.nameForCondition && module.nameForCondition();

                        if (reg.test(name)) {
                            // Exclude Babel loaders embeded into babel-preset-react-app
                            return !(/[\\/]node_modules[\\/]babel-preset-react-app/.test(name));
                        } else {
                            return false;
                        }
                    },
                    chunks: 'all',
                    priority: 1,
                    enforce: true,
                    name: 'react'
                },
                default: {
                    minSize: 0,
                    minChunks: 2,
                    priority: 0,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new VueLoaderPlugin(),
        new CaseSensitivePathsPlugin(),
        new CleanWebpackPlugin(
            [ 'build' ],
            { root: path.resolve(context, './webroot') }
        ),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: `"${process.env.NODE_ENV}"`,
                REACT_APP_SERVER_URL: `"/"`
            }
        }),
        new ExtractCssChunks({
			filename: `${cssBuildFolder}/[name].css`
		})
    ],
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map';
    module.exports.optimization.minimizer = [
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true,
            uglifyOptions: {
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                }
            }
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                map: {
                    inline: false,
                    annotation: true
                }
            }
        })
    ];
} else {
    // development
    module.exports.plugins = (module.exports.plugins || []).concat([
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: `${buildFolder}/report.html`
        })
    ]);
}
