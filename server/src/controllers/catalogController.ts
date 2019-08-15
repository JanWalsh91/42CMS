import { catalogService } from '../services/catalogService'

import { ICatalog } from '../models'

import { Request, Response } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ResourceNotFoundError } from '../utils/Errors'

const { BAD_REQUEST } = ResponseStatusTypes 

export class CatalogController {
	public async create(req: Request, res: Response): Promise<void> {
		console.log(chalk.magenta('[CatalogController.create]'))
		const { name, id, isMaster }: { name: string, id: string, isMaster: boolean } = req.body; // User acquired from authorization middleware

		// TODO: Catch errors in global error middleware
		const catalog: ICatalog = await catalogService.create({name, id, isMaster});
		
		// console.log(chalk.magenta('[CatalogController] create END'), catalog);
		res.send(catalog)
	}

	public async get(req: Request, res: Response): Promise<void> {
		console.log(chalk.magenta('[CatalogController.get]'))

		const catalog: ICatalog = await catalogService.getById(req.body.id)

		// TODO: output for front end user
		res.send(catalog);
	}

	public async getAll(req: Request, res: Response): Promise<void> {
		console.log(chalk.magenta('[CatalogController.getAll]'))

		const catalogs: ICatalog[] = await catalogService.getAll()

		// TODO: output for front end user
		res.send(catalogs);
	}

	public async delete(req: Request, res: Response): Promise<void> {
		const catalog: ICatalog = await catalogService.getById(req.body.id)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog')
		}
		await catalogService.delete(req.body.id)
		res.send('Catalog deleted')
	}
}

export const catalogController: CatalogController = new CatalogController();
