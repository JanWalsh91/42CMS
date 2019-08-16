import { ICatalog, Catalog } from '../models/catalogModel';
import { ResourceNotFoundError, NotImplementedError, ValidationError } from '../utils/Errors';
import { ICategory } from '../models';
import { categoryService } from '.';

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

	public async update(): Promise<ICatalog> {
		throw new NotImplementedError()
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
