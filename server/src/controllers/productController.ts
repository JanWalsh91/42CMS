import { Request, Response, NextFunction } from 'express'
import chalk from 'chalk'

import { productService } from '../services'
import { IProduct } from '../interfaces'
import { ValidationError, ResourceNotFoundError } from '../utils/Errors';

export const productController = {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController] create'))
		const { name, id, mastercatalogid: masterCatalog } = req.body
		
		try {
			const product: IProduct = await productService.create({
				name, 
				id,
				masterCatalog
			})
			res.send(product)
		} catch (e) { next(e) }
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.get]'))
		
		// TODO: output for front end user
		res.send(res.locals.product);
	},

	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.getAll]'))
		const products: IProduct[] = await productService.getAll()

		// TODO: output for front end user
		res.send(products);
	},	

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.update]'))

		try {
			await productService.update(res.locals.product, req.body, {
				product: res.locals.product
			})
			res.end()
		} catch (e) { next(e) }
	
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.delete]'))
		try {
			await productService.delete(res.locals.product)
			res.end()
		} catch (e) { next(e) }
	},

	async setProductFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		console.log(chalk.magenta('[ProductController.setProductFromParams]'))
		if (!req.params.productid) {
			return next(new ValidationError('Product id not provided'))
		}
		const product: IProduct = await productService.getById(req.params.productid)
		if (!product) {
			return next(new ResourceNotFoundError('Product', req.params.productid))
		}
		res.locals.product = product
		next()
	},
}
