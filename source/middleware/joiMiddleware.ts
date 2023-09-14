import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import IResponseError from '../interfaces/responseErrorInterface';
import IUser from '../interfaces/userInterface';
import ISynonym from '../interfaces/synonymInterface';
import config from '../config/config';
import logging from '../config/logging';

const NAMESPACE = 'Validation Middleware';

const validateData = (schema: ObjectSchema, key: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req[key as keyof Request]);
            next();
        } catch (error: any) {
            const data: IResponseError = {
                error,
                message: (error && error.details && error.details[0] && error.details[0].message) || config.server.messages.unproccesableData
            };

            logging.error(NAMESPACE, data.message, error);
            return res.status(config.server.statusCodes.unproccesable).json({ data });
        }
    };
};

/** Simple schema examples for validating data using joi library as middleware */
const userSchema = {
    data: Joi.object<IUser>({
        username: Joi.string().alphanum().min(3).max(15).required(),
        password: Joi.string().alphanum().min(3).max(15).required()
    })
};

const synonymsSchema = {
    data: Joi.object<ISynonym>({
        word: Joi.string()
            .regex(/^[a-zA-Z]+$/)
            .min(2)
            .max(45) //longest eglish word is 45 chars
            .required(),
        synonym: Joi.string()
            .regex(/^[a-zA-Z]+$/)
            .min(2)
            .max(45)
    })
};

export { validateData, userSchema, synonymsSchema };
