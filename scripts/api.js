const holidays = require("./holidays");
const LOGGER = require("./logger");
const { STATUS_CODES } = require("http");

/**
 * @param {Response} response
 */
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
    if (request.method !== "GET") {
        sendJson(response, {
            success: false,
            data: STATUS_CODES[405]
        }, 405);
        return;
    }
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
const isAdmin = (request, response) => {
    const cookie = request.headers?.cookie;
    if (cookie && cookie === "auth=admintoken") {
        sendJson(response, {
            admin: true
        }, 200);
    } else {
        if (cookie) {
            LOGGER.emit("critical", `(API) Unauthenticated user tried to access /api/admin, user: ${cookie}`);
        }
        sendJson(response, {
            admin: false
        }, 403);
    }
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
        case "/admin":
            isAdmin(request, response);
            break;
        default:
            sendJson(response, { success: false, data: "Unknown route" }, 404);
    }
}