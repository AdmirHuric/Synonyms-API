import { NextFunction, Request, Response } from 'express';
import { signJWT } from '../middleware/jwtMiddleware';
import IUser from '../interfaces/userInterface';
import IResponseError from '../interfaces/responseErrorInterface';
import config from '../config/config';
import logging from '../config/logging';

/**
 * This controller is where we would normally add logic for creating user, encrypting password, etc.
 * But since this is out of scope for this assignment, I wanted to add at least some level of protection using JWT.
 * Also, this can serve as a good starting point if we ever need user functionality.
 * For now we will be sending testuser/testpassword combination,
 * and using that to provide JWT token used for authorizing requests.
 */

const NAMESPACE = 'User Controller';

interface IResponseToken {
    token: string;
    message: string;
}

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, config.server.messages.userTokenValidationSuccess, {});

    return res.status(config.server.statusCodes.success).json({
        data: {
            message: config.server.messages.userAuthorized
        }
    });
};

const authorize = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body,
        { userAuthorized, userUnathorized } = config.server.messages,
        { unauthorized, success } = config.server.statusCodes,
        user: IUser = {
            username,
            password
        };
    let data: IResponseError | IResponseToken;

    signJWT(user, (error: Error | null, token: string | null) => {
        if (error) {
            data = {
                error,
                message: userUnathorized
            };

            logging.error(NAMESPACE, data.message, error);
            return res.status(unauthorized).json({ data });
        } else if (token) {
            data = {
                token,
                message: userAuthorized
            };

            logging.info(NAMESPACE, data.message, user);
            return res.status(success).json({ data });
        }
    });
};

export default { validateToken, authorize };
