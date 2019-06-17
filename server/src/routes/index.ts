import { Router, Request, Response } from 'express';

import users from './users';
import projects from './projects';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
	res.status(200).send({
		message: 'GET request successfulll!!!!'
	})
});

router.use('/users', users);
router.use('/projects', projects);

export default router;