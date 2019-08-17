import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';

import { ICategory, ICatalog } from '../models'
import { categoryService, catalogService } from '../services';
import ResponseStatusTypes from '../utils/ResponseStatusTypes';
import { ValidationError, ResourceNotFoundError, NotImplementedError } from '../utils/Errors';

const { BAD_REQUEST } = ResponseStatusTypes; 

export class CategoryController {
	
	public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.create]'));
		const { name, id, parent } = req.body

		try {
			const category: ICategory = await categoryService.create({
				name,
				id,
				catalog: req.params.catalogid, // id instead of _id ?
				parent
			})
			res.send(category)
		} catch (e) { next(e) }
	}

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.get]'), req.params);
		res.send(res.locals.category)
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		await res.locals.catalog.populate('categories').execPopulate()
		res.send(res.locals.catalog.categories)
	}

	public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.update]'))
		const { name, id, parent } = req.body
		try {
			await categoryService.update(res.locals.category, {
				name,
				id,
				parentId: parent
			})
		} catch (e) { next(e) }
	
		res.end()
	}

	public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[CategoryController.delete]'), req.params);
		await categoryService.delete(res.locals.category)
		res.end()
	}

	public async setCategoryFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[categoryController.setCategoryFromParams]'))
		if (!req.params.categoryid) {
			return next(new ValidationError('Category id not provided'))
		}
		const category: ICategory = await res.locals.catalog.getCategory({id: req.params.categoryid})
		if (!category) {
			return next(new ResourceNotFoundError('Category', req.params.categoryid))
		}
		res.locals.category = category
		next()
	}
}

export const categoryController: CategoryController = new CategoryController();
