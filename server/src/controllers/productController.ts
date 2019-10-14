import { Request, Response, NextFunction } from 'express'

import { productService, objectTypeDefinitionService } from '../services'
import { IProduct } from '../interfaces'
import { ValidationError, ResourceNotFoundError } from '../utils/Errors'

export const productController = {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { mastercatalogid: masterCatalog } = req.body

		try {
			const product: IProduct = await productService.create({
				...req.body,
				masterCatalog,
			})
			res.send(product)
		} catch (e) { next(e) }
	},

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.send(res.locals.product);
	},

	async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const products: IProduct[] = await productService.getAll()
			res.send(products);
		} catch (e) { next(e) }
	},	

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await productService.update(res.locals.product, req.body, {
				objectTypeDefinition: await objectTypeDefinitionService.getByDocument(res.locals.product)
			})
			res.end()
		} catch (e) { next(e) }
	},

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await productService.delete(res.locals.product)
			res.end()
		} catch (e) { next(e) }
	},

	async setProductFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
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
