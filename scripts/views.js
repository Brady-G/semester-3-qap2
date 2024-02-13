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
        }
    });
});

/**
 * @param {Request} request
 * @param {Response} response
 */
module.exports = (request, response, path) => {
    let noramlizedPath = path.substring(1);
    if (noramlizedPath === "") {
        noramlizedPath = "index";
    }

    if (allowedPaths.includes(noramlizedPath)) {
        const content = paths[noramlizedPath];
        response.writeHead(200, {
            "Content-Type": "text/html"
        })
        response.write(content);
    } else {
        response.writeHead(404, {
            "Content-Type": "text/html"
        })
        response.write(paths["404"]);

        LOGGER.emit("warn", `(Views) No file for route: ${noramlizedPath}`);
    }
    response.end();
}

