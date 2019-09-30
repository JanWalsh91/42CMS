import { Router } from 'express'

import { productController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.post('/', productController.create)
	.get('/:productid', productController.setProductFromParams, productController.get)
	.get('/', productController.getAll)
	.patch('/:productid', productController.setProductFromParams, productController.update)
	.delete('/:productid', productController.setProductFromParams, productController.delete)

export default router