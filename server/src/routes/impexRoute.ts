import { Router } from 'express'

import { impexController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/:filename', impexController.download)
	.get('/', impexController.getAll)
	.post('/upload', impexController.upload)
	.post('/export', impexController.export)
	.post('/import', impexController.import)
	.delete('/:filename', impexController.delete)

export default router