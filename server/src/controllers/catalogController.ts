import { catalogService } from '../services/catalogService'

import { ICatalog } from '../models'

import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ResourceNotFoundError } from '../utils/Errors'

const { BAD_REQUEST } = ResponseStatusTypes 

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

		try {
			const catalog: ICatalog = await catalogService.getById(req.params.catalogid)
			if (!catalog) {
				throw new ResourceNotFoundError('Catalog', req.params.catalogid)
			}
			// TODO: output for front end user
			res.send(catalog);
		} catch (e) {
			next(e);
		}
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CatalogController.getAll]'))

		const catalogs: ICatalog[] = await catalogService.getAll()

		// TODO: output for front end user
		res.send(catalogs);
	}

	public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		const catalog: ICatalog = await catalogService.getById(req.params.id)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', req.params.id)
		}
		await catalogService.delete(req.body.id)
		res.send('Catalog deleted')
	}
}

export const catalogController: CatalogController = new CatalogController();
