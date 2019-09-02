import chalk from 'chalk'

import { ResourceNotFoundError, NotImplementedError, ValidationError, Patchable, patchAction, patchRequest } from '../utils'
import { Catalog } from '../models'
import { ICatalog, ICategory, IProduct } from '../interfaces'
import { categoryService } from '.'


export class CatalogService extends Patchable {
	patchMap = {
		id: {
			$set: async (action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const catalog: ICatalog = action.resources.catalog;
				await catalog.setId(action.value)
			}
		},
		name: {
			$set: async (action: patchAction): Promise<void> => {
				this.checkRequiredProperties(action, ['value'])
				const catalog: ICatalog = action.resources.catalog;
				
				await catalog.setName(action.value)
			}
		}
	}

	public async create(options: Partial<ICatalog>): Promise<ICatalog> {
		// Check if catalog exists
		let existingCatalogs: ICatalog[] = await Catalog.find({id: options.id})
		if (existingCatalogs.length > 0) {
			throw new ValidationError('Catalog already exists')
		}

		return await new Catalog({
			id: options.id,
			name: options.name,
			master: options.master
		}).save()
	}

	public async getById(id: string): Promise<ICatalog> {
		return Catalog.findOne({id}).exec()
	}

	public async getByName(name: string): Promise<ICatalog> {
		return Catalog.findOne({name}).exec()
	}

	public async getAll(): Promise<ICatalog[]> {
		return Catalog.find({}).exec()
	}

	public async update(catalog: ICatalog, patchRequest: patchRequest, resources: any): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogService.update]`))

		await this.patch(patchRequest, resources)
		
		return catalog.save()
	}

	public async delete(catalog: ICatalog): Promise<void> {
		// Delete all categories
		catalog = await catalog.populate('categories').execPopulate()
		await catalog.categories.reduce((_, category: ICategory) => _.then(() => categoryService.delete(category)), Promise.resolve())
		await catalog.remove()
	}

	public async addCategory(catalog: ICatalog, category: ICategory): Promise<void> {
		await catalog.populate('categories').execPopulate()
		if (catalog.categories.some(x => x.id == category.id)) {
			console.log(chalk.yellow('[CatalogService.addCategory] category already in catalog'))
			return 
		}
		await catalog.addCategory(category)
		await catalog.save()
	}

	public async removeCategory(catalog: ICatalog, category: ICategory): Promise<void> {
		console.log(chalk.magenta(`[CatalogModel.removeCategory] ${category.id} from ${category.id}`))
		await catalog.populate('categories').execPopulate()
		if (catalog.categories.some(x => x.id == category.id)) {
			await catalog.removeCategory(category)
			await catalog.save()
		} else {
			console.log(chalk.yellow(`[CatalogModel.removeCategory] ${category.id} not in ${category.id}`))
		}
	}

	public async addProduct(catalog: ICatalog, product: IProduct): Promise<void> {
		console.log(chalk.magenta(`[CatalogService.addProduct] ${product.id} to ${catalog.id}`))
		await catalog.populate('products').execPopulate()
		if (catalog.products.some(x => x.id == product.id)) {
			console.log(chalk.yellow('[CatalogModel.addProduct] product already in catalog'))
			return
		}
		await catalog.addProduct(product)
		await catalog.save()
	}

	public async removeProduct(catalog: ICatalog, product: IProduct): Promise<void> {
		console.log(chalk.magenta(`[CatalogService.removeProduct] ${product.id} to ${catalog.id}`))
		await catalog.populate('products').execPopulate()
		if (catalog.products.some(x => x.id == product.id)) {
			await catalog.removeProduct(product)
			await catalog.save()
			return 
		} else {
			console.log(chalk.yellow('[CatalogModel.removeProduct] product not in catalog'))
			return
		}
	}

	

}

export const catalogService: CatalogService = new CatalogService();
