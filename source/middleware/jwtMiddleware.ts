import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import IUser from '../interfaces/userInterface';
import IResponseError from '../interfaces/responseErrorInterface';
import logging from '../config/logging';
import config from '../config/config';

const NAMESPACE = 'Auth Middleware';

const signJWT = (user: IUser, callback: (error: Error | null, token: string | null) => void): void => {
    const { issuer, secret } = config.server.token,
        timeSinceEpoch = new Date().getTime(),
        expirationTime = timeSinceEpoch + Number(config.server.token.expireTime) * 100000, //in miliseconds
        expirationTimeInSeconds = Math.floor(expirationTime / 1000);

    logging.info(NAMESPACE, config.server.messages.userTokenSignAttempt, user);

    try {
        jwt.sign(
            user,
            secret,
            {
                issuer,
                algorithm: 'HS256',
                expiresIn: expirationTimeInSeconds
            },
            (error, token) => {
                if (error) {
                    callback(error, null);
                } else if (token) {
                    callback(null, token);
                }
            }
        );
    } catch (error: any) {
        logging.error(NAMESPACE, error.message, error);
        callback(error, null);
    }
};

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, config.server.messages.validatingUserToken, {});

    //Extract auth token from request authorization header 'Bearer ${token}'
    const token = req.headers.authorization?.split(' ')[1],
        { userUnathorized } = config.server.messages,
        { unauthorized } = config.server.statusCodes;
    let data: IResponseError | { message: string };

    if (token) {
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                data = {
                    error,
                    message: userUnathorized
                };

                logging.error(NAMESPACE, data.message, error);
                return res.status(unauthorized).json({ data });
            }

            res.locals.jwt = decoded;
            next();
        });
    } else {
        const data = { message: userUnathorized };

        logging.error(NAMESPACE, data.message, {});
        return res.status(unauthorized).json({ data });
    }
};

export { signJWT, extractJWT };
