import { Router } from 'express';
import { projectController } from '../controllers/project';

const router: Router = Router();

router
	.post('/', projectController.create)

export default router;
