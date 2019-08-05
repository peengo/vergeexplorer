const axios = require('axios');

module.exports = class Rpc {
    constructor(url, methods = []) {
        this.url = url;
        this.methods = methods;

        for (const method of this.methods) {
            this[method] = (params) => {
                return this.run(method.toLowerCase(), params);
            };
        }
    }

    async run(method, params = []) {
        try {
            const response = await axios.post(
                this.url,
                { method, params },
                // accept all HTTP statuses as resolved 
                // { validateStatus: () => true }
            );

            return response.data;
        } catch (error) {
            if (error.response) {
                throw error.response;
            } else if (error.request) {
                throw error.request;
            } else {
                throw error.message;
            }
        }
    }
};
