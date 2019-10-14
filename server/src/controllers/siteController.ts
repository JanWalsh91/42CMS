import { Request, Response, NextFunction } from 'express'

import { ISite } from '../interfaces'
import { siteService } from '../services'
import { ValidationError, ResourceNotFoundError } from '../utils'

export const siteController = {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const site: ISite = await siteService.create(req.body.id)
			res.send(site)
		} catch (e) { next(e) }
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		const site: ISite = res.locals.site
		try {
			const obj = await site.toJSONForClient()
			res.send(obj);
		} catch (e) { next(e) }
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await siteService.update(res.locals.site, req.body, {
				objectTypeDefinition: await res.locals.site.getObjectTypeDefinition()
			})
			res.end()
		} catch (e) { next(e) }
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await siteService.delete(res.locals.site)
			res.end()
		} catch (e) { next(e) }
	},

	async setSiteFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
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