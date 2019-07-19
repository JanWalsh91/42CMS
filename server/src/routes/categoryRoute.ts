import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { categoryController } from '../controllers/categoryController'
import { IProject } from '../models/projectModel'
import { ICatalog } from '../models/catalogModel'
import { ICategory } from '../models/categoryModel';

const router: Router = Router()

router
	// .get('/:catalogid', getCategoryById, categoryController.get)
	.post('/', categoryController.create)

function getCategoryById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.magenta('[getCategoryById]'))
	const catalog: ICatalog = req.body.catalog

	if (!catalog) {
		console.log(chalk.red('[getCategoryById] FAIL'))
		next(new Error('failed to load catalog'))
		return
	}

	const category: ICategory = catalog.getCategory({ id: req.params.categoryid })
	if (!category) {
		console.log(chalk.red('[getCategoryById] FAIL'))		
		next(new Error('failed to load category'))
	}
	req.body.category = category
	next();
}

export default router