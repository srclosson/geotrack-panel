module.exports.getWebpackConfig = (config, options) => {
    config = {
        ...config,
        // babel: {
        //     dangerouslyAddModulePathsToTranspile: ["react-map-gl",],
        // },
    };
    console.log(config);
    return config;
}