import { Router } from 'express'

import { categoryController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	// .get('/:catalogid', getCategoryById, categoryController.get)
	.post('/', categoryController.create)

export default router