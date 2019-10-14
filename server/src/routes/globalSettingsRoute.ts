import { Router } from 'express'

import { globalSettingsController } from '../controllers/'

const router: Router = Router({ mergeParams: true })

router
	.get('/', globalSettingsController.get)
	.patch('/', globalSettingsController.update)

export default router;
