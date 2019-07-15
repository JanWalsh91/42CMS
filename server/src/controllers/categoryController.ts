import { Project, IProject } from '../models/projectModel'
import { Category, ICategory } from '../models/categoryModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CategoryController] create'), req.body);
		const { user, project, name, id } = req.body; // User acquired from authorization middleware
	   
		// TODO: Submitted category id must be unique within Catalog
		const existingCategory: ICategory = await Category.findOne({project: project._id, id});
		if (existingCategory) {
			console.log(chalk.red(`${project.id} already has a category with id ${id}`));
			res.status(BAD_REQUEST);
			res.send({err: `${project.id} already has a category with id ${id}`});
			return ;
		}
		const newCategory: ICategory = new Category({name, id, project: project._id});

        newCategory.save((err, category) => {
            if (err){
                res.send(err);
            } else {
				res.json({					// TODO: factorize
					name: category.name,
					id: category.id,
					project: project.id,
				});
			}
        });
	}
}

export const categoryController: CategoryController = new CategoryController();
