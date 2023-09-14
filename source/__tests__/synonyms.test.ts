import supertest from 'supertest';
import ISynonym from '../interfaces/synonymInterface';
import IUser from '../interfaces/userInterface';
import { signJWT } from '../middleware/jwtMiddleware';
import createApp from '../app';
import config from '../config/config';

const app = createApp(),
    user: IUser = {
        username: 'testuser',
        password: 'testpassword'
    },
    authorizationHeader = 'Authorization',
    { conflict, success, unproccesable, notFound } = config.server.statusCodes,
    { wordAndSynonymCantBeSame, synonymAlreadyAdded, synonymSuccessfullyAdded, synonymsListEmpty, synonymsSuccessfullyReturned, synonymDoesntExist, synonymSuccessfullyDeleted } =
        config.server.messages;

let accessToken: string | null;

beforeAll((done) => {
    signJWT(user, (error: Error | null, token: string | null) => {
        if (token) {
            accessToken = `Bearer ${token}`;
        }
        done();
    });
});

describe('synonyms', () => {
    describe('add new synonym route', () => {
        const route = '/api/synonyms/add';

        describe('given word and synonym are valid and same', () => {
            it('should return status 409 (conflict), synonyms list and synonyms cannot be same message', async () => {
                const synonyms: ISynonym = {
                    word: 'car',
                    synonym: 'car'
                };
                const { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(conflict);
                expect(body).toEqual({
                    data: {
                        synonyms: [],
                        message: wordAndSynonymCantBeSame
                    }
                });
            });
        });

        describe('given multiple adding of the same valid synonym for the same valid word', () => {
            it('should return status 409 (conflict), synonyms list and synonym already added message', async () => {
                const synonyms: ISynonym = {
                        word: 'car',
                        synonym: 'machine'
                    },
                    anotherSynonyms: ISynonym = {
                        word: 'car',
                        synonym: 'machine'
                    };

                await supertest(app).post(route).set('Authorization', `${accessToken}`).send(synonyms);
                const { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(anotherSynonyms);

                expect(statusCode).toBe(conflict);
                expect(body).toEqual({
                    data: {
                        synonyms: [synonyms.synonym],
                        message: synonymAlreadyAdded
                    }
                });
            });
        });

        describe('given word and synonym are valid', () => {
            it('should return status 200, synonyms list and synonyms added successfully message', async () => {
                const synonyms: ISynonym = {
                    word: 'bike',
                    synonym: 'cycle'
                };
                const { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(success);
                expect(body).toEqual({
                    data: {
                        synonyms: [synonyms.synonym],
                        message: synonymSuccessfullyAdded
                    }
                });
            });
        });

        describe('given word fails word regex validation as word', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'bike1',
                        synonym: 'cycle'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object), //since we do not control joi returned error we use any here and for rest of word/synonym validation tests
                        message: JSON.stringify('word').concat(' with value ').concat(JSON.stringify(synonyms.word)).concat(' fails to match the required pattern: /^[a-zA-Z]+$/')
                    }
                });
            });
        });

        describe('given synonym fails word regex validation as word', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'bike',
                        synonym: 'cycle1'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('synonym').concat(' with value ').concat(JSON.stringify(synonyms.synonym)).concat(' fails to match the required pattern: /^[a-zA-Z]+$/')
                    }
                });
            });
        });

        describe('given word fails minimum (2) characters validation', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'b',
                        synonym: 'cycle'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('word').concat(' length must be at least 2 characters long')
                    }
                });
            });
        });

        describe('given word fails maximum (45) characters validation', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'reallythelongestwordlongerthanfortyfivecharacters',
                        synonym: 'cycle'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('word').concat(' length must be less than or equal to 45 characters long')
                    }
                });
            });
        });

        describe('given synonym fails minimum (2) characters validation', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'bike',
                        synonym: 'c'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('synonym').concat(' length must be at least 2 characters long')
                    }
                });
            });
        });

        describe('given synonym fails maximum (45) characters validation', () => {
            it('should return status 422 (unprocesable), and word validation error message', async () => {
                const synonyms: ISynonym = {
                        word: 'bike',
                        synonym: 'reallythelongestwordlongerthanfortyfivecharacters'
                    },
                    { statusCode, body } = await supertest(app).post(route).set(authorizationHeader, `${accessToken}`).send(synonyms);

                expect(statusCode).toBe(unproccesable);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: JSON.stringify('synonym').concat(' length must be less than or equal to 45 characters long')
                    }
                });
            });
        });
    });

    describe('get synonyms route', () => {
        const getRoute = '/api/synonyms/get',
            postRoute = '/api/synonyms/add';

        describe('given word does not have synonyms', () => {
            it('should return status 200, empty synonyms list and synonyms list empty message', async () => {
                const synonym: ISynonym = {
                        word: 'wash'
                    },
                    { statusCode, body } = await supertest(app).get(`${getRoute}/${synonym.word}`).set(authorizationHeader, `${accessToken}`);

                expect(statusCode).toBe(success);
                expect(body).toEqual({
                    data: {
                        synonyms: [],
                        message: synonymsListEmpty
                    }
                });
            });
        });

        describe('given adding multiple valid synonyms for a word', () => {
            it('should return status 200, synonyms list in reverse order and synonyms added successfully message', async () => {
                const synonyms: ISynonym = {
                        word: 'wash',
                        synonym: 'clean'
                    },
                    anotherSynonyms: ISynonym = {
                        word: 'wash',
                        synonym: 'cleanse'
                    };

                await supertest(app).post(postRoute).set(authorizationHeader, `${accessToken}`).send(synonyms);
                await supertest(app).post(postRoute).set(authorizationHeader, `${accessToken}`).send(anotherSynonyms);
                const { statusCode, body } = await supertest(app).get(`${getRoute}/${synonyms.word}`).set(authorizationHeader, `${accessToken}`);

                expect(statusCode).toBe(success);
                expect(body).toEqual({
                    data: {
                        synonyms: [anotherSynonyms.synonym, synonyms.synonym],
                        message: synonymsSuccessfullyReturned
                    }
                });
            });
        });
    });

    describe('delete synonyms route', () => {
        const deleteRoute = '/api/synonyms/delete',
            postRoute = '/api/synonyms/add';

        describe('given synonym does not exist for given word', () => {
            it('should return status 404, error and synonym does not exist error message', async () => {
                const synonyms: ISynonym = {
                        word: 'take',
                        synonym: 'grasp'
                    },
                    { statusCode, body } = await supertest(app).delete(`${deleteRoute}/${synonyms.word}/${synonyms.synonym}`).set(authorizationHeader, `${accessToken}`);

                expect(statusCode).toBe(notFound);
                expect(body).toEqual({
                    data: {
                        error: expect.any(Object),
                        message: synonymDoesntExist.replace('${synonym}', synonyms.synonym || '')
                    }
                });
            });
        });

        describe('given synonym exists for given word', () => {
            it('should return status 200, synonym list without deleted synonym and synonym successfully deleted message', async () => {
                const synonyms: ISynonym = {
                        word: 'take',
                        synonym: 'grasp'
                    },
                    anotherSynonyms: ISynonym = {
                        word: 'take',
                        synonym: 'grab'
                    };

                await supertest(app).post(postRoute).set(authorizationHeader, `${accessToken}`).send(synonyms);
                await supertest(app).post(postRoute).set(authorizationHeader, `${accessToken}`).send(anotherSynonyms);
                const { statusCode, body } = await supertest(app).delete(`${deleteRoute}/${synonyms.word}/${synonyms.synonym}`).set(authorizationHeader, `${accessToken}`);

                expect(statusCode).toBe(success);
                expect(body).toEqual({
                    data: {
                        synonyms: [anotherSynonyms.synonym],
                        message: synonymSuccessfullyDeleted
                    }
                });
            });
        });
    });
});
