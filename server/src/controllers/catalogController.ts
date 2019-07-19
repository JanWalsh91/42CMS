import { Project, IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ServerError, ErrorType } from '../utils/ServerError';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CatalogController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] create'), req.body);
		const { project, name, id, isMaster } = req.body; // User acquired from authorization middleware

		const newCatalog: ICatalog = new Catalog({ id, name, project: project._id, isMaster: !!isMaster });
		await newCatalog.save();

		res.end();
	}

	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] get'));
		res.send(req.body.catalog);
	}

	public async getAll(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] getAll'));
		const { project } : { project: IProject }  = req.body;
		
		const catalogs = project.catalogs;
		res.send({catalogs});
	}
}

export const catalogController: CatalogController = new CatalogController();
