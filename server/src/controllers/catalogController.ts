import { Project, IProject } from '../models/projectModel'
import { Catalog, ICatalog } from '../models/catalogModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CatalogController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CatalogController] create'), req.body);
		const { user, project, name, id } = req.body; // User acquired from authorization middleware
	   
		// Submitted catalog id must be unique
		const existingCatalog: ICatalog = await Catalog.findOne({project: project._id, id});
		if (existingCatalog) {
			console.log(chalk.red(`${project.id} already has a catalog with id ${id}`));
			res.statusCode = BAD_REQUEST;
			res.send({err: `${project.id} already has a catalog with id ${id}`});
			return ;
		}
		const newCatalog: ICatalog = new Catalog({name, id, project: project._id});

        newCatalog.save((err, catalog) => {
            if (err){
                res.send(err);
            } else {
				res.json({					// TODO: factorize
					name: catalog.name,
					id: catalog.id,
					project: project.id,
				});
			}
        });
	}
}

export const catalogController: CatalogController = new CatalogController();
