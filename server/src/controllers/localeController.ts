import { Request, Response, NextFunction } from 'express'

import { ValidationError, ResourceNotFoundError } from '../utils'
import { ILocale } from '../interfaces'
import { localeService } from '../services'

export const localeController = {
	
	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const locales: ILocale[] = await localeService.getAll()
		
			res.send(
				await Promise.all(
					locales.map((locale: ILocale) => locale.toJsonForUser(res.locals.user))
				)
			)
		} catch (e) { next(e) }
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await localeService.update(res.locals.locale, req.body, {})
			res.end()
		} catch (e) { next(e) }
	},
	
	async setLocaleFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.localeid) {
			return next(new ValidationError('Locale id not provided'))
		}
		const locale: ILocale = await localeService.getById(req.params.localeid)
		if (!locale) {
			return next(new ResourceNotFoundError('Locale', req.params.localeid))
		}
		res.locals.locale = locale
		next()
	}
}

