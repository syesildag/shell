module.exports = {
    future: {
        webpack5: true,
    },
    webpack: (config, options) => {
        console.log("config =>\n" + JSON.stringify(config) + "\n");
        console.log("options =>\n" + JSON.stringify(options) + "\n");

        if (!options.isServer) {
            config.resolve.fallback = {
                fs: false,
                path: false,
            };
        }

        // Important: return the modified config
        return config
    },
}