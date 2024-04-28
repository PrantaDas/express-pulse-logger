import { statsLogger } from "./middleware/logger";

import express from 'express';

const app = express();
app.use(statsLogger({ clearLog: '1D' }));

app.get('/', (_req, res) => {
    return res.status(200).send('ok');
});

app.listen(5000);