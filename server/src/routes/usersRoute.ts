import { Router, Request, Response, NextFunction } from 'express';

import { userController } from '../controllers/userController';
import authorize from '../middleware/authorize';

const router: Router = Router({ mergeParams: true });

router
	.post('/', userController.create)
	.get('/:username', authorize, userController.get)
	.get('/', authorize, userController.getAll)
	.post('/:username', authorize, userController.update)
	.delete('/:username', authorize, userController.delete)
	.delete('/', authorize, userController.delete)

export default router;
