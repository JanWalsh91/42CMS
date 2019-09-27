import { Router } from 'express'

import { imageController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	// .get('/:imageid', imageController.get)
	// .get('/', imageController.getAll)
	.post('/', imageController.uploadImage, imageController.create)
	.delete('/:imageid', imageController.setImageFromParams, imageController.delete)

export default router