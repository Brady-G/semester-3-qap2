const path = require("path");
const fs = require("fs");
const LOGGER = require("./logger.js");


const viewsDirectory = path.join(path.dirname(require.main.filename), "views");
const allowedPaths = [];
const paths = {};

// Retrives all html files from the views directory and puts their contents in the paths
// object to be looked up later.
//
// The need for both an object and an array is because objects have an underlying thing called
// a prototype this means that if we were to allow for just path lookups it would crash when it
// tried to do __proto__ because its not a string, it can also be used for a security vulnerability.
fs.readdir(viewsDirectory, (err, files) => {
    if (err) return console.log("Unable to scan directory: " + err);
    files.forEach((file) => {
        if (file.endsWith(".html")) {
            const contents = fs.readFileSync(path.join(viewsDirectory, file), "utf-8");
            const fileName = file.substring(0, file.length - 5);
            paths[fileName] = contents;
            allowedPaths.push(fileName);
            LOGGER.emit("debug", `Found view ${fileName}`);
        }
    });
});

/**
 * @param {Response} response
 */
const sendHtml = (response, status, headers, name) => {
    response.writeHead(status, {
        "Content-Type": "text/html",
        ...headers
    });
    response.write(paths[name]);
}

/**
 * @param {Response} response
 */
const redirect = (response, status, location) => {
    response.writeHead(status, {
        "Location": location
    });
}

/**
 * @param {Request} request
 * @param {Response} response
 */
const specialHandle = (request, response, path) => {
    switch (path) {
        case "/holidays":
            const hasCookies = request.headers?.cookie;
            if (hasCookies) return true;
            sendHtml(response, 401, {}, "unauthenticated");
            return false;
        case "/login":
            sendHtml(response, 200, {
                "Set-Cookie": "auth=token"
            }, "login");
            return false;
        case "/calender":
            redirect(response, 308, "/holidays");
            return false;
        case "/about-me":
            redirect(response, 301, "/about");
            return false;
        case "/support":
            redirect(response, 302, "https://example.com");
            return false;
        default:
            return true;
    }
}

/**
 * @param {Request} request
 * @param {Response} response
 */
module.exports = (request, response, path) => {
    let noramlizedPath = path.substring(1);
    if (noramlizedPath === "") {
        noramlizedPath = "index";
    }

    if (specialHandle(request, response, path)) {
        if (allowedPaths.includes(noramlizedPath)) {
            sendHtml(response, 200, {}, noramlizedPath);
        } else {
            sendHtml(response, 404, {}, "404");
            LOGGER.emit("warn", `(Views) No file for route: ${noramlizedPath}`);
        }
    }
    response.end();
}

