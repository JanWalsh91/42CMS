import { Request, Response, NextFunction } from 'express'

import { ICategory } from '../interfaces'
import { categoryService } from '../services'
import { ValidationError, ResourceNotFoundError } from '../utils/Errors'

export class CategoryController {
	
	public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { name, id, parent } : { name: string, id: string, parent: string } = req.body

		try {
			const category: ICategory = await categoryService.create({
				name,
				id,
				catalog: req.params.catalogid, // handled in service
				parent
			})
			res.send(category)
		} catch (e) { next(e) }
	}

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.send(res.locals.category)
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await res.locals.catalog.populate('categories').execPopulate()
			res.send(res.locals.catalog.categories)
		} catch (e) { next(e) }
	}

	public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await categoryService.update(res.locals.category, req.body, {})
			res.end()
		} catch (e) { next(e) }
	}

	public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await categoryService.delete(res.locals.category)
			res.end()
		} catch (e) { next(e) }
	}

	public async setCategoryFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
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
