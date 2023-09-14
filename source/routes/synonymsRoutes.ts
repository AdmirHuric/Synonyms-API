import express from 'express';
import synonymsController from '../controllers/synonymsController';
import { extractJWT } from '../middleware/jwtMiddleware';
import { synonymsSchema, validateData } from '../middleware/joiMiddleware';

const router = express.Router();

router.post('/add', extractJWT, validateData(synonymsSchema.data, 'body'), synonymsController.addSynonym);
router.get('/get/:word', extractJWT, validateData(synonymsSchema.data, 'params'), synonymsController.getSynonyms);
router.delete('/delete/:word/:synonym', extractJWT, validateData(synonymsSchema.data, 'params'), synonymsController.deleteSynonym);

export = router;
