const http = require("http");
const url = require("url");

const views = require("./scripts/views");
const api = require("./scripts/api");

const server = http.createServer((request, response) => {
    const path = url.parse(request.url).pathname;

    if (path.startsWith("/api")) {
        api(request, response, path.substring(4));
    } else {
        views(request, response, path);
    }
});


server.listen(3000);