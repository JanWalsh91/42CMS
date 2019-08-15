import { ICatalog, Catalog } from "../models/catalogModel";
import { ResourceNotFoundError, NotImplementedError } from "../utils/Errors";

export class CatalogService {
	public async create(options: Partial<ICatalog>): Promise<ICatalog> {
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

	public async delete(id: string): Promise<void> {
		let catalog: ICatalog = await this.getById(id)
		if (!catalog) {
			throw new ResourceNotFoundError('Catalog', id)
		}
		await Catalog.findOneAndDelete(id)
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
