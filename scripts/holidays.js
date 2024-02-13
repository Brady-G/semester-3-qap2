const axios = require('axios');

const URL = `https://date.nager.at/api/v3/publicholidays`;

module.exports = () => {
    const url = `${URL}/${new Date().getFullYear()}/CA`;
    return axios.get(url)
            .then(response => {
                const holidays = [];
                for (const value of response.data) {
                    const date = new Date(value.date);
                    if (date.getMonth() === new Date().getMonth()) {
                        holidays.push(value);
                    }
                }
                return holidays;
            });
}