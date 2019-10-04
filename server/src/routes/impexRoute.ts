import { Router } from 'express'

import { impexController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/', impexController.getAll)
	.get('/:filename', impexController.download)
	.post('/upload', impexController.upload)
	.post('/export', impexController.export)
	.post('/import', impexController.import)
	.delete('/:filename', impexController.delete)

export default router