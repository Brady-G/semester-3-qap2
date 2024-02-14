const EventEmitter = require("events");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

const logsDirectory = path.join(path.dirname(require.main.filename), "logs");
const events = new EventEmitter();
let debug = false;

if (!fsSync.existsSync(logsDirectory)) {
    fsSync.mkdirSync(logsDirectory);
}

const writeToFile = (line) => {
    const date = new Date();
    const formattedDate = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDay()}`
    const logFile = path.join(logsDirectory, `${formattedDate}.log`);
    fs.appendFile(logFile, line + "\n")
        .catch(err => console.error("Error occurred saving log line: " + err));
}

const writeToLog = (level, message, logger) => {
    const line = `${new Date().toLocaleTimeString()} [${level}] ${message}`;
    writeToFile(line);
    logger(line);
}

events.on("setdebug", enabled => debug = enabled);

events.on("info", message => writeToLog("INFO", message, console.info));
events.on("error", message => writeToLog("ERROR", message, console.error));
events.on("warn", message => writeToLog("WARN", message, console.warn));
events.on("critical", message => writeToLog("CRITICAL", message, console.error));
events.on("debug", message => {
    if (!debug) return;
    writeToLog("DEBUG", message, console.debug)
});

module.exports = events;