import chalk from 'chalk';

import { IProduct, Product, ICatalog, Catalog, ICategory, Category } from '../models';
import { ResourceNotFoundError, ValidationError, patchRequest, Patchable, patchAction, NotImplementedError } from '../utils';
import { catalogService, categoryService } from '.';

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
				console.log(chalk.keyword('goldenrod')('[ProductService.assignedCatalogs.$add]'))
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

				// TODO: validate all before saving ?

				await Promise.all([
					product.save(),
					catalog.save(),
				])
			},
			$remove: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ProductService.assignedCatalogs.$remove]'))
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
		primaryCategoryByCatalog: {
			$set: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ProductService.primaryCategoryByCatalog.$set]'))
				this.checkRequiredProperties(action, ['value', 'catalog'])
				const product: IProduct = action.resources.product
				
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog}).populate('products').exec()
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}

				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}
				await category.populate('products').execPopulate()

				// Assign product to Catalog if not in Catalog
				if (!catalog.products.find(x => x.id == product.id)) {
					console.log(chalk.green('[ProductService.primaryCategoryByCatalog.$set]NOT IN CATALOG'))
					await Promise.all([
						catalog.addProduct(product),
						product.addAssignedCatalog(catalog)
					])
				}
				// Assign product to Category if not in Category
				if (!category.products.find(x => x.id == product.id)) {
					console.log(chalk.green('[ProductService.primaryCategoryByCatalog.$set]NOT IN CATEGORY'))
					await Promise.all([
						category.addProduct(product),
						product.addAssignedCategoryByCatalog(category, catalog)
					])
				}

				await product.setPrimaryCategoryByCatalog(category, catalog)

				// TODO: Validate

				await Promise.all([
					product.save(),
					catalog.save(),
					category.save(),
				])
			},
			$unset: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ProductService.primaryCategoryByCatalog.$unset]'))
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
				console.log(chalk.keyword('goldenrod')('[ProductService.assignedCategoriesByCatalog.$add]'))
				this.checkRequiredProperties(action, ['value', 'catalog'])
	
				const product: IProduct = action.resources.product
	
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog}).populate('products').exec()
	
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}
				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}

				// Assign product to Catalog if not in Catalog
				if (!catalog.products.find(x => x.id == product.id)) {
					console.log(chalk.green('[ProductService.assignedCategoriesByCatalog.$add]NOT IN CATALOG'))
					await Promise.all([
						catalog.addProduct(product),
						product.addAssignedCatalog(catalog),
					])
				}

				await Promise.all([
					product.addAssignedCategoryByCatalog(category, catalog),
					// category.addProduct(product),
				])

				// TODO: validate

				await Promise.all([
					product.save(),
					category.save(),
					catalog.save(),
				])
			},
			$remove: async(action: patchAction): Promise<void> => {
				console.log(chalk.keyword('goldenrod')('[ProductService.assignedCategoriesByCatalog.$remove]'))
				this.checkRequiredProperties(action, ['value', 'catalog'])
				const product: IProduct = action.resources.product
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog}).populate('products')
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}
				const category: ICategory = await catalog.getCategory({id: action.value})
				if (!category) {
					throw new ResourceNotFoundError('Category', action.value)
				}
				
				// Return if product not assigned to Catalog
				if (!catalog.products.find(x => x.id == product.id)) {
					return
				}

				await Promise.all([
					category.removeProduct(product),
					product.removeAssignedCategoryByCatalog(category, catalog),
				])

				// TODO: validate

				await Promise.all([
					category.save(),
					product.save(),
				])
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
		await Promise.all([
			catalog.addProduct(product),
			product.addAssignedCatalog(catalog),
		])

		// TODO: validation

		await Promise.all([
			product.save(),
			catalog.save(),
		])

		return product
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
		await product.populate([
			{path: 'assignedCatalogs'},
			{path: 'assignedCategoriesByCatalog.catalog'},
			{path: 'assignedCategoriesByCatalog.categories'},
		]).execPopulate()

		const categories: ICategory[] = product.assignedCategoriesByCatalog.reduce((list: ICategory[], categoriesForCatalog) => {
			list.push(...(categoriesForCatalog.categories as ICategory[]))
			return list
		}, [])

		let promises: Promise<any>[] = [];

		// Remove product from assigned catalogs
		promises.push(...product.assignedCatalogs.map((catalog: ICatalog) => catalog.removeProduct(product)))
		// Remove product from assigned categories
		promises.push(...categories.map((category: ICategory) => category.removeProduct(product)))
		
		await Promise.all(promises)

		await Promise.all([
			...[
				...categories,
				...product.assignedCatalogs
			].map(x => x.save()),
		])

		// Delete Product
		await Product.findOneAndDelete({id: product.id})
	}
}

export const productService: ProductService = new ProductService();