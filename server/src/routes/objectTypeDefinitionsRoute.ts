import { Router } from 'express'

import { objectTypeDefinitionController } from '../controllers'

const router: Router = Router({ mergeParams: true })

router
	.get('/:objecttype',
		objectTypeDefinitionController.setObjectTypeDefinitionFromParams,
		objectTypeDefinitionController.get)
	.patch('/:objecttype/:path',
		objectTypeDefinitionController.setObjectTypeDefinitionFromParams,
		objectTypeDefinitionController.setObjectAttributeDefinitionFromParams,
		objectTypeDefinitionController.update)
	.patch('/:objecttype',
		objectTypeDefinitionController.setObjectTypeDefinitionFromParams,
		objectTypeDefinitionController.update)


export default router