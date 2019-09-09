import { Router } from 'express'

import { objectTypeDefinitionController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/:objecttype',
		objectTypeDefinitionController.setObjectTypeDefinitionFromParams,
		objectTypeDefinitionController.get)
	// .get('/', objectTypeDefinitionController.getAll)
	// .patch('/:objecttype/:attribute',
	// 	objectTypeDefinitionController.setObjectTypeDefinitionFromParams,
	// 	objectTypeDefinitionController.validateObjectAttributeFromParams,
	// 	objectTypeDefinitionController.update)

export default router