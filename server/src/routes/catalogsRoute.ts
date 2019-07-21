import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'
import { ObjectId } from 'mongodb';

import { catalogController } from '../controllers/catalogController'
import { IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import categories from './categoryRoute'

const router: Router = Router()

router
	.use('/:catalogid/categories/', getCatalogById, categories)
	.get('/:catalogid', getCatalogById, catalogController.get)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

function getCatalogById(req: Request, res: Response, next: NextFunction) {
	// console.log(chalk.magenta('[getCatalogById]'))
	const project: IProject = req.body.project
	if (!project) {
		console.log(chalk.red('[getCatalogById] FAIL'))
		next(new Error('failed to load project'))
		return
	}

	Catalog.findOne({ project: project._id, id: req.params.catalogid }, (err, catalog: ICatalog) => {
		if (!catalog) {
			console.log(chalk.red('[getCatalogById] FAIL HERE'))		
			next(new Error('failed to load catalog'))
			return 
		}
		req.body.catalog = catalog
		next()
	})
}

export default router