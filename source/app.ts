import express, { Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import synonymsRoutes from './routes/synonymsRoutes';
import usersRoutes from './routes/usersRoutes';
import config from './config/config';
import logging from './config/logging';

const NAMESPACE = 'Server',
    app = express(),
    router = Router(),
    corsOptions = {
        origin: '*',
        port: config.server.port,
        credentials: true,
        optionSuccessStatus: 200
    };

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

    router.use(cors(corsOptions));

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
