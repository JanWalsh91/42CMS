import chalk from 'chalk'

import { ResourceNotFoundError, NotImplementedError, ValidationError, Patchable, patchAction, patchRequest } from '../utils'
import { Catalog } from '../models'
import { ICatalog, ICategory, IProduct, ISite } from '../interfaces'
import { categoryService, siteService } from '.'


class CatalogService extends Patchable<ICatalog> {
	hasObjectTypeDefinition = false
	protected async getObjectTypeDefinition() { return null }
	patchMap = {
		id: {
			$set: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await catalog.setId(action.value)
			}
		},
		name: {
			$set: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await catalog.setName(action.value)
			}
		},
		sites: {
			$add: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.addSite(catalog, action.value)
			},
			$remove: async (catalog: ICatalog, action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				await this.removeSite(catalog, action.value)
			}
		}
	}

	public async create(options: Partial<ICatalog>): Promise<ICatalog> {
		console.log(chalk.magenta('[CatalogService.create]'), options)
		// Check if catalog exists
		let existingCatalogs: ICatalog[] = await Catalog.find({id: options.id})
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
		console.log(chalk.magenta(`[CatalogService.update]`))

		await this.patch(catalog, patchRequest, resources)
		
		return catalog.save()
	}

	public async delete(catalog: ICatalog): Promise<void> {
		catalog = await catalog.populate([
			{path: 'categories'},
			{path: 'sites'},
		]).execPopulate()
		
		// Delete all categories
		await catalog.categories.reduce((_, category: ICategory) => _.then(() => categoryService.delete(category)), Promise.resolve())
		
		// Delete site assignements
		await catalog.sites.reduce((_, site: ISite) => _.then(() => {
			site.removeCatalog(catalog);
			return site.save()
		}), Promise.resolve())

		// TODO: handle products:
			// if master, delete products?
			// else, unassign for catalog

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
		console.log(chalk.magenta(`[CatalogService.addProduct] ${product.id} to ${catalog.id}`))
		await catalog.addProduct(product)
		
		await catalog.save()
	}
	public async addSite(catalog: ICatalog, siteid: string): Promise<void> {
		console.log(chalk.magenta(`[CatalogService.addSite] ${siteid} to ${catalog.id}`))
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
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${category.id}`))
		await catalog.removeCategory(category)
		
		await catalog.save()
	}
	public async removeProduct(catalog: ICatalog, product: IProduct): Promise<void> {
		console.log(chalk.magenta(`[CatalogService.removeProduct] ${product.id} to ${catalog.id}`))
		await catalog.removeProduct(product)
		
		await catalog.save()
	}
	public async removeSite(catalog: ICatalog, siteid: string): Promise<void> {
		console.log(chalk.magenta(`[CatalogService.removeSite] ${siteid} to ${catalog.id}`))
		const site: ISite = await siteService.getById(siteid)
		if (!site) {
			throw new ResourceNotFoundError('Site', siteid)
		}
		await site.removeCatalog(catalog)
		await catalog.removeSite(site)
		
		await site.save()
		await catalog.save()
	}
}

export const catalogService: CatalogService = new CatalogService();
