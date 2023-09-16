import supertest from 'supertest';
import IUser from '../interfaces/userInterface';
import { signJWT } from '../middleware/jwtMiddleware';
import createApp from '../app';
import config from '../config/config';
import { number } from 'joi';

const app = createApp(),
    { success, unauthorized, unproccesable } = config.server.statusCodes,
    { userAuthorized, userUnathorized } = config.server.messages;

let user: IUser = {
    username: 'testuser',
    password: 'testpassword'
};

let accessToken: string | null;

beforeAll((done) => {
    signJWT(user, (error: Error | null, token: string | null) => {
        if (token) {
            accessToken = `Bearer ${token}`;
        }
        done();
    });
});

describe('users', () => {
    describe('authorize route', () => {
        const route = '/api/users/authorize';

        describe('given username and password are valid', () => {
            it('should return status 200, token and user authorized message', async () => {
                const { statusCode, body } = await supertest(app).post(route).send(user);

                expect(statusCode).toBe(success);
                expect(body).toEqual({
                    data: {
                        token: expect.any(String),
                        expiresIn: expect.any(Number),
                        message: userAuthorized
                    }
                });
            });
        });

        describe('given username fails minimum (3) characters validation', () => {
            it('should return status 422 (unproccessable) and username validation error message', async () => {
                user.username = 'te';
                const { statusCode, body } = await supertest(app).post(route).send(user);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object), //since we do not control joi returned error we use any here and for rest of username/password validation tests
                        message: JSON.stringify('username').concat(' length must be at least 3 characters long')
                    }
                });
            });
        });

        describe('given username fails maximum (15) characters validation', () => {
            it('should return status 422 (unproccessable) and username validation error message', async () => {
                user.username = 'reallylongtestusername';
                const { statusCode, body } = await supertest(app).post(route).send(user);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('username').concat(' length must be less than or equal to 15 characters long')
                    }
                });
            });
        });

        describe('given password fails minimum (3) characters validation', () => {
            it('should return status 422 (unproccessable) and password validation error message', async () => {
                user.username = 'testusername';
                user.password = 'te';
                const { statusCode, body } = await supertest(app).post(route).send(user);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('password').concat(' length must be at least 3 characters long')
                    }
                });
            });
        });

        describe('given password fails maximum (15) characters validation', () => {
            it('should return status 422 (unproccessable) and password validation error message', async () => {
                user.username = 'testusername';
                user.password = 'reallylongtestpassword';
                const { statusCode, body } = await supertest(app).post(route).send(user);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('password').concat(' length must be less than or equal to 15 characters long')
                    }
                });
            });
        });
    });

    describe('validate token route', () => {
        const route = '/api/users/validate',
            authorizationHeader = 'Authorization';

        describe('given token is valid', () => {
            it('should return status 200, and user authorized message', async () => {
                const { statusCode, body } = await supertest(app).get(route).set(authorizationHeader, `${accessToken}`);

                expect(statusCode).toBe(success);
                expect(body).toEqual({ data: { message: userAuthorized } });
            });
        });

        describe('given token is invalid', () => {
            it('should return status 401, and user unauthorized message', async () => {
                const token = 'invalidtoken',
                    { statusCode, body } = await supertest(app).get(route).set(authorizationHeader, token);

                expect(statusCode).toBe(unauthorized);
                expect(body).toEqual({
                    data: {
                        message: userUnathorized
                    }
                });
            });
        });

        describe('given token does not exist', () => {
            it('should return status 401, and user unauthorized message', async () => {
                const token = '',
                    { statusCode, body } = await supertest(app).get(route).set(authorizationHeader, token);

                expect(statusCode).toBe(unauthorized);
                expect(body).toEqual({
                    data: {
                        message: userUnathorized
                    }
                });
            });
        });
    });
});
