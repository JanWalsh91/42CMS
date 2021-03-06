import { ResourceNotFoundError, ValidationError, Patchable, patchAction, patchRequest } from '../utils'
import { Catalog } from '../models'
import { ICatalog, ICategory, IProduct, ISite } from '../interfaces'
import { categoryService, siteService, productService } from '.'

class CatalogService extends Patchable<ICatalog> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		id: {
			$set: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await catalog.setId(action.value)
			},
		},
		name: {
			$set: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await catalog.setName(action.value)
			},
		},
		sites: {
			$add: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.addSite(catalog, action.value)
			},
			$remove: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.removeSite(catalog, action.value)
			},
		}
	}

	public async create(options: Partial<ICatalog>): Promise<ICatalog> {
		// Check if catalog exists
		const existingCatalogs: ICatalog[] = await Catalog.find({id: options.id})
		if (existingCatalogs.length > 0) {
			throw new ValidationError('Catalog already exists')
		}

		return await new Catalog({
			id: options.id,
			name: options.name,
			master: !!options.master
		}).save()
	}

	public async update(catalog: ICatalog, patchRequest: patchRequest, resources: any): Promise<ICatalog> {
		await this.patch(catalog, patchRequest, resources)
		return catalog.save()
	}

	public async delete(catalog: ICatalog): Promise<void> {
		catalog = await catalog.populate([
			{ path: 'categories' },
			{ path: 'sites' },
			{ path: 'products' },
		]).execPopulate()
		
		// Delete all categories
		await catalog.categories.reduce((_, category: ICategory) => _.then(() => categoryService.delete(category)), Promise.resolve())
		
		// Delete site assignements
		await catalog.sites.reduce((_, site: ISite) => _.then(async () => {
			await site.removeCatalog(catalog)
			return site.save()
		}), Promise.resolve())

		// Handle products
		if (catalog.master) {
			// Delete products
			await catalog.products.reduce((_, product: IProduct) => _.then(() => productService.delete(product)), Promise.resolve())
		} else {
			// Unassign products
			await catalog.products.reduce((_, product: IProduct) => _.then(() => product.removeAssignedCatalog(catalog)), Promise.resolve())
		}

		await catalog.remove()
	}

	// ==== get ====
	public async getById(id: string): Promise<ICatalog> {
		return Catalog.findOne({id}).exec()
	}
	public async getByName(name: string): Promise<ICatalog> {
		return Catalog.findOne({name}).exec()
	}
	public async getAll(): Promise<ICatalog[]> {
		return Catalog.find({}).exec()
	}

	// ==== add ====
	public async addCategory(catalog: ICatalog, category: ICategory): Promise<void> {
		await catalog.addCategory(category)
		await catalog.save()
	}
	public async addProduct(catalog: ICatalog, product: IProduct): Promise<void> {
		await catalog.addProduct(product)
		
		await catalog.save()
	}
	public async addSite(catalog: ICatalog, siteid: string): Promise<void> {
		const site: ISite = await siteService.getById(siteid)
		if (!site) {
			throw new ResourceNotFoundError('Site', siteid)
		}
		await site.addCatalog(catalog)
		await catalog.addSite(site)

		await site.save()
		await catalog.save()
	}

	// ==== remove ====
	public async removeCategory(catalog: ICatalog, category: ICategory): Promise<void> {
		await catalog.removeCategory(category)
		await catalog.save()
	}
	public async removeProduct(catalog: ICatalog, product: IProduct): Promise<void> {
		await catalog.removeProduct(product)
		await catalog.save()
	}
	public async removeSite(catalog: ICatalog, siteid: string): Promise<void> {
		const site: ISite = await siteService.getById(siteid)
		if (!site) {
			throw new ResourceNotFoundError('Site', siteid)
		}
		await site.removeCatalog(catalog)
		await catalog.removeSite(site)
		
		await site.save()
		await catalog.save()
	}

	public async exportAllCatalogs(): Promise<any> {
		const catalogs: ICatalog[] = await Catalog.find().exec()

		// Build JSON object to be converted to xml using xml-builder // https://www.npmjs.com/package/xmlbuilder
		const jsonCatalogs: any = await Promise.all(catalogs.map(this.catalogToXMLJSON))

		return { catalog: jsonCatalogs }
	}

	public async catalogToXMLJSON(catalog: ICatalog): Promise<any> {
		await catalog.populate([
			{ path: 'sites' },
			{ path: 'categories' },
			{ path: 'rootCategory' },
			{ path: 'products' },
		]).execPopulate()
		
		return {
			'@catalog-id': catalog.id,
			name: {
				'#text': catalog.name ? catalog.name : null 
			},
			master: {
				'#text': catalog.master
			},
			sites: {
				site: catalog.sites.map((site: ISite) => ({ '@site-id': site.id }))
			},
			categories: {
				category: await Promise.all(catalog.categories.map(categoryService.categoryToXMLJSON))
			},
			rootcategory: {
				'@category-id': catalog.rootCategory.id,
			},
			products: {
				product: catalog.products.map((product: IProduct) => ({
					'@product-id': product.id
				}))
			}
		}
	}
}

export const catalogService: CatalogService = new CatalogService();
