const fs = require("fs");

class config_handler {

    constructor (config_file_path) {

        this.path = config_file_path;
        this.config = {};

    }

    async load (sync) {

        // We would normally load config once when bot is run
        if (sync) {

            this.config = JSON.parse(fs.readFileSync(this.path));
            if (this.config.sasl.cert) {
                this.config.sasl.cert = fs.readFileSync(this.config.sasl.cert)
            }
            if (this.config.sasl.key) {
                this.config.sasl.key = fs.readFileSync(this.config.sasl.key)
            }
            return this.config;

        }

        // Just in case we need to have an async load
        await fs.readFile(this.path, (error, contents) => {

            if (error) {

                console.log("[ERROR]", error);

            } else {

                this.config = JSON.parse(contents);
                if (this.config.sasl.cert) {
                    let cert;
                    fs.readFile(this.config.sasl.cert, (error, contents) => {
                        if (error) {
                            console.error("[ERROR]", error);
                        } else {
                            cert = contents;
                        }
                    });
                    this.config.sasl.cert = cert;
                }
                if (this.config.sasl.key) {
                    let key;
                    fs.readFile(this.config.sasl.key, (error, contents) => {
                        if (error) {
                            console.error("[ERROR]", error);
                        } else {
                            key = contents;
                        }
                    });
                    this.config.sasl.key = key;
                }
                console.log("[CONFIG] Loaded config from", this.path);

            }

            return this.config || {};

        });

    }

    async save () {

        const config = JSON.stringify(this.config);
        await fs.writeFile(this.path, config, (error) => {

            if (error) {

                console.log("[CONFIG] ERROR: Failed saving - ", error);

            } else {

                console.log("[CONFIG] Saved!");

            }

        });

    }

}

module.exports.config_handler = config_handler;
