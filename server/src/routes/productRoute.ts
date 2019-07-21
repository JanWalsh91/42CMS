import { Router, Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { productController } from '../controllers/productController'

import { IProduct } from '../models/productModel'
import { ICatalog } from '../models/catalogModel';

const router: Router = Router()

router
	// .get('/:productid', getProductById, productController.get)
	.post('/', productController.create)
	

async function getProductById(req: Request, res: Response, next: NextFunction) {
	console.log(chalk.magenta('[getProductById]'))
	const catalog: ICatalog = req.body.catalog

	try {
		let product = await catalog.getProduct({id: req.body.productid})
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