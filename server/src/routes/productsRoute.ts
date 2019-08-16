import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { productController } from '../controllers/productController'

import { IProduct, Product } from '../models/productModel'
import { ICatalog, Catalog } from '../models/catalogModel';

const router: Router = Router({ mergeParams: true })

router
	// .get('/:productid', getProductById, productController.get)
	.post('/', getCatalogById, productController.create)
	.put('/:productid', getProductById, productController.update)
	

/**
 * Catalog ID supplied in body for products 
 */
async function getCatalogById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.magenta('[getCatalogById]'))

	Catalog.findOne({ id: req.body.masterCatalogId }, (err, masterCatalog: ICatalog) => {
		if (err) { next(err); return; }
		if (!masterCatalog) {
			console.log(chalk.red('[getCatalogById] FAIL HERE'))		
			next(new Error('failed to load catalog'))
			return 
		}
		req.body.masterCatalog = masterCatalog
		next()
	})
}

async function getProductById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.magenta('[getProductById]'))
	try {
		let product: IProduct = await Product.findOne({id: req.params.productid})
		if (!product) {
			console.log(chalk.red('[getProductById] FAIL HERE'))		
			next(new Error('failed to load product'))
			return 
		}
		req.body.product = product
		next()
	} catch (e) {
		next(new Error('failed to load product'))
	}
}

export default router