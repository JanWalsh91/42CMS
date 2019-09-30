import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { ISite } from '../interfaces'
import { siteService, objectTypeDefinitionService } from '../services'
import { ValidationError, ResourceNotFoundError } from '../utils'

export const siteController = {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[SiteController] create'))
		const { id } = req.body

		try {
			const site: ISite = await siteService.create(id)
			res.send(site)
		} catch (e) { next(e) }
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[SiteController] get'))
		const site: ISite = res.locals.site

		try {
			const obj = await site.toJSONForClient()
			res.send(obj);
		} catch (e) { next(e) }
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.update]'))

		try {
			await siteService.update(res.locals.site, req.body, {
				objectTypeDefinition: await res.locals.site.getObjectTypeDefinition()
			})
			res.end()
		} catch (e) { next(e) }
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[SiteController.delete]'))
		try {
			await siteService.delete(res.locals.site)
			res.end()
		} catch (e) { next(e) }
	},

	async setSiteFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[SiteController.setSiteFromParams]'))
		if (!req.params.siteid) {
			return next(new ValidationError('Site id not provided'))
		}
		const site: ISite = await siteService.getById(req.params.siteid)
		if (!site) {
			return next(new ResourceNotFoundError('site', req.params.siteid))
		}
		res.locals.site = site
		next()
	},
}