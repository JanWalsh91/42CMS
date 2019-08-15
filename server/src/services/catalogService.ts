import { ICatalog, Catalog } from "../models/catalogModel";

export class CatalogService {
	public async create(options) {
		let catalog: ICatalog = await new Catalog({ id, name, isMaster: !!isMaster });
		catalog = await catalog.save()
		return catalog
	}
}

export const catalogService: CatalogService = new CatalogService();
