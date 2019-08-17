import { Router } from 'express'

import { catalogController } from '../controllers/catalogController'
import categories from './categoriesRoute'

const router: Router = Router({ mergeParams: true })

router
	.use('/:catalogid/categories', catalogController.setCatalogFromParams, categories)
	.get('/:catalogid', catalogController.setCatalogFromParams, catalogController.get)
	.delete('/:catalogid', catalogController.setCatalogFromParams, catalogController.delete)
	.put('/:catalogid', catalogController.setCatalogFromParams, catalogController.update)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

export default router