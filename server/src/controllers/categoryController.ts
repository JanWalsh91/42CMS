import { Project, IProject } from '../models/projectModel'
import { ICategory } from '../models/categoryModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ServerError, ErrorType } from '../utils/ServerError';
import { ICatalog } from '../models/catalogModel';
import { prependOnceListener } from 'cluster';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CategoryController] create'), req.body);
		let catalog: ICatalog = req.body.catalog
		let project: IProject = req.body.project
		let { name, id, parentCategoryId } = req.body // User acquired from authorization middleware
	   
		let parentCategory: ICategory = null
		if (parentCategoryId) {
			parentCategory = await catalog.getCategory({id: parentCategoryId})
		}
		if (!parentCategory) {
			parentCategory = catalog.rootCategory;
		}

		// check if category already exists
		catalog.populate('')

		const newCategory = {
			parentCategory: parentCategory ? parentCategory._id : null,
			id,
			name
		};

		let existingCategory: ICategory = await catalog.getCategory({id})
		if (existingCategory) {
			res.status(BAD_REQUEST)
			console.log(chalk.red(`[CategoryController.create] Catalog with id already exists`))
			res.send(new ServerError(ErrorType.CATEGORY_EXISTS, id))
			return
		}



	
	}
}

export const categoryController: CategoryController = new CategoryController();
