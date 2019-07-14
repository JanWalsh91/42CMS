import { Router } from 'express';
import { projectController } from '../controllers/projectController';

import authorize from '../middleware/authorize';

const router: Router = Router();

router
	.post('/', authorize, projectController.create)
	.get('/', authorize, projectController.getAll)

export default router;
