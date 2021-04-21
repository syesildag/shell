module.exports = {
    future: {
        webpack5: true,
    },
    webpack: (config, options) => {
        console.log("config =>\n" + JSON.stringify(config) + "\n");
        console.log("options =>\n" + JSON.stringify(options) + "\n");

        // //hack for typeorm entities
        // if (options.isServer)
        //     config.optimization.concatenateModules = false;

        // Important: return the modified config
        return config
    },
}