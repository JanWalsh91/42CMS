import { Router } from 'express'

import { categoryController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/:categoryid', categoryController.setCategoryFromParams, categoryController.get)
	.delete('/:categoryid', categoryController.setCategoryFromParams, categoryController.delete)	
	.get('/', categoryController.getAll)
	.post('/', categoryController.create)

export default router