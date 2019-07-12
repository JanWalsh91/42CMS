import { Router, Request, Response } from 'express';

import users from './users';
import projects from './projects';
import login from './login';
import auth from './auth';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
	res.status(200).send({
		message: 'GET request successfulll!!!!'
	})
});

// router.use('/auth', auth);
router.use('/login', login);
router.use('/users', users);
router.use('/projects', projects);

export default router;