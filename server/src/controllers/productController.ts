import { Project, IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import { Request, Response } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ServerError, ErrorType } from '../utils/ServerError'
import { IProduct, Product } from '../models/productModel'
import { ICategory, Category } from '../models/categoryModel'
import { model } from 'mongoose'

const { BAD_REQUEST } = ResponseStatusTypes

export class ProductController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[ProductController] create'), req.body)
		let project: IProject = req.body.project
		let masterCatalog: ICatalog = req.body.masterCatalog
		let name: string = req.body.name
		let id: string = req.body.id
		
		try {
			let product: IProduct = await new Product({
				project: project._id,
				masterCatalog: masterCatalog._id,
				...{name, id}
			})
			product = await product.save()
			res.send(product)
		} catch (e) {
			res.status(BAD_REQUEST)
			res.end()
			// TODO: error msg
		}
	}

	
	public async update(req: Request, res: Response) {
		console.log(chalk.magenta('[ProductController] update'), req.body)
		let project: IProject = req.body.project
		let product: IProduct = req.body.product
		try {
			await product.update({...req.body})
			product = await product.save()
			res.send(product.toJSON()) // TODO: to JSONForUser
		} catch (e) {
			console.log('err: ', e)
		}
		res.end()
	}
}

export const productController: ProductController = new ProductController()
