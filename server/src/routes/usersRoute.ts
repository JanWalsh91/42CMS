import { Router, Request, Response, NextFunction } from 'express';

import { userController } from '../controllers/userController';
import { User } from '../models/userModel';
import authorize from '../middleware/authorize';

const router: Router = Router();

router
	.post('/', userController.create)
	.get('/:username', authorize, userController.get)
	.post('/:username', authorize, userController.update)
	.delete('/:username', authorize, userController.delete)

	// TODO: is this userful?
	.param('username', (req: Request, res: Response, next: NextFunction, username) => {
		User.findOne({username}, (err, user) => {
			if (err) {
				next(err);
			} else if (user) {
				req.params.user = user;
				next();
			} else {
				next(new Error('failed to load user'));
			}
		})
	})

export default router;
