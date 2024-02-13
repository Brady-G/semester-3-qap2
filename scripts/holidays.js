const axios = require('axios');

const URL = `https://date.nager.at/api/v3/publicholidays`;

module.exports = () => {
    const url = `${URL}/${new Date().getFullYear()}/CA`;
    return axios.get(url)
            .then(response => {
                for (const value of response.data) {
                    const date = Date.parse(value.date);
                    if (date > new Date()) {
                        return value;
                    }
                }
                return null;
            });
}