import { Router, Request, Response } from 'express';

import users from './usersRoute';
import projects from './projectsRoute';
import login from './loginRoute';
import logout from './logoutRoute';
import auth from './authRoute';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
	res.status(200).send({
		message: 'GET request successfulll!!!!'
	})
});

router.use('/auth', auth);
router.use('/login', login);
router.use('/logout', logout);
router.use('/users', users);
router.use('/projects', projects);

export default router;