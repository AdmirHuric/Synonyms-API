import express from 'express';
import synonymsController from '../controllers/synonymsController';
import { extractJWT } from '../middleware/jwtMiddleware';
import { synonymsSchema, validateData } from '../middleware/joiMiddleware';
import { toLowerCase } from '../middleware/toLowerCaseMiddleware';

const router = express.Router();

router.post('/add', extractJWT, toLowerCase('body'), validateData(synonymsSchema.data, 'body'), synonymsController.addSynonym);
router.get('/get/:word', extractJWT, toLowerCase('params'), validateData(synonymsSchema.data, 'params'), synonymsController.getSynonyms);
router.delete('/delete/:word/:synonym', extractJWT, toLowerCase('params'), validateData(synonymsSchema.data, 'params'), synonymsController.deleteSynonym);

export = router;
