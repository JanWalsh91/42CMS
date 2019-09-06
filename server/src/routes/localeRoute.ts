import { Router } from 'express'

import { localeController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/', localeController.getAll)
	.patch('/:localeid', localeController.update)

export default router