import { Router, Request, Response } from 'express';

import users from './usersRoute';
import login from './loginRoute';
import logout from './logoutRoute';

import auth from './authRoute';
import catalogs from './catalogsRoute';
// import products from './productsRoute';

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
router.use('/catalogs', catalogs);
// router.use('/products', products);

export default router;