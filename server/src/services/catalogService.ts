import { ICatalog, Catalog } from '../models/catalogModel';
import { ResourceNotFoundError, NotImplementedError, ValidationError } from '../utils/Errors';
import { ICategory } from '../models';
import { categoryService } from '.';
import chalk from 'chalk';

export class CatalogService {
	public async create(options: Partial<ICatalog>): Promise<ICatalog> {
		// Check if catalog exists
		let existingCatalogs: ICatalog[] = await Catalog.find({id: options.id})
		if (existingCatalogs.length > 0) {
			throw new ValidationError('Catalog already exists')
		}

		return await new Catalog({
			id: options.id,
			name: options.name,
			isMaster: options.isMaster
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

	public async update(catalog: ICatalog, update: Partial<{name: string, id: string}>): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogService.update]`), update)
		await Object.keys(update)
			.filter(key => update[key] != undefined)
			.reduce((_, key: string) => {
				console.log('reducing ', key, update[key])
				return _.then(() => this[`update_${key}`](catalog, update[key]))
			}, Promise.resolve())
		return catalog.save()
	}

	public async update_name(catalog: ICatalog, name: string): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogService.updateName] ${name}`))
		catalog.name = name
		return catalog
	}

	public async update_id(catalog: ICatalog, id: string): Promise<ICatalog> {
		console.log(chalk.magenta(`[CatalogService.updateID] ${id}`))
		catalog.id = id
		return catalog
	}

	public async delete(catalog: ICatalog): Promise<void> {
		// Delete all categories
		catalog = await catalog.populate('categories').execPopulate()
		await catalog.categories.reduce((_, category: ICategory) => _.then(() => categoryService.delete(category)), Promise.resolve())
		await catalog.remove()
	}

	public async addCategory(catalogid: string, categoryid: string): Promise<void> {

	}

	public async removeCategory(catalogid: string, categoryid: string): Promise<void> {

	}

	public async addProduct(catalogid: string, categoryid: string): Promise<void> {

	}

	public async removeProduct(catalogid: string, categoryid: string): Promise<void> {

	}

	

}

export const catalogService: CatalogService = new CatalogService();
