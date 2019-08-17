import chalk from "chalk";

import { IProduct, Product, ICatalog } from "../models";
import { catalogService } from ".";
import { ResourceNotFoundError, ValidationError } from "../utils/Errors";

export class ProductService {
	public async create(options: Partial<IProduct>): Promise<IProduct> {
		console.log(chalk.blue('[productService.create]'), options)
		const catalog: ICatalog = await catalogService.getById(options.masterCatalog)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', options.masterCatalog)
		}
		if (!catalog.master) {
			throw new ValidationError(`Cannot create a product in a non master catalog`)
		}
		
		// Create new Product
		const product: IProduct = await new Product({
			id: options.id,
			name: options.name,
			masterCatalog: catalog
		}).save();

		// Add Product to Catalog
		await catalogService.addProduct(catalog, product)
		return await product.save()
	}

	public async getById(id: string): Promise<IProduct> {
		return Product.findOne({id}).exec()
	}

	public async getAll(): Promise<IProduct[]> {
		return Product.find({}).exec()
	}

	public async update() {

	}

	public async delete(product: IProduct): Promise<void> {
		console.log(chalk.magenta('[productService.delete] ' +  product.id))
		await product.populate([{path: 'masterCatalog'}]).execPopulate()

		// Remove product from masterCatalog
		await catalogService.removeProduct(product.masterCatalog, product)

		// TODO: remove product from assigned catalogs

		// TODO: remove product from assigned categories and primary category

		// Delete Product
		await Product.findOneAndDelete({id: product.id})
	}
}

export const productService: ProductService = new ProductService();