import { Project, IProject } from '../models/projectModel'
import { ICatalog } from '../models/catalogModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ServerError, ErrorType } from '../utils/ServerError';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CatalogController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] create'), req.body);
		const { project, name, id } = req.body; // User acquired from authorization middleware
	   
		const newCatalog = { id, name };

		Project.findOneAndUpdate(
			// Get current project only if catalog does not have a catalog with id  
			{id: project.id, catalogs: { $not: { $elemMatch: { id }}}},
			// Add newCatalog to catalogs
			{ $push: { catalogs : newCatalog }},
			// Return updated Project in callback
			{new: true},
			(err, doc) => {
				// console.log('findOneAndUpdate callback', err, doc)
				if (err || !doc) {
					res.status(BAD_REQUEST)
					if (err) {
						console.log(chalk.red(`[findOndAndUpdate] Error: ${err}`))
						res.send({err})
					} else {
						console.log(chalk.red(`[findOndAndUpdate] Catalog with id already exists`))
						res.send(new ServerError(ErrorType.CATALOG_EXISTS))
					}
				} else {
					console.log(chalk.green(`[findOndAndUpdate] Success: ${doc}`))
					res.send(doc.catalogs.find(catalog => catalog.id == id))
				}
			}
		)
	}

	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] get'), req.body);
		res.send(req.body.catalog);
	}

	public async getAll(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] getAll'), req.body);
		const { project } : { project: IProject }  = req.body;
		
		const catalogs = project.catalogs;
		res.send({catalogs});
	}
}

export const catalogController: CatalogController = new CatalogController();
