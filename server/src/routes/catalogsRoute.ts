import { Router } from 'express'

import { catalogController } from '../controllers/catalogController'
import categories from './categoriesRoute'

const router: Router = Router({ mergeParams: true })

router
	.use('/:catalogid/categories', categories)
	.get('/:catalogid', catalogController.get)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

export default router