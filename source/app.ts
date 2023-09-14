import express, { Router } from 'express';
import bodyParser from 'body-parser';
import synonymsRoutes from './routes/synonymsRoutes';
import usersRoutes from './routes/usersRoutes';
import config from './config/config';
import logging from './config/logging';

const NAMESPACE = 'Server',
    app = express(),
    router = Router();

export default function createApp() {
    /** Logging the request */
    router.use((req, res, next) => {
        logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`, {});

        res.on('finish', () => {
            logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`, {});
        });

        next();
    });

    /** Parse the request */
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());

    /** Simple Rules of API
     * For assigment purposes we allow access from everywhere
     * If needed we would allow IPs here
     */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow Methods', 'GET PATCH DELETE POST PUT');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */
    router.use('/users', usersRoutes);
    router.use('/synonyms', synonymsRoutes);

    /** Default error handling for non-existant routes */
    router.use((req, res, next) => {
        const error = new Error('Not Found'),
            statusCode = config.server.statusCodes.notFound,
            data = { message: error.message };

        logging.error(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${statusCode}]`, error);
        return res.status(statusCode).json(data);
    });

    app.use('/api', router);

    return app;
}
