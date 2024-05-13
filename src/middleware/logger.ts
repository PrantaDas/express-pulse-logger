import { Request, Response, NextFunction } from "express";
import { LoggerOptions } from "../utils/types";
import { calculateElapsedTime, checkLogRotation, generateLog, initializeLogStream, writeLog } from "../utils/helpers";

export function statsLogger(options?: LoggerOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (options) initializeLogStream(options);
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