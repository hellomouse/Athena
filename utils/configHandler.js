const fs = require("fs")

class config_handler {

    constructor (config_file_path) {

        this.path = config_file_path
        this.config = {}

    }

    async load (sync) {

        // We would normally load config once when bot is run
        if (sync){

            this.config = JSON.parse(fs.readFileSync(this.path))
            return this.config

        }

        // Just in case we need to have an async load
        fs.readFile(this.path, (error, contents) => {

            if (error) {
                
                console.log("[ERROR]", error)
            
            }
            else {

                this.config = JSON.parse(contents)
                console.log("[CONFIG] Loaded config from", this.path)

                return this.config
            
            }

        })

    }

    async save () {

        let config = JSON.stringify(this.config)
        fs.writeFile(this.path, config, (error) => {

            if (error) {

                console.log("[CONFIG] ERROR: Failed saving - ", error)

            }
            else {

                console.log("[CONFIG] Saved!")

            }

        })

    }

}

module.exports.config_handler = config_handler 
