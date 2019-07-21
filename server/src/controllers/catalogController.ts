import { Project, IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import { Request, Response } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ServerError, ErrorType } from '../utils/ServerError'

const { BAD_REQUEST } = ResponseStatusTypes 

export class CatalogController {
	public async create(req: Request, res: Response) {
		// console.log(chalk.magenta('[CatalogController] create'))
		const { project, name, id, isMaster }: {project: IProject, name: string, id: string, isMaster: boolean } = req.body; // User acquired from authorization middleware

		// TODO: Catch errors
		let catalog: ICatalog = await new Catalog({ id, name, project: project._id, isMaster: !!isMaster });
		catalog = await catalog.save()

		// console.log(chalk.magenta('[CatalogController] create END'), catalog);
		res.send(catalog)
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
