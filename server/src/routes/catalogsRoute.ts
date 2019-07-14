import { Router, Request, Response, NextFunction } from 'express'
import { catalogController } from '../controllers/catalogController'
import authorize from '../middleware/authorize';
import { Catalog } from '../models/catalogModel';
import chalk from 'chalk';

const router: Router = Router()

router
	.post('/', catalogController.create)

function getCatalogById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.keyword('lightGreen')('[getCatalogById]'))
	Catalog.findOne({id: req.params.id}, (err, catalog) => {
		if (err) {
			next(err);
		} else if (catalog) {
			req.params.catalog = catalog;
			next();
		} else {
			next(new Error('failed to load catalog'));
		}
	})
}

export default router