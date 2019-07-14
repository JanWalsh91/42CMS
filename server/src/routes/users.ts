import { Router, Request, Response, NextFunction } from 'express';

import { userController } from '../controllers/userController';
import { User } from '../models/user';
import authorize from '../middleware/authorize';

const router: Router = Router();

router
	.post('/', userController.create)
	.get('/:userid', authorize, userController.get)
	.post('/:userid', authorize, userController.update)
	.delete('/:userid', authorize, userController.delete)

	// TODO: is this userful?
	.param('userid', (req: Request, res: Response, next: NextFunction, id) => {
		User.findById(id, (err, user) => {
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
