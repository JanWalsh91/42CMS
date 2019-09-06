import { Router } from 'express'
import { userController } from '../controllers'
import { authorize } from '../middleware'

const router: Router = Router({ mergeParams: true })

router
	.get('/', authorize, userController.setSession)

export default router
