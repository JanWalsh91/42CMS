import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

import { ICategory, ICatalog } from '../models'
import { categoryService, catalogService } from '../services';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ValidationError, ResourceNotFoundError } from '../utils/Errors';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	
	public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.create]'));

		const { name, id, parent } = req.body
		const catalog = req.params.catalogid

		try {
			const category: ICategory = await categoryService.create({ name, id, catalog, parent })
			res.send(category)
		} catch (e) { next(e) }
	}

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.get]'));
		if (!req.body.id) {
			return next(new ValidationError('Category id not provided'))
		}
		if (!req.params.catalogid) {
			return next(new ValidationError('Catalog id not provided'))
		}
		const catalog: ICatalog = await catalogService.getById(req.params.catalogid)
		if (!catalog) {
			return next(new ResourceNotFoundError('Catalog', req.params.catalogid))
		}
		
		const category: ICategory = await catalog.getCategory({id: req.body.id})
		if (!category) {
			return next(new ResourceNotFoundError('Category', req.body.id))
		}
		res.send(category)
	}
}

export const categoryController: CategoryController = new CategoryController();
