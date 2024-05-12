# express-pulse-logger

**express-insight-logger** is a logging middleware for Express.js applications, providing detailed insights into incoming requests, server responses, CPU usage, and memory consumption.

- **Request Logging:** Logs incoming requests including IP address, user-agent, HTTP method, URL, content length,the time of prcessing each incoming request and response status code.
- **Response Logging:** Records server responses including HTTP version, response time, and bandwidth.
- **Enhanced Logging:** Built upon the logging mechanisms of Morgan and Tslog, ensuring robust and customizable logging functionality.
- **CPU and Memory Monitoring:** Unique feature to monitor CPU usage and memory consumption, providing valuable insights into server performance.


# Example
```ts
import { statsLogger } from "express-pulse-logger";

import express from 'express';

const app = express();
app.use(statsLogger({ clearLog: '1D' }));

app.get('/', (_req, res) => {
    return res.status(200).send('ok');
});

app.listen(5000);
```