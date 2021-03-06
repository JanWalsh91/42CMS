import { Router } from 'express'

import { userController } from '../controllers/userController'

const router: Router = Router({ mergeParams: true })

router
	.post('/', userController.login)

export default router
