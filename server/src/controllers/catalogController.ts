import { Request, Response, NextFunction } from 'express'

import { catalogService } from '../services/catalogService'
import { ICatalog } from '../interfaces'
import { ResourceNotFoundError, ValidationError } from '../utils/Errors'

export class CatalogController {
	public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { name, id, master }: { name: string, id: string, master: boolean } = req.body;

		try {
			const catalog: ICatalog = await catalogService.create({name, id, master})
			res.send(catalog)
		} catch(e) {
			next(e)
		}
	}

	public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.send(res.locals.catalog);
	}

	public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const catalogs: ICatalog[] = await catalogService.getAll()
			res.send(catalogs);
		} catch (e) { next(e) }		
	}

	public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await catalogService.update(res.locals.catalog, req.body, {})
			res.end()
		} catch (e) { next(e) }
	}
	
	public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			await catalogService.delete(res.locals.catalog)
			res.end()
		} catch (e) { next(e) }
	}

	public async setCatalogFromParams(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (!req.params.catalogid) {
			return next(new ValidationError('Catalog id not provided'))
		}
		const catalog: ICatalog = await catalogService.getById(req.params.catalogid)
		if (!catalog) {
			return next(new ResourceNotFoundError('Catalog', req.params.catalogid))
		}
		res.locals.catalog = catalog
		next()
	}
}

export const catalogController: CatalogController = new CatalogController();
