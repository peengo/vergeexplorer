const axios = require('axios');

class Rpc {
    constructor(url, methods = []) {
        this.url = url;

        if (!Array.isArray(methods)) {
            throw new Error(`${methods} must be an array`);
        }
        this.methods = methods;

        for (const method of this.methods) {
            this[method] = (params) => {
                return this.run(method.toLowerCase(), params);
            };
        }
    }
    async run(method, params = []) {
        if (!(typeof method === 'string')) {
            throw new Error(`${method} must be a string`);
        }
        if (!Array.isArray(params)) {
            throw new Error(`${params} must be an array`);
        }

        try {
            const response = await axios.post(
                this.url,
                {
                    method,
                    params
                },
                {
                    // accept all HTTP statuses as resolved 
                    validateStatus: () => true
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Rpc;
