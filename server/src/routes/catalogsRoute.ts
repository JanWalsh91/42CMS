import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { catalogController } from '../controllers/catalogController'
import { IProject } from '../models/projectModel'
import { ICatalog } from '../models/catalogModel'
import categories from './categoryRoute'

const router: Router = Router()

router
	.use('/:catalogid/categories/', getCatalogById, categories)
	.get('/:catalogid', getCatalogById, catalogController.get)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

function getCatalogById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.magenta('[getCatalogById]'))
	const project: IProject = req.body.project
	if (!project) {
		console.log(chalk.red('[getCatalogById] FAIL'))
		next(new Error('failed to load project'))
		return
	}

	const catalog: ICatalog = project.catalogs.find(catalog => catalog.id == req.params.catalogid)
	if (!catalog) {
		console.log(chalk.red('[getCatalogById] FAIL'))		
		next(new Error('failed to load catalog'))
	}
	req.body.catalog = catalog
	next();
}

export default router