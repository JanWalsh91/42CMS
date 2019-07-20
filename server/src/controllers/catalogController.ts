import { Project, IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ServerError, ErrorType } from '../utils/ServerError';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CatalogController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] create'));
		const { project, name, id }: {project: IProject, name: string, id: string } = req.body; // User acquired from authorization middleware

		Catalog.create(project, id, name)
		.then((newCatalog: ICatalog) => {
			console.log(chalk.green('[CatalogController] create OK'), newCatalog);
			res.send(newCatalog);
		})
		.catch(err => {
			console.log(chalk.red('[CatalogController] create KO', err));
			res.status(BAD_REQUEST)
			res.send(err);
		})
	}

	public async get(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] get'));
		res.send(req.body.catalog);
	}

	public async getAll(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] getAll'));
		const project: IProject = req.body.project;
		
		project.populate('catalogs', (err, project: IProject) => {
			res.send({catalogs: project.catalogs});
		});
	}
}

export const catalogController: CatalogController = new CatalogController();
