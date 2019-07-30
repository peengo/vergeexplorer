const { pricesUrl } = require('../config');
const axios = require('axios');

const getPrice = async () => {
    try {
        const response = await axios.get(pricesUrl);

        let price;

        if (response.status === 200) {
            ({ data: price } = response);
        }

        return price;
    } catch (error) {
        throw error.message;
    }
};

module.exports = getPrice;

