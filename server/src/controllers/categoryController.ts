// import { Project, IProject } from '../models/projectModel'
import { ICategory, Category } from '../models/categoryModel'
import { Request, Response } from 'express';
import chalk from 'chalk';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ICatalog, Catalog } from '../models/catalogModel';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[CategoryController] create'));
		// let catalog: ICatalog = req.body.catalog
		// let project: IProject = req.body.project
		let { name, id, parentCategoryId } = req.body // User acquired from authorization middleware
	   
		// TODO: link with parent if necessary
		let parentCategory: ICategory = null
		if (parentCategoryId) {
			parentCategory = await catalog.getCategory({id: parentCategoryId})
		}
		if (!parentCategory && id != 'root') {
			parentCategory = await catalog.getCategory({id: 'root'});
		}
		
		// TODO: Catch errors
		let category: ICategory = await new Category({id, name, catalog: catalog._id});
		category = await category.save()
		if (parentCategory) {
			console.log({parentCategory})
			await Category.linkCategories(parentCategory, category)
		}
		res.send(category)
	}
}

export const categoryController: CategoryController = new CategoryController();
