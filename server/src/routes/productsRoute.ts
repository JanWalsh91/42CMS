import { Router } from 'express'

import { productController } from '../controllers'


const router: Router = Router({ mergeParams: true })

router
	.get('/:productid', productController.setProductFromParams, productController.get)
	.put('/:productid', productController.setProductFromParams, productController.update)
	.delete('/:productid', productController.setProductFromParams, productController.delete)
	.get('/', productController.getAll)
	.post('/', productController.create)
	

export default router