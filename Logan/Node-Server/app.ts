import express, { Request, Response, NextFunction } from "express";
import { createConnection } from "typeorm";
import createHttpError from "http-errors";
import logger from "morgan";

import LoganRoute from "./routes/logan";
import LoganWebRoute from "./routes/logan-web";

const port = '9002';
const app = express();


(async () => {
    try {
        await createConnection();

        console.log('connect db success');

        app.use(logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

        app.use('/logan', LoganRoute);
        app.use('/logan/web', LoganWebRoute);

        // catch 404 and forward to error handler
        app.use((req, res, next) => { next(createHttpError(404)); });

        // error handler
        app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.status(err.status || 500).json(err);
        });

        app.listen(port, () => { console.log(`server run at ${port}`); });
    } catch (error) {
        console.error('connect db error');
        console.error(error);
    }
})();