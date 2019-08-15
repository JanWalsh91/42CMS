import { Router } from 'express'

import { categoryController } from '../controllers'

const router: Router = Router()

router
	// .get('/:catalogid', getCategoryById, categoryController.get)
	.post('/', categoryController.create)

export default router