import { createWriteStream } from "fs";

export const loggerStream = {
    logFile: '',
    logStream: createWriteStream('', { flags: 'a' }),
    logFileSize: 0,
};