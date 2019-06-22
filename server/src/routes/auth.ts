import { Router } from 'express';
import { userController } from '../controllers/user';

const router: Router = Router();

router
	.get('/', userController.authorize)

export default router;
