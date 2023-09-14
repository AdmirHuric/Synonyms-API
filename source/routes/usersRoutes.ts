import express from 'express';
import usersController from '../controllers/usersController';
import { extractJWT } from '../middleware/jwtMiddleware';
import { validateData, userSchema } from '../middleware/joiMiddleware';

const router = express.Router();

router.get('/validate', extractJWT, usersController.validateToken);
router.post('/authorize', validateData(userSchema.data, 'body'), usersController.authorize);

export = router;
