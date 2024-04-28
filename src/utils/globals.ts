import { WriteStream } from "fs";

interface LoggerStream {
    logFile: string;
    logStream?: WriteStream;
    logFileSize: number;
}

export const loggerStream: LoggerStream = {
    logFile: '',
    logFileSize: 0,
};

