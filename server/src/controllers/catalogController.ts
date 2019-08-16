import { catalogService } from '../services/catalogService'

import { ICatalog } from '../models'

import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import { ResourceNotFoundError, ValidationError } from '../utils/Errors'

export class CatalogController {
	public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.create]'))
		const { name, id, isMaster }: { name: string, id: string, isMaster: boolean } = req.body; // User acquired from authorization middleware

		try {
			const catalog: ICatalog = await catalogService.create({name, id, isMaster});
			
			// console.log(chalk.magenta('[CatalogController] create END'), catalog);
			res.send(catalog)
		} catch(e) {
			next(e)
		}
	}

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.get]'))

		// TODO: output for front end user
		res.send(res.locals.catalog);
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.getAll]'))

		const catalogs: ICatalog[] = await catalogService.getAll()

		// TODO: output for front end user
		res.send(catalogs);
	}

	public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.delete]'), req.params)
		await catalogService.delete(res.locals.catalog)
		res.end()
	}

	public async setCatalogFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.setCatalogFromParams]'))
		if (!req.params.catalogid) {
			return next(new ValidationError('Catalog id not provided'))
		}
		const catalog: ICatalog = await catalogService.getById(req.params.catalogid)
		if (!catalog) {
			return next(new ResourceNotFoundError('Catalog', req.params.catalogid))
		}
		res.locals.catalog = catalog
		next()
	}
}

export const catalogController: CatalogController = new CatalogController();
