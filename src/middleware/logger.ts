import { Request, Response, NextFunction } from "express";
import { LoggerOptions } from "../utils/types";
import { calculateElapsedTime, checkLogRotation, generateLog, writeLog } from "../utils/helpers";

export function statsLogger(options: LoggerOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = process.hrtime();

        res.on("finish", () => {
            const endTime = process.hrtime();
            const elapsedTime = calculateElapsedTime(startTime, endTime);
            const log = generateLog(req, res, elapsedTime);
            writeLog(log);
            console.log(log);
            checkLogRotation(options);
        });

        return next();
    };
}