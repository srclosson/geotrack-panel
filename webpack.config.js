// const resolve = require('path').resolve;

module.exports.getWebpackConfig = (config, options) => {
    config = {
        ...config,
        // plugins: [
        //     ...config.plugins,
        //     '@babel/plugin-proposal-nullish-coalescing-operator',
        //     '@babel/plugin-proposal-optional-chaining',
        // ],
        // module: {
        //     ...config.module,
        //     rules: [
        //         ...config.module.rules,
        //         {
        //             test: /\.(ts|js)x$/,
        //             include: [resolve('.')],
        //             exclude: [/node_modules/],
        //             use: [
        //             {
        //                 loader: 'babel-loader',
        //                 options: {
        //                 presets: ['@babel/env', '@babel/react']
        //                 }
        //             },
        //             {
        //                 loader: 'ts-loader'
        //             }
        //             ]
        //         }
        //     ]
        // }
    };
    console.log(config);
    return config;
}