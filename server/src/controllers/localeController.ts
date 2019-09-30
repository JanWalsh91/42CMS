import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import { ValidationError, ResourceNotFoundError } from '../utils'
import { ILocale } from '../interfaces'
import { localeService } from '../services'

export const localeController = {
	
	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[localeController.getAll]'))
		const locales: ILocale[] = await localeService.getAll()
	
		res.send(
			await Promise.all(
				locales.map((locale: ILocale) => locale.toJsonForUser(res.locals.user))
			)
		)
	},

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[localeController.update]'))
		try {
			await localeService.update(res.locals.locale, req.body, {})
			res.end()
		} catch (e) { next(e) }
	
	},
	
	async setLocaleFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[localeController.setLocaleFromParams]'))
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
