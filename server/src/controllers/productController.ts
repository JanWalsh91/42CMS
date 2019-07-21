import { Project, IProject } from '../models/projectModel'
import { ICatalog, Catalog } from '../models/catalogModel'
import { Request, Response } from 'express'
import chalk from 'chalk'
import ResponseStatusTypes from '../utils/ResponseStatusTypes'
import { ServerError, ErrorType } from '../utils/ServerError'
import { IProduct, Product } from '../models/productModel';

const { BAD_REQUEST } = ResponseStatusTypes

export class ProductController {
	public async create(req: Request, res: Response) {
		console.log(chalk.magenta('[ProductController] create'), req.body)
		let project: IProject = req.body.project
		let catalog: ICatalog = req.body.catalog
		let name: string = req.body.name
		let id: string = req.body.id
		
		try {
			let product: IProduct = await new Product({ project: project._id, catalog: catalog._id, ...{name, id} })
			res.send(product)
		} catch (e) {
			res.status(BAD_REQUEST)
			res.end()
			// TODO: error msg
		}
	}
}

export const productController: ProductController = new ProductController();
