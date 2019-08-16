import { Router, Request, Response, NextFunction } from 'express';

import { userController } from '../controllers/userController';
import { User } from '../models/userModel';
import authorize from '../middleware/authorize';

const router: Router = Router({ mergeParams: true });

router
	.post('/', userController.create)
	.get('/', userController.getAll)
	.get('/:username', authorize, userController.get)
	.post('/:username', authorize, userController.update)
	.delete('/:username', authorize, userController.delete)

export default router;
