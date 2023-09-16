import http from 'http';
import cors from 'cors';
import createApp from './app';
import config from './config/config';
import logging from './config/logging';

const NAMESPACE = 'Server',
    app = createApp();

let port: Number | string = config.server.port;

/** Assign random port number in 5000 - 6500 range for running tests */
if (config.server.node_env == 'test') {
    port = Math.floor(Math.random() * 60000) + 5000;
}

/** Create Server - entry point */
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
    logging.info(NAMESPACE, `Server running on ${config.server.hostname}:${config.server.port}`, {});
});
