var webpack = require('webpack');
var path = require('path');

var commonConfig = {
    resolve: {
        extensions: ['', '.ts', '.js', '.json']
    },
    module: {
        preLoaders: [{ test: /\.ts$/, loader: 'tslint-loader' }],

        loaders: [
            // Support for .ts files.
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                query: {
                    'ignoreDiagnostics': [
                        2403, // 2403 -> Subsequent variable declarations
                        2300, // 2300 Duplicate identifier
                        2304, // 2304 Cannot find name
                        2374, // 2374 -> Duplicate number index signature
                        2375  // 2375 -> Duplicate string index signature
                    ]
                },
                exclude: [/\.spec\.ts$/, /\.e2e\.ts$/, /node_modules/]
            },

            // Support for *.json files.
            { test: /\.json$/, loader: 'json-loader' },

            // Support for CSS as raw text
            { test: /\.css$/, loader: 'style!css' },

            { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' },

            { test: /^(?!.*component).*\.scss$/, loaders: ['style', 'css', 'sass'] },

            { test: /\.component\.scss$/, loaders: ['raw', 'sass'] },

            { test: /\.md$/, loader: 'html?minimize=false!markdown' },

            { test: /\.(png|jpg|svg|jpeg|gif|eot|ttf|otf|woff|woff2)/, loader: 'file?name=[path][name].[ext]' },
            // support for .html as raw text
            { test: /\.html$/, loader: 'raw-loader' }
        ],
        noParse: [
            /zone\.js\/dist\/.+/,
            /reflect-metadata/,
            /es(6|7)-.+/,
            /.zone-microtask/,
            /.long-stack-trace-zone/
        ]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true)
    ]

};


var serverConfig = {
    target: 'node',
    entry: './server/server', // use the entry file of the node server if everything is ts rather than es5
    output: {
        path: root(),
        libraryTarget: 'commonjs2',
        publicPath: path.resolve(__dirname),
        filename: 'app.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.scss']
    },
    // Ad
    externals: checkNodeImport,
    node: {
        global: true,
        __dirname: true,
        __filename: true,
        process: true,
        Buffer: true
    }
};

var clientConfig = {
    entry: {
        'vendor': [
            // Polyfills
            'es6-shim',
            'es6-promise',
            'reflect-metadata',
            'zone.js/dist/zone.min.js',
            // Angular2
            '@angular/core',
            '@angular/router',
            '@angular/http',
            // RxJS
            'rxjs'
            // Other
        ],
        'app': [
            './app/index'
        ]
    },

    // Config for our build files
    output: {
        path: root('public/dist'),
        filename: '[name].js',
        // filename: '[name].[hash].js',
        sourceMapFilename: '[name].js.map',
        chunkFilename: '[id].chunk.js'
        // publicPath: 'http://mycdn.com/'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    }
}

// Default config
var defaultConfig = {
    context: __dirname,
    resolve: {
        root: root('/src')
    },
    output: {
        publicPath: path.resolve(__dirname),
        filename: 'app.js'
    }
}



var webpackMerge = require('webpack-merge');
module.exports = [
    // Server
    webpackMerge({}, commonConfig, serverConfig),
    //client
    // webpackMerge({}, commonConfig, clientConfig)
]

// Helpers
function checkNodeImport(context, request, cb) {
    if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
        cb(null, 'commonjs ' + request); return;
    }
    cb()
}

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}
