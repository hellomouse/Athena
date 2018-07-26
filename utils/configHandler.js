const fs = require('fs');
const path = require('path');
const log = require('./logging.js');

/** Class that holds the config */
class ConfigHandler {

    /**
    * @param {string} config_file_path - The path to the config
    */
    constructor(config_file_path) {
        this.path = config_file_path;
        this.config = {};
    }

    /**
    * Function to load config file specified in class constructor
    * @async
    * @param {boolean} sync - Use async or synchronous methods
    * @return {object}
    */
    async load(sync) {
        // We would normally load config once when bot is run
        if (sync) {
            this.config = JSON.parse(fs.readFileSync(this.path));
            if (this.config.sasl.cert) {
                this.config.sasl.cert = [
                    fs.readFileSync(path.join(__dirname, '..', this.config.sasl.cert)),
                    this.config.sasl.cert
                ];
            } else {
                this.config.sasl.cert = [undefined];
            }

            if (this.config.sasl.key) {
                this.config.sasl.key = [
                    fs.readFileSync(path.join(__dirname, '..', this.config.sasl.key)),
                    this.config.sasl.key
                ];
            } else {
                this.config.sasl.key = [undefined];
            }

            return this.config || {};
        }

        // Just in case we need to have an async load
        await fs.readFile(this.path, (error, contents) => {
            if (error) {
                log.error(error.stack);
            } else {
                this.config = JSON.parse(contents);

                if (this.config.sasl.cert) {
                    fs.readFile(path.join(__dirname, '..', this.config.sasl.cert), (err, cnts) => {
                        if (err) {
                            log.error(err.stack);
                        } else {
                            this.config.sasl.cert = [cnts, this.config.sasl.cert];
                        }
                    });
                }

                if (this.config.sasl.key) {
                    fs.readFile(path.join(__dirname, '..', this.config.sasl.key), (err, cnts) => {
                        if (err) {
                            log.error(err.stack);
                        } else {
                            this.config.sasl.key = [cnts, this.config.sasl.key];
                        }
                    });
                }

                log.info('[CONFIG] Loaded config from %s', this.path);
            }

            return this.config || {};
        });
    }

    /**
    * Function to save config file
    * @async
    */
    async save() {
        const config = { ...this.config };

        delete config.caps[config.caps.length - 1];
        if (config.sasl.cert) config.sasl.cert = config.sasl.cert[1];
        if (config.sasl.key) config.sasl.key = config.sasl.key[1];

        await fs.writeFile(this.path, JSON.stringify(config), error => {
            if (error) {
                log.error('[CONFIG] ERROR: Failed saving - ', error);
            } else {
                log.info('[CONFIG] Saved!');
            }
        });
    }

}

module.exports.ConfigHandler = ConfigHandler;
