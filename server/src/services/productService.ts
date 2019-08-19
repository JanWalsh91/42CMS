import chalk from 'chalk';

import { IProduct, Product, ICatalog, Catalog, ICategory } from '../models';
import { ResourceNotFoundError, ValidationError, patchRequest, Patchable, patchAction, NotImplementedError } from '../utils';
import { catalogService } from '.';

export class ProductService extends Patchable {
	patchMap = {
		id: {
			$set: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const product: IProduct = action.resources.product
				
				await this.setId(product, action.value)
			},
		},
		name: {
			$set: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const product: IProduct = action.resources.product

				await this.setName(product, action.value)
			},
		},
		assignedCatalogs: {
			$add: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.value})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.value)
				}
				
				await Promise.all([
					product.addAssignedCatalog(catalog),
					catalog.addProduct(product),
				])

				// TODO: validate all before saving

				await Promise.all([
					product.save(),
					catalog.save(),
				])
			},
			$remove: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.value})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.value)
				}

				await Promise.all([
					product.removeAssignedCatalog(catalog),
					catalog.removeProduct(product),
				])

				// TODO: validate all before saving
				
				await Promise.all([
					product.save(),
					catalog.save(),
				])
			},
		},
		// TODO:
		primaryCategoryByCatalog: {
			$set: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}
				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}

				await product.setPrimaryCategoryByCatalog(category, catalog)
				await product.save()
			},
			$unset: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['catalog'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}

				await product.setPrimaryCategoryByCatalog(null, catalog)
				await product.save()
			},
		},
		assignedCategoriesByCatalog: {
			$add: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}
				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}

				await product.addAssignedCategoryByCatalog(category, catalog)
				await product.save()
			},
			$remove: async(action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}
				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}

				await product.removeAssignedCategoryByCatalog(category, catalog)
				await product.save()
			},
		}
	}

	public async create(options: Partial<IProduct>): Promise<IProduct> {
		console.log(chalk.blue('[productService.create]'), options)
		const catalog: ICatalog = await catalogService.getById(options.masterCatalog)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', options.masterCatalog)
		}
		if (!catalog.master) {
			throw new ValidationError(`Cannot create a product in a non master catalog`)
		}
		const existingProduct: IProduct = await catalog.getProduct({id: options.id})
		if (existingProduct) {
			throw new ValidationError('Product already exists in this catalog')
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

	public async update(product: IProduct, patchRequest: patchRequest, resources: any): Promise<IProduct> {
		console.log(chalk.magenta(`[CategoryService.update]`))

		await this.patch(patchRequest, resources)

		return product.save()
	}

	private async setId(product: IProduct, id: string): Promise<IProduct> {
		console.log(chalk.magenta(`[ProductService.setId] ${id}`))
		product.id = id
		return product
	}

	private async setName(product: IProduct, name: string): Promise<IProduct> {
		console.log(chalk.magenta(`[ProductService.setName] ${name}`))
		product.name = name
		return product
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