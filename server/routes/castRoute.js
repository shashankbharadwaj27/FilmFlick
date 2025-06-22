import {Router} from 'express';
import {handleGetPersonCredits,handleGetPersonDetails} from '../controllers/castController.js'

const castRouter=Router();

castRouter.get('/:id/credits',handleGetPersonCredits);

castRouter.get('/:id',handleGetPersonDetails);

export default castRouter