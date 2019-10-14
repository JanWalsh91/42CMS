import { Request, Response, NextFunction } from 'express'

import { ValidationError, ResourceNotFoundError } from '../utils'
import { IObjectTypeDefinition, IObjectAttributeDefinition } from '../interfaces'
import { objectTypeDefinitionService } from '../services'


export const objectTypeDefinitionController = {
	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.send(res.locals.objectTypeDefinition);
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await objectTypeDefinitionService.update(res.locals.objectTypeDefinition, req.body, {
				objectAttributeDefinition: res.locals.objectAttributeDefinition,
			})
			res.end()
		} catch (e) { next(e) }
	},

	async updateAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await objectTypeDefinitionService.update(res.locals.objectTypeDefinition, req.body, {})
			res.end()
		} catch (e) { next(e) }
	},


	async setObjectTypeDefinitionFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.objecttype) {
			return next(new ValidationError('objecttype not provided'))
		}
		const objectTypeDefinition: IObjectTypeDefinition = await objectTypeDefinitionService.getById(req.params.objecttype)
		if (!objectTypeDefinition) {
			return next(new ResourceNotFoundError('ObjectTypeDefinition', req.params.objecttype))
		}
		res.locals.objectTypeDefinition = objectTypeDefinition
		next()
	},

	async setObjectAttributeDefinitionFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.path) {
			return next(new ValidationError('path not provided'))
		}
		const objectAttributeDefinition: IObjectAttributeDefinition = res.locals.objectTypeDefinition.objectAttributeDefinitions.find(x => x.path == req.params.path)
		if (!objectAttributeDefinition) {
			return next(new ResourceNotFoundError('ObjectAttributeDefinition', req.params.path))
		}
		res.locals.objectAttributeDefinition = objectAttributeDefinition
		next()
	},

	async validateObjectAttributeFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.attribute) {
			return next(new ValidationError('attribute not provided'))
		}
		next()
	},
}