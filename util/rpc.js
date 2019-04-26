const axios = require('axios');

class Rpc {
    constructor(url) {
        this.url = url;
    }
    async init() {
        try {
            // get string of help information
            const help = await this.run('help');
            const result = help.result;

            // split it by new lines
            const array = result.split('\n');

            // split again by spaces and take the first string which is the method name
            for (let item of array) {
                const [method] = item.split(' ');
                
                this[method] = (params) => {
                    return this.run(method, params);
                }
            }
        } catch (error) {
            throw new Error(error);
        }
    }
    async run(method, params) {
        try {
            const request = await axios.post(
                this.url,
                {
                    method,
                    params
                }
            );

            return request.data;
        } catch (error) {
            throw new Error(error);
        }
    }
};

module.exports = Rpc;