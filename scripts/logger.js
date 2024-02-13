const EventEmitter = require("events");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

const logsDirectory = path.join(path.dirname(require.main.filename), "logs");
const events = new EventEmitter();

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

const writeToLog = (level, message) => {
    const line = `${new Date().toLocaleTimeString()} [${level}] ${message}`;
    writeToFile(line);
    console.log(line);
}

events.on("info", message => writeToLog("INFO", message));
events.on("error", message => writeToLog("ERROR", message));
events.on("warn", message => writeToLog("WARN", message));
events.on("critical", message => writeToLog("CRITICAL", message));

module.exports = events;