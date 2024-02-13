const holidays = require("./holidays");
const LOGGER = require("./logger");

const sendJson = (response, json, statusCode) => {
    response.writeHead(statusCode, {
        "Content-Type": "application/json"
    })
    response.write(JSON.stringify(json));
    response.end();
}

/**
 * @param {Request} request
 * @param {Response} response
 */
const getHolidays = (request, response) => {
    holidays().then(res => {
        sendJson(response, res, 200);
    }).catch(err => {
        LOGGER.emit("error", `(API) Error while retriving holidays: ${err}`);
        sendJson(response, {
            success: false,
            data: "Internal server error"
        }, 500);
    })
}

/**
 * @param {Request} request
 * @param {Response} response
 */
module.exports = (request, response, path) => {
    switch (path) {
        case "/holidays":
            getHolidays(request, response);
            break;
        default:
            sendJson(response, { success: false, data: "Unknown route" }, 404);
    }
}