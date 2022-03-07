const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports.getWebpackConfig = (config, options) => {
    config = {
        ...config,
        plugins: [
            ...config.plugins,
            new CopyWebpackPlugin([
                { from: '../node_modules/cesium', to: 'cesium'},
            ]),
        ],
    };
    console.log(config);
    return config;
}
