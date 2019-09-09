import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import { ValidationError, ResourceNotFoundError } from '../utils';
import { IObjectTypeDefinition } from '../interfaces'
import { objectTypeDefinitionService } from '../services'


export const objectTypeDefinitionController = {
	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[objectTypeDefinitionController.get]'))
		
		// TODO: output for front end user
		res.send(res.locals.objectTypeDefinition);
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[objectTypeDefinitionController.update]'))

		try {
			await objectTypeDefinitionService.update(res.locals.objectTypeDefinition, req.body, {
				objectTypeDefinition: res.locals.objectTypeDefinition,

			})
			res.end()
		} catch (e) { next(e) }
	},

	async setObjectTypeDefinitionFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[objectTypeDefinitionController.setObjectTypeDefinitionFromParams]'))
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

	async validateObjectAttributeFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[objectTypeDefinitionController.validateObjectAttributeFromParams]'))
		if (!req.params.attribute) {
			return next(new ValidationError('attribute not provided'))
		}
		// TODO;
		next()
	},
}