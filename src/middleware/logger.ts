import { Request, Response, NextFunction } from "express";
import { LoggerOptions } from "../utils/types";
import { calculateElapsedTime, checkLogRotation, generateLog, initializeLogStream, writeLog } from "../utils/helpers";

export function statsLogger(options: LoggerOptions) {
    if (options.clearLog && !(new RegExp(/^\d[MD]$/g)).test(options.clearLog)) {
        throw new Error('Invalid duration format. Use "xD" for x days or "xM" for x months.');
    }
    return (req: Request, res: Response, next: NextFunction) => {
        initializeLogStream(options);
        const startTime = process.hrtime();

        res.on("finish", () => {
            const endTime = process.hrtime();
            const elapsedTime = calculateElapsedTime(startTime, endTime);
            const log = generateLog(req, res, elapsedTime);
            writeLog(log + '\n');
            console.log(log);
            if (options) checkLogRotation(options);
        });

        return next();
    };
}