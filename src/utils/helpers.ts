import { loadavg } from "os";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { PassThrough } from "stream";
import path from "path";
import { Response, Request } from "express";
import { createGzip } from "zlib";
import { EndTime, LoggerOptions, StartTime } from "./types";
import { loggerStream } from "./globals";

export function calculateElapsedTime(start: StartTime, end: EndTime): number {
    const elapsedNanoseconds = (end[0] - start[0]) * 1e9 + (end[1] - start[1]);
    return Math.round(elapsedNanoseconds / 1e6);
}

export function calculateTotalBandwidth(req: Request, _res: Response): number {
    return req.socket.bytesRead + req.socket.bytesWritten;
};

export function generateLog(req: Request, res: Response, time: number): string {
    const { ip, method, url, route, query, httpVersion } = req;
    const userAgent = req.headers["user-agent"];
    const statusCode = res.statusCode;
    const contentLength = req.headers["content-length"];
    const cpuUsage = loadavg()[0];
    const bandWith = calculateTotalBandwidth(req, res);
    return `${ip} - ${userAgent} - HTTP/${httpVersion} ${method.toUpperCase()} - ${url ? url : ''} - ${contentLength ? contentLength : 0} - ${statusCode} - (${time} ms) - (CPU USAGE ${cpuUsage} %) - (${bandWith} Bytes)`;
};

export function writeLog(log: string): void {
    if (loggerStream.logStream) {
        loggerStream.logStream.write(log);
        loggerStream.logFileSize += Buffer.byteLength(log);
    }
};

export function checkLogRotation(options: LoggerOptions): void {
    if (loggerStream.logFileSize >= 10 * 1024 * 1024) {
        if (options.clearLog) rotateLogFile(options);
    }
    // readdirSync(path.join(process.cwd(), '.log')).forEach((file) => {
    //     if (new RegExp(/^stats-.+\.txt$/g).test(file)) {
    //         const fileDate = new Date(file.substring(6, 23).split('.')[0]);
    //         if (
    //             (fileDate < new Date(new Date().getTime())) &&
    //             new RegExp(/\.txt$/g).test(file)
    //         ) {
    //             const compress = createGzip();
    //             const passThrough = new PassThrough();
    //             const txtFile = createReadStream(path.join(process.cwd(), '.log', file));
    //             txtFile
    //                 .pipe(passThrough)
    //                 .pipe(compress)
    //                 .pipe(createWriteStream(path.join(process.cwd(), '.log', file + '.gz')));
    //             unlinkSync(path.join(process.cwd(), '.log', file));
    //             console.log(file)
    //         }
    //     }
    // });
};

export function rotateLogFile(options: LoggerOptions) {
    if (loggerStream.logStream) {
        loggerStream.logStream.end();
        const compress = createGzip();
        const passThrough = new PassThrough();
        const inputFile = createReadStream(loggerStream.logFile || '');
        inputFile
            .pipe(passThrough)
            .pipe(compress)
            .pipe(createWriteStream(`${loggerStream.logFile}.gz`));
    }
    initializeLogStream(options);
};

export function deleteOldLogsFile(durations: string): void {
    const currentDate = new Date();
    let deleteDate: Date;

    switch (true) {
        case durations.endsWith('D'):
            const days = parseInt(durations);
            deleteDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);
            break;
        case durations.endsWith('M'):
            const months = parseInt(durations);
            deleteDate = new Date(currentDate.getTime() - months * 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            break;
    }

    readdirSync(path.join(process.cwd(), '.log')).forEach((file) => {
        if (file.startsWith('stats-') && file.endsWith('.gz')) {
            const fileDate = new Date(file.substring(6, 23).split('.')[0]);
            if (fileDate < deleteDate) {
                unlinkSync(path.join(process.cwd(), '.log', file));
            }
        }
    });
};

export function initializeLogStream(options: LoggerOptions): void {
    const currentDate = new Date();
    const logFolder = path.join(process.cwd(), '.log');
    const fileName = `stats-${currentDate.toISOString().slice(0, 10)}.txt`;
    console.log(fileName);
    const logFilePath = path.join(logFolder, fileName);
    if (!existsSync(logFolder)) mkdirSync(logFolder);
    if (!existsSync(logFilePath)) writeFileSync(logFilePath, '');
    loggerStream.logFile = logFilePath;
    loggerStream.logStream = createWriteStream(loggerStream.logFile, { flags: 'a' });
    loggerStream.logFileSize = statSync(loggerStream.logFile).size;
    if (options.clearLog) deleteOldLogsFile(options.clearLog);
};