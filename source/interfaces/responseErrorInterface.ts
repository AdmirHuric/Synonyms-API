import { VerifyErrors } from 'jsonwebtoken';

export default interface IResponseError {
    error: Error | VerifyErrors | any;
    message: string;
}
