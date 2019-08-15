import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { catalogController } from '../controllers/catalogController'
import { ICatalog, Catalog } from '../models/catalogModel'
import categories from './categoriesRoute'

const router: Router = Router()

router
	.use('/:catalogid/categories/', getCatalogById, categories)
	.get('/:catalogid', getCatalogById, catalogController.get)
	.get('/', catalogController.getAll)
	.post('/', catalogController.create)

// TODO: is this necessary? Better to do in Service
function getCatalogById(req: Request, res: Response, next: NextFunction) {
	// console.log(chalk.magenta('[getCatalogById]'))

	Catalog.findOne({ id: req.params.catalogid }, (err, catalog: ICatalog) => {
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