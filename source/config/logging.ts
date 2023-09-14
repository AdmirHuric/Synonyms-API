import { VerifyErrors } from 'jsonwebtoken';
import ISynonym from '../interfaces/synonymInterface';
import IUser from '../interfaces/userInterface';

const getTimeStamp = (): string => {
    return new Date().toISOString();
};

const info = (namespace: string, message: string, object: IUser | ISynonym | any) => {
    console.info(`[${getTimeStamp()}] [INFO] [${namespace}] [${message}]`, object);
};

const warn = (namespace: string, message: string, object: IUser | ISynonym | any) => {
    console.warn(`[${getTimeStamp()}] [WARN] [${namespace}] [${message}]`, object);
};

const error = (namespace: string, message: string, object: Error | VerifyErrors | any) => {
    console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] [${message}]`, object);
};

const debug = (namespace: string, message: string, object: IUser | ISynonym | any) => {
    console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] [${message}]`, object);
};

export default {
    info,
    warn,
    error,
    debug
};
