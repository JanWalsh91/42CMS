import { Router } from 'express';
import { userController } from '../controllers/user';
import authorize from '../middleware/authorize';

const router: Router = Router();

router
	.get('/', authorize, userController.setSession)

export default router;
