import { catalogService } from '../services/catalogService'

import { ICatalog } from '../models'


import { Request, Response } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ServerError, ErrorType } from '../utils/ServerError'

const { BAD_REQUEST } = ResponseStatusTypes 

export class CatalogController {
	public async create(req: Request, res: Response) {
		// console.log(chalk.magenta('[CatalogController] create'))
		const { name, id, isMaster }: { name: string, id: string, isMaster: boolean } = req.body; // User acquired from authorization middleware

		// TODO: Catch errors in global error middleware
		let catalog: ICatalog = await catalogService.create({name, id, isMaster});
		
		// console.log(chalk.magenta('[CatalogController] create END'), catalog);
		res.send(catalog)
	}

	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] get'));
		res.send(req.body.catalog);
	}

	public async getAll(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] getAll'));
		// TODO; Use service!
		res.send({catalogs: ''});
	}
}

export const catalogController: CatalogController = new CatalogController();
