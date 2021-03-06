import { Product, Catalog, ProductMaster, ProductVariant } from '../models'
import { IProduct, ICatalog, ICategory, IProductVariant, IObjectTypeDefinition, IObjectAttributeDefinition, IProductMaster } from '../interfaces'
import { ResourceNotFoundError, ValidationError, patchRequest, Patchable, patchAction } from '../utils'
import { catalogService, objectTypeDefinitionService, localizableAttributeService } from '.'
import { isMasterProduct, isVariantProduct } from '../typeguards'

class ProductService extends Patchable<IProduct> {
	hasObjectTypeDefinition = true
	protected async getObjectTypeDefinition() {
		return objectTypeDefinitionService.getById('Product')
	}
	patchMap = {
		id: {
			$set: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.setId(product, action.value)
			},
		},
		assignedCatalogs: {
			$add: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				
				const catalog: ICatalog = await Catalog.findOne({id: action.value})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.value)
				}
				if (catalog.master) {
					throw new ValidationError('Cannot assign product to master catalog')
				}
				await Promise.all([
					product.addAssignedCatalog(catalog),
					catalog.addProduct(product),
				])

				await Promise.all([
					product.save(),
					catalog.save(),
				])
			},
			$remove: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const catalog: ICatalog = await Catalog.findOne({id: action.value})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.value)
				}

				await Promise.all([
					product.removeAssignedCatalog(catalog),
					catalog.removeProduct(product),
				])

				await Promise.all([
					product.save(),
					catalog.save(),
				])
			},
		},
		primaryCategoryByCatalog: {
			$set: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
				
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
					await Promise.all([
						catalog.addProduct(product),
						product.addAssignedCatalog(catalog)
					])
				}
				// Assign product to Category if not in Category
				if (!category.products.find(x => x.id == product.id)) {
					await Promise.all([
						category.addProduct(product),
						product.addAssignedCategoryByCatalog(category, catalog)
					])
				}

				await product.setPrimaryCategoryByCatalog(category, catalog)

				await Promise.all([
					product.save(),
					catalog.save(),
					category.save(),
				])
			},
			$unset: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['catalog'])
				const catalog: ICatalog = await Catalog.findOne({id: action.catalog})
				if (!catalog) {
					throw new ResourceNotFoundError('Catalog', action.catalog)
				}

				await product.setPrimaryCategoryByCatalog(null, catalog)
				await product.save()
			},
		},
		assignedCategoriesByCatalog: {
			$add: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
	
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
					await Promise.all([
						catalog.addProduct(product),
						product.addAssignedCatalog(catalog),
					])
				}

				await Promise.all([
					product.addAssignedCategoryByCatalog(category, catalog),
					category.addProduct(product),
				])

				await Promise.all([
					product.save(),
					category.save(),
					catalog.save(),
				])
			},
			$remove: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value', 'catalog'])
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

				await Promise.all([
					category.save(),
					product.save(),
				])
			},
		},
		variationAttributes: {
			$add: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				if (isMasterProduct(product)) {
					const OTD: IObjectTypeDefinition = await product.getObjectTypeDefinition()
					const OAD: IObjectAttributeDefinition = OTD.getAttribute(action.value)
					if (!OAD) {
						throw new ValidationError(`Attribute ${action.value} does not exist on product, or cannot be used as variation attribute`)
					}
					await product.addVariationAttribute(OAD)
				} else {
					throw new ValidationError(`Product is not a master product`)
				}
			},
			$remove: async(product: IProduct, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				if (isMasterProduct(product)) {
					const OTD: IObjectTypeDefinition = await product.getObjectTypeDefinition()
					const OAD: IObjectAttributeDefinition = OTD.getAttribute(action.value)
					if (!OAD) {
						throw new ValidationError(`Attribute ${action.value} does not exist on product, or cannot be used as variation attribute`)
					}
					await product.removeVariationAttribute(OAD)
				} else {
					throw new ValidationError(`Product is not a master product`)
				}
			},
		}
	}

	public async create(options: Partial<IProductVariant> | Partial<IProductMaster> | Partial<IProduct>): Promise<IProduct> {
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
		if (!options.type) {
			if (options.hasOwnProperty('masterProduct')) {
				options.type = 'variant'
			} else {
				options.type = 'basic'
			}
		}

		// Create new Product
		let product: IProduct;
		switch (options.type) {
			case 'basic':
				product = await new Product({
					id: options.id,
					masterCatalog: catalog,
				}).save();
				break;
			case 'master':
				product = await new ProductMaster({
					id: options.id,
					masterCatalog: catalog,
				}).save();
				break;
			case 'variant':
				let variantOptions: Partial<IProductVariant> = options as Partial<IProductVariant>
				let masterProduct: IProduct;
				// Get master product
				if (variantOptions.masterProduct) {
					masterProduct = await Product.findOne({id: variantOptions.masterProduct}).populate('variationAttributes')
				}
				if (!masterProduct) {
					throw new ResourceNotFoundError('MasterProduct', <any>variantOptions.masterProduct)
				}
				if (isMasterProduct(masterProduct)) {
					const variationAttributes: IObjectAttributeDefinition[] = masterProduct.variationAttributes
					// Check that variation attribtues exist
					if (variationAttributes.length == 0) {
						throw new ValidationError(`Master product must have at least one variation attribute`)
					}
					// Check that variation attributes are provided
					if (variationAttributes.some(x => options[x.path] == undefined)) {
						throw new ValidationError(`Must provide all variation attributes`)
					}
					product = await new ProductVariant({
						id: options.id,
						masterCatalog: catalog,
						masterProduct,
					}).save();
					product = await Product.findById(product._id)
					// Set attributes passed on in options
					await Promise.all(variationAttributes.map(async (OAD: IObjectAttributeDefinition) => {
						if (OAD.system) {
							return localizableAttributeService.update(product[OAD.path], OAD, OAD.path, {
								op: '$set', path: OAD.path, value: options[OAD.path]
							})
						} else {
							return localizableAttributeService.update(product.custom.get(OAD.path), OAD, OAD.path, {
								op: '$set', path: OAD.path, value: options[OAD.path]
							})
						}
					}))
					// Add Variant to master
					await masterProduct.addVariant(product as IProductVariant)
					await masterProduct.save()
				} else {
					throw new ValidationError(`${<any>variantOptions.masterProduct} is not a master product`)
				}
				break;
			default: 
				throw new ValidationError(`Invalid type ${(<any>options).type}`)
		}

		// Add Product to Catalog
		await Promise.all([
			catalog.addProduct(product),
			product.addAssignedCatalog(catalog),
		])

		await Promise.all([
			product.save(),
			catalog.save(),
		])

		return product
	}

	public async update(product: IProduct, patchRequest: patchRequest, resources: any): Promise<IProduct> {
		await this.patch(product, patchRequest, resources)
		return product.save()
	}

	public async delete(product: IProduct): Promise<void> {
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
		// Delete LocalizableAttributes
		promises.push(localizableAttributeService.deleteAttributesFromExtensibleObject(product))
		// If product Variant, remove from list of master
		if (isVariantProduct(product)) {
			await product.populate({path: 'masterProduct', populate: {path: 'variantProducts'}}).execPopulate()
			await product.masterProduct.removeVariant(product)
			await product.masterProduct.save()
		}
		
		await Promise.all(promises)
		
		// If product Master, delete all variants
		if (isMasterProduct(product)) {
			await product.populate('variantProducts').execPopulate()
			await product.variantProducts.reduce((_: Promise<void>, v: IProductVariant): Promise<void> => {
				return _.then(async() => this.delete(v))
			}, Promise.resolve())
		}
		
		await Promise.all([
			...[
				...categories,
				...product.assignedCatalogs
			].map(x => x.save()),
		])

		// Delete Product
		await Product.findOneAndDelete({id: product.id})
	}

	// ==== get ====
	public async getById(id: string): Promise<IProduct> {
		return Product.findOne({id}).exec()
	}
	public async getAll(): Promise<IProduct[]> {
		return Product.find({}).exec()
	}

	// ==== set ====
	private async setId(product: IProduct, id: string): Promise<IProduct> {
		product.setId(id)
		return product
	}

	public async exportAllProducts(): Promise<any> {
		let products: IProduct[] = await Product.find().exec()

		let jsonProducts: any = await Promise.all(products.map(this.productToXMLJSON))

		jsonProducts = {
			product: jsonProducts
		}

		return jsonProducts
	}


	public async productToXMLJSON(product: IProduct): Promise<any> {
		await product.populate([
			{ path: '' },
		]).execPopulate()

		const ret: any =  {
			'@product-id': product.id,
			type: {
				'#text': product.type
			},
			...(await objectTypeDefinitionService.extensibleObjectToXMLJSON(product))
		}
		return ret
	}
}

export const productService: ProductService = new ProductService();