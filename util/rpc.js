const axios = require('axios');

class Rpc {
    constructor(url, methods = []) {
        if (!typeof url === 'string') {
            throw new Error(`${url} must be a string`)
        }
        this.url = url

        if (!Array.isArray(methods)) {
            throw new Error(`${methods} must be an array`)
        }
        this.methods = methods;

        for (const method of this.methods) {
            this[method] = (params) => {
                return this.run(method, params);
            }
        }
    }
    async init() {
        try {
            const help = await this.run('help');
            const result = help.result;

            const array = result.split('\n');

            for (const item of array) {
                const [method] = item.split(' ');

                this.methods.push(method);
            }

            for (const method of this.methods) {
                this[method] = (params) => {
                    return this.run(method, params);
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async run(method, params = []) {
        if (!typeof method === 'string') {
            throw new Error(`${method} must be a string`)
        }
        if (!Array.isArray(params)) {
            throw new Error(`${params} must be an array`)
        }

        try {
            const response = await axios.post(
                this.url,
                {
                    method,
                    params
                },
                {
                    // accept all statuses as resolved 
                    validateStatus: () => true
                }
            );

            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Rpc;
