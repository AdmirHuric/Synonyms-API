import dotenv from 'dotenv';

dotenv.config();

const SERVER_PORT = process.env.PORT || 3000;
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_TOKEN_EXPIRE_TIME = process.env.SERVER_TOKEN_EXPIRE_TIME || 3600; //in seconds
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'reeinventsecret';
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'reeinventIssuer';

const SERVER = {
    node_env: process.env.NODE_ENV,
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    token: {
        expireTime: SERVER_TOKEN_EXPIRE_TIME,
        issuer: SERVER_TOKEN_ISSUER,
        secret: SERVER_TOKEN_SECRET
    },
    statusCodes: {
        success: 200,
        conflict: 409,
        notFound: 404,
        badRequest: 400,
        unauthorized: 401,
        unproccesable: 422
    },
    messages: {
        userAuthorized: 'User authorized.',
        userUnathorized: 'User not authorized.',
        userTokenSignAttempt: 'Attempting to sign token.',
        validatingUserToken: 'Validating token',
        userTokenValidationSuccess: 'Token validated, user authorized.',
        wordAndSynonymCantBeSame: 'Word and synonym cannot be same.',
        synonymSuccessfullyAdded: 'Synonym successfully added.',
        synonymAlreadyAdded: 'Synonym already added.',
        synonymsSuccessfullyReturned: 'Synonyms successfully returned.',
        synonymSuccessfullyDeleted: 'Synonym successfully deleted.',
        synonymsListEmpty: 'This word does not have synonyms, please add one.',
        synonymDoesntExist: 'Synonym ${synonym} does not exist.',
        unproccesableData: 'Data cannot be processed.'
    }
};

const config = {
    server: SERVER
};

export default config;
