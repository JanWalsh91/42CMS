import { Router } from 'express';
import { projectController } from '../controllers/project';

import authorize from '../middleware/authorize';

const router: Router = Router();

router
	.post('/', authorize, projectController.create)
	.get('/', authorize, projectController.get)

export default router;
