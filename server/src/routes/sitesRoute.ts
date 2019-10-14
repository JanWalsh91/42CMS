import { Router } from 'express'

import { siteController } from '../controllers/siteController'

const router: Router = Router({ mergeParams: true })

router
	.post('/', siteController.create)
	.get('/:siteid', siteController.setSiteFromParams, siteController.get)
	.patch('/:siteid', siteController.setSiteFromParams, siteController.update)
	.delete('/:siteid', siteController.setSiteFromParams, siteController.delete)
	
export default router